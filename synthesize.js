import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Analyzes and restructures a raw text conversation into a hierarchical markdown mind map
 * using the Gemini API.
 * @param {string} content The raw text content of the conversation.
 * @param {string} apiKey The Gemini API key.
 * @returns {Promise<string>} The structured markdown ready for Markmap.
 */
export async function synthesizeContent(content, apiKey) {
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please set the GEMINI_API_KEY environment variable.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    As an expert software project analyst, your task is to convert a raw conversation log into a structured, hierarchical markdown mind map. Your output will be directly used by Markmap.

    **Instructions:**

    1.  **Analyze the Core Subject:** Identify the main goal or subject of the conversation. This will be your root node.
    2.  **Identify Key Themes:** Extract the main topics, questions, and decisions. These will be the primary branches of your mind map.
    3.  **Structure Hierarchically:** Organize the information logically. Use sub-bullets (indentation) to represent details, code snippets, file paths, and subsequent developments related to a key theme.
    4.  **Extract Actionable Items:** Highlight important code snippets (using markdown for code blocks), commands, and file names.
    5.  **Create Repository Links:** If a file path (e.g., \`build.mjs\`, \`.github/workflows/deploy.yml\`) is mentioned, format it as a markdown link pointing to its location in the \`aliennatione/ConvoMap\` repository on the \`main\` branch. The format should be \`[filename](https://github.com/aliennatione/ConvoMap/blob/main/filename)\`.
    6.  **Summarize and Conclude:** Create a final "Conclusion" or "Outcome" branch that summarizes the final state or resolution of the conversation.
    7.  **Format for Markmap:** Use standard markdown syntax (# for the title, - for bullets, indentation for hierarchy, and \`\`\` for code blocks).

    **Example Input (Raw Log):**
    "User: I'm getting a 403 error when deploying to gh-pages.
    AI: Ah, that's a permissions issue. The GITHUB_TOKEN needs write access. You need to add 'permissions: contents: write' to your deploy.yml workflow file.
    User: done.
    AI: Great, pushing the fix now."

    **Example Output (Structured Markdown):**
    # GitHub Pages Deployment Issue

    - **Problem Identified**: Deployment fails with a 403 Forbidden error.
      - **Root Cause**: The default \`GITHUB_TOKEN\` lacks write permissions to the repository.
    - **Solution Proposed**: Grant write permissions to the deployment job.
      - **Specific Change**: Add \`permissions: contents: write\` to the workflow file.
      - **File Affected**: [\`.github/workflows/deploy.yml\`](https://github.com/aliennatione/ConvoMap/blob/main/.github/workflows/deploy.yml)
    - **Implementation**: The fix was applied and pushed to the \`main\` branch.
    - **Outcome**: The deployment workflow is now expected to succeed.

    **Now, analyze and structure the following conversation log:**

    ---
    ${content}
    ---
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Error during Gemini API call:", error);
    // Fallback to a simple version of the content to avoid total failure
    return `# Analysis Error

- Could not process content with Gemini.
- Raw content:
\\\`\\\`\\\`
${content.substring(0, 500)}...
\\\`\\\`\\\``;
  }
}
