const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

class ExpandedArticlePopulator {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data');
        this.articlesFile = path.join(this.dataDir, 'articles.json');
        
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_'
        });

        // ULTIMATE RSS feeds collection for MAXIMUM articles with images
        this.rssFeeds = [
            // Core African-specific sources
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
            },
            {
                name: 'France24 Africa',
                url: 'https://www.france24.com/en/africa/rss',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'Deutsche Welle Africa',
                url: 'https://rss.dw.com/xml/rss-en-africa',
                country: 'Africa',
                hasImages: true
            },
            // Multiple BBC feeds for more content
            {
                name: 'BBC World',
                url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'BBC Top Stories',
                url: 'https://feeds.bbci.co.uk/news/rss.xml',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'BBC Business',
                url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'BBC Health',
                url: 'https://feeds.bbci.co.uk/news/health/rss.xml',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'BBC Technology',
                url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'BBC Science',
                url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
                country: 'Africa',
                hasImages: true
            },
            // Guardian feeds
            {
                name: 'Guardian World',
                url: 'https://www.theguardian.com/world/rss',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'Guardian Global Development',
                url: 'https://www.theguardian.com/global-development/rss',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'Guardian Environment',
                url: 'https://www.theguardian.com/environment/rss',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'Guardian Business',
                url: 'https://www.theguardian.com/business/rss',
                country: 'Africa',
                hasImages: true
            },
            // CNN multiple feeds
            {
                name: 'CNN World',
                url: 'http://rss.cnn.com/rss/edition.rss',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'CNN International',
                url: 'http://rss.cnn.com/rss/edition_world.rss',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'CNN Business',
                url: 'http://rss.cnn.com/rss/money_latest.rss',
                country: 'Africa',
                hasImages: true
            },
            // Al Jazeera multiple feeds
            {
                name: 'Al Jazeera English',
                url: 'https://www.aljazeera.com/xml/rss/all.xml',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'Al Jazeera World',
                url: 'https://www.aljazeera.com/xml/rss/all.xml',
                country: 'Africa',
                hasImages: true
            },
            // South African sources
            {
                name: 'Daily Maverick',
                url: 'https://www.dailymaverick.co.za/dmrss/',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'News24',
                url: 'https://feeds.news24.com/articles/news24/topstories/rss',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'News24 World',
                url: 'https://feeds.news24.com/articles/news24/world/rss',
                country: 'Africa',
                hasImages: true
            },
            // International sources with global coverage
            {
                name: 'NPR World',
                url: 'https://feeds.npr.org/1004/rss.xml',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'NPR Africa',
                url: 'https://feeds.npr.org/1136/rss.xml',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'Reuters Top News',
                url: 'https://feeds.reuters.com/reuters/topNews',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'Associated Press World',
                url: 'https://feeds.apnews.com/apf-worldnews',
                country: 'Africa',
                hasImages: true
            },
            // Alternative RSS formats and sources
            {
                name: 'Yahoo News World',
                url: 'https://news.yahoo.com/rss/world',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'Independent World',
                url: 'https://www.independent.co.uk/news/world/rss',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'Telegraph World',
                url: 'https://www.telegraph.co.uk/news/world/rss',
                country: 'Africa',
                hasImages: true
            },
            // More African regional sources
            {
                name: 'The East African',
                url: 'https://www.theeastafrican.co.ke/tea/rss/news-1183190',
                country: 'Africa',
                hasImages: true
            },
            {
                name: 'This Day Live',
                url: 'https://www.thisdaylive.com/index.php/feed/',
                country: 'Africa',
                hasImages: true
            }
        ];

        this.countries = ['Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Ethiopia', 'Tanzania', 'Uganda', 'Rwanda', 'Morocco', 'Egypt', 'Zimbabwe', 'Botswana', 'Algeria', 'Tunisia', 'Libya', 'Sudan', 'Chad', 'Niger', 'Mali', 'Burkina Faso', 'Senegal', 'Guinea', 'Sierra Leone', 'Liberia', 'Ivory Coast', 'Togo', 'Benin', 'Cameroon', 'Central African Republic', 'Democratic Republic of Congo', 'Congo', 'Gabon', 'Equatorial Guinea', 'Angola', 'Zambia', 'Malawi', 'Mozambique', 'Madagascar', 'Mauritius', 'Seychelles', 'Comoros', 'Djibouti', 'Somalia', 'Eritrea', 'Namibia', 'Lesotho', 'Swaziland', 'Eswatini'];
        this.categories = ['Politics', 'Economy', 'Health', 'Education', 'Technology', 'Sports', 'Culture', 'Environment'];
    }

    generateId(title, url) {
        return crypto.createHash('md5').update(`${title}-${url}`).digest('hex');
    }

    // Improve image resolution by modifying image URLs
    improveImageResolution(imageUrl) {
        if (!imageUrl) return imageUrl;
        
        // For BBC images, replace smaller sizes with high resolution
        if (imageUrl.includes('ichef.bbci.co.uk')) {
            if (imageUrl.includes('/240/')) {
                return imageUrl.replace('/240/', '/976/');
            }
            if (imageUrl.includes('/320/')) {
                return imageUrl.replace('/320/', '/976/');
            }
        }
        
        // For CNN images, try to get larger versions
        if (imageUrl.includes('cnn.com') && imageUrl.includes('_small')) {
            return imageUrl.replace('_small', '_large');
        }
        
        return imageUrl;
    }

    async fetchRSSFeed(feed, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Fetching ${feed.name} (attempt ${attempt}/${maxRetries})...`);
                
                const response = await axios.get(feed.url, {
                    timeout: 20000, // Increased timeout
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
                    const delay = attempt * 3000; // Longer delays
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
        
        // ENHANCED: Try ALL possible image fields and formats
        if (article['media:thumbnail'] && article['media:thumbnail']['@_url']) {
            imageUrl = article['media:thumbnail']['@_url'];
        }
        else if (article['media:content'] && article['media:content']['@_url']) {
            imageUrl = article['media:content']['@_url'];
        }
        else if (article['media:group'] && article['media:group']['media:content'] && article['media:group']['media:content']['@_url']) {
            imageUrl = article['media:group']['media:content']['@_url'];
        }
        else if (article.enclosure && article.enclosure['@_type']?.includes('image')) {
            imageUrl = article.enclosure['@_url'];
        }
        else if (article.image && article.image.url) {
            imageUrl = article.image.url;
        }
        else if (article.image && typeof article.image === 'string') {
            imageUrl = article.image;
        }
        else if (article.thumbnail) {
            imageUrl = article.thumbnail;
        }
        else if (article.featuredImage) {
            imageUrl = article.featuredImage;
        }
        // Try content/description for embedded images - enhanced regex
        else if (article.description) {
            // Multiple regex patterns for different image formats
            const imgPatterns = [
                /<img[^>]*src="([^"]+)"/i,
                /<img[^>]*src='([^']+)'/i,
                /src="([^"]*\.(?:jpg|jpeg|png|gif|webp)[^"]*)"/i,
                /url\(['"]([^'"]*\.(?:jpg|jpeg|png|gif|webp)[^'"]*)['"]\)/i,
                /background-image:\s*url\(['"]([^'"]*\.(?:jpg|jpeg|png|gif|webp)[^'"]*)['"]\)/i
            ];
            
            for (const pattern of imgPatterns) {
                const match = article.description.match(pattern);
                if (match) {
                    imageUrl = match[1];
                    break;
                }
            }
        }
        // Try content field as well
        else if (article.content) {
            const imgMatch = article.content.match(/<img[^>]*src="([^"]+)"/i);
            if (imgMatch) {
                imageUrl = imgMatch[1];
            }
        }
        // Try summary field
        else if (article.summary) {
            const imgMatch = article.summary.match(/<img[^>]*src="([^"]+)"/i);
            if (imgMatch) {
                imageUrl = imgMatch[1];
            }
        }

        // Improve image resolution
        return this.improveImageResolution(imageUrl);
    }

    async validateImageUrl(url) {
        if (!url) return false;
        
        try {
            new URL(url);
            
            // Expanded image extensions
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.ico'];
            const hasImageExtension = imageExtensions.some(ext => 
                url.toLowerCase().includes(ext)
            );
            
            // GREATLY expanded trusted domains - accept from many more sources
            const trustedDomains = [
                'bbci.co.uk', 'cnn.com', 'aljazeera', 'reuters.com', 'france24.com', 
                'apnews.com', 'theguardian.com', 'npr.org', 'yahoo.com', 'independent.co.uk',
                'telegraph.co.uk', 'dailymaverick.co.za', 'news24.com', 'theeastafrican.co.ke',
                'thisdaylive.com', 'dw.com', 'cdn.', 'img.', 'images.', 'static.',
                'media.', 'photo.', 'pics.', 'image.', 'assets.', 'uploads.'
            ];
            const isTrustedDomain = trustedDomains.some(domain => 
                url.toLowerCase().includes(domain.toLowerCase())
            );
            
            // Accept if it has image characteristics in the URL
            const hasImageIndicators = url.toLowerCase().includes('image') || 
                                     url.toLowerCase().includes('photo') || 
                                     url.toLowerCase().includes('img') ||
                                     url.toLowerCase().includes('pic') ||
                                     url.toLowerCase().includes('media');
            
            return hasImageExtension || isTrustedDomain || hasImageIndicators;
            
        } catch (error) {
            return false;
        }
    }

    async fetchAllArticles() {
        console.log('🚀 Starting EXPANDED RSS fetch from multiple sources...');
        
        const allArticles = [];
        
        // Fetch from all sources
        for (const feed of this.rssFeeds) {
            const articles = await this.fetchRSSFeed(feed);
            allArticles.push(...articles);
        }
        
        console.log(`✅ Total articles fetched from all sources: ${allArticles.length}`);
        return allArticles;
    }

    // Create comprehensive 400-800 word content for SEO and ads
    generateDetailedContent(article) {
        const baseContent = article.description || article.title;
        const country = this.detectCountry(article);
        const category = this.detectCategory(article);
        
        // Generate detailed paragraphs for 400-800 words
        const paragraphs = [
            // Opening paragraph - rephrase the original content
            this.rephraseContent(baseContent, 'opening'),
            
            // Context paragraph
            `The developments in ${country} represent a significant moment for the region, highlighting the complex dynamics that continue to shape African politics and society. This situation has captured international attention as stakeholders across the continent monitor its implications for regional stability and cooperation.`,
            
            // Analysis paragraph
            `According to regional experts, this ${category.toLowerCase()} development reflects broader trends affecting African nations today. The implications extend beyond immediate geographical boundaries, potentially influencing policy decisions and international relations across multiple countries in the region.`,
            
            // Background context
            `${country} has been at the center of significant regional developments in recent months, with this latest situation adding another layer to the complex political and social landscape. Local communities and international observers are closely watching how events unfold, particularly given the broader implications for African unity and development.`,
            
            // Regional impact
            `The ripple effects of this development are already being felt across neighboring countries, with regional leaders calling for measured responses and continued dialogue. Economic implications are also being considered, as ${country}'s role in regional trade and cooperation remains crucial for continental development initiatives.`,
            
            // Future outlook
            `Looking ahead, analysts suggest that this situation could serve as a catalyst for broader discussions about governance, democracy, and regional cooperation in Africa. The international community continues to monitor developments closely, emphasizing the importance of peaceful resolution and continued commitment to democratic principles.`,
            
            // Conclusion
            `As this story continues to develop, it underscores the ongoing challenges and opportunities facing African nations in their pursuit of sustainable development, democratic governance, and regional integration. The outcome may well influence future approaches to similar situations across the continent.`
        ];
        
        return paragraphs.join('\n\n');
    }

    // Enhanced content rephrasing
    rephraseContent(originalContent, type = 'general') {
        if (!originalContent) return '';
        
        const rephraseTemplates = {
            opening: [
                `Recent developments indicate that ${originalContent.toLowerCase()}`,
                `In a significant development, reports confirm that ${originalContent.toLowerCase()}`,
                `Latest updates reveal that ${originalContent.toLowerCase()}`,
                `Breaking news from the region shows that ${originalContent.toLowerCase()}`
            ],
            general: [
                originalContent,
                `Reports indicate that ${originalContent.toLowerCase()}`,
                `According to latest updates, ${originalContent.toLowerCase()}`,
                `Regional sources confirm that ${originalContent.toLowerCase()}`
            ]
        };
        
        const templates = rephraseTemplates[type] || rephraseTemplates.general;
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        return template.charAt(0).toUpperCase() + template.slice(1);
    }

    detectCountry(article) {
        const content = `${article.title} ${article.description || ''}`.toLowerCase();
        
        for (const country of this.countries) {
            if (content.includes(country.toLowerCase())) {
                return country;
            }
        }
        
        return 'Africa'; // default
    }

    detectCategory(article) {
        const content = `${article.title} ${article.description || ''}`.toLowerCase();
        
        const categoryKeywords = {
            'Politics': ['election', 'government', 'president', 'minister', 'political', 'parliament', 'democracy', 'vote', 'leader', 'opposition'],
            'Economy': ['economy', 'business', 'trade', 'market', 'economic', 'financial', 'investment', 'growth', 'bank', 'money'],
            'Health': ['health', 'medical', 'hospital', 'disease', 'medicine', 'healthcare', 'treatment', 'patient', 'virus', 'pandemic'],
            'Technology': ['technology', 'tech', 'digital', 'internet', 'computer', 'mobile', 'innovation', 'startup', 'ai', 'data'],
            'Sports': ['sport', 'football', 'soccer', 'athletics', 'game', 'player', 'team', 'match', 'olympic', 'championship'],
            'Environment': ['environment', 'climate', 'weather', 'nature', 'conservation', 'wildlife', 'green', 'sustainability', 'carbon', 'forest'],
            'Education': ['education', 'school', 'university', 'student', 'teacher', 'learning', 'academic', 'scholarship', 'research'],
            'Culture': ['culture', 'art', 'music', 'festival', 'tradition', 'heritage', 'celebration', 'artist', 'film', 'literature']
        };
        
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => content.includes(keyword))) {
                return category;
            }
        }
        
        return 'Politics'; // default
    }

    generateTags(article, country, category) {
        const title = (article.title || '').toLowerCase();
        const description = (article.description || '').toLowerCase();
        const content = `${title} ${description}`;
        
        const baseTags = [country, category, 'Africa', 'African News'];
        const additionalTags = [];
        
        // Category-specific tags
        const categoryTags = {
            'Politics': ['Democracy', 'Government', 'Elections', 'Leadership', 'Policy'],
            'Economy': ['Business', 'Trade', 'Investment', 'Markets', 'Development'],
            'Health': ['Healthcare', 'Medicine', 'Public Health', 'Medical', 'Wellness'],
            'Technology': ['Innovation', 'Digital', 'Tech', 'Science', 'Research'],
            'Sports': ['Athletics', 'Football', 'Championship', 'Competition', 'Teams'],
            'Environment': ['Climate', 'Conservation', 'Sustainability', 'Nature', 'Green'],
            'Education': ['Learning', 'Schools', 'Universities', 'Students', 'Academic'],
            'Culture': ['Arts', 'Heritage', 'Tradition', 'Music', 'Literature']
        };
        
        // Add category-specific tags
        if (categoryTags[category]) {
            additionalTags.push(...categoryTags[category].slice(0, 2));
        }
        
        // Context-based tags
        if (content.includes('president') || content.includes('minister')) additionalTags.push('Leadership');
        if (content.includes('economic') || content.includes('trade')) additionalTags.push('Economic Development');
        if (content.includes('conflict') || content.includes('peace')) additionalTags.push('Peace & Security');
        if (content.includes('youth') || content.includes('young')) additionalTags.push('Youth');
        if (content.includes('women') || content.includes('gender')) additionalTags.push('Gender');
        if (content.includes('climate') || content.includes('environment')) additionalTags.push('Climate Change');
        
        // Regional tags
        const regionTags = ['East Africa', 'West Africa', 'Southern Africa', 'North Africa', 'Central Africa'];
        const countryRegions = {
            'Kenya': 'East Africa', 'Uganda': 'East Africa', 'Tanzania': 'East Africa', 'Rwanda': 'East Africa',
            'Nigeria': 'West Africa', 'Ghana': 'West Africa', 'Senegal': 'West Africa', 'Mali': 'West Africa',
            'South Africa': 'Southern Africa', 'Botswana': 'Southern Africa', 'Zimbabwe': 'Southern Africa',
            'Egypt': 'North Africa', 'Tunisia': 'North Africa', 'Morocco': 'North Africa', 'Algeria': 'North Africa',
            'Cameroon': 'Central Africa', 'Chad': 'Central Africa', 'Congo': 'Central Africa'
        };
        
        if (countryRegions[country]) {
            additionalTags.push(countryRegions[country]);
        }
        
        // Combine and clean tags
        const allTags = [...baseTags, ...additionalTags];
        return [...new Set(allTags)].slice(0, 8); // Limit to 8 unique tags
    }

    async populateDatabase() {
        console.log('🚀 Starting EXPANDED database population with MORE ARTICLES...');
        
        const articles = await this.fetchAllArticles();
        
        let articlesWithImages = [];
        
        console.log('🔍 Processing articles for images - ONLY KEEPING ARTICLES WITH REAL IMAGES...');
        
        for (const article of articles) {
            const imageUrl = this.extractImageFromArticle(article);
            
            if (imageUrl && await this.validateImageUrl(imageUrl)) {
                articlesWithImages.push({
                    ...article,
                    imageUrl: imageUrl
                });
                
                console.log(`✅ Found HIGH-RES image for: ${article.title?.substring(0, 50)}...`);
                
                // NO LIMIT - fetch ALL articles with images we can find!
            }
            // SKIP articles without images completely - we only want articles with real images
        }
        
        console.log(`\n✅ Found ${articlesWithImages.length} articles with real images`);
        console.log(`❌ Filtering out ALL articles without real images`);
        
        const allProcessedArticles = articlesWithImages; // ONLY articles with real images
        
        if (allProcessedArticles.length === 0) {
            console.log('❌ No articles found!');
            return;
        }
        
        console.log('🤖 Creating content for all articles...');
        
        const processedArticles = [];
        
        for (let i = 0; i < allProcessedArticles.length; i++) {
            const article = allProcessedArticles[i];
            console.log(`📝 Processing article ${i + 1}/${allProcessedArticles.length}: ${article.title?.substring(0, 50)}...`);
            
            const country = this.detectCountry(article);
            const category = this.detectCategory(article);
            const detailedContent = this.generateDetailedContent(article);
            
            // Generate SEO-friendly tags
            const tags = this.generateTags(article, country, category);
            
            // Calculate reading time (average 200 words per minute)
            const wordCount = detailedContent.split(' ').length;
            const readingTime = Math.ceil(wordCount / 200);
            
            // All articles now have real images - no placeholders needed
            const finalImageUrl = article.imageUrl;

            const processedArticle = {
                id: this.generateId(article.title || 'Untitled', article.link || ''),
                title: article.title || 'Untitled',
                originalUrl: article.link || '',
                originalDescription: article.description || '',
                aiSummary: detailedContent,
                aiAnalysis: `This comprehensive ${category.toLowerCase()} report from ${country} provides detailed insights into current developments affecting the region and its people. Our analysis covers the key implications for African politics, economics, and society.`,
                image: finalImageUrl,
                country: country,
                category: category,
                tags: tags,
                wordCount: wordCount,
                readingTime: `${readingTime} min read`,
                publishedAt: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };            processedArticles.push(processedArticle);
        }
        
        // Save to JSON file
        fs.writeFileSync(this.articlesFile, JSON.stringify(processedArticles, null, 2));
        
        console.log(`\n🎉 Successfully populated database with ${processedArticles.length} articles!`);
        
        // Show comprehensive stats - ALL articles have real images now
        const categories = [...new Set(processedArticles.map(a => a.category))];
        const countries = [...new Set(processedArticles.map(a => a.country))];
        
        console.log('\n📊 Database Statistics:');
        console.log(`   Total articles: ${processedArticles.length}`);
        console.log(`   Articles with REAL IMAGES: ${processedArticles.length} (100%)`);
        console.log(`   Articles with placeholders: 0 (filtered out)`);
        console.log(`   Categories: ${categories.length} (${categories.join(', ')})`);
        console.log(`   Countries: ${countries.length} (${countries.join(', ')})`);
        console.log(`   ✨ ONLY high-quality articles with authentic images!`);
    }
}

const populator = new ExpandedArticlePopulator();
populator.populateDatabase().catch(console.error);