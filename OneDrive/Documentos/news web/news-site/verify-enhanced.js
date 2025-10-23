// Verify the enhanced database content
const fs = require('fs');
const path = require('path');

try {
  console.log('🔍 Verifying Enhanced Database...');
  console.log('=' .repeat(50));
  
  const dbPath = path.join(__dirname, 'data', 'rewritten-articles.json');
  const articles = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  console.log(`✅ Total articles: ${articles.length}`);
  
  // Check content quality
  const avgContentLength = articles.reduce((sum, a) => sum + a.content.length, 0) / articles.length;
  console.log(`✅ Average content length: ${Math.round(avgContentLength)} characters`);
  
  // Show first article in detail
  const firstArticle = articles[0];
  console.log(`\n📰 SAMPLE ARTICLE:`);
  console.log(`Title: ${firstArticle.title}`);
  console.log(`Country: ${firstArticle.country} | Category: ${firstArticle.category}`);
  console.log(`Reading time: ${firstArticle.readingTime} minutes`);
  console.log(`Image: ${firstArticle.image}`);
  console.log(`\nFull Content Preview (first 300 chars):`);
  console.log(`"${firstArticle.content.substring(0, 300)}..."`);
  
  // Check content distribution
  const contentLengths = articles.map(a => a.content.length);
  const shortContent = contentLengths.filter(l => l < 500).length;
  const mediumContent = contentLengths.filter(l => l >= 500 && l < 1000).length;
  const longContent = contentLengths.filter(l => l >= 1000).length;
  
  console.log(`\n📊 CONTENT DISTRIBUTION:`);
  console.log(`Short (< 500 chars): ${shortContent} articles`);
  console.log(`Medium (500-1000 chars): ${mediumContent} articles`);
  console.log(`Long (> 1000 chars): ${longContent} articles`);
  
  // Check images
  const realImages = articles.filter(a => !a.image.includes('unsplash')).length;
  console.log(`\n🖼️ IMAGE SOURCES:`);
  console.log(`Real article images: ${realImages}`);
  console.log(`Stock photos: ${articles.length - realImages}`);
  
  // Check categories
  const categories = [...new Set(articles.map(a => a.category))];
  console.log(`\n📂 CATEGORIES: ${categories.join(', ')}`);
  
  // Check countries
  const countries = [...new Set(articles.map(a => a.country))];
  console.log(`🌍 COUNTRIES: ${countries.join(', ')}`);
  
  console.log(`\n🎉 Enhanced database is ready!`);
  console.log(`📱 Visit http://localhost:3000 to see the improved articles`);
  
} catch (error) {
  console.error('❌ Error verifying database:', error.message);
}