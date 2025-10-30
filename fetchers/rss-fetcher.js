const axios = require('axios');
const { parseStringPromise } = require('xml2js');

class RSSFetcher {
  constructor() {
    this.africanCountries = [
      'kenya', 'nigeria', 'south-africa', 'ghana', 'egypt', 'morocco', 
      'ethiopia', 'tanzania', 'uganda', 'rwanda', 'senegal', 'ivory-coast',
      'cameroon', 'burkina-faso', 'mali', 'mozambique', 'madagascar', 
      'angola', 'niger', 'malawi', 'zambia', 'zimbabwe', 'botswana'
    ];
    
    this.rssSources = {
      allAfrica: {
        kenya: 'https://allafrica.com/tools/headlines/rdf/kenya/headlines.rdf',
        nigeria: 'https://allafrica.com/tools/headlines/rdf/nigeria/headlines.rdf',
        'south-africa': 'https://allafrica.com/tools/headlines/rdf/south-africa/headlines.rdf',
        ghana: 'https://allafrica.com/tools/headlines/rdf/ghana/headlines.rdf',
        egypt: 'https://allafrica.com/tools/headlines/rdf/egypt/headlines.rdf'
      },
      googleNews: {
        kenya: 'https://news.google.com/rss/search?q=Kenya&hl=en-KE&gl=KE&ceid=KE:en',
        nigeria: 'https://news.google.com/rss/search?q=Nigeria&hl=en-NG&gl=NG&ceid=NG:en',
        'south-africa': 'https://news.google.com/rss/search?q=South+Africa&hl=en-ZA&gl=ZA&ceid=ZA:en',
        ghana: 'https://news.google.com/rss/search?q=Ghana&hl=en-GH&gl=GH&ceid=GH:en',
        egypt: 'https://news.google.com/rss/search?q=Egypt&hl=ar-EG&gl=EG&ceid=EG:ar'
      }
    };
  }

  // --- Function to fetch and parse RSS ---
  async fetchRSS(url, sourceName = 'Unknown', country = 'Africa') {
    try {
      console.log(`🔄 Fetching RSS from ${sourceName} (${country}): ${url}`);
      
      const { data } = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const result = await parseStringPromise(data);
      
      // Handle different RSS structures
      let items = [];
      if (result.rss && result.rss.channel && result.rss.channel[0].item) {
        // Standard RSS format
        items = result.rss.channel[0].item.map((item, idx) => {
          let imageUrl = this.extractImage(this.extractText(item.description) || '') || '/images/default.jpg';
          if (!/^https?:\/\//i.test(imageUrl)) imageUrl = '/images/default.jpg';
          let articleUrl = this.extractText(item.link);
          if (!/^https?:\/\//i.test(articleUrl)) articleUrl = '';
          return {
            id: this.generateId((this.extractText(item.title) || '') + (this.extractText(item.pubDate) || this.extractText(item.published) || '') + (articleUrl || '') + idx),
            title: this.extractText(item.title),
            link: articleUrl,
            description: this.extractText(item.description) || this.extractText(item.summary) || '',
            pubDate: this.extractText(item.pubDate) || this.extractText(item.published) || new Date().toISOString(),
            source: sourceName,
            country: country,
            category: this.categorizeArticle(this.extractText(item.title) + ' ' + this.extractText(item.description)),
            image: imageUrl,
            originalSource: result.rss.channel[0].title ? this.extractText(result.rss.channel[0].title) : sourceName
          };
        });
      } else if (result.feed && result.feed.entry) {
        // Atom feed format
        items = result.feed.entry.map((item) => {
          let imageUrl = this.extractImage(this.extractText(item.summary) || this.extractText(item.content) || '') || '/images/default.jpg';
          if (!/^https?:\/\//i.test(imageUrl)) imageUrl = '/images/default.jpg';
          let articleUrl = item.link && item.link[0] ? item.link[0].$.href : '';
          if (!/^https?:\/\//i.test(articleUrl)) articleUrl = '';
          return {
            title: this.extractText(item.title),
            link: articleUrl,
            description: this.extractText(item.summary) || this.extractText(item.content) || '',
            pubDate: this.extractText(item.published) || this.extractText(item.updated) || new Date().toISOString(),
            source: sourceName,
            country: country,
            category: this.categorizeArticle(this.extractText(item.title) + ' ' + this.extractText(item.summary)),
            image: imageUrl,
            originalSource: result.feed.title ? this.extractText(result.feed.title) : sourceName
          };
        });
      }
      
      console.log(`✅ Successfully fetched ${items.length} articles from ${sourceName} (${country})`);
      return items.filter(item => item.title && item.link); // Filter out invalid items
      
    } catch (error) {
      console.error(`❌ Error fetching RSS from ${sourceName} (${country}):`, error.message);
      let items = [];
      if (result.rss && result.rss.channel && result.rss.channel[0].item) {
        // Standard RSS format
        items = result.rss.channel[0].item.map((item) => {
          let imageUrl = this.extractImage(this.extractText(item.description) || '') || '/images/default.jpg';
          if (!/^https?:\/\//i.test(imageUrl)) imageUrl = '/images/default.jpg';
          let articleUrl = this.extractText(item.link);
          if (!/^https?:\/\//i.test(articleUrl)) articleUrl = '';
          return {
            title: this.extractText(item.title),
            link: articleUrl,
            description: this.extractText(item.description) || this.extractText(item.summary) || '',
            pubDate: this.extractText(item.pubDate) || this.extractText(item.published) || new Date().toISOString(),
            source: sourceName,
            country: country,
            category: this.categorizeArticle(this.extractText(item.title) + ' ' + this.extractText(item.description)),
            image: imageUrl,
            originalSource: result.rss.channel[0].title ? this.extractText(result.rss.channel[0].title) : sourceName
          };
        });
      } else if (result.feed && result.feed.entry) {
        // Atom feed format
        items = result.feed.entry.map((item) => {
          let imageUrl = this.extractImage(this.extractText(item.summary) || this.extractText(item.content) || '') || '/images/default.jpg';
          if (!/^https?:\/\//i.test(imageUrl)) imageUrl = '/images/default.jpg';
          let articleUrl = item.link && item.link[0] ? item.link[0].$.href : '';
          if (!/^https?:\/\//i.test(articleUrl)) articleUrl = '';
          return {
            title: this.extractText(item.title),
            link: articleUrl,
            description: this.extractText(item.summary) || this.extractText(item.content) || '',
            pubDate: this.extractText(item.published) || this.extractText(item.updated) || new Date().toISOString(),
            source: sourceName,
            country: country,
            category: this.categorizeArticle(this.extractText(item.title) + ' ' + this.extractText(item.summary)),
            image: imageUrl,
            originalSource: result.feed.title ? this.extractText(result.feed.title) : sourceName
          };
        });
      }
      if (match && match[1]) {
        let imageUrl = match[1].trim();
        
        // Clean up the URL
        imageUrl = imageUrl.replace(/&amp;/g, '&');
        imageUrl = imageUrl.replace(/]]>.*$/, '');
        
        // Validate URL
        if (imageUrl.startsWith('http') && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(imageUrl)) {
          return imageUrl;
        }
      }
    }
    
    return null;
  }

  // --- Function to categorize articles ---
  categorizeArticle(text) {
    if (!text) return 'general';
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.match(/business|economy|financial|trade|investment|bank|market|company/)) {
      return 'business';
    } else if (lowerText.match(/technology|tech|digital|cyber|internet|startup|innovation/)) {
      return 'technology';
    } else if (lowerText.match(/sports|football|soccer|rugby|cricket|athletics|olympics/)) {
      return 'sports';
    } else if (lowerText.match(/health|medical|hospital|doctor|disease|covid|pandemic/)) {
      return 'health';
    } else if (lowerText.match(/politics|government|election|president|minister|parliament/)) {
      return 'politics';
    } else if (lowerText.match(/entertainment|music|film|movie|celebrity|culture|art/)) {
      return 'entertainment';
    } else {
      return 'general';
    }
  }

  // --- Fetch from AllAfrica RSS feeds ---
  async fetchAllAfricaNews() {
    const allArticles = [];
    
    for (const [country, rssUrl] of Object.entries(this.rssSources.allAfrica)) {
      const articles = await this.fetchRSS(rssUrl, 'AllAfrica', country);
      allArticles.push(...articles);
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return allArticles;
  }

  // --- Fetch from Google News RSS feeds ---
  async fetchGoogleNewsAfrica() {
    const allArticles = [];
    
    for (const [country, rssUrl] of Object.entries(this.rssSources.googleNews)) {
      const articles = await this.fetchRSS(rssUrl, 'Google News', country);
      allArticles.push(...articles);
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return allArticles;
  }

  // --- Fetch all RSS sources ---
  async fetchAllRSSNews() {
    console.log('🚀 Starting RSS news fetch from all sources...');
    
    const [allAfricaNews, googleNews] = await Promise.all([
      this.fetchAllAfricaNews(),
      this.fetchGoogleNewsAfrica()
    ]);
    
    const allNews = [...allAfricaNews, ...googleNews];
    
    console.log(`📊 Total RSS articles fetched: ${allNews.length}`);
    console.log(`   - AllAfrica: ${allAfricaNews.length}`);
    console.log(`   - Google News: ${googleNews.length}`);
    
    return this.removeDuplicates(allNews);
  }

  // --- Remove duplicate articles ---
  removeDuplicates(articles) {
    const seen = new Set();
    const unique = articles.filter(article => {
      const key = article.title.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    
    console.log(`🔄 Removed ${articles.length - unique.length} duplicate articles`);
    return unique;
  }
}

module.exports = RSSFetcher;