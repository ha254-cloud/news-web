const fs = require('fs');

// Check what data we have
const articles = JSON.parse(fs.readFileSync('data/articles.json', 'utf-8'));

console.log('=== DATA ANALYSIS ===');
console.log('Total articles:', articles.length);
console.log('Countries:', [...new Set(articles.map(a => a.country))]);
console.log('Categories:', [...new Set(articles.map(a => a.category))]);

console.log('\n=== SAMPLE ARTICLE ===');
if (articles.length > 0) {
    const sample = articles[0];
    console.log('ID:', sample.id);
    console.log('Title:', sample.title);
    console.log('Country:', sample.country);
    console.log('Category:', sample.category);
    console.log('Image:', sample.image);
    console.log('Has image:', !!sample.image);
    console.log('Published:', sample.publishedAt);
}

console.log('\n=== COUNTRY MAPPING ISSUE ===');
console.log('Homepage searches for country "ke" but our data has countries:', [...new Set(articles.map(a => a.country))]);
console.log('This is likely why no articles are showing!');