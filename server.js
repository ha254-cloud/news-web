import NewsAPIClient from "./sources/newsapi.js";
import MediaStackClient from "./sources/mediastack.js";
import AllAfricaClient from "./sources/allafrica.js";
import RSSFetcher from "./sources/rssfetcher.js";
import FeedMerger from "./utils/feedMerger.js";
import TextRewriter from "./utils/textRewriter.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cron from "node-cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// (Removed duplicate Express server and SundayWorld scraping endpoints.)
// The main AfricanNewsServer class implementation starts below.

class AfricanNewsServer {
  // ... constructor and other methods ...

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 10000;
    this.dataFile = path.join(process.cwd(), "data", "processed_news.json");

    // ✅ Initialize helper modules
    this.newsAPI = new NewsAPIClient();
    this.mediaStack = new MediaStackClient();
    this.allAfrica = new AllAfricaClient();
    this.rssFetcher = new RSSFetcher();
    this.feedMerger = new FeedMerger();
    this.textRewriter = new TextRewriter();

    this.app.use(express.static(path.resolve(__dirname, '../READY-TO-UPLOAD')));

    this.setupRoutes?.();
    this.setupCronJobs?.();
  }

  // Existing methods (place all your route handlers and logic here)
  // For example, your Express route handlers, fetchAndProcessNews, etc.

  // Place all the methods you had above here, inside the class.

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



      // =============== NEW ROUTES FOR FRONTEND COMPATIBILITY ===============
      // Get all rewritten articles (alias of /african-news)
      this.app.get('/api/articles', async (req, res) => {
        try {
          const articles = await this.loadProcessedNews();
          const simplified = articles.map(a => ({
            title: a.title,
            image: a.image,
            summary: a.summary || a.description || '',
            source: a.source || 'unknown',
            url: a.id || a.slug || a.url || '#'
          }));
          res.json(simplified);
        } catch (err) {
          console.error('Error in /api/articles:', err);
          res.status(500).json({ error: 'Failed to load articles' });
        }
      });

      // Get full rewritten article
      this.app.get('/api/article/:id', async (req, res) => {
        try {
          const { id } = req.params;
          const articles = await this.loadProcessedNews();
          const article = articles.find(a => a.id === id || a.url === id);

          if (!article) return res.status(404).json({ error: 'Article not found' });

          res.json({
            title: article.title,
            image: article.image,
            content: article.content || article.description || 'No full text available.',
          });
        } catch (err) {
          console.error('Error in /api/article/:id:', err);
          res.status(500).json({ error: 'Failed to fetch article' });
        }
      });

      // Serve index.html for any unknown route (SPA fallback)
      this.app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../READY-TO-UPLOAD/index.html'));
      });

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
        console.log('   GET  /api/articles - Get rewritten articles (frontend)');
        console.log('   GET  /api/article/:id - Get full rewritten article (frontend)');
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

// ✅ Works in ES modules
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new AfricanNewsServer();
  app.start();
}