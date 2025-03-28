const fs = require('fs');
const path = require('path');

const cryptoIcons = ['ltc', 'eth', 'usdt', 'usdc', 'bnb'];
const sourceDir = path.join(__dirname, '../node_modules/cryptocurrency-icons/svg/color');
const targetDir = path.join(__dirname, '../public/crypto');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy each icon
cryptoIcons.forEach(icon => {
  const sourcePath = path.join(sourceDir, `${icon}.svg`);
  const targetPath = path.join(targetDir, `${icon}.svg`);
  
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${icon}.svg successfully`);
  } catch (error) {
    console.error(`Error copying ${icon}.svg:`, error);
  }
}); 