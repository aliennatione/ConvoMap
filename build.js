import { exec } from 'child_process';
import { writeFile, mkdir, readdir, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';
import { synthesizeContent } from './synthesize.js'; // Import the new intelligent synthesizer

const execAsync = promisify(exec);

const INPUT_DIR = 'data';
const OUTPUT_DIR = 'public';
const TEMP_DIR = 'tmp_build';

/**
 * Generates an index.html file that lists all created mind maps.
 * @param {string[]} builtFiles - A list of the generated HTML file names.
 */
async function createIndex(builtFiles) {
    const links = builtFiles
        .map(file => `<li><a href="./${file}">${file.replace(/\.html$/, '')}</a></li>`)
        .join('\n');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ConvoMap Index</title>
            <style>
                body { font-family: sans-serif; background-color: #f0f2f5; margin: 0; padding: 2rem; }
                .container { max-width: 800px; margin: auto; background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                h1 { color: #333; }
                ul { list-style-type: none; padding: 0; }
                li { margin: 0.5rem 0; }
                a { text-decoration: none; color: #007bff; font-size: 1.1rem; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>ConvoMap Index</h1>
                <p>Select a mind map to view:</p>
                <ul>
                    ${links}
                </ul>
            </div>
        </body>
        </html>
    `;

    await writeFile(join(OUTPUT_DIR, 'index.html'), htmlContent);
    console.log('✅ Index file created.');
}

/**
 * Main build process.
 */
async function main() {
    try {
        console.log('🚀 Starting intelligent build process...');

        // Get Gemini API Key from environment
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY environment variable is not set.');
        }

        await mkdir(OUTPUT_DIR, { recursive: true });
        await mkdir(TEMP_DIR, { recursive: true });

        const files = await readdir(INPUT_DIR);
        const markdownFiles = files.filter(file => file.endsWith('.md'));

        if (markdownFiles.length === 0) {
            console.warn('⚠️ No markdown files found. Build finished early.');
            await createIndex([]);
            return;
        }

        console.log(`🧠 Synthesizing content for ${markdownFiles.length} file(s) using Gemini...`);

        const conversionPromises = markdownFiles.map(async (fileName) => {
            const rawContent = await readFile(join(INPUT_DIR, fileName), 'utf-8');
            
            // Synthesize content with Gemini
            const synthesizedMarkdown = await synthesizeContent(rawContent, geminiApiKey);
            
            const baseName = fileName.replace(/\.md$/, '');
            const tempInputPath = join(TEMP_DIR, `${baseName}.md`);
            const outputPath = join(OUTPUT_DIR, `${baseName}.html`);

            await writeFile(tempInputPath, synthesizedMarkdown);

            const command = `npx markmap-cli "${tempInputPath}" --no-open --output "${outputPath}"`;
            await execAsync(command);
            
            console.log(`🗺️  Mind map created: ${outputPath}`);
        });

        await Promise.all(conversionPromises);

        const builtFiles = (await readdir(OUTPUT_DIR)).filter(file => file.endsWith('.html') && file !== 'index.html');
        await createIndex(builtFiles);

        console.log('✅ Build process completed successfully!');

    } catch (error) {
        console.error('❌ Build process failed:', error);
        process.exit(1);
    } finally {
        await rm(TEMP_DIR, { recursive: true, force: true });
        console.log('🧹 Cleaned up temporary files.');
    }
}

main();
