// Background service for automatically fetching and rewriting news
import { HumanNewsRewriter } from '../../lib/humanRewriter.js';
import { RewrittenNewsDatabase } from '../../lib/rewrittenDatabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.NEWS_API_KEY;
  const NEWS_PROVIDER = process.env.NEWS_PROVIDER || 'newsapi';
  
  if (!API_KEY) {
    return res.status(500).json({ 
      error: 'API key not configured' 
    });
  }

  try {
    console.log('Starting automatic news fetch and rewrite...');
    
    // Define countries and categories to fetch for
    const countries = ['ke', 'ng', 'za', 'eg'];
    const categories = ['business', 'technology', 'sports', 'general'];
    
    let totalProcessed = 0;
    const results = [];

    // Fetch news for each country and category combination
    for (const country of countries) {
      for (const category of categories) {
        try {
          const articlesProcessed = await fetchAndRewriteForCategory(country, category, API_KEY, NEWS_PROVIDER);
          totalProcessed += articlesProcessed;
          results.push({
            country,
            category,
            processed: articlesProcessed
          });
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Error processing ${country}-${category}:`, error);
          results.push({
            country,
            category,
            processed: 0,
            error: error.message
          });
        }
      }
    }

    console.log(`Automatic news fetch completed. Total articles processed: ${totalProcessed}`);

    return res.status(200).json({
      success: true,
      totalProcessed,
      results,
      message: `Successfully processed ${totalProcessed} articles across all categories`
    });

  } catch (error) {
    console.error('Error in automatic news fetch:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch and rewrite news automatically',
      details: error.message 
    });
  }
}

async function fetchAndRewriteForCategory(country, category, apiKey, provider) {
  try {
    // Build API URL
    let apiUrl;
    
    if (provider === 'mediastack') {
      apiUrl = `http://api.mediastack.com/v1/news?access_key=${apiKey}`;
      if (country) apiUrl += `&countries=${country}`;
      if (category) apiUrl += `&categories=${category}`;
      apiUrl += `&limit=5`; // Limit to 5 articles per category
    } else {
      // NewsAPI
      apiUrl = `https://newsapi.org/v2/everything?apiKey=${apiKey}`;
      
      const countryNames = {
        'ke': 'Kenya',
        'ng': 'Nigeria', 
        'za': 'South Africa',
        'eg': 'Egypt'
      };
      
      const searchQuery = countryNames[country] || 'Africa';
      apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
      apiUrl += `&language=en&sortBy=publishedAt&pageSize=5`;
    }
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error?.message || 'Failed to fetch news');
    }

    const rawArticles = data.articles || data.data || [];
    let processedCount = 0;

    for (const rawArticle of rawArticles) {
      try {
        // Skip articles without sufficient content or duplicates
        if (!rawArticle.title || rawArticle.title.length < 10) continue;
        
        // Check if we already have a similar article
        const existingArticles = await RewrittenNewsDatabase.getArticlesByFilters({
          search: rawArticle.title.substring(0, 30),
          limit: 1
        });
        
        if (existingArticles.articles.length > 0) {
          continue; // Skip if similar article exists
        }

        // Rewrite the article
        const rewrittenData = HumanNewsRewriter.rewriteArticle(
          rawArticle, 
          country, 
          category
        );

        if (!rewrittenData) continue;

        // Save to database
        await RewrittenNewsDatabase.saveRewrittenArticle(rewrittenData);
        processedCount++;
        
      } catch (articleError) {
        console.error('Error processing individual article:', articleError);
        continue;
      }
    }

    return processedCount;
    
  } catch (error) {
    console.error(`Error fetching for ${country}-${category}:`, error);
    return 0;
  }
}