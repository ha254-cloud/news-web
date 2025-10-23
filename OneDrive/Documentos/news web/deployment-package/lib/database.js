import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize articles file if it doesn't exist
if (!fs.existsSync(ARTICLES_FILE)) {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify([], null, 2));
}

export class ArticleDatabase {
  static generateId(title, url) {
    return crypto.createHash('md5').update(`${title}-${url}`).digest('hex');
  }

  static async getAllArticles() {
    try {
      const data = fs.readFileSync(ARTICLES_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading articles:', error);
      return [];
    }
  }

  static async getArticleById(id) {
    const articles = await this.getAllArticles();
    return articles.find(article => article.id === id);
  }

  static async getArticlesByFilters({ country, category, search, page = 1, limit = 12 }) {
    const articles = await this.getAllArticles();
    
    let filtered = articles.filter(article => {
      if (country && article.country !== country) return false;
      if (category && article.category !== category) return false;
      if (search && !article.title.toLowerCase().includes(search.toLowerCase()) && 
          !article.aiSummary.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      articles: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      page: parseInt(page),
      totalPages: Math.ceil(filtered.length / limit)
    };
  }

  static async saveArticle(articleData) {
    try {
      const articles = await this.getAllArticles();
      const id = this.generateId(articleData.title, articleData.originalUrl);
      
      // Check if article already exists
      const existingIndex = articles.findIndex(article => article.id === id);
      
      const article = {
        id,
        title: articleData.title,
        originalUrl: articleData.originalUrl,
        originalDescription: articleData.originalDescription,
        aiSummary: articleData.aiSummary,
        aiAnalysis: articleData.aiAnalysis,
        image: articleData.image,
        source: articleData.source,
        author: articleData.author,
        country: articleData.country,
        category: articleData.category,
        publishedAt: articleData.publishedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        // Update existing article
        articles[existingIndex] = { ...articles[existingIndex], ...article, updatedAt: new Date().toISOString() };
      } else {
        // Add new article
        articles.unshift(article); // Add to beginning for newest first
      }

      // Keep only last 500 articles to prevent file from getting too large
      if (articles.length > 500) {
        articles.splice(500);
      }

      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
      return article;
    } catch (error) {
      console.error('Error saving article:', error);
      throw error;
    }
  }

  static async deleteArticle(id) {
    try {
      const articles = await this.getAllArticles();
      const filteredArticles = articles.filter(article => article.id !== id);
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(filteredArticles, null, 2));
      return true;
    } catch (error) {
      console.error('Error deleting article:', error);
      return false;
    }
  }

  static async getStats() {
    const articles = await this.getAllArticles();
    const stats = {
      totalArticles: articles.length,
      byCountry: {},
      byCategory: {},
      recentArticles: articles.slice(0, 5).length
    };

    articles.forEach(article => {
      // Count by country
      if (article.country) {
        stats.byCountry[article.country] = (stats.byCountry[article.country] || 0) + 1;
      }
      
      // Count by category
      if (article.category) {
        stats.byCategory[article.category] = (stats.byCategory[article.category] || 0) + 1;
      }
    });

    return stats;
  }
}