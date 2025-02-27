const fs = require('fs');
const path = require('path');

const baseUrl = process.env.VITE_BASE_URL || '/modern-tontine-app-31/';

function preprocessHtml() {
  const indexPath = path.resolve(__dirname, '../dist/index.html');
  let content = fs.readFileSync(indexPath, 'utf8');

  // Remplacer les chemins
  content = content.replace(/%BASE_URL%/g, baseUrl.replace(/\/$/, ''));

  fs.writeFileSync(indexPath, content);
  console.log('HTML preprocessing complete');
}

preprocessHtml();