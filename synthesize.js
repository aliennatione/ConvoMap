import { GoogleGenerativeAI } from '@google/generative-ai';

function classifyContent(content) {
    const technicalKeywords = ['git', 'npm', 'error', 'code', 'commit', 'deploy', 'workflow', 'debug', 'script'];
    const contentLower = content.toLowerCase();
    const technicalCount = technicalKeywords.reduce((count, keyword) => count + (contentLower.includes(keyword) ? 1 : 0), 0);
    if (technicalCount > 2) return 'technical';
    return 'literary';
}

function getTechnicalPrompt(content) {
    return `As an expert software project analyst, convert a technical conversation log into a structured, hierarchical markdown mind map for Markmap.\n\nInstructions:\n1. Title: Create a root title for the project or the main goal discussed.\n2. Key Topics: Identify major themes like "Project Setup", "Bug Fixes", "New Features", "Deployment", "Errors". These are your main branches.\n3. Hierarchy: Structure events, commands, and decisions chronologically or logically under the appropriate topic. Use indentation for sub-tasks or details.\n4. Code & Commands: Represent important terminal commands or code snippets as distinct nodes.\n5. Decisions & Outcomes: Clearly mark key decisions and their results.\n\nAnalyze the following technical log:\n---\n${content}\n---`;
}

function getLiteraryPrompt(content) {
    return `As an expert literary analyst, convert a chapter of a story into a structured, hierarchical markdown mind map for Markmap.\n\nInstructions:\n1. Identify Core Subject: Use the story's central theme or main character as the root node.\n2. Extract Plot Points: Pull out main events, character interactions, and turning points as primary branches.\n3. Analyze Characters: Create branches for main characters, describing their key actions, motivations, or dialogue.\n4. Note Settings: Create nodes for the different locations where the story takes place.\n5. Format for Markmap: Use standard markdown with # for the title and - for indented bullets.\n\nAnalyze the following story excerpt:\n---\n${content}\n---`;
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
