import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = process.env.VITE_BASE_URL || '/';

function preprocessHtml() {
  const indexPath = path.resolve(__dirname, '../dist/index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('dist/index.html not found. Make sure the build process completed successfully.');
    return;
  }
  
  let content = fs.readFileSync(indexPath, 'utf8');

  // Replace paths
  content = content.replace(/%BASE_URL%/g, baseUrl.replace(/\/$/, ''));

  fs.writeFileSync(indexPath, content);
  console.log('HTML preprocessing complete');
}

preprocessHtml();