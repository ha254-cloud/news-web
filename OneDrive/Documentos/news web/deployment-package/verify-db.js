// Quick verification of the improved database
const fs = require('fs');
const path = require('path');

try {
  console.log('🔍 Checking improved database...');
  
  const dbPath = path.join(__dirname, 'data', 'rewritten-articles.json');
  const articles = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  console.log(`✅ Database contains: ${articles.length} articles`);
  
  if (articles.length > 0) {
    const first = articles[0];
    console.log(`\n📰 Sample Article:`);
    console.log(`  Title: ${first.title}`);
    console.log(`  Content length: ${first.content.length} characters`);
    console.log(`  Summary: ${first.summary.substring(0, 100)}...`);
    console.log(`  Image: ${first.image}`);
    console.log(`  Country: ${first.country}`);
    console.log(`  Category: ${first.category}`);
    
    // Check if content is clean (no HTML tags)
    const hasHtml = first.content.includes('<') || first.content.includes('&lt;');
    console.log(`  Clean content: ${!hasHtml ? '✅ Yes' : '❌ No'}`);
    
    // Check if image is proper URL
    const hasProperImage = first.image && first.image.startsWith('http');
    console.log(`  Proper image: ${hasProperImage ? '✅ Yes' : '❌ No'}`);
  }
  
  console.log('\n🎉 Database verification complete!');
  
} catch (error) {
  console.error('❌ Error checking database:', error.message);
}