// API endpoint for aggregated African news from multiple sources
const { AfricanNewsAggregator } = require('../../lib/africanNewsAggregator');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    country,
    category,
    search,
    limit = 50,
    page = 1,
    source
  } = req.query;

  try {
    console.log('🔄 African News API called with params:', { country, category, search, limit, page, source });
    
    const aggregator = new AfricanNewsAggregator();
    let articles = [];

    // Fetch based on parameters
    if (country) {
      articles = await aggregator.getArticlesByCountry(country);
    } else if (category) {
      articles = await aggregator.getArticlesByCategory(category);
    } else if (search) {
      articles = await aggregator.searchArticles(search);
    } else {
      articles = await aggregator.aggregateNews();
    }

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedArticles = articles.slice(startIndex, endIndex);

    // Transform to clean output format
    const cleanArticles = paginatedArticles.map(article => ({
      id: article.id,
      title: article.title || 'Untitled',
      summary: article.description || article.content?.substring(0, 200) + '...' || '',
      image: article.image || null,
      source: article.source?.name || article.source || 'Unknown Source',
      url: article.url || '#',
      category: article.category || 'General',
      country: article.country || 'Africa',
      published_at: article.publishedAt || new Date().toISOString(),
      reading_time: article.readingTime || '2 min read',
      fetched_at: article.fetchedAt || new Date().toISOString()
    }));

    // Prepare response
    const response = {
      success: true,
      data: cleanArticles,
      meta: {
        total: articles.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(articles.length / parseInt(limit)),
        fetched_at: new Date().toISOString(),
        sources: ['NewsAPI', 'MediaStack', 'AllAfrica RSS', 'Google News RSS']
      },
      filters: {
        country: country || null,
        category: category || null,
        search: search || null
      }
    };

    console.log(`✅ Returning ${cleanArticles.length} articles`);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ African News API Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch African news',
      message: error.message,
      data: [],
      meta: {
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: 0,
        fetched_at: new Date().toISOString()
      }
    });
  }
}