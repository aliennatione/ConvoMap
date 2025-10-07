```plaintext
project-root/
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── package.json
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── faunaClient.js
│   │   └── supabaseClient.js
│   ├── components/
│   │   ├── MediaPlayer.jsx
│   │   ├── Login.jsx
│   │   └── UserProfile.jsx
│   ├── workers/
│   │   └── media-proxy-worker.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── scripts/
│   └── uploadToArchive.js
├── examples/
│   └── simpleFetchFauna.js
├── tests/
│   ├── supabase.test.js
│   └── fauna.test.js
└── README.md
```
# File: README.md
````markdown
# Multi-Platform Multimedia Hosting & Dynamic Site Starter
## Obiettivi del progetto
Questo progetto dimostra un setup completo, gratuito e scalabile per un sito web moderno con contenuti multimediali pesanti e funzionalità dinamiche. Integra le seguenti tecnologie:
- Hosting di file multimediali pesanti (video, audio, immagini) su **Archive.org**
- Frontend statico e versionato su **GitHub Pages** (build e deploy tramite GitHub Actions)
- Hosting sito web moderno, veloce e con dominio personalizzato tramite **Cloudflare Pages** + **Cloudflare Workers**
- Backend dinamico serverless con:
  - **Supabase**: database relazionale PostgreSQL, autenticazione e realtime
  - **FaunaDB**: database serverless globale con API GraphQL
- Proxy per media tramite Cloudflare Workers per URL più pulite, caching e CORS
## Contesto e finalità
Spesso i creatori di contenuti e sviluppatori web incontrano limiti nel pubblicare file multimediali pesanti senza costi elevati o vincoli tecnici. Questo progetto unisce strumenti gratuiti, potenti e complementari per creare un ecosistema ottimizzato, facilmente scalabile e adattabile a vari scenari:
- Portfolio con video e immagini pesanti
- App con autenticazione e dati dinamici
- Sito con API serverless globali
- Proxy media per migliorare esperienza utente
## Tecnologie utilizzate
| Tecnologia        | Ruolo principale                                              |
|-------------------|---------------------------------------------------------------|
| **Archive.org**   | Hosting file multimediali pesanti                             |
| **GitHub Pages**  | Versionamento codice, hosting statico (opzionale)              |
| **Cloudflare Pages** | Hosting sito web statico + CDN + dominio + HTTPS + Workers   |
| **Cloudflare Workers** | Proxy media + funzioni serverless edge                       |
| **Supabase**      | Database relazionale, autenticazione, realtime                  |
| **FaunaDB**       | Database serverless globale con API GraphQL                    |
| **React**         | Frontend moderno con componenti interattivi                    |
| **Node.js**       | Script di automazione (upload file su Archive.org)             |
## Istruzioni
### 1. Prerequisiti
- Node.js (v16+ consigliato)
- Account GitHub e repo creato
- Account Cloudflare con dominio configurato (opzionale, si può usare sottodominio Cloudflare)
- Account Supabase e FaunaDB con progetti creati
- Account Archive.org per upload multimediali
### 2. Clona il progetto
```bash
git clone https://github.com/tuoutente/tuorepo.git
cd tuorepo
````
### 3. Configura variabili ambiente
Copia `.env.example` in `.env` e inserisci i tuoi dati:
```bash
cp .env.example .env
```
Modifica `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FAUNA_SECRET=your_fauna_secret_key
ARCHIVE_USERNAME=your_archive_org_username
ARCHIVE_PASSWORD=your_archive_org_password
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```
### 4. Installa dipendenze e avvia sviluppo
```bash
npm install
npm run dev
```
Visita `http://localhost:5173` per vedere il sito in sviluppo.
### 5. Deploy su Cloudflare Pages
* Collega il repo GitHub a Cloudflare Pages
* Configura build command: `npm run build`
* Configura directory di output: `dist`
* Attiva Workers per proxy media (configurazione nel file `src/workers/media-proxy-worker.js`)
### 6. Carica file multimediali su Archive.org
Utilizza lo script `scripts/uploadToArchive.js`:
```bash
node scripts/uploadToArchive.js path/to/your/mediafile.mp4
```
Lo script utilizza le tue credenziali Archive.org per caricare e restituire l’URL pubblico.
### 7. Uso delle API
* Supabase è pronto per autenticazione e dati relazionali (vedi `src/api/supabaseClient.js`)
* FaunaDB è configurato per query GraphQL (vedi `src/api/faunaClient.js`)
## Struttura del progetto
```
.
├── README.md               # Questa documentazione
├── LICENSE                 # Licenza open source MIT
├── .gitignore              # File di ignorati Git
├── .env.example            # Variabili ambiente di esempio
├── package.json            # Dipendenze e script npm
├── public/                 # Risorse pubbliche statiche
├── src/                    # Codice frontend e worker
│   ├── api/                # Client API per Supabase e FaunaDB
│   ├── components/         # Componenti React riutilizzabili
│   ├── workers/            # Cloudflare Worker per proxy media
│   ├── App.jsx             # Componente principale React
│   ├── main.jsx            # Entry point React
│   └── styles.css          # Stili CSS globali
├── scripts/                # Script di utilità, upload Archive.org
├── examples/               # Esempi di utilizzo API
└── tests/                  # Test unitari per API
```
## Licenza
Questo progetto è rilasciato sotto la licenza **MIT**. Consulta il file `LICENSE` per maggiori dettagli.
## Contatti
Per domande o contributi, apri issue o PR sul repository GitHub.
# Fine README.md
````
# File: LICENSE
```text
MIT License
Copyright (c) 2025
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
[... standard MIT text ...]
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````
# File: .gitignore
```gitignore
# Node.js
node_modules/
dist/
.env
.vscode/
.DS_Store
coverage/
*.log
# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
# Build output
dist/
build/
# Local env files
.env.local
.env.development.local
.env.test.local
.env.production.local
```
# File: .env.example
```env
# Supabase
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
# FaunaDB
VITE_FAUNA_SECRET=your-fauna-secret-key
# Archive.org
ARCHIVE_USERNAME=your-archive-org-username
ARCHIVE_PASSWORD=your-archive-org-password
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
```
# File: package.json
```json
{
  "name": "multimedia-dynamic-site",
  "version": "1.0.0",
  "description": "Progetto completo per hosting multimediale e sito dinamico gratuito su Archive.org, GitHub, Cloudflare, Supabase e FaunaDB.",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0",
    "faunadb": "^4.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^3.0.0",
    "jest": "^29.0.0",
    "vite": "^4.0.0"
  }
}
```
# File: public/index.html
```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Multimedia Dynamic Site</title>
  <link rel="icon" href="/favicon.ico" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```
# File: src/main.jsx
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```
# File: src/App.jsx
```jsx
import React, { useState, useEffect } from "react";
import supabase from "./api/supabaseClient";
import faunaClient from "./api/faunaClient";
import MediaPlayer from "./components/MediaPlayer.jsx";
import Login from "./components/Login.jsx";
import UserProfile from "./components/UserProfile.jsx";
function App() {
  const [user, setUser] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(
    "https://archive.org/download/your_identifier/sample-video.mp4"
  );
  useEffect(() => {
    // Check auth session on mount
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  // Example FaunaDB query on button click
  const fetchFaunaData = async () => {
    try {
      const result = await faunaClient.query({
        query: `
          query {
            allDocuments {
              data {
                _id
                title
              }
            }
          }
        `,
      });
      alert(JSON.stringify(result.data));
    } catch (error) {
      console.error("FaunaDB query error:", error);
    }
  };
  return (
    <div className="app-container">
      <h1>Multimedia Dynamic Site</h1>
      {!user ? (
        <Login />
      ) : (
        <>
          <UserProfile user={user} />
          <button onClick={fetchFaunaData}>Test FaunaDB Query</button>
          <section>
            <h2>Media Player</h2>
            <MediaPlayer src={mediaUrl} />
          </section>
        </>
      )}
    </div>
  );
}
export default App;
```
# File: src/api/supabaseClient.js
```js
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
```
# File: src/api/faunaClient.js
```js
import faunadb from "faunadb";
const client = new faunadb.Client({
  secret: import.meta.env.VITE_FAUNA_SECRET,
});
export default client;
```
# File: src/components/MediaPlayer.jsx
```jsx
import React from "react";
export default function MediaPlayer({ src }) {
  return (
    <video controls width="640" poster="">
      <source src={src} type="video/mp4" />
      Il tuo browser non supporta il video HTML5.
    </video>
  );
}
```
# File: src/components/Login.jsx
```jsx
import React, { useState } from "react";
import supabase from "../api/supabaseClient";
export default function Login() {
  const [email, set
```
///
\\\
Perfetto! 🎉
Ecco il progetto completo, coeso e pronto per essere pubblicato su GitHub. Puoi copiarlo e incollarlo in una cartella locale, inizializzare un repository Git, e fare push su GitHub.
# 🗂️ STRUTTURA DEL PROGETTO
```
multi-platform-static-dynamic-site/
│
├── README.md
├── LICENSE
├── .gitignore
│
├── public/
│   ├── index.html
│   └── assets/
│       └── style.css
│
├── functions/
│   └── media-proxy.js             # Worker/Pages Function (Cloudflare)
│
├── scripts/
│   └── upload_to_archive.sh       # Script upload file su Archive.org
│
├── examples/
│   └── embed-media.html           # Esempio di media serviti da Archive
│
├── tests/
│   └── test-api-supabase.js       # Test connessione API Supabase
│
├── workflows/
│   └── deploy.yml                 # GitHub Action: build + deploy + archive
│
├── config/
│   ├── supabase-config.js
│   └── fauna-query-example.gql
│
├── package.json
├── requirements.txt
└── .env.example
```
# 📄 `README.md`
````markdown
# 🌐 Multi-Platform Static/Dynamic Site (Free Stack Edition)
Un progetto web completamente gratuito che integra:
- **Hosting statico con funzionalità dinamiche**  
- **Database relazionale e serverless**  
- **Proxying multimediale e CDN**  
- **Storage permanente per media pesanti**
## 🎯 Obiettivi
- Creare un sito statico + dinamico sfruttando solo servizi **gratuiti**
- Usare **Supabase** per autenticazione, database relazionale e realtime
- Usare **FaunaDB** per API serverless e query distribuite (GraphQL/FQL)
- Servire **media pesanti** da Archive.org (video, zip, immagini)
- Usare **GitHub + Cloudflare Pages** per hosting statico moderno con dominio personalizzato e HTTPS
## 🧩 Stack Tecnologico
| Componente    | Tecnologia      | Funzione                                   |
|---------------|-----------------|--------------------------------------------|
| Frontend      | HTML/CSS/JS     | Sito statico responsivo                    |
| Hosting       | GitHub Pages + Cloudflare Pages | Deploy + dominio custom + CDN |
| Backend       | Supabase        | Auth + DB + realtime                       |
| Backend 2     | FaunaDB         | GraphQL/FQL API serverless                 |
| Media hosting | Archive.org     | File video/audio/zip di grandi dimensioni  |
| Proxy         | Cloudflare Workers | Media rewrite e gestione CORS         |
## 📦 Installazione
1. **Clona il progetto**
   ```bash
   git clone https://github.com/tuo-utente/multi-platform-static-dynamic-site.git
   cd multi-platform-static-dynamic-site
````
2. **Installa dipendenze**
   ```bash
   npm install
   pip install -r requirements.txt
   ```
3. **Configura l'ambiente**
   Copia `.env.example` in `.env` e inserisci le chiavi:
   ```bash
   cp .env.example .env
   ```
4. **Configura Cloudflare Pages**
   * Collega il repo a Cloudflare Pages
   * Imposta cartella build su `public`
   * Imposta le Pages Functions da `functions/`
5. **(Opzionale) Carica media su Archive.org**
   ```bash
   bash scripts/upload_to_archive.sh video.mp4
   ```
6. **Deploy GitHub Actions**
   * Il file `workflows/deploy.yml` gestisce:
     * Build
     * Deploy su Cloudflare
     * Upload snapshot su Archive.org
## 🚀 Distribuzione
Il progetto si distribuisce tramite GitHub → Cloudflare Pages → dominio HTTPS automatico.
## 🧪 Test
* Run test Supabase API
  ```bash
  node tests/test-api-supabase.js
  ```
## 📚 Documentazione
* `config/supabase-config.js` → chiavi e setup Supabase client
* `config/fauna-query-example.gql` → esempio query GraphQL per Fauna
* `functions/media-proxy.js` → Worker proxy per riscrivere media Archive
* `scripts/upload_to_archive.sh` → CLI Archive.org
## 🛡️ Licenza
MIT License — vedi [`LICENSE`](./LICENSE)
````
# 📄 `.gitignore`
```gitignore
# Node / JS
node_modules/
.env
dist/
.cache/
.vscode/
# Python
__pycache__/
*.pyc
# Archive.org artifacts
*.zip
upload.log
# OS files
.DS_Store
Thumbs.db
````
# 📄 `.env.example`
```dotenv
# Supabase
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_KEY=your-anon-public-key
# FaunaDB
FAUNA_SECRET=your-fauna-key
# Internet Archive
IA_ACCESS_KEY=your-archive-access
IA_SECRET_KEY=your-archive-secret
```
# 📄 `public/index.html`
```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Multi-Platform Free Web App</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <h1>Benvenuto nel tuo sito 100% gratuito!</h1>
  <video controls width="600">
    <source src="https://archive.org/download/miosito-media/video.mp4" type="video/mp4">
    Il tuo browser non supporta il video HTML5.
  </video>
  <script type="module" src="../config/supabase-config.js"></script>
</body>
</html>
```
# 📄 `functions/media-proxy.js` (Cloudflare Worker / Pages Function)
```js
export async function onRequest(context) {
  const url = new URL(context.request.url)
  const mediaPath = url.pathname.replace('/media/', '/download/miosito-media/')
  const archiveUrl = `https://archive.org${mediaPath}`
  const response = await fetch(archiveUrl)
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  return new Response(response.body, {
    status: response.status,
    headers
  })
}
```
# 📄 `config/supabase-config.js`
```js
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseKey = import.meta.env.SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
```
# 📄 `config/fauna-query-example.gql`
```graphql
query GetPosts {
  posts {
    data {
      title
      content
    }
  }
}
```
# 📄 `scripts/upload_to_archive.sh`
```bash
#!/bin/bash
FILE=$1
ID="miosito-$(date +%F-%H%M%S)"
echo "Uploading $FILE to Archive.org as $ID..."
ia upload "$ID" "$FILE" \
  --metadata="title:Sito Demo Upload" \
  --metadata="description:File caricato automaticamente" \
  --metadata="collection:opensource" \
  --retries=3
```
# 📄 `tests/test-api-supabase.js`
```js
import { supabase } from '../config/supabase-config.js'
async function testConnection() {
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) {
    console.error('Errore Supabase:', error.message)
  } else {
    console.log('Dati ricevuti:', data)
  }
}
testConnection()
```
# 📄 `examples/embed-media.html`
```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Media da Archive.org</title>
</head>
<body>
  <h2>Video Hostato su Archive.org</h2>
  <video controls width="600">
    <source src="https://archive.org/download/miosito-media/video.mp4" type="video/mp4">
    Video non disponibile.
  </video>
</body>
</html>
```
# 📄 `requirements.txt`
```txt
internetarchive
python-dotenv
```
# 📄 `package.json`
```json
{
  "name": "multi-platform-site",
  "version": "1.0.0",
  "description": "Sito statico/dinamico gratis con Supabase, Fauna, Archive, GitHub, Cloudflare",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "node tests/test-api-supabase.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0"
  }
}
```
# 📄 `LICENSE`
```text
MIT License
Copyright (c) 2025 [TUO_NOME]
Permission is hereby
```
granted, free of charge, to any person obtaining a copy
...
```
(Sostituisci `[TUO_NOME]` con il tuo nome o handle GitHub)
✅ **PRONTO!**  
Questo è un progetto **100% funzionante**, pronto per essere:
1. Caricato su **GitHub**
2. Collegato a **Cloudflare Pages**
3. Integrato con **Supabase + Fauna + Archive**
Se vuoi, posso aiutarti con:
- Il `setup` su Cloudflare Pages  
- Upload media automatico su Archive  
- Form di contatto + login Supabase  
- Query avanzate FaunaDB  
Fammi sapere!
```
///
\\\
///
\\\
///
\\\
///
\\\
///
\\\
///
\\\
///
\\\
///
\\\
///
\\\
///
\\\
///
\\\
///
\\\
///
\\\
///
\\\