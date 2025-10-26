import { fetchAfricanNews } from "./sources/newsapi.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import cron from "node-cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// (Removed duplicate Express server and SundayWorld scraping endpoints.)
// The main AfricanNewsServer class implementation starts below.

class AfricanNewsServer {
  // ... constructor and other methods ...

  constructor() {
    this.app = express();
    // Restrict CORS to production frontend domain(s) only (with and without www)
    this.app.use(cors({
      origin: ['https://trendingnews.org.za', 'https://www.trendingnews.org.za'],
      methods: ['GET'],
    }));
    this.port = process.env.PORT || 10000;
    this.dataFile = path.join(process.cwd(), "data", "processed_news.json");
    // Serve static frontend from READY-TO-UPLOAD
    this.app.use(express.static(path.join(__dirname, 'READY-TO-UPLOAD')));
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

  // Helper to create a unique slug from source and index (same as frontend)
  makeSlug(source, index) {
    return `${(source || 'article').replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\-]/g, '')}-${index}`;
  }

  async fetchAndProcessNews() {
    try {
      console.log('🚀 Starting news fetch and processing...');
      let africanNews = await fetchAfricanNews();
      // Add slug to each article
      africanNews = africanNews.map((a, i) => ({
        ...a,
        slug: this.makeSlug(a.source, i)
      }));
      await this.saveProcessedNews(africanNews);
      console.log(`✅ Fetched ${africanNews.length} articles from NewsAPI`);
      return africanNews;
    } catch (error) {
      console.error('❌ Error in fetchAndProcessNews:', error);
      throw error;
    }
  }

  async saveProcessedNews(articles) {
    const data = {
      articles,
      lastUpdated: new Date().toISOString(),
      count: articles.length
    };
    await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
    console.log(`💾 Saved ${articles.length} articles to ${this.dataFile}`);
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
          let articles = await this.loadProcessedNews();
          // Deduplicate by url (or slug if url missing)
          const seen = new Set();
          articles = articles.filter(a => {
            const key = a.url || a.slug;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          // Filtering
          const { category, country, q, page = 1, pageSize = 12 } = req.query;
          if (category && category !== 'All Categories') {
            articles = articles.filter(a => (a.category || '').toLowerCase() === category.toLowerCase());
          }
          if (country && country !== 'All Countries') {
            articles = articles.filter(a => (a.country || '').toLowerCase() === country.toLowerCase());
          }
          if (q) {
            const search = q.toLowerCase();
            articles = articles.filter(a =>
              (a.title || '').toLowerCase().includes(search) ||
              (a.summary || '').toLowerCase().includes(search) ||
              (a.description || '').toLowerCase().includes(search)
            );
          }
          // Pagination
          const pageNum = parseInt(page, 10) || 1;
          const size = parseInt(pageSize, 10) || 12;
          const start = (pageNum - 1) * size;
          const paginated = articles.slice(start, start + size);
          const simplified = paginated.map(a => {
            let img = a.image;
            if (img && typeof img === 'string') {
              img = img.replace(/^http:\/\//i, 'https://');
            } else {
              img = 'https://via.placeholder.com/640x360?text=No+Image';
            }
            return {
              title: a.title,
              image: img,
              summary: a.summary || a.description || '',
              source: a.source || 'unknown',
              url: a.slug || a.id || a.url || '#'
            };
          });
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

          // Try to match local stored articles first
          let article = articles.find(a => a.slug === id || a.id === id || a.url === id);

          if (article) {
            // If we already have content, return it immediately
            return res.json({
              title: article.title,
              image: article.image || "https://via.placeholder.com/800x400?text=No+Image",
              content: article.content || article.description || article.summary || "No full text available.",
              source: article.url || '',
            });
          }

          // 🔥 Otherwise scrape from the original URL (id is actually encoded URL)
          const articleUrl = decodeURIComponent(id);
          const axios = (await import('axios')).default;
          const cheerio = (await import('cheerio')).default;

          const response = await axios.get(articleUrl, { timeout: 10000 });
          const html = response.data;
          const $ = cheerio.load(html);

          const title = $("h1").first().text().trim() || $("title").text();
          const image =
            $('meta[property="og:image"]').attr("content") ||
            $("img").first().attr("src") ||
            "https://via.placeholder.com/800x400?text=No+Image";

          // Extract main readable text
          const paragraphs = $("p")
            .map((i, el) => $(el).text().trim())
            .get()
            .filter(text => text.length > 50)
            .slice(0, 30); // limit for performance

          const content = paragraphs.join("\n\n");


          const result = {
            title,
            image: image.replace(/^http:\/\//i, "https://"),
            content,
            source: articleUrl,
          };

          // Save the scraped article to the local cache for future requests
          articles.push({
            title,
            image: result.image,
            content,
            source: articleUrl,
            slug: this.makeSlug('scraped', articles.length)
          });
          await this.saveProcessedNews(articles);

          return res.json(result);

        } catch (error) {
          console.error("❌ Error fetching article:", error.message);
          res.status(500).json({ error: "Failed to load article content" });
        }
      });


      // --- API 404 handler: ensure /api/* never returns HTML ---
      this.app.use('/api', (req, res, next) => {
        res.status(404).json({ error: 'API endpoint not found' });
      });

      // SPA fallback: serve index.html for all non-API routes
      this.app.get(/^((?!\/api\/).)*$/, (req, res) => {
        res.sendFile(path.join(__dirname, 'READY-TO-UPLOAD', 'index.html'));
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