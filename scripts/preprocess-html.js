const fs = require('fs');
const path = require('path');

const baseUrl = process.env.VITE_BASE_URL || '/modern-tontine-app-31/';

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