// Database for storing completely rewritten news articles
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'rewritten-articles.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize articles file if it doesn't exist
if (!fs.existsSync(ARTICLES_FILE)) {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify([], null, 2));
}

export class RewrittenNewsDatabase {
  static generateId(title) {
    return crypto.createHash('md5').update(`${title}-${Date.now()}`).digest('hex');
  }

  static async saveRewrittenArticle(rewrittenData) {
    try {
      const articles = await this.loadArticles();
      
      const articleId = this.generateId(rewrittenData.rewrittenTitle);
      const slug = this.generateSlug(rewrittenData.rewrittenTitle, articleId);
      
      const article = {
        id: articleId,
        slug: slug,
        title: rewrittenData.rewrittenTitle,
        content: rewrittenData.rewrittenContent,
        summary: rewrittenData.summary,
        image: rewrittenData.image,
        originalSource: rewrittenData.source,
        country: rewrittenData.country,
        category: rewrittenData.category,
        readingTime: rewrittenData.readingTime,
        publishedAt: rewrittenData.publishedAt,
        rewrittenAt: new Date().toISOString(),
        views: 0,
        featured: false,
        // Keep original for reference but don't expose publicly
        _original: {
          title: rewrittenData.originalTitle,
          description: rewrittenData.originalDescription
        }
      };

      // Check if article already exists (by similar title)
      const existingIndex = articles.findIndex(a => 
        this.calculateSimilarity(a.title, article.title) > 0.8
      );

      if (existingIndex >= 0) {
        // Update existing article
        articles[existingIndex] = { ...articles[existingIndex], ...article, id: articles[existingIndex].id };
      } else {
        // Add new article to beginning
        articles.unshift(article);
      }

      // Keep only last 1000 articles to prevent file from getting too large
      if (articles.length > 1000) {
        articles.splice(1000);
      }

      await this.saveArticles(articles);
      return article;
    } catch (error) {
      console.error('Error saving rewritten article:', error);
      throw error;
    }
  }

  static async loadArticles() {
    try {
      const data = fs.readFileSync(ARTICLES_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading articles:', error);
      return [];
    }
  }

  static async saveArticles(articles) {
    try {
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
    } catch (error) {
      console.error('Error saving articles:', error);
      throw error;
    }
  }

  static async getArticleBySlug(slug) {
    try {
      const articles = await this.loadArticles();
      const article = articles.find(a => a.slug === slug);
      
      if (article) {
        // Increment view count
        article.views = (article.views || 0) + 1;
        await this.saveArticles(articles);
      }
      
      return article;
    } catch (error) {
      console.error('Error getting article by slug:', error);
      return null;
    }
  }

  static async getArticlesByFilters(filters = {}) {
    try {
      const articles = await this.loadArticles();
      let filteredArticles = [...articles];

      // Apply filters
      if (filters.country && filters.country !== 'all') {
        filteredArticles = filteredArticles.filter(article => 
          article.country && article.country.toLowerCase().includes(filters.country.toLowerCase())
        );
      }

      if (filters.category && filters.category !== 'all') {
        filteredArticles = filteredArticles.filter(article => 
          article.category === filters.category
        );
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredArticles = filteredArticles.filter(article =>
          (article.title && article.title.toLowerCase().includes(searchTerm)) ||
          (article.summary && article.summary.toLowerCase().includes(searchTerm)) ||
          (article.content && article.content.toLowerCase().includes(searchTerm))
        );
      }

      if (filters.featured) {
        filteredArticles = filteredArticles.filter(article => article.featured);
      }

      // Sort by date (newest first)
      filteredArticles.sort((a, b) => new Date(b.rewrittenAt) - new Date(a.rewrittenAt));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

      return {
        articles: paginatedArticles,
        total: filteredArticles.length,
        page: page,
        totalPages: Math.ceil(filteredArticles.length / limit),
        hasMore: endIndex < filteredArticles.length
      };
    } catch (error) {
      console.error('Error filtering articles:', error);
      return { articles: [], total: 0, page: 1, totalPages: 0, hasMore: false };
    }
  }

  static async getFeaturedArticles(limit = 5) {
    try {
      const articles = await this.loadArticles();
      return articles
        .filter(article => article.featured)
        .sort((a, b) => new Date(b.rewrittenAt) - new Date(a.rewrittenAt))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting featured articles:', error);
      return [];
    }
  }

  static async getPopularArticles(limit = 5) {
    try {
      const articles = await this.loadArticles();
      return articles
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting popular articles:', error);
      return [];
    }
  }

  static async toggleFeatured(articleId) {
    try {
      const articles = await this.loadArticles();
      const articleIndex = articles.findIndex(a => a.id === articleId);
      
      if (articleIndex >= 0) {
        articles[articleIndex].featured = !articles[articleIndex].featured;
        await this.saveArticles(articles);
        return articles[articleIndex];
      }
      
      return null;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  }

  static async deleteArticle(articleId) {
    try {
      const articles = await this.loadArticles();
      const updatedArticles = articles.filter(article => article.id !== articleId);
      await this.saveArticles(updatedArticles);
      return true;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const articles = await this.loadArticles();
      
      const countries = [...new Set(articles.map(a => a.country))];
      const categories = [...new Set(articles.map(a => a.category))];
      const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
      const featuredCount = articles.filter(a => a.featured).length;
      
      return {
        totalArticles: articles.length,
        totalViews: totalViews,
        featuredCount: featuredCount,
        countryCount: countries.length,
        categoryCount: categories.length,
        countries: countries,
        categories: categories,
        averageViews: articles.length > 0 ? Math.round(totalViews / articles.length) : 0,
        latestArticle: articles.length > 0 ? articles[0].rewrittenAt : null
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Helper function to calculate title similarity
  static calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    return intersection.length / union.length;
  }

  static generateSlug(title, id) {
    if (!title) {
      title = 'untitled-article';
    }
    
    if (!id) {
      id = Date.now().toString();
    }
    
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);
    return `${slug}-${id.substring(0, 8)}`;
  }
}