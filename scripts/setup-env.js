#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Path to .env file
const envPath = path.resolve(__dirname, '../.env');
const envExamplePath = path.resolve(__dirname, '../.env.example');

// Function to prompt for input
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Function to generate a random string
function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Main setup function
async function setupEnvironment() {
  console.log('🚀 Tontine App Environment Setup');
  
  // Read example env file
  const exampleEnv = fs.readFileSync(envExamplePath, 'utf8');
  
  // Prepare env variables
  let envContent = exampleEnv;
  
  // Prompt for Supabase URL
  const supabaseUrl = await prompt('Enter your Supabase Project URL (https://your-project.supabase.co): ');
  const supabaseAnonKey = await prompt('Enter your Supabase Anon Key: ');
  
  // Replace placeholders
  envContent = envContent
    .replace('your_supabase_project_url', supabaseUrl)
    .replace('your_supabase_anon_key', supabaseAnonKey);
  
  // Optional: Generate a random database password
  const dbPassword = generateRandomString(24);
  envContent = envContent.replace('your_database_password', dbPassword);
  
  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Environment configuration complete!');
  console.log('🔒 .env file created with your configuration');
  console.log('📝 Please review and adjust the settings as needed');
}

// Run the setup
setupEnvironment().catch(console.error);