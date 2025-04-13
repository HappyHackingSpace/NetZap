#!/usr/bin/env node

/**
 * Build script for the NetZap ZMap SDK
 * Handles both Node.js and browser builds
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'));
}

console.log('Building NetZap ZMap SDK...');

try {
  // Check if TypeScript is installed
  try {
    execSync('npx tsc --version', { stdio: 'ignore' });
    console.log('TypeScript is installed. Proceeding with build...');
  } catch (error) {
    console.log('TypeScript not found. Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Compile TypeScript to JavaScript
  console.log('Compiling TypeScript code...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  // No longer generating browser files since we're using a source file now
  
  // Create ESM module version for modern bundlers
  console.log('Creating ESM module version...');
  const esmDistPath = path.join(__dirname, 'dist', 'index.esm.js');
  fs.copyFileSync(path.join(__dirname, 'dist', 'index.js'), esmDistPath);
  
  console.log('Build completed successfully!');
  console.log('The SDK is now available in the dist/ directory.');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} 