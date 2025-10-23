// API proxy for news services (Mediastack / NewsAPI)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.NEWS_API_KEY;
  const NEWS_PROVIDER = process.env.NEWS_PROVIDER || 'newsapi';
  
  if (!API_KEY) {
    return res.status(500).json({ 
      error: 'API key not configured. Please add NEWS_API_KEY to your .env.local file.' 
    });
  }

  // Extract query parameters
  const { q, country, category, page = 1, pageSize = 12 } = req.query;

  try {
    let apiUrl;
    let response;
    let data;

    if (NEWS_PROVIDER === 'mediastack') {
      // Mediastack API
      apiUrl = `http://api.mediastack.com/v1/news?access_key=${API_KEY}`;
      if (q) apiUrl += `&keywords=${encodeURIComponent(q)}`;
      if (country) apiUrl += `&countries=${country}`;
      if (category) apiUrl += `&categories=${category}`;
      apiUrl += `&offset=${(page - 1) * pageSize}&limit=${pageSize}`;
      
      response = await fetch(apiUrl);
      data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch news from Mediastack');
      }

      // Mediastack response format
      if (data.data) {
        return res.status(200).json({
          data: data.data.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            image: article.image,
            image_url: article.image, // Add alias for compatibility
            published_at: article.published_at,
            publishedAt: article.published_at, // Add alias for compatibility
            source: article.source,
            author: article.author
          })),
          pagination: data.pagination
        });
      }
    } else {
      // NewsAPI (default)
      apiUrl = `https://newsapi.org/v2/everything?apiKey=${API_KEY}`;
      
      // For African countries, search for news about the country instead of news from the country
      const countryNames = {
        'ke': 'Kenya',
        'ng': 'Nigeria', 
        'za': 'South Africa',
        'eg': 'Egypt'
      };
      
      let searchQuery = q;
      if (country && countryNames[country]) {
        // Search for news about African countries rather than from them (better coverage)
        searchQuery = searchQuery ? `${searchQuery} AND ${countryNames[country]}` : countryNames[country];
      } else if (country && !countryNames[country]) {
        // For non-African countries, use the original approach
        apiUrl = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&country=${country}`;
        if (q) apiUrl += `&q=${encodeURIComponent(q)}`;
        if (category) apiUrl += `&category=${category}`;
        apiUrl += `&page=${page}&pageSize=${pageSize}`;
      }
      
      if (searchQuery) {
        apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
      }
      
      // Add language and sorting for better results
      apiUrl += `&language=en&sortBy=publishedAt`;
      apiUrl += `&page=${page}&pageSize=${pageSize}`;
      
      // If no search query and no country, default to general news
      if (!searchQuery && !country) {
        apiUrl = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&country=us`;
        if (category) apiUrl += `&category=${category}`;
        apiUrl += `&page=${page}&pageSize=${pageSize}`;
      }
      
      response = await fetch(apiUrl);
      data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch news from NewsAPI');
      }

      // NewsAPI response format
      if (data.articles) {
        return res.status(200).json({
          articles: data.articles.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.urlToImage,
            image: article.urlToImage, // Add alias for compatibility
            publishedAt: article.publishedAt,
            published_at: article.publishedAt, // Add alias for compatibility
            source: article.source?.name || 'Unknown',
            author: article.author
          })),
          totalResults: data.totalResults
        });
      }
    }

    return res.status(200).json({ 
      articles: [], 
      data: [] 
    });

  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch news',
      details: error.message 
    });
  }
}