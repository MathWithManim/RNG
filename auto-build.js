#!/usr/bin/env node

// Simple build trigger script
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const BUILD_DELAY = 2000; // 2 seconds delay to avoid multiple rapid builds
let buildTimeout = null;
let isBuilding = false;

console.log('🚀 Next.js Auto-Build Script');
console.log('This script will automatically run "npm run build" when source files change.');
console.log('');

// Files and directories to watch
const watchPaths = [
  './app',
  './components', 
  './lib',
  './services',
  './types.ts',
  './next.config.js',
  './package.json',
  './tsconfig.json'
];

function runBuild() {
  if (isBuilding) {
    console.log('⚠️  Build already in progress, skipping...');
    return;
  }

  console.log('🔧 Starting build process...');
  isBuilding = true;

  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  buildProcess.on('close', (code) => {
    isBuilding = false;
    console.log(code === 0 
      ? '✅ Build completed successfully!' 
      : `❌ Build failed with exit code ${code}`
    );
    
    // If there are pending changes, trigger another build
    if (buildTimeout) {
      clearTimeout(buildTimeout);
      buildTimeout = null;
      setTimeout(runBuild, 500);
    }
  });

  buildProcess.on('error', (err) => {
    isBuilding = false;
    console.error('❌ Error running build:', err.message);
  });
}

function debounceBuild() {
  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }
  
  buildTimeout = setTimeout(() => {
    if (!isBuilding) {
      runBuild();
    } else {
      // If a build is in progress, schedule another one after it completes
      buildTimeout = setTimeout(debounceBuild, BUILD_DELAY);
    }
  }, BUILD_DELAY);
}

// Set up watchers
watchPaths.forEach(watchPath => {
  if (fs.existsSync(watchPath)) {
    fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
      if (filename && /\.(js|ts|tsx|jsx|json|css|scss|sass)$/i.test(filename)) {
        console.log(`📝 Detected change in: ${path.join(watchPath, filename)}`);
        debounceBuild();
      }
    });
    console.log(`👀 Watching: ${watchPath}`);
  } else {
    console.log(`⚠️  Warning: Path does not exist: ${watchPath}`);
  }
});

console.log('');
console.log('✨ Auto-build watcher is running...');
console.log('💡 The build will run automatically when you change source files');
console.log('   Press Ctrl+C to stop');

// Initial build
setTimeout(runBuild, 1000);