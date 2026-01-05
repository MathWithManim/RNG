const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

console.log('Starting Next.js Build Watcher...');
console.log('This will run "npm run build" whenever you make changes to the project files.');

// Function to run the build command
function runBuild() {
  console.log('\n🔄 Running build...');
  
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Build failed!');
      console.log(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
    console.log('✅ Build completed successfully!');
    console.log(stdout);
  });
}

// Watch specific file patterns that typically affect builds
const watcher = chokidar.watch([
  'app/**/*.{js,ts,tsx,jsx}',
  'components/**/*.{js,ts,tsx,jsx}', 
  'lib/**/*.{js,ts,tsx,jsx}',
  'services/**/*.{js,ts,tsx,jsx}',
  'package.json',
  'next.config.js',
  'tsconfig.json'
], {
  ignored: [
    /(^|[\/\\])\../, // dotfiles
    /node_modules/,
    /\.next/,
    /build/,
    /dist/,
    /out/
  ],
  persistent: true
});

let isBuilding = false;
let pendingBuild = false;

watcher
  .on('ready', () => {
    console.log('✅ File watcher is ready and listening for changes...');
    console.log('Building project for the first time...');
    runBuild();
  })
  .on('all', (event, filePath) => {
    console.log(`\n📝 File ${event}: ${filePath}`);
    
    if (isBuilding) {
      pendingBuild = true;
      console.log('⏳ Build in progress, will queue another build after completion...');
    } else {
      isBuilding = true;
      console.log('🔄 Triggering build...');
      runBuild();
    }
  });

// Handle build completion
process.on('message', (msg) => {
  if (msg === 'build-complete') {
    isBuilding = false;
    if (pendingBuild) {
      pendingBuild = false;
      console.log('🔄 Processing queued build...');
      setTimeout(runBuild, 1000); // Wait a bit before running queued build
    }
  }
});

// Handle exit
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping build watcher...');
  process.exit(0);
});