import fs from 'fs/promises';
import path from 'path';

const inputDir = './data';
const outputDir = './processed_data';

async function preprocessFile(inputFile, outputFile) {
  try {
    const data = await fs.readFile(inputFile, 'utf-8');
    const lines = data.split('\n');
    
    // 1. Remove blockquotes, empty lines, and thematic breaks
    const filteredLines = lines.filter(line => 
      !line.trim().startsWith('>') && 
      line.trim() !== '' &&
      !line.trim().match(/^(---|\*\*\*|___)$/)
    );
    
    // 2. Remove the first line if it is a level 1 heading
    if (filteredLines.length > 0 && filteredLines[0].startsWith('# ')) {
        filteredLines.shift();
    }

    const processedContent = filteredLines.join('\n');
    await fs.writeFile(outputFile, processedContent);
    console.log(`Preprocessed: ${path.basename(inputFile)}`);
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
    console.log('Preprocessing complete.');
  } catch (error) {
    console.error('Error during preprocessing:', error);
  }
}

main();
