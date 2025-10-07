import { readdir, writeFile, mkdir } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fork } from 'child_process';

const execAsync = promisify(exec);

async function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const process = fork(scriptPath);
    process.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptPath} exited with code ${code}`));
      }
    });
  });
}

async function build() {
  try {
    // 1. Preprocess markdown files
    await runScript('./preprocess.mjs');

    const dataDir = './processed_data'; // Use the preprocessed data
    const publicDir = './public';
    await mkdir(publicDir, { recursive: true });

    const files = await readdir(dataDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    const links = [];

    for (const file of markdownFiles) {
      const inputFile = `${dataDir}/${file}`;
      const outputFile = `${publicDir}/${file.replace('.md', '.html')}`;
      
      try {
        // Use npx to run the locally installed markmap-cli
        const { stdout, stderr } = await execAsync(`npx markmap-cli ${inputFile} -o ${outputFile} --no-open`);
        if (stderr) {
          console.warn(`Warnings during conversion of ${file}:`, stderr);
        }
        console.log(`Converted ${file} to ${outputFile}`);
        links.push(`<li><a href="${file.replace('.md', '.html')}">${file.replace('.md', '')}</a></li>`);
      } catch (error) {
        console.error(`Failed to convert ${file}:`, error);
        // Continue to the next file even if one fails
      }
    }

    const indexHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Markmap Index</title>
        </head>
        <body>
          <h1>Markmap Index</h1>
          <ul>
            ${links.join('\n')}
          </ul>
        </body>
      </html>
    `;

    await writeFile(`${publicDir}/index.html`, indexHtml);
    console.log('Created index.html');

  } catch (error) {
    console.error('An error occurred during the build process:', error);
    process.exit(1); // Exit with an error code
  }
}

build();
