import { GoogleGenerativeAI } from '@google/generative-ai';

function classifyContent(content) {
    const technicalKeywords = ['git', 'npm', 'error', 'code', 'commit', 'deploy', 'workflow', 'debug', 'script'];
    const contentLower = content.toLowerCase();
    const technicalCount = technicalKeywords.reduce((count, keyword) => count + (contentLower.includes(keyword) ? 1 : 0), 0);
    if (technicalCount > 2) return 'technical';
    return 'literary';
}

function getTechnicalPrompt(content) {
    return `Sei un analista esperto. Converti il log di conversazione tecnica in una mappa mentale Markdown per Markmap, IN ITALIANO.

Istruzioni:
1. Non omettere alcun contenuto rilevante dell'originale: riporta decisioni, comandi, errori, risultati. Se ci sono citazioni testuali, riportale come citazioni Markdown (> ...) o come testo integrale.
2. Titolo radice chiaro.
3. Rami principali per temi (Setup, Bug, Feature, Deploy, Errori).
4. Gerarchia con indentazione.
5. Comandi/codice come nodi distinti (code inline o blocchi).
6. Decisioni ed esiti evidenziati.

Log da analizzare:
---
${content}
---
`;
}

function getLiteraryPrompt(content) {
    return `Sei un analista letterario. Converti il testo in una mappa mentale Markdown per Markmap, IN ITALIANO.

Istruzioni:
1. Non omettere alcun contenuto rilevante: riporta eventi, personaggi, dialoghi importanti, citazioni come citazioni Markdown (> ...) o testo integrale.
2. Nodo radice: tema centrale o protagonista.
3. Rami per eventi, personaggi, ambientazioni.
4. Formato Markmap con # titolo e - bullet indentati.

Testo da analizzare:
---
${content}
---
`;
}

export async function synthesizeContent(content, apiKey) {
    const contentType = classifyContent(content);
    console.log(`  - Content classified as: ${contentType}`);
    const prompt = contentType === 'technical' ? getTechnicalPrompt(content) : getLiteraryPrompt(content);

    const baseUrl = process.env.OPENCODE_BASE_URL || 'https://opencode.ai/inference/go/openai/v1';
    const model = process.env.OPENCODE_MODEL || 'beam-free';
    const key = process.env.OPENCODE_API_KEY || apiKey;
    const sessionId = crypto.randomUUID();

    const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'x-opencode-session': sessionId,
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
        }),
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`OpenCode API ${res.status}: ${txt.slice(0,500)}`);
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from OpenCode');
    return text;
}
