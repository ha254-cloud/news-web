const crypto = require('crypto');

class FeedMerger {
  constructor() {
    this.duplicateThreshold = 0.8; // 80% similarity threshold
  }

  mergeFeeds(newsApiArticles = [], mediaStackArticles = [], allAfricaArticles = []) {
    console.log('🔄 Merging feeds...');
    console.log(`   NewsAPI: ${newsApiArticles.length} articles`);
    console.log(`   MediaStack: ${mediaStackArticles.length} articles`);
    console.log(`   AllAfrica: ${allAfricaArticles.length} articles`);

    // Combine all articles
    const allArticles = [
      ...newsApiArticles,
      ...mediaStackArticles,
      ...allAfricaArticles
    ];

    console.log(`   Total before deduplication: ${allArticles.length} articles`);

    // Remove duplicates
    const uniqueArticles = this.removeDuplicates(allArticles);
    
    console.log(`   Total after deduplication: ${uniqueArticles.length} articles`);

    // Sort by publication date (newest first)
    const sortedArticles = uniqueArticles.sort((a, b) => 
      new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    // Add merge metadata
    const processedArticles = sortedArticles.map((article, index) => ({
      ...article,
      mergeId: this.generateMergeId(article),
      mergeRank: index + 1,
      mergedAt: new Date().toISOString()
    }));

    console.log('✅ Feed merge completed');
    return processedArticles;
  }

  removeDuplicates(articles) {
    const uniqueArticles = [];
    const seenHashes = new Set();

    for (const article of articles) {
      let isDuplicate = false;

      // Check exact title matches first
      const titleHash = this.generateHash(article.title.toLowerCase().trim());
      if (seenHashes.has(titleHash)) {
        isDuplicate = true;
      } else {
        // Check for similar articles
        for (const uniqueArticle of uniqueArticles) {
          if (this.areSimilar(article, uniqueArticle)) {
            isDuplicate = true;
            // Keep the article with more content or better source
            if (this.isArticleBetter(article, uniqueArticle)) {
              // Replace the existing article
              const index = uniqueArticles.indexOf(uniqueArticle);
              uniqueArticles[index] = article;
            }
            break;
          }
        }
      }

      if (!isDuplicate) {
        uniqueArticles.push(article);
        seenHashes.add(titleHash);
      }
    }

    return uniqueArticles;
  }

  areSimilar(article1, article2) {
    // Check title similarity
    const titleSimilarity = this.calculateSimilarity(
      article1.title.toLowerCase(),
      article2.title.toLowerCase()
    );

    // Check description similarity
    const descSimilarity = this.calculateSimilarity(
      article1.description?.toLowerCase() || '',
      article2.description?.toLowerCase() || ''
    );

    // Check if they're about the same event (high title similarity)
    if (titleSimilarity > this.duplicateThreshold) {
      return true;
    }

    // Check if both title and description are moderately similar
    if (titleSimilarity > 0.6 && descSimilarity > 0.6) {
      return true;
    }

    // Check for exact URL matches
    if (article1.url && article2.url && article1.url === article2.url) {
      return true;
    }

    return false;
  }

  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    // Simple Jaccard similarity using word sets
    const words1 = new Set(str1.split(/\s+/).filter(word => word.length > 2));
    const words2 = new Set(str2.split(/\s+/).filter(word => word.length > 2));

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  isArticleBetter(article1, article2) {
    // Scoring system to determine which article is better
    let score1 = 0;
    let score2 = 0;

    // Content length (longer is usually better)
    score1 += (article1.content?.length || 0) / 100;
    score2 += (article2.content?.length || 0) / 100;

    // Description length
    score1 += (article1.description?.length || 0) / 50;
    score2 += (article2.description?.length || 0) / 50;

    // Has image
    if (article1.image) score1 += 2;
    if (article2.image) score2 += 2;

    // Source preference (NewsAPI > MediaStack > AllAfrica for completeness)
    const sourceScores = {
      'newsapi': 3,
      'mediastack': 2,
      'allafrica': 1
    };
    score1 += sourceScores[article1.provider] || 0;
    score2 += sourceScores[article2.provider] || 0;

    // Recency (newer is better)
    const age1 = Date.now() - new Date(article1.publishedAt).getTime();
    const age2 = Date.now() - new Date(article2.publishedAt).getTime();
    if (age1 < age2) score1 += 1;
    if (age2 < age1) score2 += 1;

    return score1 > score2;
  }

  groupByCountryAndCategory(articles) {
    const grouped = {};

    articles.forEach(article => {
      const country = article.country || 'Unknown';
      const category = article.category || 'general';

      if (!grouped[country]) {
        grouped[country] = {};
      }

      if (!grouped[country][category]) {
        grouped[country][category] = [];
      }

      grouped[country][category].push(article);
    });

    return grouped;
  }

  getStatistics(articles) {
    const stats = {
      total: articles.length,
      byCountry: {},
      byCategory: {},
      byProvider: {},
      byHour: {},
      avgContentLength: 0,
      articlesWithImages: 0
    };

    let totalContentLength = 0;

    articles.forEach(article => {
      // Country stats
      const country = article.country || 'Unknown';
      stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;

      // Category stats
      const category = article.category || 'general';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Provider stats
      const provider = article.provider || 'unknown';
      stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;

      // Hour stats (for understanding publication patterns)
      const hour = new Date(article.publishedAt).getHours();
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;

      // Content stats
      totalContentLength += article.content?.length || 0;
      if (article.image) {
        stats.articlesWithImages++;
      }
    });

    stats.avgContentLength = Math.round(totalContentLength / articles.length);
    stats.imagePercentage = Math.round((stats.articlesWithImages / articles.length) * 100);

    return stats;
  }

  generateHash(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  generateMergeId(article) {
    const source = `${article.title}${article.publishedAt}${article.provider}`;
    return crypto.createHash('sha256').update(source).digest('hex').substr(0, 16);
  }

  // Advanced deduplication using content fingerprinting
  createContentFingerprint(article) {
    // Extract key phrases and create a fingerprint
    const text = `${article.title} ${article.description}`.toLowerCase();
    const words = text.split(/\s+/).filter(word => 
      word.length > 3 && 
      !this.isStopWord(word)
    );

    // Get the most significant words (simple frequency-based approach)
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const significantWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return significantWords.sort().join('|');
  }

  isStopWord(word) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'this', 'that', 'these', 'those', 'it', 'he', 'she', 'they', 'we'
    ]);
    return stopWords.has(word.toLowerCase());
  }
}

module.exports = FeedMerger;