const crypto = require('crypto');

class TextRewriter {
  constructor() {
    this.synonyms = {
      // Common verbs
      'said': ['reported', 'stated', 'announced', 'declared', 'mentioned', 'indicated', 'revealed', 'disclosed'],
      'told': ['informed', 'advised', 'notified', 'conveyed', 'communicated'],
      'shows': ['demonstrates', 'indicates', 'reveals', 'displays', 'exhibits'],
      'makes': ['creates', 'produces', 'generates', 'establishes', 'forms'],
      'helps': ['assists', 'supports', 'aids', 'contributes to', 'facilitates'],
      'gives': ['provides', 'offers', 'supplies', 'delivers', 'grants'],
      'gets': ['receives', 'obtains', 'secures', 'acquires', 'gains'],
      'wants': ['seeks', 'desires', 'aims for', 'pursues', 'strives for'],
      'needs': ['requires', 'demands', 'necessitates', 'calls for'],
      'uses': ['utilizes', 'employs', 'applies', 'implements', 'operates'],
      
      // Common nouns
      'company': ['organization', 'firm', 'corporation', 'enterprise', 'business'],
      'government': ['administration', 'authorities', 'officials', 'state', 'regime'],
      'people': ['citizens', 'residents', 'individuals', 'population', 'community'],
      'country': ['nation', 'state', 'territory', 'region'],
      'money': ['funds', 'capital', 'resources', 'financing', 'investment'],
      'problem': ['issue', 'challenge', 'difficulty', 'concern', 'obstacle'],
      'plan': ['strategy', 'proposal', 'scheme', 'initiative', 'program'],
      'work': ['operations', 'activities', 'efforts', 'tasks', 'projects'],
      'change': ['transformation', 'modification', 'alteration', 'shift', 'development'],
      'growth': ['expansion', 'increase', 'development', 'progress', 'advancement'],
      
      // Common adjectives
      'big': ['large', 'major', 'significant', 'substantial', 'considerable'],
      'small': ['minor', 'limited', 'modest', 'compact', 'reduced'],
      'new': ['recent', 'latest', 'fresh', 'modern', 'contemporary'],
      'old': ['previous', 'former', 'earlier', 'established', 'traditional'],
      'good': ['positive', 'beneficial', 'favorable', 'excellent', 'successful'],
      'bad': ['negative', 'unfavorable', 'poor', 'problematic', 'concerning'],
      'important': ['significant', 'crucial', 'vital', 'essential', 'key'],
      'high': ['elevated', 'increased', 'substantial', 'considerable', 'significant'],
      'low': ['reduced', 'decreased', 'minimal', 'limited', 'modest'],
      'fast': ['rapid', 'quick', 'swift', 'accelerated', 'speedy'],
      
      // Common adverbs
      'very': ['extremely', 'highly', 'considerably', 'significantly', 'remarkably'],
      'really': ['genuinely', 'truly', 'actually', 'indeed', 'certainly'],
      'also': ['additionally', 'furthermore', 'moreover', 'likewise', 'similarly'],
      'now': ['currently', 'presently', 'at present', 'today', 'recently'],
      'today': ['currently', 'presently', 'this day', 'at present'],
      'recently': ['lately', 'in recent times', 'not long ago', 'previously'],
      
      // Transition words
      'however': ['nevertheless', 'nonetheless', 'yet', 'still', 'although'],
      'therefore': ['consequently', 'thus', 'as a result', 'hence', 'accordingly'],
      'because': ['due to', 'owing to', 'as a result of', 'since', 'given that'],
      'although': ['while', 'despite', 'even though', 'whereas', 'though'],
      'meanwhile': ['at the same time', 'simultaneously', 'concurrently', 'in the interim']
    };

    this.phrasalReplacements = {
      'according to': ['as reported by', 'as stated by', 'based on reports from', 'sources indicate'],
      'in order to': ['to', 'with the aim of', 'for the purpose of', 'so as to'],
      'as a result of': ['due to', 'because of', 'owing to', 'following'],
      'at the same time': ['simultaneously', 'concurrently', 'meanwhile', 'in parallel'],
      'in addition to': ['besides', 'along with', 'as well as', 'together with'],
      'on the other hand': ['conversely', 'alternatively', 'in contrast', 'however'],
      'for example': ['for instance', 'such as', 'including', 'namely'],
      'as well as': ['in addition to', 'along with', 'together with', 'plus'],
      'in spite of': ['despite', 'regardless of', 'notwithstanding', 'even with'],
      'in the future': ['going forward', 'ahead', 'in coming times', 'subsequently']
    };
  }

  async rewriteArticle(article) {
    try {
      const rewrittenTitle = this.rewriteText(article.title);
      const rewrittenDescription = this.rewriteText(article.description);
      const rewrittenContent = this.rewriteText(article.content);

      return {
        id: this.generateNewId(rewrittenTitle),
        originalTitle: article.title,
        title: rewrittenTitle,
        originalDescription: article.description,
        description: rewrittenDescription,
        content: rewrittenContent,
        image: article.image, // Keep original image as requested
        source: article.source,
        url: this.generateInternalUrl(rewrittenTitle),
        publishedAt: article.publishedAt,
        rewrittenAt: new Date().toISOString(),
        country: article.country,
        category: article.category,
        provider: article.provider,
        readingTime: this.estimateReadingTime(rewrittenContent)
      };
    } catch (error) {
      console.error('Error rewriting article:', error);
      return null;
    }
  }

  rewriteText(text) {
    if (!text) return text;

    let rewritten = text;

    // Replace phrasal expressions first
    for (const [phrase, replacements] of Object.entries(this.phrasalReplacements)) {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      if (regex.test(rewritten)) {
        const replacement = replacements[Math.floor(Math.random() * replacements.length)];
        rewritten = rewritten.replace(regex, replacement);
      }
    }

    // Replace individual words
    for (const [word, synonyms] of Object.entries(this.synonyms)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(rewritten)) {
        // Don't replace every instance, maintain some variety
        if (Math.random() > 0.3) { // 70% chance to replace
          const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
          rewritten = rewritten.replace(regex, synonym);
        }
      }
    }

    // Apply sentence structure variations
    rewritten = this.varyStentenceStructure(rewritten);
    
    // Clean up and format
    rewritten = this.cleanupText(rewritten);

    return rewritten;
  }

  varyStentenceStructure(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return sentences.map(sentence => {
      sentence = sentence.trim();
      
      // Randomly apply different sentence starters
      if (Math.random() > 0.7) {
        const starters = [
          'According to reports,',
          'Sources indicate that',
          'It has been reported that',
          'Recent developments show that',
          'Officials confirm that',
          'Data suggests that',
          'Studies reveal that',
          'Experts note that'
        ];
        
        if (!sentence.toLowerCase().startsWith('according to') && 
            !sentence.toLowerCase().startsWith('sources') &&
            !sentence.toLowerCase().startsWith('it has been')) {
          const starter = starters[Math.floor(Math.random() * starters.length)];
          sentence = `${starter} ${sentence.toLowerCase()}`;
        }
      }

      return sentence;
    }).join('. ') + '.';
  }

  cleanupText(text) {
    return text
      // Fix double spaces
      .replace(/\s+/g, ' ')
      // Fix punctuation spacing
      .replace(/\s+([,.!?;:])/g, '$1')
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      // Fix capitalization after sentence starters
      .replace(/(According to reports,|Sources indicate that|It has been reported that|Recent developments show that|Officials confirm that|Data suggests that|Studies reveal that|Experts note that)\s*([a-z])/gi, 
               (match, starter, firstChar) => starter + ' ' + firstChar.toUpperCase())
      // Clean up multiple punctuation
      .replace(/[.]{2,}/g, '.')
      .replace(/[!]{2,}/g, '!')
      .replace(/[?]{2,}/g, '?')
      .trim();
  }

  generateNewId(title) {
    const timestamp = Date.now();
    return crypto.createHash('md5').update(title + timestamp).digest('hex');
  }

  generateInternalUrl(title) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);
    
    return `/article/${slug}`;
  }

  estimateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  // Advanced rewriting using natural language patterns
  enhancedRewrite(text) {
    // This could be extended to use AI/ML models for more sophisticated rewriting
    // For now, we use rule-based transformation
    
    const patterns = [
      // Transform passive to active voice patterns
      {
        pattern: /(\w+) was (\w+) by (.+)/gi,
        replacement: '$3 $2 $1'
      },
      // Transform "There is/are" constructions
      {
        pattern: /There (?:is|are) (.+) (?:in|at|on) (.+)/gi,
        replacement: '$2 has $1'
      }
    ];

    let enhanced = text;
    patterns.forEach(({ pattern, replacement }) => {
      enhanced = enhanced.replace(pattern, replacement);
    });

    return enhanced;
  }
}

module.exports = TextRewriter;