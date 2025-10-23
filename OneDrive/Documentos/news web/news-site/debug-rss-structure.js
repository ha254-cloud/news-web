const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

async function debugRSSStructure() {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
    });

    console.log('🔍 Debugging RSS feed structure...\n');

    const feeds = [
        { name: 'Google News Kenya', url: 'https://news.google.com/rss/search?q=Kenya+news&hl=en&gl=KE' },
        { name: 'BBC Africa', url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml' }
    ];

    for (const feed of feeds) {
        try {
            console.log(`📡 Fetching ${feed.name}...`);
            const response = await axios.get(feed.url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const parsed = parser.parse(response.data);
            const items = parsed.rss?.channel?.item || [];
            
            console.log(`✅ Found ${items.length} articles`);
            
            if (items.length > 0) {
                console.log(`\n📋 Structure of first article from ${feed.name}:`);
                const firstItem = items[0];
                console.log(JSON.stringify(firstItem, null, 2));
            }
            
            console.log('\n' + '='.repeat(60) + '\n');
            
        } catch (error) {
            console.log(`❌ Error fetching ${feed.name}: ${error.message}\n`);
        }
    }
}

debugRSSStructure().catch(console.error);