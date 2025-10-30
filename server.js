import { fetchAfricanNews } from "./sources/newsapi.js";
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import express from "express";
import cors from "cors";
import cron from "node-cron";

import { TextRewriter } from "./utils/rewrite.js";

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

      // Rewrite all articles using TextRewriter
      const rewriter = new TextRewriter();
      const rewrittenNews = [];
      for (const article of africanNews) {
        try {
          const rewritten = await rewriter.rewriteArticle(article);
          if (rewritten) {
            rewrittenNews.push(rewritten);
          }
        } catch (err) {
          console.error('❌ Error rewriting article:', article.title, err);
        }
      }

      await this.saveProcessedNews(rewrittenNews);
      console.log(`✅ Fetched and rewritten ${rewrittenNews.length} articles from NewsAPI`);
      return rewrittenNews;
    } catch (error) {
      console.error('❌ Error in fetchAndProcessNews:', error);
      throw error;
    }
  }
  // Test route to check file writing
  addTestRoute() {
    this.app.get('/api/test-write', async (req, res) => {
      try {
        const testPath = this.dataFile.replace('processed_news.json', 'test_write.json');
        await fs.mkdir(path.dirname(testPath), { recursive: true });
        await fs.writeFile(testPath, JSON.stringify({ test: 'ok', time: new Date().toISOString() }, null, 2));
        res.json({ success: true, path: testPath });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });
  }

  async saveProcessedNews(articles) {
    // Read old articles if file exists
    let oldArticles = [];
    try {
      const raw = await fs.readFile(this.dataFile, 'utf8');
      const parsed = JSON.parse(raw);
      oldArticles = parsed.articles || [];
    } catch (e) {
      // File may not exist yet
    }

    console.log(`🔁 saveProcessedNews: old=${oldArticles.length} incoming=${articles.length}`);

    // Merge and deduplicate by url or slug
    const allArticles = [...oldArticles, ...articles];
    const seen = new Set();
    const deduped = allArticles.filter(a => {
      const key = a.url || a.slug;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`🔁 saveProcessedNews: merged=${allArticles.length} deduped=${deduped.length}`);

    const data = {
      articles: deduped,
      lastUpdated: new Date().toISOString(),
      count: deduped.length
    };
    await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
    console.log(`💾 Saved ${deduped.length} articles to ${this.dataFile}`);
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
      // =============== DEBUG: fetch raw RSS/feeds (no rewrite) ===============
      this.app.get('/api/debug/rawfetch', async (req, res) => {
        try {
          const raw = await fetchAfricanNews(); // returns array from your sources/newsapi.js
          return res.json({ ok: true, count: raw.length, sample: raw.slice(0, 30) });
        } catch (err) {
          return res.status(500).json({ ok: false, error: err.message });
        }
      });

      // =============== RAW REWRITTEN ARTICLES ENDPOINT ===============
      // Serves the output of scripts/fetch-news.js directly
      this.app.get('/api/articles', (req, res) => {
        try {
          const data = require('fs').readFileSync('./data/articles.json', 'utf8');
          res.json(JSON.parse(data));
        } catch (err) {
          res.status(500).json({ error: 'Failed to load articles' });
        }
      });
    try {
  // Create data directory if it doesn't exist
  await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
  // Add test write route
  this.addTestRoute();

      // =============== DEBUG: show raw processed file (safe read-only) ===============
      this.app.get('/api/debug/processed', async (req, res) => {
        try {
          const raw = await fs.readFile(this.dataFile, 'utf8');
          const parsed = JSON.parse(raw);
          return res.json({
            ok: true,
            countOnDisk: parsed.count || (parsed.articles && parsed.articles.length) || 0,
            lastUpdated: parsed.lastUpdated || null,
            sample: (parsed.articles || []).slice(0, 30)
          });
        } catch (err) {
          return res.status(500).json({ ok: false, error: err.message });
        }
      });

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
          const { category, country, q } = req.query;
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
          // Filter out images with any known news source tags, domains, or watermark patterns
          const imageWatermarkPattern = /bbc|aljazeera|cnn|reuters|apnews|france24|dw|skynews|guardian|theguardian|nytimes|foxnews|cbs|nbc|abc|sabc|enca|citizen|sowetan|herald|mailguardian|dailymaverick|opinion|weekly|logo|brand|watermark|newsroom|press|bloomberg|forbes|wsj|financialtimes|economist|lemonde|timeslive|iol|sundaytimes|sowetanlive|sundayworld|sundaymail|sundaypost|sundaynews|sundayindependent|sundaytribune|sundayexpress|sundayobserver|sundayherald|sundaytelegraph|sundaymirror|sundaypeople|sundaymail|sundaymailzimbabwe|sundaymailng|sundaymailuk|sundaymailscotland|sundaymailonline|sundaymailnews|sundaymailmagazine|sundaymailtv|sundaymailradio|sundaymaildigital|sundaymailafrica|sundaymailghana|sundaymailnigeria|sundaymailkenya|sundaymailuganda|sundaymailbotswana|sundaymailzambia|sundaymailmalawi|sundaymailtanzania|sundaymailrwanda|sundaymailburundi|sundaymailethiopia|sundaymailzimbabwe|sundaymailmozambique|sundaymailangola|sundaymailnamibia|sundaymaillesotho|sundaymailswaziland|sundaymailbotswana|sundaymailzambia|sundaymailmalawi|sundaymailtanzania|sundaymailrwanda|sundaymailburundi|sundaymailethiopia|sundaymailzimbabwe|sundaymailmozambique|sundaymailangola|sundaymailnamibia|sundaymaillesotho|sundaymailswaziland/i;
          const simplified = articles
            .filter(a => {
              // Filter out images with watermark/source patterns in URL or alt text/title
              const testStr = (a.image || '') + ' ' + (a.title || '') + ' ' + (a.description || '');
              // Only allow images that are valid URLs (http/https) and not watermarked
              if (!a.image || typeof a.image !== 'string') return false;
              if (!/^https?:\/\//i.test(a.image)) return false;
              if (imageWatermarkPattern.test(a.image) || imageWatermarkPattern.test(testStr)) return false;
              return true;
            })
            .map(a => {
              let img = a.image;
              // Always use HTTPS and fallback to placeholder if invalid
              if (img && typeof img === 'string' && /^https?:\/\//i.test(img)) {
                img = img.replace(/^http:\/\//i, 'https://');
              } else {
                img = 'https://via.placeholder.com/640x360?text=No+Image';
              }
              return {
                title: a.title,
                image: img,
                summary: a.summary || a.description || '',
                description: a.description || '',
                content: a.content || '',
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
            // Compose a more complete fallback if content is missing
            let content = article.content;
            if (!content) {
              // Combine title, summary, and description for a better fallback
              const parts = [];
              if (article.title) parts.push(`<strong>${article.title}</strong>`);
              if (article.summary) parts.push(article.summary);
              if (article.description && article.description !== article.summary) parts.push(article.description);
              content = parts.join('<br><br>') || "No full text available.";
            }
            // Always return a valid HTTPS image or placeholder
            let img = article.image;
            if (!img || typeof img !== 'string' || !/^https?:\/\//i.test(img)) {
              img = "https://via.placeholder.com/800x400?text=No+Image";
            } else {
              img = img.replace(/^http:\/\//i, 'https://');
            }
            return res.json({
              title: article.title,
              image: img,
              content,
              source: article.url || '',
            });
          }

          // 🔥 Otherwise scrape from the original URL (id is actually encoded URL)
          const articleUrl = decodeURIComponent(id);

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
      const PORT = process.env.PORT || 5000;
      this.app.listen(PORT, () => {
        console.log('🌍 African News Aggregation Server');
        console.log(`Server running on port ${PORT}`);
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

        // Initial news fetch if no data exists, after server is ready
        this.fetchNewsSafely();
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

// Helper to safely fetch news after server starts
fetchNewsSafely() {
  this.loadProcessedNews()
    .then(existingArticles => {
      if (existingArticles.length === 0) {
        console.log('🔄 No existing data found, fetching initial news...');
        return this.fetchAndProcessNews();
      }
    })
    .catch(err => {
      console.error('Error fetching sources:', err.message);
    });
}
} // <-- Close the AfricanNewsServer class here

// Top-level server start with async error catching
let server = new AfricanNewsServer();
server.start().catch(err => {
  console.error('🚨 Server failed to start:', err);
});