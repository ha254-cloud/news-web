const fs = require('fs');
const { Client } = require('pg');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

class RealImageArticlePopulator {
    constructor() {
        this.openaiKey = process.env.OPENAI_API_KEY;
        this.db = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'news_db',
            password: 'password123',
            port: 5432,
        });

        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_'
        });

        // RSS feeds with confirmed image support
        this.rssFeeds = [
            {
                name: 'BBC Africa',
                url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'CNN Africa',
                url: 'http://rss.cnn.com/rss/edition_africa.rss',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'Reuters Africa',
                url: 'https://www.reuters.com/world/africa/',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'AllAfrica',
                url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf',
                country: 'Africa',
                hasImages: false // Testing showed no images
            }
        ];

        this.countries = ['Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Ethiopia', 'Tanzania', 'Uganda', 'Rwanda'];
        this.categories = ['Politics', 'Economy', 'Health', 'Education', 'Technology', 'Sports', 'Culture', 'Environment'];
    }

    async fetchRSSFeed(feed, maxRetries = 2) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Fetching ${feed.name} (attempt ${attempt}/${maxRetries})...`);
                
                const response = await axios.get(feed.url, {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'application/rss+xml, application/xml, text/xml'
                    }
                });

                const parsed = this.parser.parse(response.data);
                const items = parsed.rss?.channel?.item || parsed.rdf?.item || [];
                
                if (Array.isArray(items)) {
                    console.log(`✅ ${feed.name}: Fetched ${items.length} articles`);
                    return items.map(item => ({ ...item, source: feed.name, sourceCountry: feed.country }));
                } else if (items) {
                    console.log(`✅ ${feed.name}: Fetched 1 article`);
                    return [{ ...items, source: feed.name, sourceCountry: feed.country }];
                }

                return [];
            } catch (error) {
                console.log(`❌ Attempt ${attempt} failed for ${feed.name}: ${error.message}`);
                if (attempt < maxRetries) {
                    const delay = attempt * 2000;
                    console.log(`⏳ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        console.log(`❌ All ${maxRetries} attempts failed for ${feed.name}`);
        return [];
    }

    extractImageFromArticle(article) {
        // Check various image fields
        let imageUrl = null;
        
        // BBC and other media outlets use media:thumbnail
        if (article['media:thumbnail'] && article['media:thumbnail']['@_url']) {
            imageUrl = article['media:thumbnail']['@_url'];
        }
        // Some feeds use enclosure for images
        else if (article.enclosure && article.enclosure['@_type']?.includes('image')) {
            imageUrl = article.enclosure['@_url'];
        }
        // Some feeds embed images in description
        else if (article.description) {
            const imgMatch = article.description.match(/<img[^>]+src="([^"]+)"/i);
            if (imgMatch) {
                imageUrl = imgMatch[1];
            }
        }

        return imageUrl;
    }

    async validateImageUrl(url) {
        if (!url) return false;
        
        try {
            // Basic URL validation
            new URL(url);
            
            // Check if it's likely an image URL
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const hasImageExtension = imageExtensions.some(ext => 
                url.toLowerCase().includes(ext)
            );
            
            // For BBC and other media outlets, trust their image URLs even without extensions
            const trustedDomains = ['bbci.co.uk', 'cnn.com', 'reuters.com'];
            const isTrustedDomain = trustedDomains.some(domain => 
                url.includes(domain)
            );
            
            return hasImageExtension || isTrustedDomain;
            
        } catch (error) {
            return false;
        }
    }

    async fetchAllArticles() {
        console.log('🚀 Starting RSS fetch with image-supported feeds...');
        
        const allArticles = [];
        const fetchPromises = this.rssFeeds
            .filter(feed => feed.hasImages) // Only fetch feeds known to have images
            .map(feed => this.fetchRSSFeed(feed));
        
        const results = await Promise.all(fetchPromises);
        
        for (const articles of results) {
            allArticles.push(...articles);
        }
        
        console.log(`✅ Total articles fetched: ${allArticles.length}`);
        return allArticles;
    }

    async enhanceArticleWithAI(article, imageUrl) {
        if (!this.openaiKey) {
            return {
                enhancedContent: article.description || 'No content available',
                category: this.categories[Math.floor(Math.random() * this.categories.length)],
                country: this.countries[Math.floor(Math.random() * this.countries.length)]
            };
        }

        try {
            const prompt = `
Enhance this African news article with comprehensive, engaging content:

Title: ${article.title}
Original Content: ${article.description || 'Limited content'}
Source: ${article.source}

Please provide:
1. A detailed, well-written article (800-1200 words) that expands on the topic
2. The most relevant African country this news relates to
3. The best category that fits this news

Countries to choose from: ${this.countries.join(', ')}
Categories to choose from: ${this.categories.join(', ')}

Return as JSON:
{
  "enhancedContent": "detailed article content here",
  "country": "country name",
  "category": "category name"
}`;

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2000,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openaiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const aiResponse = JSON.parse(response.data.choices[0].message.content);
            return aiResponse;

        } catch (error) {
            console.log(`⚠️ AI enhancement failed: ${error.message}`);
            return {
                enhancedContent: article.description || 'No content available',
                category: this.categories[Math.floor(Math.random() * this.categories.length)],
                country: this.countries[Math.floor(Math.random() * this.countries.length)]
            };
        }
    }

    async populateDatabase() {
        await this.db.connect();
        
        // Clear existing data
        await this.db.query('DELETE FROM articles');
        console.log('🗑️ Cleared existing articles');

        const articles = await this.fetchAllArticles();
        
        let articlesWithImages = [];
        
        console.log('🔍 Processing articles for real images...');
        
        for (const article of articles) {
            const imageUrl = this.extractImageFromArticle(article);
            
            if (imageUrl && await this.validateImageUrl(imageUrl)) {
                articlesWithImages.push({
                    ...article,
                    imageUrl: imageUrl
                });
                
                if (articlesWithImages.length >= 30) { // Limit to 30 articles for faster testing
                    break;
                }
            }
        }
        
        console.log(`✅ Found ${articlesWithImages.length} articles with real images`);
        
        if (articlesWithImages.length === 0) {
            console.log('❌ No articles found with real images!');
            return;
        }
        
        console.log('🤖 Enhancing articles with AI...');
        
        for (let i = 0; i < articlesWithImages.length; i++) {
            const article = articlesWithImages[i];
            console.log(`📝 Processing article ${i + 1}/${articlesWithImages.length}: ${article.title?.substring(0, 60)}...`);
            
            const enhanced = await this.enhanceArticleWithAI(article, article.imageUrl);
            
            const insertQuery = `
                INSERT INTO articles (title, content, author, published_date, category, country, image_url, source_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            
            const values = [
                article.title || 'Untitled',
                enhanced.enhancedContent,
                article.source || 'Unknown',
                article.pubDate ? new Date(article.pubDate) : new Date(),
                enhanced.category,
                enhanced.country,
                article.imageUrl,
                article.link || ''
            ];
            
            await this.db.query(insertQuery, values);
        }
        
        console.log(`✅ Successfully populated database with ${articlesWithImages.length} articles with real images!`);
        
        // Show some stats
        const stats = await this.db.query(`
            SELECT 
                COUNT(*) as total_articles,
                AVG(LENGTH(content)) as avg_content_length,
                COUNT(DISTINCT category) as unique_categories,
                COUNT(DISTINCT country) as unique_countries
            FROM articles
        `);
        
        console.log('📊 Database Statistics:');
        console.log(`   Total articles: ${stats.rows[0].total_articles}`);
        console.log(`   Average content length: ${Math.round(stats.rows[0].avg_content_length)} characters`);
        console.log(`   Unique categories: ${stats.rows[0].unique_categories}`);
        console.log(`   Unique countries: ${stats.rows[0].unique_countries}`);
        
        await this.db.end();
    }
}

const populator = new RealImageArticlePopulator();
populator.populateDatabase().catch(console.error);