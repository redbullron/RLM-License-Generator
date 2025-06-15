#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create electron directory if it doesn't exist
if (!fs.existsSync('./electron')) {
  fs.mkdirSync('./electron');
}

// Check if electron/main.js exists
if (!fs.existsSync('./electron/main.js')) {
  console.log('Creating Electron main process file...');
  // Copy the main.js from the current directory if it exists, or create a new one
  if (fs.existsSync('./electron-main.js')) {
    fs.copyFileSync('./electron-main.js', './electron/main.js');
  }
}

// Check if electron/preload.js exists
if (!fs.existsSync('./electron/preload.js')) {
  console.log('Creating Electron preload script...');
  // Copy the preload.js from the current directory if it exists, or create a new one
  if (fs.existsSync('./electron-preload.js')) {
    fs.copyFileSync('./electron-preload.js', './electron/preload.js');
  }
}

// Ensure types directory exists
if (!fs.existsSync('./src/types')) {
  fs.mkdirSync('./src/types', { recursive: true });
}

// Ensure utils directory exists
if (!fs.existsSync('./src/utils')) {
  fs.mkdirSync('./src/utils', { recursive: true });
}

console.log('Electron setup complete! You can now run:');
console.log('npm run electron:dev - to start the development server');
console.log('npm run electron:package - to build the application for production');