// Multi-source African news aggregator
const axios = require('axios');
const { MediaStackFetcher } = require('./mediaStackFetcher');
const { RSSFetcher } = require('./rssFetcher');

class AfricanNewsAggregator {
  constructor() {
    this.mediaStack = new MediaStackFetcher();
    this.newsApiKey = process.env.NEWS_API_KEY;
  }

  // Fetch from NewsAPI
  async fetchNewsAPI() {
    if (!this.newsApiKey) {
      console.log('⚠️ NewsAPI key not found, skipping NewsAPI...');
      return [];
    }

    try {
      console.log('🔄 Fetching from NewsAPI...');
      
      const countries = ['ke', 'ng', 'za', 'gh', 'eg'];
      const categories = ['general', 'business', 'technology', 'sports', 'health'];
      const allArticles = [];

      for (const country of countries) {
        for (const category of categories) {
          try {
            const response = await axios.get('https://newsapi.org/v2/top-headlines', {
              params: {
                apiKey: this.newsApiKey,
                country: country,
                category: category,
                pageSize: 20
              },
              timeout: 10000
            });

            if (response.data.articles) {
              const articles = response.data.articles.map(article => ({
                title: article.title,
                description: article.description,
                content: article.content,
                url: article.url,
                image: article.urlToImage,
                publishedAt: article.publishedAt,
                source: article.source,
                country: this.mapCountryCode(country),
                category: category
              }));
              
              allArticles.push(...articles);
            }
            
            // Rate limiting
            await this.delay(100);
          } catch (error) {
            console.error(`NewsAPI error for ${country}/${category}:`, error.message);
          }
        }
      }

      console.log(`✅ NewsAPI: Fetched ${allArticles.length} articles`);
      return allArticles;

    } catch (error) {
      console.error('❌ NewsAPI fetch error:', error.message);
      return [];
    }
  }

  // Fetch from MediaStack
  async fetchMediaStack() {
    try {
      return await this.mediaStack.fetchNews();
    } catch (error) {
      console.error('❌ MediaStack fetch error:', error.message);
      return [];
    }
  }

  // Fetch from RSS sources
  async fetchRSS() {
    try {
      return await RSSFetcher.fetchAllRSS();
    } catch (error) {
      console.error('❌ RSS fetch error:', error.message);
      return [];
    }
  }

  // Main aggregation function
  async aggregateNews() {
    console.log('🚀 Starting African news aggregation...');
    
    const startTime = Date.now();
    
    // Fetch from all sources in parallel
    const [newsApiArticles, mediaStackArticles, rssArticles] = await Promise.all([
      this.fetchNewsAPI(),
      this.fetchMediaStack(),
      this.fetchRSS()
    ]);

    // Combine all articles
    let allArticles = [
      ...newsApiArticles,
      ...mediaStackArticles,
      ...rssArticles
    ];

    console.log(`📊 Raw articles fetched: ${allArticles.length}`);

    // Filter African content
    allArticles = this.filterAfricanContent(allArticles);
    console.log(`🌍 African articles after filtering: ${allArticles.length}`);

    // Remove duplicates
    allArticles = this.removeDuplicates(allArticles);
    console.log(`✨ Unique articles after deduplication: ${allArticles.length}`);

    // Sort by date (newest first)
    allArticles = allArticles.sort((a, b) => 
      new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    // Add metadata
    allArticles = allArticles.map(article => ({
      ...article,
      id: this.generateId(article.title),
      fetchedAt: new Date().toISOString(),
      readingTime: this.estimateReadingTime(article.content || article.description)
    }));

    const endTime = Date.now();
    console.log(`✅ Aggregation completed in ${endTime - startTime}ms`);
    console.log(`📰 Final article count: ${allArticles.length}`);

    return allArticles;
  }

  // Filter for African content
  filterAfricanContent(articles) {
    const africanKeywords = [
      'africa', 'kenya', 'nigeria', 'south africa', 'ghana', 'egypt', 
      'morocco', 'ethiopia', 'tanzania', 'uganda', 'rwanda',
      'nairobi', 'lagos', 'cape town', 'accra', 'cairo',
      'johannesburg', 'abuja', 'casablanca', 'addis ababa'
    ];

    return articles.filter(article => {
      if (!article.title && !article.description) return false;
      
      const content = (
        (article.title || '') + ' ' + 
        (article.description || '') + ' ' +
        (article.country || '')
      ).toLowerCase();

      return africanKeywords.some(keyword => content.includes(keyword));
    });
  }

  // Remove duplicate articles
  removeDuplicates(articles) {
    const seen = new Map();
    
    return articles.filter(article => {
      if (!article.title) return false;
      
      // Create a key from title (first 60 chars, normalized)
      const key = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 60);
      
      if (seen.has(key)) {
        return false;
      }
      
      seen.set(key, true);
      return true;
    });
  }

  // Map country codes
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

  // Generate unique ID
  generateId(title) {
    return require('crypto')
      .createHash('md5')
      .update(title + Date.now())
      .digest('hex')
      .substring(0, 8);
  }

  // Estimate reading time
  estimateReadingTime(content) {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get articles by country
  async getArticlesByCountry(country) {
    const allArticles = await this.aggregateNews();
    return allArticles.filter(article => 
      article.country?.toLowerCase() === country.toLowerCase()
    );
  }

  // Get articles by category
  async getArticlesByCategory(category) {
    const allArticles = await this.aggregateNews();
    return allArticles.filter(article => 
      article.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // Search articles
  async searchArticles(query) {
    const allArticles = await this.aggregateNews();
    const lowerQuery = query.toLowerCase();
    
    return allArticles.filter(article => 
      article.title?.toLowerCase().includes(lowerQuery) ||
      article.description?.toLowerCase().includes(lowerQuery)
    );
  }
}

module.exports = { AfricanNewsAggregator };