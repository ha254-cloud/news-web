const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import our custom modules
const NewsAPIFetcher = require('./fetchers/newsapi');
const MediaStackFetcher = require('./fetchers/mediastack');
const AllAfricaFetcher = require('./fetchers/allafrica');
const RSSFetcher = require('./fetchers/rss-fetcher');
const TextRewriter = require('./utils/rewrite');
const FeedMerger = require('./utils/mergeFeeds');

class AfricanNewsServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.dataFile = path.join(__dirname, 'data', 'news.json');
    
    // Initialize services
    this.newsAPI = new NewsAPIFetcher(process.env.NEWS_API_KEY);
    this.mediaStack = new MediaStackFetcher(); // API key already embedded
    this.allAfrica = new AllAfricaFetcher();
    this.rssFetcher = new RSSFetcher();
    this.textRewriter = new TextRewriter();
    this.feedMerger = new FeedMerger();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupCronJobs();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  setupRoutes() {
    // Main endpoint for fetching African news
    this.app.get('/african-news', async (req, res) => {
      try {
        const {
          country,
          category,
          limit = 20,
          offset = 0,
          refresh = false
        } = req.query;

        console.log(`📰 Request: /african-news - country: ${country}, category: ${category}, limit: ${limit}`);

        // Force refresh if requested or if data is stale
        if (refresh === 'true' || await this.isDataStale()) {
          console.log('🔄 Refreshing news data...');
          await this.fetchAndProcessNews();
        }

        // Load processed news
        const articles = await this.loadProcessedNews();
        
        // Filter articles based on query parameters
        let filteredArticles = articles;

        if (country) {
          filteredArticles = filteredArticles.filter(article => 
            article.country.toLowerCase().includes(country.toLowerCase())
          );
        }

        if (category) {
          filteredArticles = filteredArticles.filter(article => 
            article.category.toLowerCase() === category.toLowerCase()
          );
        }

        // Pagination
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

        // Response with metadata
        res.json({
          articles: paginatedArticles,
          meta: {
            total: filteredArticles.length,
            offset: startIndex,
            limit: parseInt(limit),
            country: country || 'all',
            category: category || 'all',
            lastUpdated: await this.getLastUpdated()
          }
        });

      } catch (error) {
        console.error('Error serving /african-news:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to fetch African news'
        });
      }
    });

    // Endpoint to force refresh news
    this.app.post('/refresh-news', async (req, res) => {
      try {
        console.log('🔄 Manual news refresh triggered');
        const startTime = Date.now();
        
        await this.fetchAndProcessNews();
        
        const duration = Date.now() - startTime;
        const articles = await this.loadProcessedNews();
        
        res.json({
          success: true,
          message: 'News refreshed successfully',
          articlesCount: articles.length,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error refreshing news:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to refresh news',
          message: error.message
        });
      }
    });

    // Endpoint for statistics
    this.app.get('/stats', async (req, res) => {
      try {
        const articles = await this.loadProcessedNews();
        const stats = this.feedMerger.getStatistics(articles);
        
        res.json({
          ...stats,
          lastUpdated: await this.getLastUpdated(),
          serverUptime: process.uptime()
        });

      } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
          error: 'Failed to get statistics'
        });
      }
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Get available countries and categories
    this.app.get('/filters', async (req, res) => {
      try {
        const articles = await this.loadProcessedNews();
        
        const countries = [...new Set(articles.map(article => article.country))].sort();
        const categories = [...new Set(articles.map(article => article.category))].sort();
        
        res.json({
          countries,
          categories,
          totalArticles: articles.length
        });

      } catch (error) {
        console.error('Error getting filters:', error);
        res.status(500).json({
          error: 'Failed to get filters'
        });
      }
    });
  }

  setupCronJobs() {
    // Fetch news every 2 hours
    cron.schedule('0 */2 * * *', async () => {
      console.log('⏰ Scheduled news refresh triggered');
      try {
        await this.fetchAndProcessNews();
        console.log('✅ Scheduled news refresh completed');
      } catch (error) {
        console.error('❌ Scheduled news refresh failed:', error);
      }
    });

    console.log('⏰ Cron job scheduled: News refresh every 2 hours');
  }

  async fetchAndProcessNews() {
    try {
      console.log('🚀 Starting news fetch and processing...');
      const startTime = Date.now();

      // Fetch from all sources in parallel
      const [newsApiArticles, mediaStackArticles, allAfricaArticles, rssArticles] = await Promise.all([
        this.newsAPI.fetchAfricanNews().catch(err => {
          console.warn('NewsAPI fetch failed:', err.message);
          return [];
        }),
        this.mediaStack.fetchAfricanNews().catch(err => {
          console.warn('MediaStack fetch failed:', err.message);
          return [];
        }),
        this.allAfrica.fetchAfricanNews().catch(err => {
          console.warn('AllAfrica fetch failed:', err.message);
          return [];
        }),
        this.rssFetcher.fetchAllRSSNews().catch(err => {
          console.warn('RSS fetch failed:', err.message);
          return [];
        })
      ]);

      // Merge and deduplicate
      const mergedArticles = this.feedMerger.mergeFeeds(
        newsApiArticles,
        mediaStackArticles,
        allAfricaArticles,
        rssArticles
      );

      console.log('📝 Rewriting articles...');
      
      // Rewrite articles in batches to avoid overwhelming the system
      const rewrittenArticles = [];
      const batchSize = 10;
      
      for (let i = 0; i < mergedArticles.length; i += batchSize) {
        const batch = mergedArticles.slice(i, i + batchSize);
        const rewrittenBatch = await Promise.all(
          batch.map(article => this.textRewriter.rewriteArticle(article))
        );
        
        rewrittenArticles.push(...rewrittenBatch.filter(article => article !== null));
        
        // Small delay between batches
        if (i + batchSize < mergedArticles.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Save to file
      await this.saveProcessedNews(rewrittenArticles);

      const duration = Date.now() - startTime;
      console.log(`✅ News processing completed in ${duration}ms`);
      console.log(`   📊 Final count: ${rewrittenArticles.length} articles`);

      return rewrittenArticles;

    } catch (error) {
      console.error('❌ Error in fetchAndProcessNews:', error);
      throw error;
    }
  }

  async saveProcessedNews(articles) {
    try {
      const data = {
        articles,
        lastUpdated: new Date().toISOString(),
        count: articles.length
      };
      
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
      console.log(`💾 Saved ${articles.length} articles to ${this.dataFile}`);
      
    } catch (error) {
      console.error('Error saving processed news:', error);
      throw error;
    }
  }

  async loadProcessedNews() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.articles || [];
    } catch (error) {
      console.warn('No existing news data found, will fetch fresh data');
      return [];
    }
  }

  async getLastUpdated() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.lastUpdated || null;
    } catch (error) {
      return null;
    }
  }

  async isDataStale() {
    const lastUpdated = await this.getLastUpdated();
    if (!lastUpdated) return true;

    const staleThreshold = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const now = Date.now();
    const lastUpdateTime = new Date(lastUpdated).getTime();

    return (now - lastUpdateTime) > staleThreshold;
  }

  async start() {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(path.dirname(this.dataFile), { recursive: true });

      // Initial news fetch if no data exists
      const existingArticles = await this.loadProcessedNews();
      if (existingArticles.length === 0) {
        console.log('🔄 No existing data found, fetching initial news...');
        await this.fetchAndProcessNews();
      }

      // Start server
      this.app.listen(this.port, () => {
        console.log('🌍 African News Aggregation Server');
        console.log(`🚀 Server running on http://localhost:${this.port}`);
        console.log('📡 Available endpoints:');
        console.log('   GET  /african-news - Get African news articles');
        console.log('   POST /refresh-news - Force refresh news');
        console.log('   GET  /stats       - Get statistics');
        console.log('   GET  /filters     - Get available filters');
        console.log('   GET  /health      - Health check');
        console.log('');
        console.log('🔧 Query parameters for /african-news:');
        console.log('   ?country=Kenya    - Filter by country');
        console.log('   ?category=business - Filter by category');
        console.log('   ?limit=10         - Limit results');
        console.log('   ?offset=0         - Pagination offset');
        console.log('   ?refresh=true     - Force refresh');
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
if (require.main === module) {
  const server = new AfricanNewsServer();
  server.start();
}

module.exports = AfricanNewsServer;