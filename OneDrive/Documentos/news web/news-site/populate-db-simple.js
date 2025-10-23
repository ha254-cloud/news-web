// Simple script to populate the database with RSS articles
const { RSSFetcher } = require('./lib/rssFetcher');
const fs = require('fs').promises;
const path = require('path');

async function populateDatabase() {
  try {
    console.log('🚀 Starting database population...');
    
    // Fetch fresh RSS articles
    const articles = await RSSFetcher.fetchAllRSS();
    console.log(`✅ Fetched ${articles.length} RSS articles`);
    
    // Transform RSS articles to match our database format
    const transformedArticles = articles.slice(0, 50).map((article, index) => ({
      id: `rss-${Date.now()}-${index}`,
      slug: generateSimpleSlug(article.title || 'untitled', `rss-${index}`),
      title: article.title || 'Untitled Article',
      content: article.description || article.content || 'Content not available',
      summary: (article.description || article.content || '').substring(0, 200) + '...',
      image: article.urlToImage || article.image || '/images/default-news.jpg',
      originalSource: article.source?.name || 'RSS Feed',
      country: detectCountry(article.title, article.description),
      category: detectCategory(article.title, article.description),
      publishedAt: article.publishedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      views: Math.floor(Math.random() * 100),
      featured: Math.random() > 0.8,
      readingTime: Math.ceil((article.description || '').split(' ').length / 200) || 3
    }));
    
    // Save to database file
    const dbPath = path.join(__dirname, 'data', 'rewritten-articles.json');
    await fs.writeFile(dbPath, JSON.stringify(transformedArticles, null, 2));
    
    console.log(`🎉 Successfully populated database with ${transformedArticles.length} articles!`);
    console.log('📊 Sample articles:');
    transformedArticles.slice(0, 3).forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.title}`);
      console.log(`     Country: ${article.country} | Category: ${article.category}`);
    });
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

function generateSimpleSlug(title, id) {
  if (!title) return `article-${id}`;
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60) + `-${id.substring(0, 8)}`;
}

function detectCountry(title = '', description = '') {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('kenya') || text.includes('nairobi')) return 'Kenya';
  if (text.includes('nigeria') || text.includes('lagos') || text.includes('abuja')) return 'Nigeria';
  if (text.includes('south africa') || text.includes('johannesburg') || text.includes('cape town')) return 'South Africa';
  if (text.includes('ghana') || text.includes('accra')) return 'Ghana';
  if (text.includes('egypt') || text.includes('cairo')) return 'Egypt';
  
  return 'Africa';
}

function detectCategory(title = '', description = '') {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('business') || text.includes('economy') || text.includes('market')) return 'business';
  if (text.includes('tech') || text.includes('digital') || text.includes('innovation')) return 'technology';
  if (text.includes('sport') || text.includes('football') || text.includes('soccer')) return 'sports';
  if (text.includes('health') || text.includes('medical')) return 'health';
  if (text.includes('politics') || text.includes('government') || text.includes('election')) return 'politics';
  
  return 'general';
}

populateDatabase();