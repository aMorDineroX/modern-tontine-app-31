#!/bin/bash

# Initialize git repository
echo "Initializing git repository..."
git init

# Add all files
echo "Adding files to git..."
git add .

# Make initial commit
echo "Creating initial commit..."
git commit -m "Initial commit"

# Set up remote
echo "Setting up remote repository..."
git remote add origin https://github.com/aMorDineroX/modern-tontine-app-31.git

# Rename branch to main if needed
echo "Ensuring branch is named 'main'..."
git branch -M main

# Push to remote
echo "Pushing to remote repository..."
git push -u origin main

echo "Git initialization complete!"