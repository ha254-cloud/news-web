const axios = require('axios');

class MediaStackFetcher {
  constructor(apiKey = '58b73faaa3a26c528bdbbaf0d9b27e47') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.mediastack.com/v1';
    this.africanCountries = [
      'ke', 'ng', 'za', 'gh', 'eg', 'ma', 'et', 'tz', 'ug', 'rw',
      'sn', 'ci', 'cm', 'bf', 'ml', 'mz', 'mg', 'ao', 'ne', 'mw'
    ];
  }

  async fetchAfricanNews() {
    const articles = [];
    try {
      // Fetch main African news
      const response = await axios.get(`${this.baseUrl}/news`, {
        params: {
          access_key: this.apiKey,
          countries: this.africanCountries.join(','),
          languages: 'en',
          limit: 50,
          sort: 'published_desc'
        }
      });

      if (response.data.data) {
        const processedArticles = response.data.data
          .filter(article => this.isValidArticle(article))
          .map(article => this.processArticle(article));
        articles.push(...processedArticles);
      }

      // Additional keyword-based search for African content
      const africanKeywords = [
        'Nigeria Lagos Abuja',
        'Kenya Nairobi',
        'South Africa Cape Town',
        'Ghana Accra',
        'Egypt Cairo',
        'Morocco Casablanca',
        'Ethiopia Addis Ababa',
        'Tanzania Dar es Salaam'
      ];

      for (const keyword of africanKeywords.slice(0, 3)) { // Limit to avoid rate limits
        try {
          const keywordResponse = await axios.get(`${this.baseUrl}/news`, {
            params: {
              access_key: this.apiKey,
              keywords: keyword,
              languages: 'en',
              limit: 20,
              sort: 'published_desc'
            }
          });

          if (keywordResponse.data.data) {
            const keywordArticles = keywordResponse.data.data
              .filter(article => this.isValidArticle(article) && this.isAfricanContent(article))
              .map(article => this.processArticle(article));
            articles.push(...keywordArticles);
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.warn(`MediaStack keyword search failed for "${keyword}":`, error.message);
        }
      }

      console.log(`✅ MediaStack: Fetched ${articles.length} articles`);
      return articles;

    } catch (error) {
      console.error('MediaStack fetcher error:', error);
      return [];
    }
  }

  isValidArticle(article) {
    return article.title && 
           article.description && 
           article.title.length > 10 &&
           article.description.length > 50 &&
           article.image &&
           !article.title.toLowerCase().includes('remove');
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

    return article.country || 'Africa';
  }

  processArticle(article) {
    return {
      id: this.generateId((article.title || '') + (article.published_at || '') + (article.url || '')), // always generate id
      title: article.title,
      description: article.description,
      content: article.description, // MediaStack doesn't provide full content
      image: article.image,
      source: article.source,
      url: article.url,
      publishedAt: article.published_at,
      country: this.detectCountry(article),
      category: this.detectCategory(article),
      provider: 'mediastack'
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

    // Check category from MediaStack if available
    if (article.category) {
      return article.category.toLowerCase();
    }

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

module.exports = MediaStackFetcher;