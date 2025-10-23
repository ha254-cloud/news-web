// API endpoint for fetching and rewriting news articles
import { HumanNewsRewriter } from '../../lib/humanRewriter.js';
import { RewrittenNewsDatabase } from '../../lib/rewrittenDatabase.js';
import { ArticleDatabase } from '../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    q, 
    country, 
    category, 
    page = 1, 
    pageSize = 12, 
    source = 'rewritten' // 'rewritten' for stored articles, 'fresh' for new articles
  } = req.query;

  try {
    if (source === 'fresh') {
      // Fetch fresh articles from external API and rewrite them
      return await fetchAndRewriteNews(req, res);
    } else {
      // Return stored rewritten articles from database
      return await getRewrittenArticles(req, res);
    }
  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch news',
      details: error.message 
    });
  }
}

async function getRewrittenArticles(req, res) {
  const { q, country, category, page = 1, pageSize = 12 } = req.query;
  
  try {
    // Use ArticleDatabase which has our real images from RSS feeds
    const result = await ArticleDatabase.getArticlesByFilters({
      country,
      category,
      search: q,
      page: parseInt(page),
      limit: parseInt(pageSize)
    });

    return res.status(200).json({
      articles: result.articles.map(article => ({
        id: article.id,
        slug: generateSlug(article.title, article.id),
        title: article.title,
        description: article.aiSummary || article.originalDescription, // Use our enhanced content
        content: article.aiSummary, // Use enhanced content as main content
        image: article.image, // This has our REAL IMAGES from RSS feeds!
        image_url: article.image,
        publishedAt: article.publishedAt,
        published_at: article.publishedAt,
        createdAt: article.createdAt,
        source: article.source,
        author: article.author,
        country: article.country,
        category: article.category,
        readingTime: Math.ceil((article.aiSummary?.length || 0) / 200) + ' min',
        isRewritten: true, // Mark as enhanced with real images
        // No external URL - keeps users on our site
        url: `/article/${generateSlug(article.title, article.id)}`
      })),
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        hasMore: result.page < result.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching articles with real images:', error);
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }
}

// Helper function to generate slugs for articles
function generateSlug(title, id) {
  if (!title) {
    title = 'untitled-article';
  }
  
  if (!id) {
    id = Date.now().toString();
  }
  
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
  return `${slug}-${id}`; // Use full ID instead of just first 8 characters
}

async function fetchAndRewriteNews(req, res) {
  const API_KEY = process.env.NEWS_API_KEY;
  const NEWS_PROVIDER = process.env.NEWS_PROVIDER || 'newsapi';
  const { q, country, category, page = 1, pageSize = 12 } = req.query;
  
  if (!API_KEY) {
    return res.status(500).json({ 
      error: 'API key not configured. Please add NEWS_API_KEY to your .env.local file.' 
    });
  }

  try {
    // Fetch from external API
    let apiUrl;
    let response;
    let data;

    if (NEWS_PROVIDER === 'mediastack') {
      apiUrl = `http://api.mediastack.com/v1/news?access_key=${API_KEY}`;
      if (q) apiUrl += `&keywords=${encodeURIComponent(q)}`;
      if (country) apiUrl += `&countries=${country}`;
      if (category) apiUrl += `&categories=${category}`;
      apiUrl += `&offset=${(page - 1) * pageSize}&limit=${pageSize}`;
    } else {
      // NewsAPI with smart search for African countries
      apiUrl = `https://newsapi.org/v2/everything?apiKey=${API_KEY}`;
      
      const countryNames = {
        'ke': 'Kenya',
        'ng': 'Nigeria', 
        'za': 'South Africa',
        'eg': 'Egypt'
      };
      
      let searchQuery = q;
      if (country && countryNames[country]) {
        searchQuery = searchQuery ? `${searchQuery} AND ${countryNames[country]}` : countryNames[country];
      }
      
      if (searchQuery) {
        apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
      }
      
      apiUrl += `&language=en&sortBy=publishedAt`;
      apiUrl += `&page=${page}&pageSize=${pageSize}`;
      
      if (!searchQuery && !country) {
        apiUrl = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&country=us`;
        if (category) apiUrl += `&category=${category}`;
        apiUrl += `&page=${page}&pageSize=${pageSize}`;
      }
    }
    
    response = await fetch(apiUrl);
    data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error?.message || 'Failed to fetch news');
    }

    // Process and rewrite articles
    const rawArticles = data.articles || data.data || [];
    const rewrittenArticles = [];

    for (const rawArticle of rawArticles) {
      try {
        // Skip articles without sufficient content
        if (!rawArticle.title || rawArticle.title.length < 10) continue;

        // Rewrite the article using our human-like AI system
        const rewrittenData = HumanNewsRewriter.rewriteArticle(
          rawArticle, 
          country || 'global', 
          category || 'general'
        );

        if (!rewrittenData) continue;

        // Save the rewritten article to our database
        const savedArticle = await RewrittenNewsDatabase.saveRewrittenArticle(rewrittenData);
        
        rewrittenArticles.push({
          id: savedArticle.id,
          slug: savedArticle.slug,
          title: savedArticle.title,
          description: savedArticle.summary,
          content: savedArticle.content,
          image: savedArticle.image,
          image_url: savedArticle.image,
          publishedAt: savedArticle.publishedAt,
          published_at: savedArticle.publishedAt,
          rewrittenAt: savedArticle.rewrittenAt,
          source: savedArticle.originalSource,
          country: savedArticle.country,
          category: savedArticle.category,
          readingTime: savedArticle.readingTime,
          views: savedArticle.views,
          featured: savedArticle.featured,
          isRewritten: true,
          // Internal URL only - no external links
          url: `/article/${savedArticle.slug}`
        });
        
      } catch (articleError) {
        console.error('Error processing article:', articleError);
        // Continue with next article
      }
    }

    return res.status(200).json({
      articles: rewrittenArticles,
      processed: rewrittenArticles.length,
      source: 'fresh-rewritten',
      message: `Successfully rewritten ${rewrittenArticles.length} articles`
    });

  } catch (error) {
    console.error('Error fetching and rewriting news:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch and rewrite news',
      details: error.message 
    });
  }
}