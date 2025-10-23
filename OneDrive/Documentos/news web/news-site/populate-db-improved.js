// Improved script to populate database with clean content and proper images
const { RSSFetcher } = require('./lib/rssFetcher');
const fs = require('fs').promises;
const path = require('path');

async function populateDatabase() {
  try {
    console.log('🚀 Starting improved database population...');
    
    // Fetch fresh RSS articles
    const articles = await RSSFetcher.fetchAllRSS();
    console.log(`✅ Fetched ${articles.length} RSS articles`);
    
    // Transform RSS articles with better content processing
    const transformedArticles = articles.slice(0, 50).map((article, index) => {
      const cleanTitle = cleanText(article.title || 'Untitled Article');
      const cleanContent = cleanHtmlContent(article.description || article.content || '');
      const cleanSummary = extractSummary(cleanContent);
      const properImage = extractOrGenerateImage(article);
      
      return {
        id: `rss-${Date.now()}-${index}`,
        slug: generateSimpleSlug(cleanTitle, `rss-${index}`),
        title: cleanTitle,
        content: cleanContent || generatePlaceholderContent(cleanTitle),
        summary: cleanSummary,
        image: properImage,
        originalSource: article.source?.name || 'RSS Feed',
        country: detectCountry(cleanTitle, cleanContent),
        category: detectCategory(cleanTitle, cleanContent),
        publishedAt: article.publishedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        views: Math.floor(Math.random() * 100) + 10,
        featured: Math.random() > 0.7,
        readingTime: Math.ceil(cleanContent.split(' ').length / 200) || 3
      };
    });
    
    // Save to database file
    const dbPath = path.join(__dirname, 'data', 'rewritten-articles.json');
    await fs.writeFile(dbPath, JSON.stringify(transformedArticles, null, 2));
    
    console.log(`🎉 Successfully populated database with ${transformedArticles.length} articles!`);
    console.log('📊 Sample articles:');
    transformedArticles.slice(0, 3).forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.title}`);
      console.log(`     Content length: ${article.content.length} chars`);
      console.log(`     Image: ${article.image}`);
      console.log(`     Country: ${article.country} | Category: ${article.category}`);
    });
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function cleanHtmlContent(content) {
  if (!content) return '';
  
  // Remove HTML tags but preserve structure
  let cleaned = content
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
    .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove styles
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp;
    .replace(/&amp;/g, '&') // Replace &amp;
    .replace(/&lt;/g, '<') // Replace &lt;
    .replace(/&gt;/g, '>') // Replace &gt;
    .replace(/&quot;/g, '"') // Replace &quot;
    .replace(/&#39;/g, "'") // Replace &#39;
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return cleaned;
}

function extractSummary(content) {
  if (!content) return 'No summary available.';
  
  const sentences = content.split('.').filter(s => s.trim().length > 20);
  if (sentences.length === 0) return content.substring(0, 150) + '...';
  
  const summary = sentences.slice(0, 2).join('.').trim();
  return summary.length > 200 ? summary.substring(0, 197) + '...' : summary + '.';
}

function extractOrGenerateImage(article) {
  // Try to get image from article
  if (article.urlToImage && article.urlToImage.startsWith('http')) {
    return article.urlToImage;
  }
  
  if (article.image && article.image.startsWith('http')) {
    return article.image;
  }
  
  // Generate country-specific placeholder image
  const country = detectCountry(article.title || '', article.description || '');
  const countryImages = {
    'Kenya': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop',
    'Nigeria': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    'South Africa': 'https://images.unsplash.com/photo-1484318571209-661cf29a69ea?w=600&h=400&fit=crop',
    'Ghana': 'https://images.unsplash.com/photo-1569341191732-5019bb69fe73?w=600&h=400&fit=crop',
    'Egypt': 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop'
  };
  
  return countryImages[country] || 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop';
}

function generatePlaceholderContent(title) {
  return `This is a breaking news story about "${title}". 

The story is developing and more details will be added as they become available. This article covers important developments in African news and politics.

Stay tuned for updates on this important story. Our team is working to bring you the latest information as it becomes available.

For more African news and updates, continue following our coverage of events across the continent.`;
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