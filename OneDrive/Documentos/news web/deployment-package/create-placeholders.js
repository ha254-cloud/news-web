// Create default image placeholder
console.log('Creating default image placeholders...');

// Since we can't actually create image files, let's create an SVG placeholder
const svgPlaceholder = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 600x400" preserveAspectRatio="xMidYMid slice" focusable="false">
  <title>Africa News Placeholder</title>
  <rect width="100%" height="100%" fill="#dee2e6"/>
  <text x="50%" y="50%" fill="#6c757d" dy=".3em" text-anchor="middle" font-family="Arial, sans-serif" font-size="28">
    Africa News
  </text>
</svg>`;

const fs = require('fs');
const path = require('path');

// Create public/images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Write SVG placeholder
fs.writeFileSync(path.join(imagesDir, 'default-news.svg'), svgPlaceholder);

console.log('✅ Default image placeholder created at public/images/default-news.svg');
console.log('📝 You can now use /images/default-news.svg as a fallback image');