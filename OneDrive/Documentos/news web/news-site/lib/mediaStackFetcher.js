// MediaStack API news fetcher
const axios = require('axios');

class MediaStackFetcher {
  constructor() {
    this.apiKey = '58b73faaa3a26c528bdbbaf0d9b27e47';
    this.baseUrl = 'http://api.mediastack.com/v1/news';
  }

  async fetchNews(options = {}) {
    const {
      countries = 'ke,ng,za,gh,eg,ma,et,tz,ug,rw', // African countries
      categories = 'general,business,technology,sports,health',
      limit = 100,
      keywords = ''
    } = options;

    try {
      console.log('🔄 Fetching from MediaStack API...');
      
      const params = {
        access_key: this.apiKey,
        countries: countries,
        categories: categories,
        limit: limit,
        sort: 'published_desc'
      };

      // Add keywords if provided
      if (keywords) {
        params.keywords = keywords;
      }

      const response = await axios.get(this.baseUrl, {
        params: params,
        timeout: 15000
      });

      if (response.data.error) {
        throw new Error(`MediaStack API Error: ${response.data.error.info}`);
      }

      const articles = response.data.data || [];
      
      console.log(`✅ MediaStack: Fetched ${articles.length} articles`);
      
      // Transform to our standard format
      return articles.map(article => ({
        title: article.title,
        description: article.description,
        content: article.description, // MediaStack doesn't provide full content
        url: article.url,
        image: article.image,
        publishedAt: article.published_at,
        source: {
          name: article.source
        },
        country: this.mapCountryCode(article.country),
        category: article.category,
        language: article.language
      }));

    } catch (error) {
      console.error('❌ MediaStack fetch error:', error.message);
      return [];
    }
  }

  // Map country codes to full names
  mapCountryCode(countryCode) {
    const countryMap = {
      'ke': 'Kenya',
      'ng': 'Nigeria', 
      'za': 'South Africa',
      'gh': 'Ghana',
      'eg': 'Egypt',
      'ma': 'Morocco',
      'et': 'Ethiopia',
      'tz': 'Tanzania',
      'ug': 'Uganda',
      'rw': 'Rwanda'
    };
    
    return countryMap[countryCode?.toLowerCase()] || 'Africa';
  }

  // Fetch specific categories
  async fetchByCategory(category) {
    return this.fetchNews({ categories: category });
  }

  // Fetch specific countries
  async fetchByCountry(countries) {
    return this.fetchNews({ countries: countries });
  }

  // Search with keywords
  async searchNews(keywords) {
    return this.fetchNews({ keywords: keywords });
  }
}

module.exports = { MediaStackFetcher };