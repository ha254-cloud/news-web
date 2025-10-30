
import axios from 'axios';
import xml2js from 'xml2js';
import * as cheerio from 'cheerio';

class AllAfricaFetcher {
  constructor() {
    this.baseUrl = 'https://allafrica.com';
    this.rssFeeds = [
      'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf',
      'https://allafrica.com/tools/headlines/rdf/business/headlines.rdf',
      'https://allafrica.com/tools/headlines/rdf/politics/headlines.rdf',
      'https://allafrica.com/tools/headlines/rdf/sport/headlines.rdf',
      'https://allafrica.com/tools/headlines/rdf/health/headlines.rdf',
      'https://allafrica.com/tools/headlines/rdf/tech/headlines.rdf'
    ];
  }

  async fetchAfricanNews() {
    const articles = [];
    try {
      // Fetch from general RSS feeds
      for (const feedUrl of this.rssFeeds) {
        try {
          const response = await axios.get(feedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
          });

          const parser = new xml2js.Parser();
          const result = await parser.parseStringPromise(response.data);

          if (result.rdf && result.rdf.item) {
            const feedArticles = result.rdf.item
              .filter(item => this.isValidArticle(item))
              .map(item => this.processArticle(item, feedUrl));

            articles.push(...feedArticles);
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.warn(`Failed to fetch AllAfrica RSS feed ${feedUrl}:`, error.message);
        }
      }

      // Also try to fetch from country-specific RSS feeds
      const countryFeeds = [
        'https://allafrica.com/kenya/headlines.rdf',
        'https://allafrica.com/nigeria/headlines.rdf',
        'https://allafrica.com/southafrica/headlines.rdf',
        'https://allafrica.com/ghana/headlines.rdf',
        'https://allafrica.com/egypt/headlines.rdf'
      ];

      for (const feedUrl of countryFeeds) {
        try {
          const response = await axios.get(feedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
          });

          const parser = new xml2js.Parser();
          const result = await parser.parseStringPromise(response.data);

          if (result.rdf && result.rdf.item) {
            const feedArticles = result.rdf.item
              .filter(item => this.isValidArticle(item))
              .map(item => this.processArticle(item, feedUrl));

            articles.push(...feedArticles);
          }

          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.warn(`Failed to fetch country RSS feed ${feedUrl}:`, error.message);
        }
      }

      console.log(`✅ AllAfrica: Fetched ${articles.length} articles`);
      return articles;

    } catch (error) {
      console.error('AllAfrica fetcher error:', error);
      return [];
    }
  }

  isValidArticle(item) {
    return item.title && 
           item.title[0] && 
           item.description && 
           item.description[0] &&
           item.title[0].length > 10 &&
           item.description[0].length > 50;
  }

  processArticle(item, feedUrl) {
    const title = item.title[0];
    const description = this.cleanDescription(item.description[0]);
    const link = item.link ? item.link[0] : '';
    const pubDate = item.pubDate ? item.pubDate[0] : new Date().toISOString();

    return {
      id: this.generateId((title || '') + (pubDate || '') + (link || '')), // always generate id
      title: title,
      description: description,
      content: description,
      image: this.extractImage(item) || this.getDefaultImage(),
      source: 'AllAfrica',
      url: link,
      publishedAt: this.formatDate(pubDate),
      country: this.detectCountryFromFeed(feedUrl, title, description),
      category: this.detectCategoryFromFeed(feedUrl, title, description),
      provider: 'allafrica'
    };
  }

  cleanDescription(description) {
  // Remove HTML tags and clean up text
  const $ = cheerio.load(description);
  return $.text().trim().substring(0, 500);
  }

  extractImage(item) {
    // Try to extract image from various RSS fields
    if (item.enclosure && item.enclosure[0] && item.enclosure[0].$.url) {
      return item.enclosure[0].$.url;
    }
    
    if (item['media:content'] && item['media:content'][0] && item['media:content'][0].$.url) {
      return item['media:content'][0].$.url;
    }

    if (item.description && item.description[0]) {
      const $ = cheerio.load(item.description[0]);
      const imgSrc = $('img').attr('src');
      if (imgSrc) {
        return imgSrc.startsWith('http') ? imgSrc : `https://allafrica.com${imgSrc}`;
      }
    }

    return null;
  }

  getDefaultImage() {
    // Return a default AllAfrica image
    const defaultImages = [
      'https://allafrica.com/static/images/structure/aa-logo-rgba-small.png',
      'https://cdn.vox-cdn.com/thumbor/gkJ6HY2RlAP_zPF-5bF0FjTMDbM=/0x0:5184x3456/1200x675/filters:focal(2178x1314:3006x2142)/cdn.vox-cdn.com/uploads/chorus_image/image/65992194/GettyImages_1141723038.0.jpg'
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  }

  detectCountryFromFeed(feedUrl, title, description) {
    // Extract country from feed URL
    if (feedUrl.includes('/kenya/')) return 'Kenya';
    if (feedUrl.includes('/nigeria/')) return 'Nigeria';
    if (feedUrl.includes('/southafrica/')) return 'South Africa';
    if (feedUrl.includes('/ghana/')) return 'Ghana';
    if (feedUrl.includes('/egypt/')) return 'Egypt';

    // Detect from content
    const text = `${title} ${description}`.toLowerCase();
    
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

    return 'Africa';
  }

  detectCategoryFromFeed(feedUrl, title, description) {
    // Extract category from feed URL
    if (feedUrl.includes('/business/')) return 'business';
    if (feedUrl.includes('/politics/')) return 'politics';
    if (feedUrl.includes('/sport/')) return 'sports';
    if (feedUrl.includes('/health/')) return 'health';
    if (feedUrl.includes('/tech/')) return 'technology';

    // Detect from content
    const text = `${title} ${description}`.toLowerCase();
    
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

  formatDate(dateString) {
    // Try to parse the date string, fallback to current date if invalid
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    return new Date().toISOString();
  }
}

export default AllAfricaFetcher;