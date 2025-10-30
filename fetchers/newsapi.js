const axios = require('axios');

class NewsAPIFetcher {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://newsapi.org/v2';
    this.africanCountries = [
      'ke', 'ng', 'za', 'gh', 'eg', 'ma', 'et', 'tz', 'ug', 'rw',
      'sn', 'ci', 'cm', 'bf', 'ml', 'mz', 'mg', 'ao', 'ne', 'mw'
    ];
  }

  async fetchAfricanNews() {
    const articles = [];
    try {
      // Fetch top headlines for each African country
      for (const country of this.africanCountries) {
        try {
          const response = await axios.get(`${this.baseUrl}/top-headlines`, {
            params: {
              country: country,
              language: 'en',
              pageSize: 10,
              apiKey: this.apiKey
            }
          });

          if (response.data.articles) {
            const processedArticles = response.data.articles
              .filter(article => this.isValidArticle(article))
              .map(article => this.processArticle(article, country));
            articles.push(...processedArticles);
          }

          // Rate limiting - wait 100ms between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to fetch from NewsAPI for ${country}:`, error.message);
        }
      }

      // Also search for African keywords globally
      const keywordSearches = [
        'Nigeria Lagos Abuja',
        'Kenya Nairobi Mombasa',
        'South Africa Cape Town Johannesburg',
        'Ghana Accra',
        'Egypt Cairo',
        'Morocco Casablanca Rabat',
        'Ethiopia Addis Ababa',
        'Tanzania Dar es Salaam'
      ];

      for (const query of keywordSearches) {
        try {
          const response = await axios.get(`${this.baseUrl}/everything`, {
            params: {
              q: query,
              language: 'en',
              sortBy: 'publishedAt',
              pageSize: 10,
              apiKey: this.apiKey
            }
          });

          if (response.data.articles) {
            const processedArticles = response.data.articles
              .filter(article => this.isValidArticle(article) && this.isAfricanContent(article))
              .map(article => this.processArticle(article, this.detectCountry(article)));
            articles.push(...processedArticles);
          }

          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to search NewsAPI for "${query}":`, error.message);
        }
      }

      console.log(`✅ NewsAPI: Fetched ${articles.length} articles`);
      return articles;

    } catch (error) {
      console.error('NewsAPI fetcher error:', error);
      return [];
    }
  }

  isValidArticle(article) {
    return article.title && 
           article.description && 
           article.title !== '[Removed]' &&
           article.description !== '[Removed]' &&
           article.urlToImage &&
           !article.title.toLowerCase().includes('remove') &&
           article.description.length > 50;
  }

  isAfricanContent(article) {
    const africanKeywords = [
      'nigeria', 'kenya', 'south africa', 'ghana', 'egypt', 'morocco',
      'ethiopia', 'tanzania', 'uganda', 'rwanda', 'senegal', 'ivory coast',
      'cameroon', 'burkina faso', 'mali', 'mozambique', 'madagascar',
      'angola', 'niger', 'malawi', 'lagos', 'nairobi', 'cape town',
      'johannesburg', 'accra', 'cairo', 'casablanca', 'addis ababa',
      'dar es salaam', 'kampala', 'kigali', 'african', 'africa'
    ];

    const text = `${article.title} ${article.description}`.toLowerCase();
    return africanKeywords.some(keyword => text.includes(keyword));
  }

  detectCountry(article) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    const countryPatterns = {
      'Nigeria': ['nigeria', 'lagos', 'abuja', 'nigerian'],
      'Kenya': ['kenya', 'nairobi', 'mombasa', 'kenyan'],
      'South Africa': ['south africa', 'cape town', 'johannesburg', 'durban', 'south african'],
      'Ghana': ['ghana', 'accra', 'ghanaian'],
      'Egypt': ['egypt', 'cairo', 'egyptian'],
      'Morocco': ['morocco', 'casablanca', 'rabat', 'moroccan'],
      'Ethiopia': ['ethiopia', 'addis ababa', 'ethiopian'],
      'Tanzania': ['tanzania', 'dar es salaam', 'tanzanian'],
      'Uganda': ['uganda', 'kampala', 'ugandan'],
      'Rwanda': ['rwanda', 'kigali', 'rwandan']
    };

    for (const [country, patterns] of Object.entries(countryPatterns)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        return country;
      }
    }

    return 'Africa'; // Default for general African content
  }

  processArticle(article, country) {
    return {
      id: this.generateId(article.title + article.publishedAt),
      title: article.title,
      description: article.description,
      content: article.content || article.description,
      image: article.urlToImage,
      source: article.source?.name || 'NewsAPI',
      url: article.url,
      publishedAt: article.publishedAt,
      country: country,
      category: this.detectCategory(article),
      provider: 'newsapi'
    };
  }

  detectCategory(article) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    const categories = {
      'business': ['business', 'economy', 'economic', 'market', 'finance', 'financial', 'trade', 'investment', 'bank', 'company'],
      'technology': ['technology', 'tech', 'digital', 'internet', 'software', 'app', 'startup', 'innovation', 'ai', 'artificial intelligence'],
      'sports': ['sport', 'football', 'soccer', 'basketball', 'cricket', 'rugby', 'athletics', 'olympic', 'champion', 'tournament'],
      'health': ['health', 'medical', 'hospital', 'doctor', 'disease', 'medicine', 'vaccine', 'covid', 'pandemic', 'healthcare'],
      'politics': ['politics', 'political', 'government', 'president', 'minister', 'election', 'parliament', 'policy', 'vote', 'democracy'],
      'entertainment': ['entertainment', 'music', 'movie', 'film', 'celebrity', 'artist', 'concert', 'festival', 'culture', 'art']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  generateId(text) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(text).digest('hex');
  }
}

module.exports = NewsAPIFetcher;