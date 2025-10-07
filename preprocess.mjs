import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Patterns to remove conversational noise. It can be extended.
const conversationalPatterns = [
    /^> .*/gm, // Blockquotes used in replies
    /^(User|Assistant|Gemini|You):\s*/gim, // Speaker labels
    /^Okay, .*$/gim, // Affirmations
    /^I have .*$/gim,
    /^I've .*$/gim,
    /^I will .*$/gim,
    /^(Great|Perfect|Excellent), .*$/gim, // Positive feedback
    /^Let me know if you have any other questions\.$/gim,
    /^Is there anything else I can help you with\?$/gim,
    // Specific pattern for 'scc.md' to fix tree structures
    {
        // This object targets a specific file for more granular control.
        // It converts text-based tree syntax into standard Markdown lists.
        // It replaces '├─' and '└─' with a standard list item '-'.
        // Then, it removes hanging pipe characters '│' at the start of lines.
        test: /scc\.md$/,
        replacer: (content) => content
            .replace(/(├|└)─/g, '-')
            .replace(/^│\s/gm, '  ') // Keep indentation
    }
];

/**
 * Cleans the content of a Markdown file by removing conversational patterns.
 * @param {string} content The raw content of the file.
 * @param {string} fileName The name of the file being processed.
 * @returns {string} The cleaned content.
 */
function cleanContent(content, fileName) {
    let cleanedContent = content;
    for (const pattern of conversationalPatterns) {
        if (typeof pattern === 'object' && pattern.test.test(fileName)) {
            cleanedContent = pattern.replacer(cleanedContent);
        } else if (pattern instanceof RegExp) {
            cleanedContent = cleanedContent.replace(pattern, '');
        }
    }
    return cleanedContent.trim();
}

/**
 * Preprocesses all Markdown files in a given directory.
 * @param {string} inputDir - The directory containing raw Markdown files.
 * @returns {Promise<Array<{fileName: string, content: string}>>} A promise that resolves to an array of objects, each containing the file name and its cleaned content.
 */
export async function preprocess(inputDir) {
    const files = await readdir(inputDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    const processedContents = [];

    for (const fileName of markdownFiles) {
        const filePath = join(inputDir, fileName);
        const rawContent = await readFile(filePath, 'utf8');
        const cleanedContent = cleanContent(rawContent, fileName);
        processedContents.push({ fileName, content: cleanedContent });
    }
    
    return processedContents;
}
