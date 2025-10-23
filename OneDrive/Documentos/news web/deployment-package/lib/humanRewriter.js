// Improved human-like news rewriter that preserves context and meaning
const crypto = require('crypto');

class HumanNewsRewriter {
  
  // Main rewriting function that preserves context and creates meaningful content
  static async rewriteArticle(originalArticle, country = 'Africa', category = 'general') {
    try {
      const countryInfo = this.getCountryInfo(country);
      
      // Extract original information
      const originalTitle = originalArticle.title || 'Breaking News';
      const originalDesc = originalArticle.description || originalArticle.content || '';
      
      // Rewrite while preserving context and meaning
      const rewrittenTitle = this.rewriteTitleMeaningfully(originalTitle);
      const rewrittenContent = this.rewriteContentMeaningfully(originalDesc, originalTitle);
      const summary = this.createMeaningfulSummary(rewrittenContent, originalDesc);

      return {
        originalTitle: originalTitle,
        rewrittenTitle: rewrittenTitle,
        originalDescription: originalDesc,
        rewrittenContent: rewrittenContent,
        summary: summary,
        image: originalArticle.urlToImage || originalArticle.image,
        source: originalArticle.source?.name || 'News Source',
        publishedAt: originalArticle.publishedAt,
        country: countryInfo.name,
        category: category,
        readingTime: this.estimateReadingTime(rewrittenContent)
      };
    } catch (error) {
      console.error('Error rewriting article:', error);
      return null;
    }
  }

  // Rewrite titles while preserving meaning and context
  static rewriteTitleMeaningfully(originalTitle) {
    if (!originalTitle || originalTitle.length < 10) return 'Breaking News Update';
    
    // Simple word substitutions that preserve meaning
    const replacements = {
      'says': 'reports',
      'announces': 'reveals', 
      'confirms': 'verifies',
      'breaking': 'latest',
      'exclusive': 'special',
      'urgent': 'immediate',
      'major': 'significant',
      'huge': 'substantial',
      'massive': 'large',
      'critical': 'important',
      'shocking': 'surprising',
      'amazing': 'remarkable',
      'officials': 'authorities',
      'government': 'administration'
    };
    
    let rewritten = originalTitle;
    
    // Apply simple replacements
    for (const [original, replacement] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      rewritten = rewritten.replace(regex, replacement);
    }
    
    return rewritten;
  }

  // Rewrite content while preserving the actual story and context
  static rewriteContentMeaningfully(originalContent, title) {
    if (!originalContent || originalContent.trim().length < 50) {
      // Generate contextual content based on title when original is too short
      return this.generateContextualContent(title);
    }
    
    // Split into sentences and rewrite each while preserving meaning
    const sentences = originalContent.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const rewrittenSentences = [];
    
    for (let sentence of sentences) {
      const rewritten = this.rewriteSentenceMeaningfully(sentence.trim());
      if (rewritten) {
        rewrittenSentences.push(rewritten);
      }
    }
    
    // Ensure we have enough content
    let finalContent = rewrittenSentences.join('. ') + '.';
    
    // Add contextual information if content is too short
    if (finalContent.length < 200) {
      finalContent += ' ' + this.addContextualInformation(title);
    }
    
    return finalContent;
  }

  // Rewrite individual sentences while preserving meaning
  static rewriteSentenceMeaningfully(sentence) {
    if (!sentence) return '';
    
    // Word replacements that maintain meaning
    const wordReplacements = {
      'said': 'stated',
      'told': 'informed',
      'revealed': 'disclosed',
      'according to': 'as stated by',
      'officials': 'authorities',
      'government': 'administration',
      'announced': 'declared',
      'confirmed': 'verified',
      'reported': 'indicated',
      'sources': 'reports',
      'will': 'is expected to',
      'has': 'reportedly has',
      'is': 'appears to be'
    };
    
    let rewritten = sentence;
    
    for (const [original, replacement] of Object.entries(wordReplacements)) {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      rewritten = rewritten.replace(regex, replacement);
    }
    
    return rewritten;
  }

  // Generate meaningful content when original is insufficient
  static generateContextualContent(title) {
    if (!title) {
      return 'Recent developments have emerged that are drawing attention from various stakeholders. The situation continues to evolve as more information becomes available.';
    }
    
    // Analyze title for context
    const lowerTitle = title.toLowerCase();
    let context = '';
    
    if (lowerTitle.includes('election') || lowerTitle.includes('vote') || lowerTitle.includes('president')) {
      context = 'The electoral process continues to draw significant attention from both local and international observers. Stakeholders are monitoring developments closely as the situation unfolds.';
    } else if (lowerTitle.includes('business') || lowerTitle.includes('economy') || lowerTitle.includes('market')) {
      context = 'The economic implications of these developments are being carefully assessed by market analysts and industry experts. The impact on regional markets is expected to be significant.';
    } else if (lowerTitle.includes('sport') || lowerTitle.includes('football') || lowerTitle.includes('soccer')) {
      context = 'Sports enthusiasts and officials are following these developments with keen interest. The implications for the sporting community are substantial.';
    } else if (lowerTitle.includes('health') || lowerTitle.includes('medical') || lowerTitle.includes('hospital')) {
      context = 'Health officials and medical experts are closely monitoring the situation. The development has important implications for public health and safety.';
    } else if (lowerTitle.includes('tech') || lowerTitle.includes('digital') || lowerTitle.includes('internet')) {
      context = 'Technology experts and industry leaders are analyzing the implications of these developments. The impact on the digital landscape is being closely monitored.';
    } else {
      context = 'Officials and stakeholders are monitoring these developments closely. The situation continues to evolve as more details emerge.';
    }
    
    return `Recent reports have highlighted important developments regarding the matter. ${context} Further updates are expected as the situation progresses.`;
  }

  // Add contextual information to extend short content
  static addContextualInformation(title) {
    const additionalInfo = [
      'Local authorities are expected to provide further updates in the coming days.',
      'The development has attracted attention from various regional stakeholders.',
      'Experts are analyzing the potential implications of these events.',
      'The situation continues to develop as more information becomes available.',
      'Officials have indicated that additional details will be released soon.'
    ];
    
    return additionalInfo[Math.floor(Math.random() * additionalInfo.length)];
  }

  // Create meaningful summaries that reflect the actual content
  static createMeaningfulSummary(rewrittenContent, originalContent) {
    // Try to use rewritten content first
    if (rewrittenContent && rewrittenContent.length > 100) {
      const firstSentence = rewrittenContent.split('.')[0] + '.';
      return firstSentence.length > 200 ? firstSentence.substring(0, 197) + '...' : firstSentence;
    }
    
    // Fallback to original content
    if (originalContent && originalContent.length > 50) {
      const firstSentence = originalContent.split('.')[0] + '.';
      return firstSentence.length > 200 ? firstSentence.substring(0, 197) + '...' : firstSentence;
    }
    
    return 'Recent developments continue to unfold with important implications for stakeholders.';
  }

  // Country information
  static getCountryInfo(countryInput) {
    const countryMap = {
      'ke': { name: 'Kenya', region: 'East Africa' },
      'ng': { name: 'Nigeria', region: 'West Africa' },
      'za': { name: 'South Africa', region: 'Southern Africa' },
      'gh': { name: 'Ghana', region: 'West Africa' },
      'eg': { name: 'Egypt', region: 'North Africa' },
      'ma': { name: 'Morocco', region: 'North Africa' },
      'et': { name: 'Ethiopia', region: 'East Africa' },
      'tz': { name: 'Tanzania', region: 'East Africa' },
      'ug': { name: 'Uganda', region: 'East Africa' },
      'rw': { name: 'Rwanda', region: 'East Africa' }
    };

    // Handle different input formats
    if (typeof countryInput === 'string') {
      const lowerInput = countryInput.toLowerCase();
      
      // Check if it's a country code
      if (countryMap[lowerInput]) {
        return countryMap[lowerInput];
      }
      
      // Check if it's a full country name
      for (const [code, info] of Object.entries(countryMap)) {
        if (info.name.toLowerCase() === lowerInput) {
          return info;
        }
      }
    }

    // Default fallback
    return { name: 'Africa', region: 'Africa' };
  }

  // Estimate reading time
  static estimateReadingTime(content) {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  // Generate unique article slug for internal linking
  static generateSlug(title, id) {
    if (!title) return `article-${id.substring(0, 8)}`;
    
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);
    return `${slug}-${id.substring(0, 8)}`;
  }

  // Generate unique ID for articles
  static generateId(title, url) {
    const content = (title || '') + (url || '') + Date.now();
    return crypto.createHash('md5').update(content).digest('hex');
  }
}

module.exports = { HumanNewsRewriter };