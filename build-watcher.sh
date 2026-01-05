#!/bin/bash

# Simple script to watch for file changes and run build
echo "Starting build watcher..."
echo "This will run 'npm run build' whenever you make changes to the project files."

# Function to run build
run_build() {
    echo "Running build..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "Build completed successfully!"
    else
        echo "Build failed!"
    fi
}

# Initial build
run_build

echo "Watching for changes in the project directory..."
echo "Press Ctrl+C to stop."

# Watch for changes using inotifywait if available, otherwise just notify user
if command -v inotifywait &> /dev/null; then
    inotifywait -m -r -e modify,create,delete --include=".*\.\(js\|ts\|tsx\|jsx\|json\|css\|scss\)$" . &
    INOTIFY_PID=$!
    
    # Run build when changes are detected
    while kill -0 $INOTIFY_PID 2>/dev/null; do
        inotifywait -r -e modify,create,delete --include=".*\.\(js\|ts\|tsx\|jsx\|json\|css\|scss\)$" . 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "File change detected, running build..."
            run_build
        fi
    done
else
    echo "inotifywait not found. You can install it with 'apt install inotify-tools' on Termux."
    echo "For now, please manually run 'npm run build' after making changes."
    echo "Or install fswatch with 'npm install -g fswatch' for file watching capabilities."
fi