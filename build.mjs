import { readdir, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  const dataDir = './data';
  const publicDir = './public';
  const files = await readdir(dataDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));

  const links = [];

  for (const file of markdownFiles) {
    const inputFile = `${dataDir}/${file}`;
    const outputFile = `${publicDir}/${file.replace('.md', '.html')}`;
    // Use npx to run the locally installed markmap-cli
    const { stdout, stderr } = await execAsync(`npx markmap ${inputFile} -o ${outputFile} --no-open`);
    if (stderr) {
      console.error(`Error converting ${file}:`, stderr);
    } else {
      console.log(`Converted ${file} to ${outputFile}`);
      links.push(`<li><a href="${file.replace('.md', '.html')}">${file.replace('.md', '')}</a></li>`);
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
}

build();
