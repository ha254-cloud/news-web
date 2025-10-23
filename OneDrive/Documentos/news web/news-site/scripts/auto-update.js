// auto-update.js
// This script automatically updates your static site with fresh articles

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCE_DATA_PATH = path.join(__dirname, '../data/articles.json');
const STATIC_ARTICLES_PATH = path.join(__dirname, '../production-build/js/static-articles.js');
const MAX_ARTICLES = 20; // Maximum number of articles to include in the static build

// Function to read the latest articles
function getLatestArticles() {
  try {
    // Read the full articles data
    const articlesRaw = fs.readFileSync(SOURCE_DATA_PATH, 'utf8');
    const allArticles = JSON.parse(articlesRaw);
    
    // Sort by date (newest first) and take the specified number
    const sortedArticles = allArticles.sort((a, b) => {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
    
    return sortedArticles.slice(0, MAX_ARTICLES);
  } catch (error) {
    console.error('Error reading or parsing articles:', error);
    return [];
  }
}

// Function to update the static articles file
function updateStaticArticles(articles) {
  if (!articles || articles.length === 0) {
    console.log('No articles to update');
    return false;
  }
  
  try {
    // Create the JavaScript content
    const jsContent = `// Static articles data for production site - AUTO-UPDATED: ${new Date().toISOString()}
const staticArticles = ${JSON.stringify(articles, null, 2)};

// Make articles available globally
window.articleData = staticArticles;`;
    
    // Write to the static articles file
    fs.writeFileSync(STATIC_ARTICLES_PATH, jsContent, 'utf8');
    console.log(`Updated static articles file with ${articles.length} articles`);
    return true;
  } catch (error) {
    console.error('Error updating static articles file:', error);
    return false;
  }
}

// Main execution
console.log('Starting static site update process...');
const latestArticles = getLatestArticles();
const updated = updateStaticArticles(latestArticles);

if (updated) {
  console.log('Static site data updated successfully');
  
  // Optional: You could add automatic FTP upload here using a package like 'basic-ftp'
  // Example: uploadToServer();
} else {
  console.log('Failed to update static site data');
}