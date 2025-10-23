// RSS Feed fetcher for AllAfrica and Google News
const axios = require('axios');
const xml2js = require('xml2js');

class RSSFetcher {
  // Main function to fetch and parse RSS
  static async fetchRSS(url, sourceName, retries = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Fetching ${sourceName} (attempt ${attempt}/${retries})...`);
        
        const { data } = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 20000, // Increased timeout to 20 seconds
          maxRedirects: 5
        });
        
        const result = await xml2js.parseStringPromise(data);
        
        // Handle different RSS structures
        let items = [];
        
        if (result.rss && result.rss.channel && result.rss.channel[0].item) {
          // Standard RSS format
          items = result.rss.channel[0].item.map((item) => ({
            title: this.extractText(item.title),
            link: this.extractText(item.link),
            description: this.extractText(item.description),
            pubDate: this.extractText(item.pubDate),
            source: sourceName || this.extractText(result.rss.channel[0].title),
            image: this.extractImage(this.extractText(item.description)),
            category: this.extractCategory(item),
            country: this.extractCountry(this.extractText(item.title) + ' ' + this.extractText(item.description))
          }));
        } else if (result.feed && result.feed.entry) {
          // Atom feed format
          items = result.feed.entry.map((entry) => ({
            title: this.extractText(entry.title),
            link: entry.link && entry.link[0] ? entry.link[0].$.href : '',
            description: this.extractText(entry.summary || entry.content),
            pubDate: this.extractText(entry.published || entry.updated),
            source: sourceName || this.extractText(result.feed.title),
            image: this.extractImage(this.extractText(entry.summary || entry.content)),
            category: this.extractCategory(entry),
            country: this.extractCountry(this.extractText(entry.title) + ' ' + this.extractText(entry.summary))
          }));
        }
        
        console.log(`✅ ${sourceName}: Fetched ${items.length} articles`);
        return items.filter(item => item.title && item.link);
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed for ${sourceName}:`, error.message);
        
        if (attempt === retries) {
          console.error(`❌ All ${retries} attempts failed for ${sourceName}`);
          return [];
        }
        
        // Wait before retry (exponential backoff)
        const waitTime = attempt * 2000;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    return [];
  }

  // Extract text from XML elements
  static extractText(element) {
    if (!element) return '';
    if (typeof element === 'string') return element;
    if (Array.isArray(element) && element.length > 0) {
      return typeof element[0] === 'string' ? element[0] : element[0]._ || '';
    }
    return element._ || '';
  }

  // Extract image from HTML description
  static extractImage(html) {
    if (!html) return null;
    
    // Try different image patterns
    const patterns = [
      /<img[^>]+src="([^"]+)"/i,
      /<img[^>]+src='([^']+)'/i,
      /src="([^"]+\.(?:jpg|jpeg|png|gif|webp))"/i,
      /url\(([^)]+\.(?:jpg|jpeg|png|gif|webp))\)/i
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let imageUrl = match[1];
        // Clean up the URL
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://allafrica.com' + imageUrl;
        }
        return imageUrl;
      }
    }
    
    return null;
  }

  // Extract category from RSS item
  static extractCategory(item) {
    // Check for category in different formats
    if (item.category) {
      const category = this.extractText(item.category);
      return this.normalizeCategory(category);
    }
    
    // Fallback to analyzing title/description
    const text = (this.extractText(item.title) + ' ' + this.extractText(item.description)).toLowerCase();
    
    if (text.includes('business') || text.includes('economy') || text.includes('finance')) return 'business';
    if (text.includes('sport') || text.includes('football') || text.includes('soccer')) return 'sports';
    if (text.includes('tech') || text.includes('digital') || text.includes('internet')) return 'technology';
    if (text.includes('health') || text.includes('medical') || text.includes('hospital')) return 'health';
    if (text.includes('politic') || text.includes('government') || text.includes('election')) return 'politics';
    
    return 'general';
  }

  // Normalize category names
  static normalizeCategory(category) {
    const categoryMap = {
      'business': 'business',
      'economy': 'business',
      'finance': 'business',
      'sports': 'sports',
      'sport': 'sports',
      'football': 'sports',
      'technology': 'technology',
      'tech': 'technology',
      'health': 'health',
      'politics': 'politics',
      'political': 'politics',
      'entertainment': 'entertainment',
      'science': 'science'
    };
    
    return categoryMap[category.toLowerCase()] || 'general';
  }

  // Extract country from content
  static extractCountry(text) {
    if (!text) return 'Africa';
    
    const countryKeywords = {
      'Kenya': ['kenya', 'nairobi', 'kenyan', 'mombasa'],
      'Nigeria': ['nigeria', 'lagos', 'abuja', 'nigerian', 'kano'],
      'South Africa': ['south africa', 'cape town', 'johannesburg', 'durban', 'pretoria'],
      'Ghana': ['ghana', 'accra', 'ghanaian', 'kumasi'],
      'Egypt': ['egypt', 'cairo', 'egyptian', 'alexandria'],
      'Morocco': ['morocco', 'casablanca', 'rabat', 'moroccan'],
      'Ethiopia': ['ethiopia', 'addis ababa', 'ethiopian'],
      'Tanzania': ['tanzania', 'dar es salaam', 'tanzanian'],
      'Uganda': ['uganda', 'kampala', 'ugandan'],
      'Rwanda': ['rwanda', 'kigali', 'rwandan']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [country, keywords] of Object.entries(countryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return country;
      }
    }
    
    return 'Africa';
  }

  // Fetch AllAfrica RSS feeds with fallbacks
  static async fetchAllAfrica() {
    const feeds = [
      { 
        url: 'https://allafrica.com/tools/headlines/rdf/kenya/headlines.rdf', 
        country: 'Kenya',
        fallback: 'https://allafrica.com/kenya/'
      },
      { 
        url: 'https://allafrica.com/tools/headlines/rdf/nigeria/headlines.rdf', 
        country: 'Nigeria',
        fallback: 'https://allafrica.com/nigeria/'
      },
      { 
        url: 'https://allafrica.com/tools/headlines/rdf/ghana/headlines.rdf', 
        country: 'Ghana',
        fallback: 'https://allafrica.com/ghana/'
      },
      // Skip South Africa for now due to 404 error
      { 
        url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', 
        country: 'Africa',
        fallback: 'https://allafrica.com/latest/'
      }
    ];
    
    const allArticles = [];
    
    // Process feeds with limited concurrency to avoid overwhelming the server
    const maxConcurrent = 2;
    for (let i = 0; i < feeds.length; i += maxConcurrent) {
      const batch = feeds.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (feed) => {
        try {
          const articles = await this.fetchRSS(feed.url, `AllAfrica ${feed.country}`, 3);
          
          if (articles.length === 0) {
            console.log(`⚠️ No articles from ${feed.country}, trying fallback approach...`);
            // Could implement fallback scraping here if needed
          }
          
          // Set country for articles that don't have one detected
          const articlesWithCountry = articles.map(article => ({
            ...article,
            country: article.country === 'Africa' ? feed.country : article.country
          }));
          
          return articlesWithCountry;
        } catch (error) {
          console.error(`Failed to fetch ${feed.country} feed:`, error.message);
          return [];
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(articles => allArticles.push(...articles));
      
      // Add delay between batches to be respectful to the server
      if (i + maxConcurrent < feeds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return allArticles;
  }

  // Fetch Google News RSS feeds with optimized concurrency
  static async fetchGoogleNews() {
    const queries = [
      { query: 'Kenya news', country: 'Kenya' },
      { query: 'Nigeria news', country: 'Nigeria' },
      { query: 'South Africa news', country: 'South Africa' },
      { query: 'Ghana news', country: 'Ghana' },
      { query: 'Africa breaking news', country: 'Africa' }
    ];
    
    const allArticles = [];
    
    // Process in batches to avoid rate limiting
    const maxConcurrent = 3;
    for (let i = 0; i < queries.length; i += maxConcurrent) {
      const batch = queries.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async ({ query, country }) => {
        try {
          const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`;
          const articles = await this.fetchRSS(url, `Google News ${country}`, 2);
          
          // Set country for articles that don't have one detected
          const articlesWithCountry = articles.map(article => ({
            ...article,
            country: article.country === 'Africa' ? country : article.country
          }));
          
          return articlesWithCountry;
        } catch (error) {
          console.error(`Failed to fetch Google News for ${query}:`, error.message);
          return [];
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(articles => allArticles.push(...articles));
      
      // Small delay between batches
      if (i + maxConcurrent < queries.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return allArticles;
  }

  // Fetch all RSS sources with improved error handling
  static async fetchAllRSS() {
    console.log('🔄 Fetching RSS feeds with optimized settings...');
    
    const startTime = Date.now();
    
    try {
      // Fetch sources with timeout protection
      const fetchWithTimeout = (promise, timeoutMs, name) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`${name} timed out after ${timeoutMs}ms`)), timeoutMs)
          )
        ]);
      };
      
      const [allAfricaArticles, googleNewsArticles] = await Promise.allSettled([
        fetchWithTimeout(this.fetchAllAfrica(), 60000, 'AllAfrica'),
        fetchWithTimeout(this.fetchGoogleNews(), 30000, 'Google News')
      ]);
      
      const validAllAfrica = allAfricaArticles.status === 'fulfilled' ? allAfricaArticles.value : [];
      const validGoogleNews = googleNewsArticles.status === 'fulfilled' ? googleNewsArticles.value : [];
      
      if (allAfricaArticles.status === 'rejected') {
        console.warn('⚠️ AllAfrica fetch failed:', allAfricaArticles.reason.message);
      }
      
      if (googleNewsArticles.status === 'rejected') {
        console.warn('⚠️ Google News fetch failed:', googleNewsArticles.reason.message);
      }
      
      const allArticles = [...validAllAfrica, ...validGoogleNews];
      
      // Remove duplicates based on title similarity
      const uniqueArticles = this.removeDuplicates(allArticles);
      
      const endTime = Date.now();
      console.log(`✅ RSS fetch completed in ${endTime - startTime}ms`);
      console.log(`✅ Total RSS articles fetched: ${uniqueArticles.length}`);
      
      return uniqueArticles;
      
    } catch (error) {
      console.error('❌ RSS fetch error:', error.message);
      return [];
    }
  }

  // Remove duplicate articles
  static removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
      // Create a simple key from title (first 50 chars, lowercase, no spaces)
      const key = article.title.toLowerCase().replace(/\s+/g, '').substring(0, 50);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

module.exports = { RSSFetcher };