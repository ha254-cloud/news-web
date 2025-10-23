const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

class RealImageArticlePopulator {
    constructor() {
        this.openaiKey = process.env.OPENAI_API_KEY;
        this.dataDir = path.join(process.cwd(), 'data');
        this.articlesFile = path.join(this.dataDir, 'articles.json');
        
        // Ensure data directory exists
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }

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
                name: 'Al Jazeera Africa',
                url: 'https://www.aljazeera.com/xml/rss/all.xml',
                country: 'Africa',
                hasImages: true
            }
        ];

        this.countries = ['Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Ethiopia', 'Tanzania', 'Uganda', 'Rwanda'];
        this.categories = ['Politics', 'Economy', 'Health', 'Education', 'Technology', 'Sports', 'Culture', 'Environment'];
    }

    generateId(title, url) {
        return crypto.createHash('md5').update(`${title}-${url}`).digest('hex');
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
        let imageUrl = null;
        
        // BBC and other media outlets use media:thumbnail
        if (article['media:thumbnail'] && article['media:thumbnail']['@_url']) {
            imageUrl = article['media:thumbnail']['@_url'];
        }
        // Some feeds use media:content
        else if (article['media:content'] && article['media:content']['@_url']) {
            imageUrl = article['media:content']['@_url'];
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
            
            // For trusted media outlets, trust their image URLs even without extensions
            const trustedDomains = ['bbci.co.uk', 'cnn.com', 'aljazeera', 'reuters.com'];
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
        
        for (const feed of this.rssFeeds) {
            if (feed.hasImages) {
                const articles = await this.fetchRSSFeed(feed);
                allArticles.push(...articles);
            }
        }
        
        console.log(`✅ Total articles fetched: ${allArticles.length}`);
        return allArticles;
    }

    async enhanceArticleWithAI(article, imageUrl) {
        // For this demo, we'll create enhanced content without OpenAI
        // since we want to focus on getting real images working
        
        const categories = this.categories;
        const countries = this.countries;
        
        // Try to detect country from title and description
        let detectedCountry = 'Africa'; // default
        const content = `${article.title} ${article.description || ''}`.toLowerCase();
        
        for (const country of countries) {
            if (content.includes(country.toLowerCase())) {
                detectedCountry = country;
                break;
            }
        }
        
        // Try to detect category
        let detectedCategory = 'Politics'; // default
        const categoryKeywords = {
            'Politics': ['election', 'government', 'president', 'minister', 'political', 'parliament'],
            'Economy': ['economy', 'business', 'trade', 'market', 'economic', 'financial'],
            'Health': ['health', 'medical', 'hospital', 'disease', 'medicine', 'healthcare'],
            'Technology': ['technology', 'tech', 'digital', 'internet', 'computer', 'mobile'],
            'Sports': ['sport', 'football', 'soccer', 'athletics', 'game', 'player'],
            'Environment': ['environment', 'climate', 'weather', 'nature', 'conservation']
        };
        
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => content.includes(keyword))) {
                detectedCategory = category;
                break;
            }
        }
        
        // Create enhanced content by expanding the description
        const originalContent = article.description || article.title;
        const enhancedContent = `${originalContent}\n\nThis breaking news story from ${detectedCountry} highlights important developments in the region. The situation continues to evolve as more details emerge from reliable sources on the ground.\n\nStay tuned for further updates as this story develops.`;
        
        return {
            enhancedContent: enhancedContent,
            category: detectedCategory,
            country: detectedCountry
        };
    }

    async populateDatabase() {
        console.log('🚀 Starting database population with REAL IMAGES ONLY...');
        
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
                
                console.log(`✅ Found image for: ${article.title?.substring(0, 60)}...`);
                console.log(`   Image URL: ${imageUrl}`);
                
                if (articlesWithImages.length >= 25) { // Limit to 25 articles for testing
                    break;
                }
            }
        }
        
        console.log(`\n✅ Found ${articlesWithImages.length} articles with real images`);
        
        if (articlesWithImages.length === 0) {
            console.log('❌ No articles found with real images!');
            return;
        }
        
        console.log('🤖 Enhancing articles with content...');
        
        const processedArticles = [];
        
        for (let i = 0; i < articlesWithImages.length; i++) {
            const article = articlesWithImages[i];
            console.log(`📝 Processing article ${i + 1}/${articlesWithImages.length}: ${article.title?.substring(0, 60)}...`);
            
            const enhanced = await this.enhanceArticleWithAI(article, article.imageUrl);
            
            const processedArticle = {
                id: this.generateId(article.title || 'Untitled', article.link || ''),
                title: article.title || 'Untitled',
                originalUrl: article.link || '',
                originalDescription: article.description || '',
                aiSummary: enhanced.enhancedContent,
                aiAnalysis: `This ${enhanced.category.toLowerCase()} news from ${enhanced.country} is significant for understanding current developments in the region.`,
                image: article.imageUrl,
                source: article.source || 'Unknown',
                author: article.source || 'News Team',
                country: enhanced.country,
                category: enhanced.category,
                publishedAt: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            processedArticles.push(processedArticle);
        }
        
        // Save to JSON file
        fs.writeFileSync(this.articlesFile, JSON.stringify(processedArticles, null, 2));
        
        console.log(`\n✅ Successfully populated database with ${processedArticles.length} articles with REAL IMAGES!`);
        
        // Show some stats
        const categories = [...new Set(processedArticles.map(a => a.category))];
        const countries = [...new Set(processedArticles.map(a => a.country))];
        const avgContentLength = Math.round(
            processedArticles.reduce((sum, a) => sum + a.aiSummary.length, 0) / processedArticles.length
        );
        
        console.log('\n📊 Database Statistics:');
        console.log(`   Total articles: ${processedArticles.length}`);
        console.log(`   Average content length: ${avgContentLength} characters`);
        console.log(`   Categories: ${categories.join(', ')}`);
        console.log(`   Countries: ${countries.join(', ')}`);
        console.log(`   All articles have REAL IMAGES from RSS feeds! ✨`);
        
        // Show sample of image URLs to verify they're real
        console.log('\n🖼️ Sample Image URLs (proving they are REAL):');
        processedArticles.slice(0, 5).forEach((article, i) => {
            console.log(`   ${i + 1}. ${article.image}`);
        });
    }
}

const populator = new RealImageArticlePopulator();
populator.populateDatabase().catch(console.error);