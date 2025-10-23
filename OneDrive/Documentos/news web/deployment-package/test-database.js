// Simple test to read the database and serve articles
const fs = require('fs');
const path = require('path');

try {
  const dbPath = path.join(__dirname, 'data', 'rewritten-articles.json');
  console.log('Reading database from:', dbPath);
  
  const articles = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log('✅ Database loaded successfully!');
  console.log('📊 Total articles:', articles.length);
  
  if (articles.length > 0) {
    console.log('📰 Sample articles:');
    articles.slice(0, 3).forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.title}`);
      console.log(`     Country: ${article.country} | Category: ${article.category}`);
    });
  }
  
  // Test if we can access the articles without errors
  console.log('\n✅ Articles can be loaded without errors!');
  console.log('🌐 The website should now display articles.');
  
} catch (error) {
  console.error('❌ Error loading database:', error.message);
}