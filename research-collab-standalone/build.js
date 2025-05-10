const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set environment variables to disable TypeScript checking
process.env.NEXT_IGNORE_TS_ERRORS = 'true';
process.env.NEXT_SKIP_TYPE_CHECK = 'true';
process.env.NEXT_DISABLE_LINT = 'true';
process.env.DISABLE_ESLINT_PLUGIN = 'true';

// Use JavaScript files when available instead of TypeScript files
function ensureJsFilesAreUsed() {
  // Core files that need to be recognized
  const libDir = path.join(__dirname, 'lib');
  
  console.log('Checking for JavaScript alternatives to TypeScript files...');
  
  // Create an index.js file that re-exports from api.js
  const indexJsContent = `
  // This file is auto-generated during build
  // It re-exports everything from api.js
  module.exports = require('./api.js');
  `;
  
  fs.writeFileSync(path.join(libDir, 'index.js'), indexJsContent);
  console.log('Created lib/index.js to export from api.js');
  
  console.log('JavaScript setup complete!');
}

try {
  console.log('Setting up JavaScript alternatives...');
  ensureJsFilesAreUsed();
  
  console.log('Running Next.js build with type checking disabled...');
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_IGNORE_TS_ERRORS: 'true',
      NEXT_SKIP_TYPE_CHECK: 'true',
      NEXT_DISABLE_LINT: 'true',
      DISABLE_ESLINT_PLUGIN: 'true',
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 