import fs from 'fs/promises';
import path from 'path';

const inputDir = './data';
const outputDir = './processed_data';

// List of conversational patterns to remove
const conversationalPatterns = [
  /^> /,
  /^no, rispondi qui\./i,
  /^Genera un progetto completo/i,
  /^Fammi sapere/i,
  /^Perfetto/i,
  /^Se vuoi/i,
  /^Dimmi pure/i,
  /😊/,
  /^Cosa vuoi fare ora\?/i,
  /^Ottima scelta/i,
  /^Hai ragione/i,
  /^Mi scuso/i,
  /^Certamente/i,
  /^Ecco/i,
  /^Certo/i,
  /^Va bene/i,
  /^Ok/i,
  /^Grazie/i
];

async function preprocessFile(inputFile, outputFile) {
  try {
    let content = await fs.readFile(inputFile, 'utf-8');

    // Specific fix for scc.md box-drawing characters
    if (path.basename(inputFile) === 'scc.md') {
      content = content.replace(/├/g, '*').replace(/─/g, '-').replace(/│/g, ' ');
    }

    const lines = content.split('\n');
    const processedLines = [];

    let inCodeBlock = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        processedLines.push(line); // Keep code block delimiters
        continue;
      }

      if (inCodeBlock) {
        processedLines.push(line); // Keep all lines within code blocks as is
        continue;
      }

      // Ignore lines matching conversational patterns
      if (conversationalPatterns.some(pattern => pattern.test(trimmedLine))) {
        continue;
      }
      
      // Ignore empty lines and simple separators
      if (trimmedLine === '' || trimmedLine === '---') {
        continue;
      }

      processedLines.push(line);
    }

    await fs.writeFile(outputFile, processedLines.join('\n'));
    console.log(`Preprocessed and structured: ${path.basename(inputFile)}`);

  } catch (error) {
    console.error(`Error processing ${inputFile}:`, error);
  }
}

async function main() {
  try {
    await fs.mkdir(outputDir, { recursive: true });
    const files = await fs.readdir(inputDir);
    for (const file of files) {
      if (path.extname(file) === '.md') {
        const inputFile = path.join(inputDir, file);
        const outputFile = path.join(outputDir, file);
        await preprocessFile(inputFile, outputFile);
      }
    }
    console.log('Advanced preprocessing complete.');
  } catch (error) {
    console.error('Error during advanced preprocessing:', error);
  }
}

main();
