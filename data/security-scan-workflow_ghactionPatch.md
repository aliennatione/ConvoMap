Ecco un progetto completo, coeso e pronto per essere usato come base GitHub repository per aggiungere un workflow GitHub Actions di security scan (con CodeQL, Semgrep, npm audit, ripgrep, e uno script Node.js personalizzato) più la cartella `tools/` con script e regole.

---

# 📁 Struttura del progetto (riassunto)

```
security-scan-workflow/
├── .github/
│   └── workflows/
│       └── security-scan.yml
├── tools/
│   ├── quick-scan.js
│   └── semgrep-rules.yml
├── .gitignore
├── LICENSE
├── README.md
└── package.json
```

---

# 📋 Contenuto completo dei file

---

## README.md

```markdown
# Security Scan Workflow per Repository GitHub

## Obiettivi del progetto

Questo progetto fornisce un workflow GitHub Actions completo per eseguire analisi di sicurezza automatizzate su repository contenenti codice JavaScript/TypeScript (ma facilmente adattabile ad altri linguaggi). Include anche strumenti personalizzati per migliorare il controllo di sicurezza.

## Contesto e finalità

L'idea nasce dalla necessità di integrare una pipeline di sicurezza facile da attivare in repository pubblici o privati, che consenta di:

- Individuare vulnerabilità note tramite `npm audit`
- Trovare pattern sospetti (es. logging di dati sensibili, chiamate a `eval`, hardcoded URL HTTP) con `ripgrep` e script personalizzati
- Analizzare il codice con Semgrep usando regole custom
- Eseguire scansione CodeQL ufficiale di GitHub per vulnerabilità più complesse
- Fornire report dettagliati facilmente scaricabili come artifact GitHub Actions

Questa configurazione è particolarmente utile per progetti open source, ma anche per repository privati che desiderano migliorare la sicurezza automatica.

## Struttura del progetto

- `.github/workflows/security-scan.yml`: Workflow GitHub Actions per la scansione di sicurezza
- `tools/quick-scan.js`: Script Node.js che cerca pattern sospetti nel codice
- `tools/semgrep-rules.yml`: Regole personalizzate per Semgrep (analisi statica)
- `.gitignore`: File per ignorare file e cartelle non necessari
- `package.json`: Configurazione base NPM per installare dipendenze e consentire `npm audit`

## Istruzioni per l’installazione e l’uso

1. **Clona questo repository** (o applica la patch al tuo repo esistente).
2. **Abilita GitHub Actions** nel repository.
3. Il workflow `security-scan.yml` si attiverà automaticamente su:
   - Push sui branch `main` o `master`
   - Pull request verso `main` o `master`
   - Invocazione manuale tramite la tab Actions > Run workflow
4. Al termine della scan, i report saranno disponibili come artifact scaricabili.
5. Per personalizzazioni:
   - Modifica o aggiungi pattern in `tools/quick-scan.js`
   - Aggiorna le regole in `tools/semgrep-rules.yml`
   - Puoi adattare `security-scan.yml` per altri linguaggi o ambienti

## Tecnologie utilizzate

- [GitHub Actions](https://docs.github.com/en/actions)
- [CodeQL](https://securitylab.github.com/tools/codeql)
- [Semgrep](https://semgrep.dev/)
- [Node.js](https://nodejs.org/)
- [ripgrep](https://github.com/BurntSushi/ripgrep)
- [npm audit](https://docs.npmjs.com/cli/v9/commands/npm-audit)

## Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

---

> Creato con passione per aiutarti a mantenere sicuri i tuoi progetti.
```

---

## .github/workflows/security-scan.yml

```yaml
name: Security scan

on:
  workflow_dispatch: {}
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write

    steps:
    - name: Checkout repo
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "18"

    - name: Ensure tools & ripgrep
      run: |
        sudo apt-get update -y
        sudo apt-get install -y ripgrep unzip jq

    - name: Install dependencies
      run: |
        if [ -f package-lock.json ]; then npm ci; else npm install; fi
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN || '' }}

    - name: Run npm audit
      run: |
        mkdir -p security-reports
        npm audit --json > security-reports/npm-audit.json || true
        jq '{vulnerabilities:.vulnerabilities,metadata:.metadata}' security-reports/npm-audit.json > security-reports/npm-audit-summary.json || true

    - name: Run ripgrep quick patterns
      run: |
        mkdir -p security-reports
        rg --hidden --no-ignore-vcs --line-number --no-heading \
          "console\.log|console\.error|console\.warn|phoneNumber|phone|StringSession|session.save|session\(|apiHash|apiId|process\.env|eval\(|new Function|child_process|exec\(|spawn\(|fetch\(|axios|http://|https://" \
          > security-reports/rg-findings.txt || true
        echo "=== HEAD OF FINDINGS ===" >> security-reports/rg-findings.txt
        head -n 200 security-reports/rg-findings.txt || true

    - name: Run custom quick scan (node)
      run: |
        node tools/quick-scan.js > security-reports/quick-scan.json || true
        jq . security-reports/quick-scan.json || true

    - name: Run Semgrep
      uses: returntocorp/semgrep-action@v2
      with:
        config: ./tools/semgrep-rules.yml
        output: security-reports/semgrep-report.json
        format: json
      continue-on-error: true

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: javascript

    - name: Build (if needed)
      run: |
        echo "No build step specified."

    - name: Run CodeQL analysis
      uses: github/codeql-action/analyze@v3
      with:
        output: security-reports/codeql-results.sarif

    - name: Create reports zip
      run: |
        mkdir -p security-reports
        ls -la security-reports || true
        zip -r security-scan-reports.zip security-reports || true

    - name: Upload scan reports artifact
      uses: actions/upload-artifact@v4
      with:
        name: security-scan-reports
        path: |
          security-scan-reports.zip
          security-reports/**/*
```

---

## tools/quick-scan.js

```js
/**
 * tools/quick-scan.js
 *
 * Script Node.js che analizza i file testuali nel repository per individuare pattern sospetti
 * come logging di numeri di telefono, chiamate a eval, uso di child_process ecc.
 *
 * Uscita: JSON dettagliato con i file, pattern trovati e linee contenenti le occorrenze.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const ignoreDirs = ['node_modules', '.git', '.github', 'dist', 'build', 'coverage'];

const patterns = [
  { id: 'phone', re: /\b(phone|phoneNumber|sms)\b/i },
  { id: 'session', re: /\b(StringSession|session\.save|session\s*=\s*)\b/i },
  { id: 'console', re: /\bconsole\.(log|error|warn|info)\b/i },
  { id: 'eval', re: /\beval\(|\bnew Function\b/i },
  { id: 'child_process', re: /\b(child_process|exec\(|spawn\()/i },
  { id: 'http', re: /\bhttps?:\/\/[^\s'"]+/i },
  { id: 'apiKeys', re: /\b(api(Id|Hash)|api_key|apiKey|API_KEY)\b/i },
  { id: 'processenv', re: /\bprocess\.env\b/i }
];

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (ignoreDirs.includes(file)) continue;
      results.push(...walk(full));
    } else {
      // solo file testuali (estensioni comuni o senza estensione)
      if (/\.(js|ts|json|env|sh|py|yml|yaml|md|html)$/.test(full) || !path.extname(full)) {
        try {
          const txt = fs.readFileSync(full, 'utf8');
          results.push({ file: path.relative(repoRoot, full), text: txt });
        } catch (e) {
          // ignora file binari o non leggibili
        }
      }
    }
  }
  return results;
}

const files = walk(repoRoot);
const findings = [];

for (const f of files) {
  for (const p of patterns) {
    const lines = [];
    const re = new RegExp(p.re, 'gmi');
    const linesArr = f.text.split(/\r?\n/);
    for (let i = 0; i < linesArr.length; i++) {
      if (re.test(linesArr[i])) {
        lines.push({ line: i + 1, content: linesArr[i].trim() });
      }
      re.lastIndex = 0; // reset regex globale
    }
    if (lines.length) {
      findings.push({ file: f.file, pattern: p.id, matches: lines });
    }
  }
}

const out = {
  scanned_files: files.length,
  findings_count: findings.length,
  findings
};

console.log(JSON.stringify(out, null, 2));
process.exit(0);
```

---

## tools/semgrep-rules.yml

```yaml
rules:
  - id: js-no-eval
    patterns:
      - pattern: eval(...)
      - pattern: new Function(...)
    message: "Avoid use of eval/new Function."
    severity: ERROR
    languages: [javascript,typescript]

  - id: js-console-phone
    pattern: console.log(...)
    message: "Avoid logging potentially sensitive variables (phone, session)."
    severity: WARNING
    languages: [javascript,typescript]

  - id: js-child-process
    pattern: |
      require('child_process').$X(...)
    message: "Potential command execution via child_process."
    severity: ERROR
    languages: [javascript,typescript]

  - id: http-hardcoded
    pattern: "http://$URL"
    message: "Hardcoded HTTP URL found; prefer HTTPS and validate target hosts."
    severity: WARNING
    languages: [javascript,typescript]
```

---

## .gitignore

```
# Node modules
node_modules/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dependency directories
dist/
build/
coverage/

# System files
.DS_Store
Thumbs.db

# GitHub Actions cache
.github/actions/cache/

# Environment files
.env
.env.local
.env.*.local

# Editor config
.vscode/
.idea/
```

---

## LICENSE (MIT)

```text
MIT License

Copyright (c) 2025 [Your Name or Your Org]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## package.json (minimale)

```json
{
  "name": "security-scan-workflow",
  "version": "1.0.0",
  "description": "GitHub Actions workflow and tools for automated security scanning",
  "main": "tools/quick-scan.js",
  "scripts": {
    "quickscan": "node tools/quick-scan.js"
  },
  "author": "[Your Name]",
  "license": "MIT",
  "dependencies": {}
}
```

---

# 🎯 Note finali

* Il workflow usa Node 18 per massima compatibilità.
* Puoi lanciare localmente lo script `tools/quick-scan.js` con `npm run quickscan`.
* Semgrep è integrato tramite GitHub Action.
* Il workflow produce artefatti compressi `security-scan-reports.zip` con tutti i risultati.
* Da qui puoi estendere facilmente il workflow e le regole.

---

Se vuoi, posso anche aiutarti a creare script per interpretare i report o adattare il tutto ad altri linguaggi.

---

**Vuoi che ti generi anche uno script per estrarre report o ulteriori esempi d’uso?**


---
///
\\\
---

Chiaro, eccoti una **patch diff** che aggiunge tutto il necessario in un repo esistente per integrare il workflow di security scan più la cartella `tools/` con gli script e regole.

---

```diff
diff --git a/.github/workflows/security-scan.yml b/.github/workflows/security-scan.yml
new file mode 100644
index 0000000..d4a1b8e
--- /dev/null
+++ b/.github/workflows/security-scan.yml
@@ -0,0 +1,69 @@
+name: Security scan
+
+on:
+  workflow_dispatch: {}
+  push:
+    branches: [ "main", "master" ]
+  pull_request:
+    branches: [ "main", "master" ]
+
+jobs:
+  security-scan:
+    runs-on: ubuntu-latest
+    permissions:
+      contents: read
+      security-events: write
+
+    steps:
+    - name: Checkout repo
+      uses: actions/checkout@v4
+      with:
+        fetch-depth: 0
+
+    - name: Setup Node.js
+      uses: actions/setup-node@v4
+      with:
+        node-version: "18"
+
+    - name: Ensure tools & ripgrep
+      run: |
+        sudo apt-get update -y
+        sudo apt-get install -y ripgrep unzip jq
+
+    - name: Install dependencies
+      run: |
+        if [ -f package-lock.json ]; then npm ci; else npm install; fi
+      env:
+        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN || '' }}
+
+    - name: Run npm audit
+      run: |
+        mkdir -p security-reports
+        npm audit --json > security-reports/npm-audit.json || true
+        jq '{vulnerabilities:.vulnerabilities,metadata:.metadata}' security-reports/npm-audit.json > security-reports/npm-audit-summary.json || true
+
+    - name: Run ripgrep quick patterns
+      run: |
+        mkdir -p security-reports
+        rg --hidden --no-ignore-vcs --line-number --no-heading \
+          "console\.log|console\.error|console\.warn|phoneNumber|phone|StringSession|session.save|session\(|apiHash|apiId|process\.env|eval\(|new Function|child_process|exec\(|spawn\(|fetch\(|axios|http://|https://" \
+          > security-reports/rg-findings.txt || true
+        echo "=== HEAD OF FINDINGS ===" >> security-reports/rg-findings.txt
+        head -n 200 security-reports/rg-findings.txt || true
+
+    - name: Run custom quick scan (node)
+      run: |
+        node tools/quick-scan.js > security-reports/quick-scan.json || true
+        jq . security-reports/quick-scan.json || true
+
+    - name: Run Semgrep
+      uses: returntocorp/semgrep-action@v2
+      with:
+        config: ./tools/semgrep-rules.yml
+        output: security-reports/semgrep-report.json
+        format: json
+      continue-on-error: true
+
+    - name: Initialize CodeQL
+      uses: github/codeql-action/init@v3
+      with:
+        languages: javascript
+
+    - name: Build (if needed)
+      run: |
+        echo "No build step specified."
+
+    - name: Run CodeQL analysis
+      uses: github/codeql-action/analyze@v3
+      with:
+        output: security-reports/codeql-results.sarif
+
+    - name: Create reports zip
+      run: |
+        mkdir -p security-reports
+        ls -la security-reports || true
+        zip -r security-scan-reports.zip security-reports || true
+
+    - name: Upload scan reports artifact
+      uses: actions/upload-artifact@v4
+      with:
+        name: security-scan-reports
+        path: |
+          security-scan-reports.zip
+          security-reports/**/*
diff --git a/tools/quick-scan.js b/tools/quick-scan.js
new file mode 100644
index 0000000..c2f8bb2
--- /dev/null
+++ b/tools/quick-scan.js
@@ -0,60 +1,60 @@
+/**
+ * tools/quick-scan.js
+ *
+ * Script Node.js che analizza i file testuali nel repository per individuare pattern sospetti
+ * come logging di numeri di telefono, chiamate a eval, uso di child_process ecc.
+ *
+ * Uscita: JSON dettagliato con i file, pattern trovati e linee contenenti le occorrenze.
+ */
+
+const fs = require('fs');
+const path = require('path');
+
+const repoRoot = process.cwd();
+const ignoreDirs = ['node_modules', '.git', '.github', 'dist', 'build', 'coverage'];
+
+const patterns = [
+  { id: 'phone', re: /\b(phone|phoneNumber|sms)\b/i },
+  { id: 'session', re: /\b(StringSession|session\.save|session\s*=\s*)\b/i },
+  { id: 'console', re: /\bconsole\.(log|error|warn|info)\b/i },
+  { id: 'eval', re: /\beval\(|\bnew Function\b/i },
+  { id: 'child_process', re: /\b(child_process|exec\(|spawn\()/i },
+  { id: 'http', re: /\bhttps?:\/\/[^\s'"]+/i },
+  { id: 'apiKeys', re: /\b(api(Id|Hash)|api_key|apiKey|API_KEY)\b/i },
+  { id: 'processenv', re: /\bprocess\.env\b/i }
+];
+
+function walk(dir) {
+  const results = [];
+  const list = fs.readdirSync(dir);
+  for (const file of list) {
+    const full = path.join(dir, file);
+    const stat = fs.statSync(full);
+    if (stat && stat.isDirectory()) {
+      if (ignoreDirs.includes(file)) continue;
+      results.push(...walk(full));
+    } else {
+      // solo file testuali (estensioni comuni o senza estensione)
+      if (/\.(js|ts|json|env|sh|py|yml|yaml|md|html)$/.test(full) || !path.extname(full)) {
+        try {
+          const txt = fs.readFileSync(full, 'utf8');
+          results.push({ file: path.relative(repoRoot, full), text: txt });
+        } catch (e) {
+          // ignora file binari o non leggibili
+        }
+      }
+    }
+  }
+  return results;
+}
+
+const files = walk(repoRoot);
+const findings = [];
+
+for (const f of files) {
+  for (const p of patterns) {
+    const lines = [];
+    const re = new RegExp(p.re, 'gmi');
+    const linesArr = f.text.split(/\r?\n/);
+    for (let i = 0; i < linesArr.length; i++) {
+      if (re.test(linesArr[i])) {
+        lines.push({ line: i + 1, content: linesArr[i].trim() });
+      }
+      re.lastIndex = 0; // reset regex globale
+    }
+    if (lines.length) {
+      findings.push({ file: f.file, pattern: p.id, matches: lines });
+    }
+  }
+}
+
+const out = {
+  scanned_files: files.length,
+  findings_count: findings.length,
+  findings
+};
+
+console.log(JSON.stringify(out, null, 2));
+process.exit(0);
diff --git a/tools/semgrep-rules.yml b/tools/semgrep-rules.yml
new file mode 100644
index 0000000..fb3f89a
--- /dev/null
+++ b/tools/semgrep-rules.yml
@@ -0,18 +1,18 @@
+rules:
+  - id: js-no-eval
+    patterns:
+      - pattern: eval(...)
+      - pattern: new Function(...)
+    message: "Avoid use of eval/new Function."
+    severity: ERROR
+    languages: [javascript,typescript]
+
+  - id: js-console-phone
+    pattern: console.log(...)
+    message: "Avoid logging potentially sensitive variables (phone, session)."
+    severity: WARNING
+    languages: [javascript,typescript]
+
+  - id: js-child-process
+    pattern: |
+      require('child_process').$X(...)
+    message: "Potential command execution via child_process."
+    severity: ERROR
+    languages: [javascript,typescript]
+
+  - id: http-hardcoded
+    pattern: "http://$URL"
+    message: "Hardcoded HTTP URL found; prefer HTTPS and validate target hosts."
+    severity: WARNING
+    languages: [javascript,typescript]
diff --git a/.gitignore b/.gitignore
index 0000000..cd3a920
--- /dev/null
+++ b/.gitignore
@@ -0,20 +1,20 @@
+# Node modules
+node_modules/
+
+# Logs
+npm-debug.log*
+yarn-debug.log*
+yarn-error.log*
+
+# Dependency directories
+dist/
+build/
+coverage/
+
+# System files
+.DS_Store
+Thumbs.db
+
+# GitHub Actions cache
+.github/actions/cache/
+
+# Environment files
+.env
+.env.local
+.env.*.local
+
+# Editor config
+.vscode/
+.idea/
diff --git a/package.json b/package.json
new file mode 100644
index 0000000..b68a15e
--- /dev/null
+++ b/package.json
@@ -0,11 +1,11 @@
+{
+  "name": "security-scan-workflow",
+  "version": "1.0.0",
+  "description": "GitHub Actions workflow and tools for automated security scanning",
+  "main": "tools/quick-scan.js",
+  "scripts": {
+    "quickscan": "node tools/quick-scan.js"
+  },
+  "author": "[Your Name]",
+  "license": "MIT",
+  "dependencies": {}
+}
diff --git a/LICENSE b/LICENSE
new file mode 100644
index 0000000..b1b5740
--- /dev/null
+++ b/LICENSE
@@ -0,25 +1,25 @@
+MIT License
+
+Copyright (c) 2025 [Your Name or Your Org]
+
+Permission is hereby granted, free of charge, to any person obtaining a copy
+of this software and associated documentation files (the "Software"), to deal
+in the Software without restriction, including without limitation
```


the rights
+to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
+copies of the Software, and to permit persons to whom the Software is
+furnished to do so, subject to the following conditions:
+
+The above copyright notice and this permission notice shall be included in all
+copies or substantial portions of the Software.
+
+THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
+IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
+FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
+AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
+LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
+OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
+SOFTWARE.

```

---

Se vuoi ti spiego qualche parte in dettaglio o ti faccio vedere un esempio concreto di output del quick-scan.js!  
Fammi sapere!
```


---
///
\\\
---

Certo! Ecco due file aggiuntivi per completare il progetto:

---

### 1) `tools/extract-reports.js`

Uno script Node.js che estrae e riassume i risultati dai vari report generati nel workflow, creando un report unico e leggibile.

```js
/**
 * tools/extract-reports.js
 *
 * Script per estrarre, aggregare e stampare un report unico a partire
 * dai vari report JSON generati dai tools di security scanning.
 *
 * Uso:
 *    node tools/extract-reports.js
 */

const fs = require('fs');
const path = require('path');

const reportsDir = path.resolve(process.cwd(), 'security-reports');

function safeReadJson(filename) {
  try {
    const content = fs.readFileSync(path.join(reportsDir, filename), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function printNpmAuditSummary() {
  const audit = safeReadJson('npm-audit-summary.json');
  if (!audit) {
    console.log('No npm audit summary found.');
    return;
  }
  console.log('=== npm Audit Summary ===');
  console.log(`Total vulnerabilities: ${audit.metadata.totalDependencies}`);
  if (audit.vulnerabilities) {
    for (const [type, details] of Object.entries(audit.vulnerabilities)) {
      if (details.count > 0) {
        console.log(` - ${type}: ${details.count}`);
      }
    }
  }
  console.log('');
}

function printQuickScanSummary() {
  const quickScan = safeReadJson('quick-scan.json');
  if (!quickScan) {
    console.log('No quick scan report found.');
    return;
  }
  console.log('=== Quick Scan Findings ===');
  if (quickScan.findings_count === 0) {
    console.log('No suspicious patterns found.');
  } else {
    quickScan.findings.forEach(f => {
      console.log(`File: ${f.file} (pattern: ${f.pattern})`);
      f.matches.forEach(m => {
        console.log(`  Line ${m.line}: ${m.content}`);
      });
      console.log('');
    });
  }
  console.log('');
}

function printSemgrepSummary() {
  const semgrepRaw = safeReadJson('semgrep-report.json');
  if (!semgrepRaw || !semgrepRaw.results) {
    console.log('No Semgrep report found.');
    return;
  }
  console.log('=== Semgrep Findings ===');
  if (semgrepRaw.results.length === 0) {
    console.log('No issues found by Semgrep.');
  } else {
    semgrepRaw.results.forEach((res, idx) => {
      const loc = res.location || {};
      const path = loc.path || 'unknown file';
      const line = loc.start?.line || 'unknown line';
      console.log(`${idx + 1}. ${res.check_id} [${res.severity}]`);
      console.log(`   File: ${path}:${line}`);
      console.log(`   Message: ${res.extra.message}`);
      console.log('');
    });
  }
  console.log('');
}

function printCodeQLSummary() {
  // CodeQL results are in SARIF format (JSON), can be complex to parse fully
  const sarifPath = path.join(reportsDir, 'codeql-results.sarif');
  if (!fs.existsSync(sarifPath)) {
    console.log('No CodeQL SARIF report found.');
    return;
  }
  const sarif = JSON.parse(fs.readFileSync(sarifPath, 'utf8'));
  const results = sarif.runs?.[0]?.results || [];
  console.log('=== CodeQL Findings ===');
  if (results.length === 0) {
    console.log('No issues found by CodeQL.');
  } else {
    results.forEach((res, idx) => {
      const message = res.message?.text || 'No message';
      const location = res.locations?.[0]?.physicalLocation?.region || {};
      const startLine = location.startLine || 'unknown line';
      const file = res.locations?.[0]?.physicalLocation?.artifactLocation?.uri || 'unknown file';
      console.log(`${idx + 1}. ${res.ruleId || 'unknown rule'} - Severity: ${res.level || 'unknown'}`);
      console.log(`   File: ${file}:${startLine}`);
      console.log(`   Message: ${message}`);
      console.log('');
    });
  }
  console.log('');
}

function main() {
  console.log('=== Security Scan Combined Report ===\n');
  printNpmAuditSummary();
  printQuickScanSummary();
  printSemgrepSummary();
  printCodeQLSummary();
  console.log('=== End of Report ===');
}

main();
```

---

### 2) Aggiornamento `package.json`

Aggiungiamo uno script per eseguire facilmente l’estrazione:

```diff
@@ -6,7 +6,10 @@
-  "scripts": {
-    "quickscan": "node tools/quick-scan.js"
-  },
+  "scripts": {
+    "quickscan": "node tools/quick-scan.js",
+    "extract-report": "node tools/extract-reports.js"
+  },
```

---

### 3) `examples/README.md`

Esempi d’uso per aiutare chi usa il repo:

````markdown
# Esempi di uso

## 1. Eseguire la scansione rapida

```bash
npm run quickscan
````

Output JSON con pattern sospetti trovati nei file.

## 2. Eseguire il workflow completo (su GitHub Actions)

Il workflow `security-scan.yml` fa partire automaticamente scansioni con:

* `npm audit`
* ricerca pattern con ripgrep
* script `quick-scan.js`
* Semgrep
* CodeQL

## 3. Estrarre e visualizzare il report completo

Dopo che i report sono stati generati, puoi creare un report leggibile con:

```bash
npm run extract-report
```

Questo aggrega i dati da tutti i tool di scanning in una sintesi facilmente consultabile.

```

---

Se vuoi, posso darti tutto già integrato in un’unica patch diff da applicare al tuo repo! Vuoi?
```

---
///
\\\
---

Ecco il progetto completo, pronto per essere pubblicato come repository GitHub.
Contiene la patch da applicare a un repo esistente per aggiungere un workflow GitHub Actions di security scan, con tool di scansione multipli e script di estrazione report.

---

# 📦 **security-scan-integration**

---

## 1. README.md

````markdown
# Security Scan Integration for Node.js Repositories

## Obiettivi del progetto

Questo progetto fornisce una soluzione completa per integrare controlli automatici di sicurezza in un repository Node.js, con workflow GitHub Actions e script di supporto per eseguire scansioni approfondite e generare report aggregati.

## Contesto e finalità

La sicurezza del codice è essenziale per prevenire vulnerabilità, fughe di dati o comportamenti non desiderati.  
Questo progetto nasce dall'esigenza di poter analizzare in modo semplice e automatizzato repository pubblici o privati, con strumenti come:

- `npm audit` per vulnerabilità note nelle dipendenze
- ricerca di pattern sospetti via `ripgrep`
- scansione con `semgrep` per problemi di sicurezza nel codice
- analisi approfondita con CodeQL
- script personalizzati per trovare pattern rischiosi

Inoltre, è incluso uno script per aggregare i risultati in un report leggibile.

## Istruzioni per l'installazione e l'uso

### Applicazione al tuo repository esistente

1. Clona questo repository o copia i file `tools/` e `.github/workflows/security-scan.yml` nel tuo repository.
2. Applica la patch fornita (vedi sotto) per aggiornare `package.json` e aggiungere script utili.
3. Esegui il commit e push: GitHub Actions inizierà automaticamente a eseguire la scansione alla push su `main`.
4. Per scansioni manuali locali, esegui:

   ```bash
   npm install
   npm run quickscan
   npm run extract-report
````

Il primo comando installa dipendenze, il secondo esegue una scansione rapida locale e il terzo aggrega i report.

### Esempio di esecuzione manuale

* `npm run quickscan` esegue la scansione custom di pattern sospetti.
* `npm run extract-report` crea un sommario dei risultati.

### Workflow GitHub Actions

Il workflow definito in `.github/workflows/security-scan.yml` esegue in automatico:

* `npm audit` con report json
* scansione pattern con `ripgrep`
* esecuzione script `tools/quick-scan.js`
* scansione `semgrep`
* scansione CodeQL con report in SARIF

Tutti i report sono salvati in `security-reports/`.

## Tecnologie utilizzate

* Node.js
* GitHub Actions
* ripgrep
* Semgrep
* CodeQL
* npm audit

## Struttura del progetto

```
security-scan-integration/
├── .github/
│   └── workflows/
│       └── security-scan.yml
├── tools/
│   ├── quick-scan.js
│   └── extract-reports.js
├── examples/
│   └── README.md
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

## Licenza

Questo progetto è rilasciato sotto licenza MIT — vedi il file LICENSE per i dettagli.

````

---

## 2. Struttura cartelle e file

```plaintext
security-scan-integration/
├── .github/
│   └── workflows/
│       └── security-scan.yml
├── tools/
│   ├── quick-scan.js
│   └── extract-reports.js
├── examples/
│   └── README.md
├── .gitignore
├── LICENSE
├── package.json
└── README.md
````

---

## 3. Codice sorgente completo

### `.github/workflows/security-scan.yml`

```yaml
name: Security Scan Workflow

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '26 7 * * 1'

jobs:
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read
      actions: read
      packages: read

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Run npm audit
      run: npm audit --json > security-reports/npm-audit.json || true

    - name: Generate npm audit summary
      run: |
        node -e "const audit=require('./security-reports/npm-audit.json'); \
        const summary={metadata:audit.metadata,vulnerabilities:audit.vulnerabilities||{}}; \
        require('fs').writeFileSync('security-reports/npm-audit-summary.json',JSON.stringify(summary,null,2))"

    - name: Run ripgrep for sensitive patterns
      run: |
        mkdir -p security-reports
        rg --json --json-path '.data.lines[0].text' --json-seq --json-seq-delim '\n' 'token|password|secret|apikey|api_key|access_key' > security-reports/ripgrep-report.json || true

    - name: Run custom quick scan
      run: node tools/quick-scan.js > security-reports/quick-scan.json || true

    - name: Run semgrep scan
      uses: returntocorp/semgrep-action@v1
      with:
        config: "p/ci"
        output: security-reports/semgrep-report.json

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: javascript
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
      with:
        category: '/language:javascript'

    - name: Upload Security Reports as artifacts
      uses: actions/upload-artifact@v3
      with:
        name: security-reports
        path: security-reports/
```

---

### `tools/quick-scan.js`

```js
/**
 * tools/quick-scan.js
 *
 * Scans source files in the repository for suspicious patterns.
 * Outputs JSON with file, pattern, and matching lines.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const patterns = [
  'token',
  'password',
  'secret',
  'apikey',
  'api_key',
  'access_key',
];

const rgCommand = `rg --json --json-path '.data.lines[0].text' --json-seq --json-seq-delim '\\n' '${patterns.join('|')}'`;

function scan() {
  try {
    const out = execSync(rgCommand, { encoding: 'utf-8' });
    const lines = out.trim().split('\n');
    const results = {};

    lines.forEach(line => {
      if (!line) return;
      try {
        const json = JSON.parse(line);
        if (!json.data || !json.data.lines) return;
        const file = json.data.path.text;
        const text = json.data.lines[0].text;
        const lineNum = json.data.lines[0].line;

        if (!results[file]) {
          results[file] = [];
        }
        results[file].push({ line: lineNum, content: text });
      } catch {}
    });

    const findings = Object.entries(results).map(([file, matches]) => ({
      file,
      pattern: patterns.find(p => matches.some(m => m.content.toLowerCase().includes(p))),
      matches,
    }));

    return { findings, findings_count: findings.length };
  } catch (err) {
    return { findings: [], findings_count: 0 };
  }
}

if (require.main === module) {
  const report = scan();
  console.log(JSON.stringify(report, null, 2));
}

module.exports = { scan };
```

---

### `tools/extract-reports.js`

```js
/**
 * tools/extract-reports.js
 *
 * Aggregates security scan reports into a readable summary.
 *
 * Usage:
 *    node tools/extract-reports.js
 */

const fs = require('fs');
const path = require('path');

const reportsDir = path.resolve(process.cwd(), 'security-reports');

function safeReadJson(filename) {
  try {
    const content = fs.readFileSync(path.join(reportsDir, filename), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function printNpmAuditSummary() {
  const audit = safeReadJson('npm-audit-summary.json');
  if (!audit) {
    console.log('No npm audit summary found.');
    return;
  }
  console.log('=== npm Audit Summary ===');
  console.log(`Total dependencies: ${audit.metadata.totalDependencies}`);
  if (audit.vulnerabilities) {
    for (const [type, details] of Object.entries(audit.vulnerabilities)) {
      if (details.count > 0) {
        console.log(` - ${type}: ${details.count}`);
      }
    }
  }
  console.log('');
}

function printQuickScanSummary() {
  const quickScan = safeReadJson('quick-scan.json');
  if (!quickScan) {
    console.log('No quick scan report found.');
    return;
  }
  console.log('=== Quick Scan Findings ===');
  if (quickScan.findings_count === 0) {
    console.log('No suspicious patterns found.');
  } else {
    quickScan.findings.forEach(f => {
      console.log(`File: ${f.file} (pattern: ${f.pattern})`);
      f.matches.forEach(m => {
        console.log(`  Line ${m.line}: ${m.content}`);
      });
      console.log('');
    });
  }
  console.log('');
}

function printSemgrepSummary() {
  const semgrepRaw = safeReadJson('semgrep-report.json');
  if (!semgrepRaw || !semgrepRaw.results) {
    console.log('No Semgrep report found.');
    return;
  }
  console.log('=== Semgrep Findings ===');
  if (semgrepRaw.results.length === 0) {
    console.log('No issues found by Semgrep.');
  } else {
    semgrepRaw.results.forEach((res, idx) => {
      const loc = res.location || {};
      const path = loc.path || 'unknown file';
      const line = loc.start?.line || 'unknown line';
      console.log(`${idx + 1}. ${res.check_id} [${res.severity}]`);
      console.log(`   File: ${path}:${line}`);
      console.log(`   Message: ${res.extra.message}`);
      console.log('');
    });
  }
  console.log('');
}

function printCodeQLSummary() {
  const sarifPath = path.join(reportsDir, 'codeql-results.sarif');
  if (!fs.existsSync(sarifPath)) {
    console.log('No CodeQL SARIF report found.');
    return;
  }
  const sarif = JSON.parse(fs.readFileSync(sarifPath, 'utf8'));
  const results = sarif.runs?.[0]?.results || [];
  console.log('=== CodeQL Findings ===');
  if (results.length === 0) {
    console.log('No issues found by CodeQL.');
  } else {
    results.forEach((res, idx) => {
      const message = res.message?.text || 'No message';
      const location = res.locations?.[0]?.physicalLocation?.region || {};
      const startLine = location.startLine || 'unknown line';
      const file = res.locations?.[0]?.physicalLocation?.artifactLocation?.uri || 'unknown file';
      console.log(`${idx + 1}. ${res.ruleId || 'unknown rule'} - Severity: ${res.level || 'unknown'}`);
      console.log(`   File: ${file}:${startLine}`);
      console.log(`   Message: ${message}`);
      console.log('');
    });
  }
  console.log('');
}

function main() {
  console.log('=== Security Scan Combined Report ===\n');
  printNpmAuditSummary();
  printQuickScanSummary();
  printSemgrepSummary();
  printCodeQLSummary();
  console.log('=== End of Report ===');
}

main();
```

---

### `examples/README.md`

````markdown
# Esempi di uso

## 1. Eseguire la scansione rapida

```bash
npm run quickscan
````

Output JSON con pattern sospetti trovati nei file.

## 2. Eseguire il workflow completo (su GitHub Actions)

Il workflow `security-scan.yml` fa partire automaticamente scansioni con:

* `npm audit`
* ricerca pattern con ripgrep
* script `quick-scan.js`
* Semgrep
* CodeQL

## 3. Estrarre e visualizzare il report completo

Dopo che i report sono stati generati, puoi creare un report leggibile con:

```bash
npm run extract-report
```

Questo aggrega i dati da tutti i tool di scanning in una sintesi facilmente consultabile.

````

---

### `.gitignore`

```gitignore
node_modules/
security-reports/
*.log
.env
.DS_Store
.vscode/
````

---

### `package.json`

```json
{
  "name": "security-scan-integration",
  "version": "1.0.0",
  "description": "Workflow e script per security scan integrati con GitHub Actions",
  "main": "tools/quick-scan.js",
  "scripts": {
    "quickscan": "node tools/quick-scan.js",
    "extract-report": "node tools/extract-reports.js"
  },
  "keywords": [
    "security",
    "scan",
    "github-actions",
    "codeql",
    "semgrep",
    "npm-audit"
  ],
  "author": "Generated by ChatGPT",
  "license": "MIT",
  "devDependencies": {}
}
```

---

### LICENSE (MIT)

```text
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 4. Patch da applicare a un repo esistente

Salva questo contenuto in `security-scan.patch` nella root del repo e applica con:

```bash
git apply security-scan.patch
```

```diff
diff --git a/package.json b/package.json
index e69de29..f3a9b30 100644
--- a/package.json
+++ b/package.json
@@ -1,6 +1,21 @@
+{
+  "name": "security-scan-integration",
+  "version": "1.0.0",
+  "description": "Workflow e script per security scan integrati con GitHub Actions",
+  "main": "tools/quick-scan.js",
+  "scripts": {
+    "quickscan": "node tools/quick-scan.js",
+    "extract-report": "node tools/extract-reports.js"
+  },
+  "keywords": [
+    "security",
+    "scan",
+    "github-actions",
+    "codeql",
+    "semgrep",
+    "npm-audit"
+  ],
+  "author": "Generated by ChatGPT",
+  "license": "MIT",
+  "devDependencies": {}
+}
+
diff --git a/.gitignore b/.gitignore
new file mode 100644
--- /dev/null
+++ b/.gitignore
@@ -0,0 +1,7 @@
+node_modules/
+security-reports/
+*.log
+.env
+.DS_Store
+.vscode/
+
diff --git a/.github/workflows/security-scan.yml
```


b/.github/workflows/security-scan.yml
new file mode 100644
--- /dev/null
+++ b/.github/workflows/security-scan.yml
@@ -0,0 +1,56 @@
+name: Security Scan Workflow
+
+on:

* push:
* branches: [ main ]
* pull_request:
* branches: [ main ]
* schedule:
* * cron: '26 7 * * 1'
*

+jobs:

* security-scan:
* runs-on: ubuntu-latest
* permissions:
* ```
   security-events: write
  ```
* ```
   contents: read
  ```
* ```
   actions: read
  ```
* ```
   packages: read
  ```
*
* steps:
* * name: Checkout code
* ```
   uses: actions/checkout@v4
  ```
*
* * name: Setup Node.js
* ```
   uses: actions/setup-node@v3
  ```
* ```
   with:
  ```
* ```
     node-version: '18'
  ```
*
* * name: Install dependencies
* ```
   run: npm install
  ```
*
* * name: Run npm audit
* ```
   run: npm audit --json > security-reports/npm-audit.json || true
  ```
*
* * name: Generate npm audit summary
* ```
   run: |
  ```
* ```
     node -e "const audit=require('./security-reports/npm-audit.json'); \
  ```
* ```
     const summary={metadata:audit.metadata,vulnerabilities:audit.vulnerabilities||{}}; \
  ```
* ```
     require('fs').writeFileSync('security-reports/npm-audit-summary.json',JSON.stringify(summary,null,2))"
  ```
*
* * name: Run ripgrep for sensitive patterns
* ```
   run: |
  ```
* ```
     mkdir -p security-reports
  ```
* ```
     rg --json --json-path '.data.lines[0].text' --json-seq --json-seq-delim '\n' 'token|password|secret|apikey|api_key|access_key' > security-reports/ripgrep-report.json || true
  ```
*
* * name: Run custom quick scan
* ```
   run: node tools/quick-scan.js > security-reports/quick-scan.json || true
  ```
*
* * name: Run semgrep scan
* ```
   uses: returntocorp/semgrep-action@v1
  ```
* ```
   with:
  ```
* ```
     config: "p/ci"
  ```
* ```
     output: security-reports/semgrep-report.json
  ```
*
* * name: Initialize CodeQL
* ```
   uses: github/codeql-action/init@v3
  ```
* ```
   with:
  ```
* ```
     languages: javascript
  ```
* * name: Perform CodeQL Analysis
* ```
   uses: github/codeql-action/analyze@v3
  ```
* ```
   with:
  ```
* ```
     category: '/language:javascript'
  ```
*
* * name: Upload Security Reports as artifacts
* ```
   uses: actions/upload-artifact@v3
  ```
* ```
   with:
  ```
* ```
     name: security-reports
  ```
* ```
     path: security-reports/
  ```
*

diff --git a/tools/extract-reports.js b/tools/extract-reports.js
new file mode 100644
--- /dev/null
+++ b/tools/extract-reports.js
@@ -0,0 +1,101 @@
+/**

* * tools/extract-reports.js
* *
* * Aggregates security scan reports into a readable summary.
* *
* * Usage:
* * node tools/extract-reports.js
* */
*

+const fs = require('fs');
+const path = require('path');
+
+const reportsDir = path.resolve(process.cwd(), 'security-reports');
+
+function safeReadJson(filename) {

* try {
* const content = fs.readFileSync(path.join(reportsDir, filename), 'utf-8');
* return JSON.parse(content);
* } catch {
* return null;
* }
  +}
*

+function printNpmAuditSummary() {

* const audit = safeReadJson('npm-audit-summary.json');
* if (!audit) {
* console.log('No npm audit summary found.');
* return;
* }
* console.log('=== npm Audit Summary ===');
* console.log(`Total dependencies: ${audit.metadata.totalDependencies}`);
* if (audit.vulnerabilities) {
* for (const [type, details] of Object.entries(audit.vulnerabilities)) {
* ```
   if (details.count > 0) {
  ```
* ```
     console.log(` - ${type}: ${details.count}`);
  ```
* ```
   }
  ```
* }
* }
* console.log('');
  +}
*

+function printQuickScanSummary() {

* const quickScan = safeReadJson('quick-scan.json');
* if (!quickScan) {
* console.log('No quick scan report found.');
* return;
* }
* console.log('=== Quick Scan Findings ===');
* if (quickScan.findings_count === 0) {
* console.log('No suspicious patterns found.');
* } else {
* quickScan.findings.forEach(f => {
* ```
   console.log(`File: ${f.file} (pattern: ${f.pattern})`);
  ```
* ```
   f.matches.forEach(m => {
  ```
* ```
     console.log(`  Line ${m.line}: ${m.content}`);
  ```
* ```
   });
  ```
* ```
   console.log('');
  ```
* });
* }
* console.log('');
  +}
*

+function printSemgrepSummary() {

* const semgrepRaw = safeReadJson('semgrep-report.json');
* if (!semgrepRaw || !semgrepRaw.results) {
* console.log('No Semgrep report found.');
* return;
* }
* console.log('=== Semgrep Findings ===');
* if (semgrepRaw.results.length === 0) {
* console.log('No issues found by Semgrep.');
* } else {
* semgrepRaw.results.forEach((res, idx) => {
* ```
   const loc = res.location || {};
  ```
* ```
   const path = loc.path || 'unknown file';
  ```
* ```
   const line = loc.start?.line || 'unknown line';
  ```
* ```
   console.log(`${idx + 1}. ${res.check_id} [${res.severity}]`);
  ```
* ```
   console.log(`   File: ${path}:${line}`);
  ```
* ```
   console.log(`   Message: ${res.extra.message}`);
  ```
* ```
   console.log('');
  ```
* });
* }
* console.log('');
  +}
*

+function printCodeQLSummary() {

* const sarifPath = path.join(reportsDir, 'codeql-results.sarif');
* if (!fs.existsSync(sarifPath)) {
* console.log('No CodeQL SARIF report found.');
* return;
* }
* const sarif = JSON.parse(fs.readFileSync(sarifPath, 'utf8'));
* const results = sarif.runs?.[0]?.results || [];
* console.log('=== CodeQL Findings ===');
* if (results.length === 0) {
* console.log('No issues found by CodeQL.');
* } else {
* results.forEach((res, idx) => {
* ```
   const message = res.message?.text || 'No message';
  ```
* ```
   const location = res.locations?.[0]?.physicalLocation?.region || {};
  ```
* ```
   const startLine = location.startLine || 'unknown line';
  ```
* ```
   const file = res.locations?.[0]?.physicalLocation?.artifactLocation?.uri || 'unknown file';
  ```
* ```
   console.log(`${idx + 1}. ${res.ruleId || 'unknown rule'} - Severity: ${res.level || 'unknown'}`);
  ```
* ```
   console.log(`   File: ${file}:${startLine}`);
  ```
* ```
   console.log(`   Message: ${message}`);
  ```
* ```
   console.log('');
  ```
* });
* }
* console.log('');
  +}
*

+function main() {

* console.log('=== Security Scan Combined Report ===\n');
* printNpmAuditSummary();
* printQuickScanSummary();
* printSemgrepSummary();
* printCodeQLSummary();
* console.log('=== End of Report ===');
  +}
*

+main();
+
diff --git a/tools/quick-scan.js b/tools/quick-scan.js
new file mode 100644
--- /dev/null
+++ b/tools/quick-scan.js
@@ -0,44 +1,44 @@
+/**

* * tools/quick-scan.js
* *
* * Scans source files in the repository for suspicious patterns.
* * Outputs JSON with file, pattern, and matching lines.
* */
*

+const fs = require('fs');
+const path = require('path');
+const { execSync } = require('child_process');
+
+const patterns = [

* 'token',
* 'password',
* 'secret',
* 'apikey',
* 'api_key',
* 'access_key',
  +];
*

+const rgCommand = `rg --json --json-path '.data.lines[0].text' --json-seq --json-seq-delim '\\n' '${patterns.join('|')}'`;
+
+function scan() {

* try {
* const out = execSync(rgCommand, { encoding: 'utf-8' });
* const lines = out.trim().split('\n');
* const results = {};
*
* lines.forEach(line => {
* ```
   if (!line) return;
  ```
* ```
   try {
  ```
* ```
     const json = JSON.parse(line);
  ```
* ```
     if (!json.data || !json.data.lines) return;
  ```
* ```
     const file = json.data.path.text;
  ```
* ```
     const text = json.data.lines[0].text;
  ```
* ```
     const lineNum = json.data.lines[0].line;
  ```
*
* ```
     if (!results[file]) {
  ```
* ```
       results[file] = [];
  ```
* ```
     }
  ```
* ```
     results[file].push({ line: lineNum, content: text });
  ```
* ```
   } catch {}
  ```
* });
*
* const findings = Object.entries(results).map(([file, matches]) => ({
* ```
   file,
  ```
* ```
   pattern: patterns.find(p => matches.some(m => m.content.toLowerCase().includes(p))),
  ```
* ```
   matches,
  ```
* }));
*
* return { findings, findings_count: findings.length };
* } catch (err) {
* return { findings: [], findings_count: 0 };
* }
  +}
*

+if (require.main === module) {

* const report = scan();
* console.log(JSON.stringify(report, null, 2));
  +}
*

+module.exports = { scan };

```

---

Se vuoi, posso aiutarti a creare direttamente un repo GitHub con questo contenuto o esportarlo in un archivio zip.  
Fammi sapere!
```

---
///
\\\
---

Certo! Ecco un progetto completo pronto per GitHub, con workflow GitHub Actions multi-linguaggio per scansioni di sicurezza, script, patch per integrare nel tuo repo e istruzioni dettagliate.

---

# Output progetto completo

---

## 1. README.md

```markdown
# Security Scan Automation for Multi-language Repositories

## Obiettivi del progetto

Questo progetto fornisce una soluzione integrata per eseguire automaticamente scansioni di sicurezza su repository GitHub contenenti codice in diversi linguaggi: JavaScript, Python, PHP, Bash.  
L’obiettivo è identificare vulnerabilità note, esposizioni di dati sensibili e potenziali problemi di sicurezza con strumenti consolidati, in modo automatizzato e continuativo tramite GitHub Actions.

## Contesto e Finalità

Nell’ecosistema DevSecOps è fondamentale integrare sicurezza e controllo qualità sin dalle prime fasi di sviluppo.  
Questo progetto mostra come configurare un workflow GitHub Actions multi-linguaggio che usa:

- CodeQL per analisi statica di più linguaggi
- Semgrep per rilevare pattern di codice problematici e sicurezza
- npm audit per vulnerabilità JS
- Bandit per sicurezza Python
- Ricerca avanzata tramite ripgrep per possibili segreti nel codice
- Script di aggregazione e reporting per esaminare facilmente i risultati

## Istruzioni per l’installazione e uso

### Applicazione della patch al repository

1. Scarica o copia i file da questa repo (ad esempio il file di workflow `.github/workflows/security-scan.yml` e la cartella `tools/`)
2. Integra la cartella `tools/` e il workflow nel tuo repository git (segui la patch inclusa nel file `PATCH.md`)
3. Committa e push al tuo repository GitHub

### Attivazione del workflow GitHub Actions

- Il workflow si attiva automaticamente su ogni push sul branch `main` (modificabile nel workflow)
- I risultati vengono salvati nella cartella `security-reports` e caricati come artifact
- Puoi scaricare i report direttamente da GitHub Actions nella sezione Artifacts della run

### Uso degli script

- Gli script in `tools/` consentono di estrarre report più leggibili dai JSON generati
- Esempi d’uso sono disponibili nella cartella `examples/`

## Tecnologie utilizzate

- [GitHub Actions](https://docs.github.com/en/actions) per l’automazione CI/CD
- [CodeQL](https://securitylab.github.com/tools/codeql) per l’analisi statica multi-linguaggio
- [Semgrep](https://semgrep.dev/) per scansione di sicurezza e qualità codice
- [npm audit](https://docs.npmjs.com/cli/v9/commands/npm-audit) per vulnerabilità JS
- [Bandit](https://bandit.readthedocs.io/en/latest/) per sicurezza Python
- [ripgrep](https://github.com/BurntSushi/ripgrep) per ricerca di pattern testuali veloci
- Script in Python per aggregazione report

---

## 2. Struttura delle cartelle e file

```

security-scan/
├── .github/
│   └── workflows/
│       └── security-scan.yml
├── tools/
│   ├── extract_reports.py
│   └── helpers.py
├── examples/
│   └── example_usage.sh
├── PATCH.md
├── README.md
├── .gitignore
├── LICENSE
└── requirements.txt

````

---

## 3. Codice sorgente e configurazioni

### `.github/workflows/security-scan.yml`

```yaml
name: Security Scan Multi-language

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
  schedule:
    - cron: '0 2 * * 1' # Ogni lunedì alle 02:00

jobs:
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read
      actions: read
      packages: read

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    # Setup Node.js and run npm audit for JS
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install JS dependencies
      run: npm install || echo "No package.json found"

    - name: Run npm audit (JS only)
      run: |
        mkdir -p security-reports
        npm audit --json > security-reports/npm-audit.json || true

    # Setup Python and run Bandit scan
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.x'

    - name: Install Bandit
      run: pip install bandit

    - name: Run Bandit scan (Python)
      run: |
        mkdir -p security-reports
        bandit -r . -f json -o security-reports/bandit-report.json || true

    # Run ripgrep to find secrets/keys in any language
    - name: Run ripgrep for secrets
      run: |
        mkdir -p security-reports
        rg --json --json-path '.data.lines[0].text' --json-seq --json-seq-delim '\n' 'token|password|secret|apikey|api_key|access_key|auth' > security-reports/ripgrep-report.json || true

    # Run Semgrep scan for multi-language
    - name: Run semgrep scan
      uses: returntocorp/semgrep-action@v1
      with:
        config: "p/ci"
        output: security-reports/semgrep-report.json

    # Initialize CodeQL for multi-language
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: javascript, python, php, bash

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
      with:
        category: '/language:javascript'

    # Upload all reports as artifact
    - name: Upload Security Reports
      uses: actions/upload-artifact@v3
      with:
        name: security-reports
        path: security-reports/
````

---

### `tools/extract_reports.py`

```python
import json
import os

def extract_vulnerabilities_from_npm_audit(path):
    results = []
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        advisories = data.get('advisories', {})
        for key, adv in advisories.items():
            results.append({
                'module': adv.get('module_name'),
                'severity': adv.get('severity'),
                'title': adv.get('title'),
                'url': adv.get('url'),
            })
    except Exception as e:
        print(f"Error reading npm audit report: {e}")
    return results

def extract_bandit_issues(path):
    results = []
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        results = data.get('results', [])
    except Exception as e:
        print(f"Error reading bandit report: {e}")
    return results

def extract_semgrep_issues(path):
    results = []
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        results = data.get('results', [])
    except Exception as e:
        print(f"Error reading semgrep report: {e}")
    return results

def main():
    reports_dir = "security-reports"
    print("=== Vulnerabilities and Security Findings ===\n")

    npm_results = extract_vulnerabilities_from_npm_audit(os.path.join(reports_dir, 'npm-audit.json'))
    print(f"\nNPM Audit Results ({len(npm_results)} vulnerabilities):")
    for r in npm_results:
        print(f" - [{r['severity']}] {r['module']}: {r['title']} ({r['url']})")

    bandit_results = extract_bandit_issues(os.path.join(reports_dir, 'bandit-report.json'))
    print(f"\nBandit (Python) Findings ({len(bandit_results)} issues):")
    for r in bandit_results:
        print(f" - {r.get('filename')}:{r.get('line_number')} - {r.get('test_name')} - {r.get('issue_text')}")

    semgrep_results = extract_semgrep_issues(os.path.join(reports_dir, 'semgrep-report.json'))
    print(f"\nSemgrep Findings ({len(semgrep_results)} issues):")
    for r in semgrep_results:
        print(f" - {r.get('path')}:{r.get('start').get('line', '?')} - {r.get('extra').get('severity', '?')} - {r.get('check_id')}")

if __name__ == "__main__":
    main()
```

---

### `tools/helpers.py`

```python
# Helpers per estrazione report, estendibili

def format_issue(issue):
    return f"{issue.get('path')}:{issue.get('start', {}).get('line')} - {issue.get('extra', {}).get('severity')} - {issue.get('check_id')}"
```

---

### `examples/example_usage.sh`

```bash
#!/bin/bash
# Esempio rapido per eseguire lo script di estrazione report
python3 tools/extract_reports.py
```

---

### `PATCH.md`

```diff
--- A/.github/workflows/security-scan.yml
+++ B/.github/workflows/security-scan.yml
@@ -1,15 +1,70 @@
+name: Security Scan Multi-language
+
+on:
+  push:
+    branches: [ "main" ]
+  pull_request:
+    branches: [ "main" ]
+  schedule:
+    - cron: '0 2 * * 1' # Ogni lunedì alle 02:00
+
+jobs:
+  security-scan:
+    runs-on: ubuntu-latest
+    permissions:
+      security-events: write
+      contents: read
+      actions: read
+      packages: read
+
+    steps:
+    - name: Checkout code
+      uses: actions/checkout@v4
+
+    # Setup Node.js and run npm audit for JS
+    - name: Setup Node.js
+      uses: actions/setup-node@v3
+      with:
+        node-version: '18'
+
+    - name: Install JS dependencies
+      run: npm install || echo "No package.json found"
+
+    - name: Run npm audit (JS only)
+      run: |
+        mkdir -p security-reports
+        npm audit --json > security-reports/npm-audit.json || true
+
+    # Setup Python and run Bandit scan
+    - name: Setup Python
+      uses: actions/setup-python@v4
+      with:
+        python-version: '3.x'
+
+    - name: Install Bandit
+      run: pip install bandit
+
+    - name: Run Bandit scan (Python)
+      run: |
+        mkdir -p security-reports
+        bandit -r . -f json -o security-reports/bandit-report.json || true
+
+    # Run ripgrep to find secrets/keys in any language
+    - name: Run ripgrep for secrets
+      run: |
+        mkdir -p security-reports
+        rg --json --json-path '.data.lines[0].text' --json-seq --json-seq-delim '\n' 'token|password|secret|apikey|api_key|access_key|auth' > security-reports/ripgrep-report.json || true
+
+    # Run Semgrep scan for multi-language
+    - name: Run semgrep scan
+      uses: returntocorp/semgrep-action@v1
+      with:
+        config: "p/ci"
+        output: security-reports/semgrep-report.json
+
+    # Initialize CodeQL for multi-language
+    - name: Initialize CodeQL
+      uses: github/codeql-action/init@v3
+      with:
+        languages: javascript, python, php, bash
+
+    - name: Perform CodeQL Analysis
+      uses: github/codeql-action/analyze@v3
+      with:
+        category: '/language:javascript'
+
+    # Upload all reports as artifact
+    - name: Upload Security Reports
+      uses: actions/upload-artifact@v3
+      with:
+        name: security-reports
+        path: security-reports/
```

---

### `.gitignore`

```
node_modules/
security-reports/
__pycache__/
*.pyc
.env
.DS_Store
.vscode/
```

---

### `requirements.txt`

```
bandit
```

---

### LICENSE

```text
MIT License

Copyright (c) 2025 [Tuo Nome o Organizzazione]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

# Istruzioni sintetiche per applicare la patch

```bash
# Clona il tuo repo
git clone https://github.com/tuoaccount/tuorepo.git
cd tuorepo

# Copia i file e cartelle da questo progetto (o applica la patch manualmente)
# Ad esempio:
mkdir -p .github/workflows
cp /percorso/security-scan/.github/workflows/security-scan.yml .github/workflows/

mkdir -p tools
cp /percorso/security-scan/tools/* tools/

cp PATCH.md .
cp README.md .
cp .gitignore .
cp requirements.txt .
cp LICENSE .

# Aggiungi e committa
git add .
git commit -m "Aggiunge workflow security scan multi-lingua + script di estrazione report"
git push origin main

# Verifica nella pagina Actions di GitHub il workflow in esecuzione
```

---

Se vuoi posso aiutarti anche a creare regole personalizzate Semgrep o a integrare altri scanner specifici.
Fammi sapere!

---

Vuoi che ti aiuti a preparare il repo o vuoi anche i file direttamente in formato ZIP o simile?

---
///
\\\
---

Perfetto! Ti preparo una versione avanzata del progetto con:

* Regole personalizzate Semgrep dedicate a sicurezza e data leak (per i linguaggi JS, Python, PHP, Bash)
* Integrazione con altri scanner specifici utili (ad esempio: Trivy per container/secrets, PHPStan per PHP static analysis, ShellCheck per bash linting)
* Aggiornamento del workflow e degli script di reporting per aggregare anche questi nuovi scanner

---

## Ecco cosa ti propongo:

---

### 1. **Regole personalizzate Semgrep**

Crea una cartella `semgrep-rules/` con regole specifiche, ad esempio:

* Rilevamento di hardcoded secrets (token, password, chiavi API)
* Uso di funzioni pericolose senza validazione (es. `eval` in JS/PHP, `exec` in Python)
* Uso di funzioni deprecate o insicure
* Logging di dati sensibili

Esempio di regola Semgrep in YAML (file: `semgrep-rules/hardcoded-secrets.yaml`):

```yaml
rules:
  - id: hardcoded-secret
    patterns:
      - pattern-either:
          - pattern: |
              api_key = "$SECRET"
          - pattern: |
              password = "$SECRET"
          - pattern: |
              token = "$SECRET"
    message: "Hardcoded secret found. Consider using environment variables or secret managers."
    severity: ERROR
    languages: [python, javascript, php, bash]
    metadata:
      category: security
```

---

### 2. **Scanner aggiuntivi**

* **Trivy**: scanner container e file system, ottimo per scovare segreti e vulnerabilità
* **PHPStan**: static analysis per PHP (codice potenzialmente vulnerabile)
* **ShellCheck**: linting bash script per errori e potenziali rischi

---

### 3. **Workflow aggiornato**

Aggiungo step per installare ed eseguire questi tool, salvare output in `security-reports/` e caricarli come artifact.

---

### 4. **Script aggiornati**

Modifico `tools/extract_reports.py` per leggere anche i report nuovi.

---

# Progetto completo aggiornato (snippet essenziali)

---

## `.github/workflows/security-scan.yml`

```yaml
name: Security Scan Multi-language Advanced

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
  schedule:
    - cron: '0 3 * * 1' # Ogni lunedì 03:00

jobs:
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read
      actions: read
      packages: read

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install JS dependencies
      run: npm install || echo "No package.json found"

    - name: Run npm audit (JS only)
      run: |
        mkdir -p security-reports
        npm audit --json > security-reports/npm-audit.json || true

    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.x'

    - name: Install Bandit, PHPStan, ShellCheck
      run: |
        pip install bandit
        sudo apt-get install -y shellcheck php-cli php-xml php-mbstring
        composer global require phpstan/phpstan || echo "Composer not found or PHPStan already installed"

    - name: Run Bandit scan (Python)
      run: bandit -r . -f json -o security-reports/bandit-report.json || true

    - name: Run ShellCheck (Bash scripts)
      run: |
        mkdir -p security-reports/shellcheck
        find . -name '*.sh' -exec shellcheck -f json -o security-reports/shellcheck/{}.json {} \; || true

    - name: Run PHPStan (PHP)
      run: |
        ~/.composer/vendor/bin/phpstan analyse --error-format=json > security-reports/phpstan-report.json || true

    - name: Run ripgrep for secrets
      run: |
        mkdir -p security-reports
        rg --json --json-path '.data.lines[0].text' --json-seq --json-seq-delim '\n' 'token|password|secret|apikey|api_key|access_key|auth' > security-reports/ripgrep-report.json || true

    - name: Run semgrep scan with custom rules
      uses: returntocorp/semgrep-action@v1
      with:
        config: "./semgrep-rules"
        output: security-reports/semgrep-report.json

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: javascript, python, php, bash

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3

    - name: Upload Security Reports
      uses: actions/upload-artifact@v3
      with:
        name: security-reports
        path: security-reports/
```

---

## `semgrep-rules/hardcoded-secrets.yaml`

```yaml
rules:
  - id: hardcoded-secret
    patterns:
      - pattern-either:
          - pattern: api_key = "$SECRET"
          - pattern: password = "$SECRET"
          - pattern: token = "$SECRET"
          - pattern: | 
              const API_KEY = "$SECRET"
          - pattern: | 
              export SECRET=*
    message: "Hardcoded secret found. Consider environment variables or secret managers."
    severity: ERROR
    languages: [python, javascript, php, bash]
    metadata:
      category: security
```

---

## `tools/extract_reports.py` (aggiunto estrazione PHPStan e ShellCheck)

```python
import json
import os
import glob

def extract_phpstan_issues(path):
    results = []
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        results = data.get('files', {}).values()
    except Exception as e:
        print(f"Error reading PHPStan report: {e}")
    return results

def extract_shellcheck_issues(dir_path):
    issues = []
    try:
        files = glob.glob(os.path.join(dir_path, '**/*.json'), recursive=True)
        for file in files:
            with open(file, 'r') as f:
                data = json.load(f)
                issues.extend(data)
    except Exception as e:
        print(f"Error reading ShellCheck reports: {e}")
    return issues

#... (resto codice estrazione come prima)

def main():
    reports_dir = "security-reports"
    print("=== Vulnerabilities and Security Findings ===\n")

    # Esempio chiamate estese:
    phpstan_issues = extract_phpstan_issues(os.path.join(reports_dir, 'phpstan-report.json'))
    shellcheck_issues = extract_shellcheck_issues(os.path.join(reports_dir, 'shellcheck'))

    print(f"\nPHPStan Issues: {len(phpstan_issues)}")
    for file_issues in phpstan_issues:
        for error in file_issues.get('errors', []):
            print(f" - {error}")

    print(f"\nShellCheck Issues: {len(shellcheck_issues)}")
    for issue in shellcheck_issues:
        print(f" - {issue.get('file')}:{issue.get('line')} - {issue.get('message')}")

    # (continua con estrazioni precedenti...)
```

---

# Ulteriori consigli e personalizzazioni

* Puoi ampliare la cartella `semgrep-rules/` con più regole mirate ai tuoi rischi specifici
* Il workflow può essere parametrizzato per scansionare branch o tag specifici
* Puoi aggiungere notifiche (Slack, email) per alert in caso di vulnerabilità critiche

---

Se vuoi, ti posso generare il progetto completo in un unico output come prima, con tutto questo integrato e pronto da pushare su GitHub.
Oppure ti posso fornire i singoli file per integrazione.

Fammi sapere!

---
///
\\\
---

Eccoti il progetto completo, aggiornato e pronto per essere pubblicato come repository GitHub.

---

# tgfeed-security-enhancer

**Obiettivo:**
Fornire una suite avanzata e multi-linguaggio per la scansione di sicurezza dei repository (come `tgfeed`), integrando CodeQL, Semgrep con regole personalizzate, Bandit, PHPStan, ShellCheck e altri scanner. Il progetto include un workflow GitHub Actions parametrizzabile e script di estrazione report per facilitare la valutazione delle vulnerabilità.

---

## 1. README.md

````markdown
# tgfeed-security-enhancer

## Obiettivi del progetto

Fornire un sistema integrato di scansione di sicurezza per repository software multi-linguaggio, capace di individuare vulnerabilità, cattive pratiche e possibili divulgazioni di dati sensibili, con un workflow CI/CD completo su GitHub Actions.

## Contesto e Finalità

La sicurezza del codice è cruciale. Questo progetto nasce dall'esigenza di analizzare e garantire sicurezza su progetti come [tgfeed](https://github.com/sshrshnv/tgfeed), estendendo l'analisi a JavaScript, Python, PHP, Bash, e altri linguaggi grazie a tool multipli (CodeQL, Semgrep, Bandit, PHPStan, ShellCheck, Trivy).

## Funzionalità principali

- Workflow GitHub Actions per scansione automatica e schedulata
- Semgrep con regole personalizzate specifiche per hardcoded secrets, uso pericoloso di funzioni, logging di dati sensibili
- Integrazione con CodeQL per scansioni approfondite
- Supporto per Bandit (Python), PHPStan (PHP), ShellCheck (Bash)
- Report aggregati salvati come artifact e script per estrazione dettagliata
- Parametrizzazione branch/tag per scansioni mirate

## Istruzioni di installazione e uso

### Clona il repository o applica la patch al tuo repo esistente:

```bash
git clone https://github.com/tuoutente/tgfeed-security-enhancer.git
````

oppure applica la patch (fornita in `patches/add-security-scan.patch`) al tuo repo:

```bash
git apply patches/add-security-scan.patch
```

### Configurazione

* Modifica il file `.github/workflows/security-scan.yml` per specificare branch/tag da scansionare (di default: `main`)
* Personalizza o aggiungi regole Semgrep nella cartella `semgrep-rules/`
* Installa dipendenze necessarie se vuoi eseguire scansioni localmente

### Esecuzione

* Il workflow GitHub Actions esegue automaticamente le scansioni su push, pull request o schedulazione settimanale
* I report vengono salvati in `security-reports/` e caricati come artifact
* Per estrarre e visualizzare i report, usa:

```bash
python3 tools/extract_reports.py
```

## Tecnologie utilizzate

* [GitHub Actions](https://github.com/features/actions)
* [CodeQL](https://codeql.github.com/)
* [Semgrep](https://semgrep.dev/)
* [Bandit](https://bandit.readthedocs.io/en/latest/)
* [PHPStan](https://phpstan.org/)
* [ShellCheck](https://www.shellcheck.net/)
* [Ripgrep](https://github.com/BurntSushi/ripgrep)

---

## Struttura del progetto

```
tgfeed-security-enhancer/
├── .github/
│   └── workflows/
│       └── security-scan.yml
├── patches/
│   └── add-security-scan.patch
├── semgrep-rules/
│   ├── hardcoded-secrets.yaml
│   ├── dangerous-functions.yaml
│   ├── logging-sensitive-data.yaml
│   └── README.md
├── security-reports/    # generata da workflow
├── tools/
│   ├── extract_reports.py
│   └── README.md
├── .gitignore
├── LICENSE
└── README.md
```

---

## Contatti

Contribuzioni, segnalazioni o richieste di miglioramenti sono benvenute!

---

# Fine README.md

````

---

## 2. `.github/workflows/security-scan.yml`

```yaml
name: Security Scan Multi-language Advanced

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main", "develop" ]
  workflow_dispatch:
  schedule:
    - cron: '0 3 * * 1' # ogni lunedì alle 03:00 UTC

jobs:
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read
      actions: read
      packages: read

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install JS dependencies
      run: npm install || echo "No package.json found"

    - name: Run npm audit (JS)
      run: |
        mkdir -p security-reports
        npm audit --json > security-reports/npm-audit.json || true

    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.x'

    - name: Install Bandit, PHPStan, ShellCheck
      run: |
        pip install bandit semgrep
        sudo apt-get update && sudo apt-get install -y shellcheck php-cli php-xml php-mbstring
        composer global require phpstan/phpstan || echo "PHPStan install skipped"

    - name: Run Bandit scan (Python)
      run: bandit -r . -f json -o security-reports/bandit-report.json || true

    - name: Run ShellCheck (Bash)
      run: |
        mkdir -p security-reports/shellcheck
        find . -name '*.sh' -exec shellcheck -f json -o security-reports/shellcheck/{}.json {} \; || true

    - name: Run PHPStan (PHP)
      run: |
        ~/.composer/vendor/bin/phpstan analyse --error-format=json > security-reports/phpstan-report.json || true

    - name: Run ripgrep for secrets
      run: |
        rg --json --json-path '.data.lines[0].text' --json-seq --json-seq-delim '\n' 'token|password|secret|apikey|api_key|access_key|auth' > security-reports/ripgrep-report.json || true

    - name: Run Semgrep with custom rules
      run: semgrep --config semgrep-rules --json --output security-reports/semgrep-report.json || true

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: javascript, python, php, bash

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3

    - name: Upload Security Reports
      uses: actions/upload-artifact@v3
      with:
        name: security-reports
        path: security-reports/
````

---

## 3. `semgrep-rules/README.md`

````markdown
# Regole personalizzate Semgrep

Questa cartella contiene regole Semgrep per l'individuazione di vulnerabilità specifiche, cattive pratiche e possibili divulgazioni di dati sensibili.

## Regole principali

- `hardcoded-secrets.yaml`: rilevamento di segreti hardcoded (password, token, chiavi)
- `dangerous-functions.yaml`: uso di funzioni potenzialmente pericolose (`eval`, `exec`, `system`, ecc.)
- `logging-sensitive-data.yaml`: logging di dati sensibili

## Come aggiungere nuove regole

1. Creare un file `.yaml` seguendo la [documentazione ufficiale di Semgrep](https://semgrep.dev/docs/writing-rules/)
2. Posizionarlo nella cartella `semgrep-rules/`
3. Aggiornare il workflow GitHub Actions se necessario

---

## Esempio di comando per testare localmente:

```bash
semgrep --config semgrep-rules/ .
````

````

---

## 4. Esempi regole Semgrep (in `semgrep-rules/`)

### `hardcoded-secrets.yaml`

```yaml
rules:
  - id: hardcoded-secret
    patterns:
      - pattern-either:
          - pattern: api_key = "$SECRET"
          - pattern: password = "$SECRET"
          - pattern: token = "$SECRET"
          - pattern: const API_KEY = "$SECRET"
          - pattern: export SECRET=*
    message: "Hardcoded secret found. Consider environment variables or secret managers."
    severity: ERROR
    languages: [python, javascript, php, bash]
    metadata:
      category: security
````

### `dangerous-functions.yaml`

```yaml
rules:
  - id: dangerous-eval
    pattern: eval(...)
    message: "Avoid using eval due to code injection risk."
    severity: ERROR
    languages: [javascript, php, python]
    metadata:
      category: security

  - id: dangerous-exec
    pattern: exec(...)
    message: "Use of exec can lead to command injection. Validate inputs."
    severity: ERROR
    languages: [python]
    metadata:
      category: security

  - id: dangerous-system
    pattern: system(...)
    message: "Use of system calls can be dangerous. Validate inputs."
    severity: WARNING
    languages: [php]
    metadata:
      category: security
```

### `logging-sensitive-data.yaml`

```yaml
rules:
  - id: sensitive-data-logging
    pattern: |
      console.log($SENSITIVE)
    message: "Logging sensitive data detected."
    severity: WARNING
    languages: [javascript]

  - id: python-logging-sensitive
    pattern: |
      logging.info($SENSITIVE)
    message: "Logging potentially sensitive data."
    severity: WARNING
    languages: [python]

  - id: php-logging-sensitive
    pattern: |
      error_log($SENSITIVE)
    message: "Logging potentially sensitive data."
    severity: WARNING
    languages: [php]
```

---

## 5. `tools/extract_reports.py`

```python
#!/usr/bin/env python3

import json
import os
import glob

def extract_semgrep_issues(path):
    issues = []
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        for result in data.get('results', []):
            issues.append({
                'check_id': result.get('check_id'),
                'message': result.get('extra', {}).get('message'),
                'file': result.get('path'),
                'start_line': result.get('start', {}).get('line'),
                'end_line': result.get('end', {}).get('line'),
                'severity': result.get('severity'),
            })
    except Exception as e:
        print(f"Errore nel parsing del report Semgrep: {e}")
    return issues

def extract_bandit_issues(path):
    issues = []
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        for issue in data.get('results', []):
            issues.append({
                'filename': issue.get('filename'),
                'issue_text': issue.get('issue_text'),
                'severity': issue.get('issue_severity'),
                'line_number': issue.get('line_number'),
            })
    except Exception as e:
        print(f"Errore nel parsing del report Bandit: {e}")
    return issues

def extract_phpstan_issues(path):
    issues = []
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        # PHPStan report struttura base
        for file_path, file_data in data.get('files', {}).items():
            for error in file_data.get('errors', []):
                issues.append({
                    'file': file_path,
                    'message': error,
                })
    except Exception as e:
        print(f"Errore nel parsing del report PHPStan: {e}")
    return issues

def extract_shellcheck_issues(dir_path):
    issues = []
    try:
        files = glob.glob(os.path.join(dir_path, '**/*.json'), recursive=True)
        for file in files:
            with open(file, 'r') as f:
                data = json.load(f)
                issues.extend(data)
    except Exception as e:
        print(f"Errore nel parsing dei report ShellCheck: {e}")
    return issues

def extract_ripgrep_issues(path):
    issues = []
    try:
        with open(path, 'r') as f:
            for line in f:
                if line.strip():
                    issues.append(json.loads(line))
    except Exception as e:
        print(f"Errore nel parsing del report Ripgrep: {e}")
    return issues

def main():
    reports_dir = "security-reports"
    print("\n=== Vulnerabilities and Security Findings ===\n")

    semgrep = extract_semgrep_issues(os.path.join(reports_dir, "semgrep-report.json"))
    print(f"Semgrep issues: {len(semgrep)}")
    for i in semgrep:
        print(f"- [{i['severity']}] {i['file']}:{i['start_line']} - {i['message']} ({i['check_id']})")

    bandit = extract_bandit_issues(os.path.join(reports_dir, "bandit-report.json"))
    print(f"\nBandit issues: {len(bandit)}")
    for i in bandit:
        print(f"- [{i['severity']}] {i['filename']}:{i['line_number']} - {i['issue_text']}")

    phpstan = extract_phpstan_issues(os.path.join(reports_dir, "phpstan-report.json"))
    print(f"\nPHPStan issues: {len(phpstan)}")
    for i in phpstan:
        print(f"- {i['file']} - {i['message']}")

    shellcheck = extract_shellcheck_issues(os.path.join(reports_dir, "shellcheck"))
    print(f"\nShellCheck issues: {len(shellcheck)}")
    for i in shellcheck:
        print(f"- {i.get('file')}:{i.get('line')} - {i.get('message')}")

    ripgrep = extract_ripgrep_issues(os.path.join(reports_dir, "ripgrep-report.json"))
    print(f"\nRipgrep findings (possible secrets): {len(ripgrep)}")
    for i in ripgrep:
        print(f"- {i.get('data', {}).get('lines', [{}])[0].get('text', '').strip()}")

if
```


**name** == "**main**":
main()

```

---

## 6. `.gitignore`

```

# Logs

logs
*.log
npm-debug.log*

# Dependency directories

node_modules/
vendor/
**pycache**/
*.pyc

# Security reports

security-reports/

# Environment files

.env
.env.local
.env.*.local

# MacOS

.DS_Store

# Python virtual environments

venv/
.env/

```

---

## 7. LICENSE (MIT)

```

MIT License

Copyright (c) 2025 [Tuo Nome]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[...standard MIT license text...]

````

---

## 8. Patch `patches/add-security-scan.patch`

```diff
diff --git a/.github/workflows/security-scan.yml b/.github/workflows/security-scan.yml
new file mode 100644
index 0000000..abcdef1
--- /dev/null
+++ b/.github/workflows/security-scan.yml
@@ -0,0 +1,63 @@
+name: Security Scan Multi-language Advanced
+
+on:
+  push:
+    branches: [ "main", "develop" ]
+  pull_request:
+    branches: [ "main", "develop" ]
+  workflow_dispatch:
+  schedule:
+    - cron: '0 3 * * 1' # ogni lunedì alle 03:00 UTC
+
+jobs:
+  security-scan:
+    runs-on: ubuntu-latest
+    permissions:
+      security-events: write
+      contents: read
+      actions: read
+      packages: read
+
+    steps:
+    - name: Checkout code
+      uses: actions/checkout@v4
+
+    - name: Setup Node.js
+      uses: actions/setup-node@v3
+      with:
+        node-version: '18'
+
+    - name: Install JS dependencies
+      run: npm install || echo "No package.json found"
+
+    - name: Run npm audit (JS)
+      run: |
+        mkdir -p security-reports
+        npm audit --json > security-reports/npm-audit.json || true
+
+    - name: Setup Python
+      uses: actions/setup-python@v4
+      with:
+        python-version: '3.x'
+
+    - name: Install Bandit, PHPStan, ShellCheck
+      run: |
+        pip install bandit semgrep
+        sudo apt-get update && sudo apt-get install -y shellcheck php-cli php-xml php-mbstring
+        composer global require phpstan/phpstan || echo "PHPStan install skipped"
+
+    - name: Run Bandit scan (Python)
+      run: bandit -r . -f json -o security-reports/bandit-report.json || true
+
+    - name: Run ShellCheck (Bash)
+      run: |
+        mkdir -p security-reports/shellcheck
+        find . -name '*.sh' -exec shellcheck -f json -o security-reports/shellcheck/{}.json {} \; || true
+
+    - name: Run PHPStan (PHP)
+      run: |
+        ~/.composer/vendor/bin/phpstan analyse --error-format=json > security-reports/phpstan-report.json || true
+
+    - name: Run ripgrep for secrets
+      run: |
+        rg --json --json-path '.data.lines[0].text' --json-seq --json-seq-delim '\n' 'token|password|secret|apikey|api_key|access_key|auth' > security-reports/ripgrep-report.json || true
+
+    - name: Run Semgrep with custom rules
+      run: semgrep --config semgrep-rules --json --output security-reports/semgrep-report.json || true
+
+    - name: Initialize CodeQL
+      uses: github/codeql-action/init@v3
+      with:
+        languages: javascript, python, php, bash
+
+    - name: Perform CodeQL Analysis
+      uses: github/codeql-action/analyze@v3
+
+    - name: Upload Security Reports
+      uses: actions/upload-artifact@v3
+      with:
+        name: security-reports
+        path: security-reports/
+
diff --git a/semgrep-rules/hardcoded-secrets.yaml b/semgrep-rules/hardcoded-secrets.yaml
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/semgrep-rules/hardcoded-secrets.yaml
@@ -0,0 +1,30 @@
+rules:
+  - id: hardcoded-secret
+    patterns:
+      - pattern-either:
+          - pattern: api_key = "$SECRET"
+          - pattern: password = "$SECRET"
+          - pattern: token = "$SECRET"
+          - pattern: const API_KEY = "$SECRET"
+          - pattern: export SECRET=*
+    message: "Hardcoded secret found. Consider environment variables or secret managers."
+    severity: ERROR
+    languages: [python, javascript, php, bash]
+    metadata:
+      category: security
+
diff --git a/semgrep-rules/dangerous-functions.yaml b/semgrep-rules/dangerous-functions.yaml
new file mode 100644
index 0000000..2345678
--- /dev/null
+++ b/semgrep-rules/dangerous-functions.yaml
@@ -0,0 +1,35 @@
+rules:
+  - id: dangerous-eval
+    pattern: eval(...)
+    message: "Avoid using eval due to code injection risk."
+    severity: ERROR
+    languages: [javascript, php, python]
+    metadata:
+      category: security
+
+  - id: dangerous-exec
+    pattern: exec(...)
+    message: "Use of exec can lead to command injection. Validate inputs."
+    severity: ERROR
+    languages: [python]
+    metadata:
+      category: security
+
+  - id: dangerous-system
+    pattern: system(...)
+    message: "Use of system calls can be dangerous. Validate inputs."
+    severity: WARNING
+    languages: [php]
+    metadata:
+      category: security
+
diff --git a/semgrep-rules/logging-sensitive-data.yaml b/semgrep-rules/logging-sensitive-data.yaml
new file mode 100644
index 0000000..3456789
--- /dev/null
+++ b/semgrep-rules/logging-sensitive-data.yaml
@@ -0,0 +1,30 @@
+rules:
+  - id: sensitive-data-logging
+    pattern: |
+      console.log($SENSITIVE)
+    message: "Logging sensitive data detected."
+    severity: WARNING
+    languages: [javascript]
+
+  - id: python-logging-sensitive
+    pattern: |
+      logging.info($SENSITIVE)
+    message: "Logging potentially sensitive data."
+    severity: WARNING
+    languages: [python]
+
+  - id: php-logging-sensitive
+    pattern: |
+      error_log($SENSITIVE)
+    message: "Logging potentially sensitive data."
+    severity: WARNING
+    languages: [php]
diff --git a/tools/extract_reports.py b/tools/extract_reports.py
new file mode 100644
index 0000000..4567890
--- /dev/null
+++ b/tools/extract_reports.py
@@ -0,0 +1,90 @@
+#!/usr/bin/env python3
+
+import json
+import os
+import glob
+
+def extract_semgrep_issues(path):
+    issues = []
+    try:
+        with open(path, 'r') as f:
+            data = json.load(f)
+        for result in data.get('results', []):
+            issues.append({
+                'check_id': result.get('check_id'),
+                'message': result.get('extra', {}).get('message'),
+                'file': result.get('path'),
+                'start_line': result.get('start', {}).get('line'),
+                'end_line': result.get('end', {}).get('line'),
+                'severity': result.get('severity'),
+            })
+    except Exception as e:
+        print(f"Errore nel parsing del report Semgrep: {e}")
+    return issues
+
+def extract_bandit_issues(path):
+    issues = []
+    try:
+        with open(path, 'r') as f:
+            data = json.load(f)
+        for issue in data.get('results', []):
+            issues.append({
+                'filename': issue.get('filename'),
+                'issue_text': issue.get('issue_text'),
+                'severity': issue.get('issue_severity'),
+                'line_number': issue.get('line_number'),
+            })
+    except Exception as e:
+        print(f"Errore nel parsing del report Bandit: {e}")
+    return issues
+
+def extract_phpstan
````


_issues(path):

* issues = []
* try:
* ```
     with open(path, 'r') as f:
  ```
* ```
         data = json.load(f)
  ```
* ```
     for file_path, file_data in data.get('files', {}).items():
  ```
* ```
         for error in file_data.get('errors', []):
  ```
* ```
             issues.append({
  ```
* ```
                 'file': file_path,
  ```
* ```
                 'message': error,
  ```
* ```
             })
  ```
* except Exception as e:
* ```
     print(f"Errore nel parsing del report PHPStan: {e}")
  ```
* return issues
*

+def extract_shellcheck_issues(dir_path):

* issues = []
* try:
* ```
     files = glob.glob(os.path.join(dir_path, '**/*.json'), recursive=True)
  ```
* ```
     for file in files:
  ```
* ```
         with open(file, 'r') as f:
  ```
* ```
             data = json.load(f)
  ```
* ```
             issues.extend(data)
  ```
* except Exception as e:
* ```
     print(f"Errore nel parsing dei report ShellCheck: {e}")
  ```
* return issues
*

+def extract_ripgrep_issues(path):

* issues = []
* try:
* ```
     with open(path, 'r') as f:
  ```
* ```
         for line in f:
  ```
* ```
             if line.strip():
  ```
* ```
                 issues.append(json.loads(line))
  ```
* except Exception as e:
* ```
     print(f"Errore nel parsing del report Ripgrep: {e}")
  ```
* return issues
*

+def main():

* reports_dir = "security-reports"
* print("\n=== Vulnerabilities and Security Findings ===\n")
*
* semgrep = extract_semgrep_issues(os.path.join(reports_dir, "semgrep-report.json"))
* print(f"Semgrep issues: {len(semgrep)}")
* for i in semgrep:
* ```
     print(f"- [{i['severity']}] {i['file']}:{i['start_line']} - {i['message']} ({i['check_id']})")
  ```
*
* bandit = extract_bandit_issues(os.path.join(reports_dir, "bandit-report.json"))
* print(f"\nBandit issues: {len(bandit)}")
* for i in bandit:
* ```
     print(f"- [{i['severity']}] {i['filename']}:{i['line_number']} - {i['issue_text']}")
  ```
*
* phpstan = extract_phpstan_issues(os.path.join(reports_dir, "phpstan-report.json"))
* print(f"\nPHPStan issues: {len(phpstan)}")
* for i in phpstan:
* ```
     print(f"- {i['file']} - {i['message']}")
  ```
*
* shellcheck = extract_shellcheck_issues(os.path.join(reports_dir, "shellcheck"))
* print(f"\nShellCheck issues: {len(shellcheck)}")
* for i in shellcheck:
* ```
     print(f"- {i.get('file')}:{i.get('line')} - {i.get('message')}")
  ```
*
* ripgrep = extract_ripgrep_issues(os.path.join(reports_dir, "ripgrep-report.json"))
* print(f"\nRipgrep findings (possible secrets): {len(ripgrep)}")
* for i in ripgrep:
* ```
     print(f"- {i.get('data', {}).get('lines', [{}])[0].get('text', '').strip()}")
  ```
*

+if **name** == "**main**":

* main()

```

---

### Ora puoi:

- clonare il repo o applicare la patch
- personalizzare i branch/tag da scansionare nel workflow `.github/workflows/security-scan.yml`
- aggiungere o modificare regole Semgrep in `semgrep-rules/`
- eseguire `python3 tools/extract_reports.py` per aggregare e visualizzare i risultati

---

Se vuoi, posso anche fornirti uno script per eseguire tutte le scansioni localmente o ulteriori regole Semgrep mirate!  
Fammi sapere! 🚀
```

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---

---
///
\\\
---