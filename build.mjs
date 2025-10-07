import { exec } from 'child_process';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';
import { preprocess } from './preprocess.mjs';

const execAsync = promisify(exec);

const INPUT_DIR = 'data';
const OUTPUT_DIR = 'public';

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
        console.log('🚀 Starting build process...');

        // Ensure output directory exists
        await mkdir(OUTPUT_DIR, { recursive: true });

        // 1. Preprocess all files in the input directory
        console.log('🔍 Preprocessing files...');
        const processedData = await preprocess(INPUT_DIR);
        
        if (processedData.length === 0) {
            console.warn('⚠️ No markdown files found in the data directory. Build process finished early.');
            await createIndex([]); // Create an empty index
            return;
        }

        // 2. Convert each processed markdown content to a mind map
        console.log('🧠 Generating mind maps...');
        const conversionPromises = processedData.map(async ({ fileName, content }) => {
            const baseName = fileName.replace(/\.md$/, '');
            const outputPath = join(OUTPUT_DIR, `${baseName}.html`);
            
            // Pass '-' to markmap-cli to indicate reading from stdin.
            const command = `npx markmap-cli - --no-open --output "${outputPath}"`;
            const child = execAsync(command);
            
            if (child.child.stdin) {
                child.child.stdin.write(content);
                child.child.stdin.end();
            }

            await child;
            console.log(`🗺️  Mind map created: ${outputPath}`);
        });

        await Promise.all(conversionPromises);

        // 3. Create an index file for easy navigation
        const builtFiles = (await readdir(OUTPUT_DIR)).filter(file => file.endsWith('.html') && file !== 'index.html');
        await createIndex(builtFiles);

        console.log('✅ Build process completed successfully!');

    } catch (error) {
        console.error('❌ Build process failed:', error);
        process.exit(1);
    }
}

main();
