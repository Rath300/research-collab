#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define patterns to search and replace
const searchPattern = /from\s+['"]@research-collab\/db['"]/g;
const replacePattern = "from '../lib/types'";
const relativeImportPattern = "from '../../lib/types'";

// Function to recursively search for files
function findFiles(dir, fileExtensions) {
  const results = [];
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...findFiles(filePath, fileExtensions));
    } else if (fileExtensions.includes(path.extname(filePath))) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Find all TypeScript and JavaScript files
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const files = findFiles('.', fileExtensions);

// Count affected files
let fixedFiles = 0;

// Process each file
for (const file of files) {
  // Skip the types.ts file we created
  if (file.endsWith('lib/types.ts')) continue;
  
  const content = fs.readFileSync(file, 'utf8');
  
  if (searchPattern.test(content)) {
    console.log(`Fixing imports in: ${file}`);
    
    let updatedContent = content;
    
    // Determine how many levels deep the file is to calculate the proper relative path
    const relativePath = path.relative(path.dirname(file), '.');
    const levelsUp = relativePath.split(path.sep).length;
    
    // Apply the appropriate relative path
    if (levelsUp === 1) {
      updatedContent = content.replace(searchPattern, "from './lib/types'");
    } else if (levelsUp === 2) {
      updatedContent = content.replace(searchPattern, replacePattern);
    } else {
      // Add more '../' as needed based on directory depth
      const relativePath = '../'.repeat(levelsUp - 2) + 'lib/types';
      updatedContent = content.replace(searchPattern, `from '${relativePath}'`);
    }
    
    fs.writeFileSync(file, updatedContent);
    fixedFiles++;
  }
}

console.log(`Fixed imports in ${fixedFiles} files.`); 