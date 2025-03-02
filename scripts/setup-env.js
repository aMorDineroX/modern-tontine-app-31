#!/usr/bin/env node

/**
 * This script helps users set up their environment variables for the Tontine App
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default values
const defaults = {
  VITE_SUPABASE_URL: 'https://qgpqiehjmkfxfnfrowbc.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncHFpZWhqbWtmeGZuZnJvd2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDkzNzUsImV4cCI6MjA1NjI4NTM3NX0.pYcG26WQa-6rIfDcE5mDjNhGbhYAlTMOvCxfYtNmu-0',
  DATABASE_HOST: 'db.qgpqiehjmkfxfnfrowbc.supabase.co',
  DATABASE_PORT: '5432',
  DATABASE_NAME: 'postgres',
  DATABASE_USER: 'postgres',
  DATABASE_PASSWORD: '7XKVQYoL2aHGtdaf8obTv1SmTFUr5K/eUzkQhk4p6Iw1kNOV/PDSo4xGNkSo5d8MVkGbZHfNoCi6zTxgX0Omfg==',
  NODE_ENV: 'development',
  VITE_APP_ENV: 'development'
};

// Environment variables to collect
const envVars = [
  {
    name: 'VITE_SUPABASE_URL',
    message: 'Enter your Supabase project URL',
    default: defaults.VITE_SUPABASE_URL,
    required: true
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    message: 'Enter your Supabase anon/public API key',
    default: defaults.VITE_SUPABASE_ANON_KEY,
    required: true
  },
  {
    name: 'DATABASE_HOST',
    message: 'Enter your Supabase database host',
    default: defaults.DATABASE_HOST,
    required: true
  },
  {
    name: 'DATABASE_PORT',
    message: 'Enter your Supabase database port',
    default: defaults.DATABASE_PORT,
    required: true
  },
  {
    name: 'DATABASE_NAME',
    message: 'Enter your Supabase database name',
    default: defaults.DATABASE_NAME,
    required: true
  },
  {
    name: 'DATABASE_USER',
    message: 'Enter your Supabase database user',
    default: defaults.DATABASE_USER,
    required: true
  },
  {
    name: 'DATABASE_PASSWORD',
    message: 'Enter your Supabase database password (JWT secret)',
    default: defaults.DATABASE_PASSWORD,
    required: true
  },
  {
    name: 'NODE_ENV',
    message: 'Enter the Node environment',
    default: defaults.NODE_ENV,
    required: false
  },
  {
    name: 'VITE_APP_ENV',
    message: 'Enter the app environment',
    default: defaults.VITE_APP_ENV,
    required: false
  }
];

// Function to ask for a variable
function askForVariable(variable) {
  return new Promise((resolve) => {
    const defaultValue = variable.default ? ` (${variable.default})` : '';
    rl.question(`${variable.message}${defaultValue}: `, (answer) => {
      // Use default if no answer provided
      const value = answer.trim() || variable.default || '';
      
      if (variable.required && !value) {
        console.log(`Error: ${variable.name} is required.`);
        // Ask again
        askForVariable(variable).then(resolve);
      } else {
        resolve({ name: variable.name, value });
      }
    });
  });
}

// Function to create .env file
function createEnvFile(variables) {
  const envContent = variables
    .map(variable => `${variable.name}=${variable.value}`)
    .join('\n');
  
  const envPath = path.join(process.cwd(), '.env');
  
  fs.writeFileSync(envPath, envContent);
  console.log(`\n.env file created successfully at ${envPath}`);
}

// Function to create .env.local file
function createEnvLocalFile(variables) {
  const envContent = variables
    .filter(variable => variable.name !== 'NODE_ENV' && variable.name !== 'VITE_APP_ENV')
    .map(variable => `${variable.name}=${variable.value}`)
    .join('\n');
  
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  fs.writeFileSync(envLocalPath, envContent);
  console.log(`.env.local file created successfully at ${envLocalPath}`);
}

// Main function
async function main() {
  console.log('Welcome to the Tontine App environment setup!\n');
  console.log('This script will help you set up your environment variables for the Tontine App.');
  console.log('Press Enter to use the default values (shown in parentheses).\n');
  
  const variables = [];
  
  // Ask for each variable
  for (const variable of envVars) {
    const result = await askForVariable(variable);
    variables.push(result);
  }
  
  // Create .env and .env.local files
  createEnvFile(variables);
  createEnvLocalFile(variables);
  
  console.log('\nSetup complete! You can now run the application with:');
  console.log('npm run dev');
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('Error setting up environment variables:', error);
  process.exit(1);
});