// Script to populate database with ONLY real images from RSS feeds
const { RSSFetcher } = require('./lib/rssFetcher');
const fs = require('fs').promises;
const path = require('path');

async function populateWithRealImagesOnly() {
  try {
    console.log('🚀 Starting database population with REAL IMAGES ONLY...');
    
    // Fetch fresh RSS articles
    const articles = await RSSFetcher.fetchAllRSS();
    console.log(`✅ Fetched ${articles.length} RSS articles`);
    
    // Filter articles that have real images and process them
    const articlesWithRealImages = [];
    let processedCount = 0;
    
    for (const article of articles) {
      if (processedCount >= 50) break; // Limit to 50 articles
      
      const realImage = extractRealImageOnly(article);
      if (realImage) {
        const cleanTitle = cleanText(article.title || 'Untitled Article');
        const fullContent = extractFullContent(article);
        const rewrittenContent = rewriteArticleContent(cleanTitle, fullContent);
        
        const enhancedArticle = {
          id: `real-img-${Date.now()}-${processedCount}`,
          slug: generateSimpleSlug(cleanTitle, `real-img-${processedCount}`),
          title: cleanTitle,
          content: rewrittenContent,
          summary: createMeaningfulSummary(rewrittenContent),
          image: realImage,
          originalSource: article.source?.name || article.link?.split('/')[2] || 'News Source',
          country: detectCountry(cleanTitle, fullContent),
          category: detectCategory(cleanTitle, fullContent),
          publishedAt: article.publishedAt || article.pubDate || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          views: Math.floor(Math.random() * 500) + 50,
          featured: Math.random() > 0.6,
          readingTime: Math.ceil(rewrittenContent.split(' ').length / 200) || 5
        };
        
        articlesWithRealImages.push(enhancedArticle);
        processedCount++;
        
        console.log(`✅ Article ${processedCount}: ${cleanTitle.substring(0, 60)}...`);
        console.log(`   📸 Real image: ${realImage.substring(0, 80)}...`);
      }
    }
    
    if (articlesWithRealImages.length === 0) {
      console.log('❌ No articles found with real images!');
      console.log('🔍 Checking sample articles for image fields...');
      
      // Debug: Show what image fields are available
      articles.slice(0, 5).forEach((article, i) => {
        console.log(`\nArticle ${i + 1}: ${article.title?.substring(0, 50)}...`);
        console.log(`  urlToImage: ${article.urlToImage || 'None'}`);
        console.log(`  image: ${article.image || 'None'}`);
        console.log(`  enclosure: ${article.enclosure?.url || 'None'}`);
        console.log(`  media:content: ${article['media:content']?.url || 'None'}`);
        console.log(`  media:thumbnail: ${article['media:thumbnail']?.url || 'None'}`);
      });
      
      return;
    }
    
    // Save to database file
    const dbPath = path.join(__dirname, 'data', 'rewritten-articles.json');
    await fs.writeFile(dbPath, JSON.stringify(articlesWithRealImages, null, 2));
    
    console.log(`\n🎉 Successfully populated database with ${articlesWithRealImages.length} articles with REAL IMAGES!`);
    console.log('📊 Sample articles:');
    articlesWithRealImages.slice(0, 3).forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.title}`);
      console.log(`     📸 Image: ${article.image}`);
      console.log(`     📝 Content: ${article.content.length} chars`);
      console.log(`     🌍 Country: ${article.country} | Category: ${article.category}`);
    });
    
    console.log(`\n📸 ALL ${articlesWithRealImages.length} ARTICLES HAVE AUTHENTIC IMAGES FROM NEWS SOURCES!`);
    
  } catch (error) {
    console.error('❌ Error populating database with real images:', error);
  }
}

function extractRealImageOnly(article) {
  // Comprehensive check for real images from RSS feeds
  const possibleImages = [
    article.urlToImage,
    article.image?.url || article.image,
    article.enclosure?.url,
    article['media:content']?.url,
    article['media:thumbnail']?.url,
    article['media:group']?.['media:content']?.url,
    article.thumbnail?.url || article.thumbnail,
    article.media?.thumbnail?.url,
    article.content_encoded?.match(/src="([^"]*\.(jpg|jpeg|png|webp|gif))/)?.[1],
    article.description?.match(/src="([^"]*\.(jpg|jpeg|png|webp|gif))/)?.[1]
  ].filter(Boolean);
  
  // Only return valid HTTP/HTTPS image URLs
  for (const imageUrl of possibleImages) {
    if (imageUrl && 
        typeof imageUrl === 'string' && 
        (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) &&
        /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(imageUrl)) {
      return imageUrl;
    }
  }
  
  return null; // Return null if no real image found
}

function extractFullContent(article) {
  let content = '';
  
  if (article.contentSnippet) content += article.contentSnippet + ' ';
  if (article.content) content += article.content + ' ';
  if (article.description && article.description !== article.contentSnippet) {
    content += article.description + ' ';
  }
  if (article.summary && article.summary !== article.description) {
    content += article.summary + ' ';
  }
  
  return cleanText(content) || 'Content not available from source.';
}

function rewriteArticleContent(title, originalContent) {
  if (!originalContent || originalContent.length < 50) {
    return generateMeaningfulContent(title);
  }
  
  const paragraphs = originalContent.split('.').filter(s => s.trim().length > 10);
  
  let rewritten = `In a significant development in African news, ${title.toLowerCase()}.

${paragraphs.slice(0, 2).join('. ').trim()}.

This story highlights important developments across the African continent, where political, economic, and social changes continue to shape the region's future.`;

  if (paragraphs.length > 2) {
    rewritten += `\n\n${paragraphs.slice(2, 4).join('. ').trim()}.`;
  }
  
  rewritten += `\n\nThis ongoing situation reflects broader trends in African politics and society. Local communities and international observers are closely monitoring these developments.

As events continue to unfold, the impact on regional stability and development remains a key concern for policymakers and citizens alike.

Updates on this story will be provided as more information becomes available from reliable sources on the ground.`;

  return rewritten;
}

function generateMeaningfulContent(title) {
  return `Breaking news from Africa: ${title}.

This developing story represents significant events unfolding across the African continent. Our team is following the situation closely and gathering information from multiple reliable sources.

The implications of these developments extend beyond immediate local impacts, potentially affecting regional stability, economic conditions, and social dynamics across multiple African nations.

Key stakeholders including government officials, community leaders, and international observers are monitoring the situation as it continues to evolve.

This story reflects ongoing political, economic, and social transformations taking place across Africa, where rapid changes in governance, development initiatives, and social movements continue to shape the continent's trajectory.

Local communities have expressed various reactions to these developments, with many calling for continued dialogue and peaceful resolution of any emerging challenges.

International attention has also focused on this region, with diplomatic efforts and development partnerships playing crucial roles in supporting positive outcomes.

As more details emerge, our coverage will provide comprehensive analysis and updates on this important African news story.`;
}

function createMeaningfulSummary(content) {
  const sentences = content.split('.').filter(s => s.trim().length > 15);
  if (sentences.length === 0) return 'Important developments in African news.';
  
  const summary = sentences.slice(0, 3).join('.').trim();
  return summary.length > 250 ? summary.substring(0, 247) + '...' : summary + '.';
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
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
  if (text.includes('ethiopia') || text.includes('addis ababa')) return 'Ethiopia';
  if (text.includes('uganda') || text.includes('kampala')) return 'Uganda';
  
  return 'Africa';
}

function detectCategory(title = '', description = '') {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('business') || text.includes('economy') || text.includes('market') || text.includes('trade')) return 'business';
  if (text.includes('tech') || text.includes('digital') || text.includes('innovation') || text.includes('startup')) return 'technology';
  if (text.includes('sport') || text.includes('football') || text.includes('soccer') || text.includes('athletics')) return 'sports';
  if (text.includes('health') || text.includes('medical') || text.includes('hospital') || text.includes('disease')) return 'health';
  if (text.includes('politics') || text.includes('government') || text.includes('election') || text.includes('president')) return 'politics';
  if (text.includes('education') || text.includes('school') || text.includes('university')) return 'education';
  
  return 'general';
}

populateWithRealImagesOnly();