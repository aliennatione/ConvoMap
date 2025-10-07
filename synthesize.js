import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Determines the content type of a text based on keywords.
 * @param {string} content The text to analyze.
 * @returns {'technical' | 'literary'} The classified content type.
 */
function classifyContent(content) {
    const technicalKeywords = ['git', 'npm', 'error', 'code', 'commit', 'deploy', 'workflow', 'debug', 'script'];
    const contentLower = content.toLowerCase();
    const technicalCount = technicalKeywords.reduce((count, keyword) => count + (contentLower.includes(keyword) ? 1 : 0), 0);

    // If we find more than 2 technical keywords, it's likely a technical log.
    if (technicalCount > 2) {
        return 'technical';
    }
    return 'literary';
}

/**
 * Generates a prompt for analyzing technical development logs.
 * @param {string} content The technical log content.
 * @returns {string} The specialized prompt for Gemini.
 */
function getTechnicalPrompt(content) {
    return `
      As an expert software project analyst, your task is to convert a technical conversation log into a structured, hierarchical markdown mind map for Markmap.

      **Instructions:**
      1.  **Title:** Create a root title for the project or the main goal discussed.
      2.  **Key Topics:** Identify major themes like "Project Setup", "Bug Fixes", "New Features", "Deployment", "Errors". These are your main branches.
      3.  **Hierarchy:** Structure events, commands, and decisions chronologically or logically under the appropriate topic. Use indentation for sub-tasks or details.
      4.  **Code & Commands:** Represent important terminal commands or code snippets as distinct nodes.
      5.  **Decisions & Outcomes:** Clearly mark key decisions and their results (e.g., "Decision: Use ES Modules", "Outcome: Resolved import errors").

      **Analyze the following technical log:**
      ---
      ${content}
      ---
    `;
}

/**
 * Generates a prompt for analyzing literary or narrative texts.
 * @param {string} content The story content.
 * @returns {string} The specialized prompt for Gemini.
 */
function getLiteraryPrompt(content) {
    return `
      As an expert literary analyst, your task is to convert a chapter of a story into a structured, hierarchical markdown mind map for Markmap.

      **Instructions:**
      1.  **Identify Core Subject:** Use the story's central theme or main character as the root node.
      2.  **Extract Plot Points:** Pull out main events, character interactions, and turning points as primary branches.
      3.  **Analyze Characters:** Create branches for main characters, describing their key actions, motivations, or dialogue.
      4.  **Note Settings:** Create nodes for the different locations where the story takes place.
      5.  **Format for Markmap:** Use standard markdown with # for the title and - for indented bullets.

      **Analyze the following story excerpt:**
      ---
      ${content}
      ---
    `;
}

/**
 * Analyzes content using a dynamically selected prompt and generates a mind map with Gemini.
 * @param {string} content The raw text content.
 * @param {string} apiKey The Gemini API key.
 * @returns {Promise<string>} The structured markdown for Markmap.
 */
export async function synthesizeContent(content, apiKey) {
    if (!apiKey) {
        throw new Error('Gemini API key is missing.');
    }

    const contentType = classifyContent(content);
    console.log(`  - Content classified as: ${contentType}`);

    const prompt = contentType === 'technical' ? getTechnicalPrompt(content) : getLiteraryPrompt(content);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        return text;
    } catch (error) {
        console.error(`Error during Gemini API call for ${contentType} content:`, error);
        return `# Analysis Error\n\n- Could not process content with Gemini.`;
    }
}
