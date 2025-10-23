// Test script for African News Aggregation System
const { AfricanNewsAggregator } = require('./lib/africanNewsAggregator');
const { RSSFetcher } = require('./lib/rssFetcher');
const { MediaStackFetcher } = require('./lib/mediaStackFetcher');

async function testAfricanNewsSystem() {
  console.log('🧪 Testing African News Aggregation System...\n');

  try {
    // Test 1: RSS Fetcher
    console.log('📰 Test 1: RSS Fetching');
    console.log('========================');
    
    console.log('Testing AllAfrica RSS...');
    const allAfricaArticles = await RSSFetcher.fetchAllAfrica();
    console.log(`✅ AllAfrica: ${allAfricaArticles.length} articles fetched`);
    
    if (allAfricaArticles.length > 0) {
      console.log('Sample AllAfrica article:');
      console.log(`  Title: ${allAfricaArticles[0].title}`);
      console.log(`  Country: ${allAfricaArticles[0].country}`);
      console.log(`  Category: ${allAfricaArticles[0].category}`);
      console.log(`  Image: ${allAfricaArticles[0].image ? 'Yes' : 'No'}`);
    }
    console.log('');

    console.log('Testing Google News RSS...');
    const googleNewsArticles = await RSSFetcher.fetchGoogleNews();
    console.log(`✅ Google News: ${googleNewsArticles.length} articles fetched`);
    
    if (googleNewsArticles.length > 0) {
      console.log('Sample Google News article:');
      console.log(`  Title: ${googleNewsArticles[0].title}`);
      console.log(`  Country: ${googleNewsArticles[0].country}`);
      console.log(`  Category: ${googleNewsArticles[0].category}`);
    }
    console.log('');

    // Test 2: MediaStack API
    console.log('📡 Test 2: MediaStack API');
    console.log('=========================');
    
    const mediaStack = new MediaStackFetcher();
    const mediaStackArticles = await mediaStack.fetchNews();
    console.log(`✅ MediaStack: ${mediaStackArticles.length} articles fetched`);
    
    if (mediaStackArticles.length > 0) {
      console.log('Sample MediaStack article:');
      console.log(`  Title: ${mediaStackArticles[0].title}`);
      console.log(`  Country: ${mediaStackArticles[0].country}`);
      console.log(`  Category: ${mediaStackArticles[0].category}`);
      console.log(`  Image: ${mediaStackArticles[0].image ? 'Yes' : 'No'}`);
    }
    console.log('');

    // Test 3: Full Aggregation
    console.log('🌍 Test 3: Full African News Aggregation');
    console.log('=========================================');
    
    const aggregator = new AfricanNewsAggregator();
    const allArticles = await aggregator.aggregateNews();
    
    console.log(`✅ Total aggregated articles: ${allArticles.length}`);
    
    // Statistics
    const countries = [...new Set(allArticles.map(a => a.country))];
    const categories = [...new Set(allArticles.map(a => a.category))];
    const sources = [...new Set(allArticles.map(a => a.source?.name || a.source))];
    
    console.log('\n📊 Statistics:');
    console.log(`Countries: ${countries.join(', ')}`);
    console.log(`Categories: ${categories.join(', ')}`);
    console.log(`Sources: ${sources.join(', ')}`);
    
    // Country breakdown
    console.log('\n🌍 Articles by Country:');
    countries.forEach(country => {
      const count = allArticles.filter(a => a.country === country).length;
      console.log(`  ${country}: ${count} articles`);
    });
    
    // Category breakdown
    console.log('\n📂 Articles by Category:');
    categories.forEach(category => {
      const count = allArticles.filter(a => a.category === category).length;
      console.log(`  ${category}: ${count} articles`);
    });

    // Sample articles
    console.log('\n📰 Sample Aggregated Articles:');
    console.log('==============================');
    allArticles.slice(0, 3).forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Country: ${article.country} | Category: ${article.category}`);
      console.log(`   Source: ${article.source?.name || article.source}`);
      console.log(`   Image: ${article.image ? 'Yes' : 'No'}`);
      console.log(`   Published: ${article.publishedAt}`);
      console.log('');
    });

    // Test 4: Filtering
    console.log('🔍 Test 4: Filtering Functionality');
    console.log('==================================');
    
    // Test country filtering
    const kenyaArticles = await aggregator.getArticlesByCountry('Kenya');
    console.log(`✅ Kenya-specific articles: ${kenyaArticles.length}`);
    
    // Test category filtering
    const businessArticles = await aggregator.getArticlesByCategory('business');
    console.log(`✅ Business articles: ${businessArticles.length}`);
    
    // Test search
    const searchResults = await aggregator.searchArticles('economy');
    console.log(`✅ Search results for 'economy': ${searchResults.length}`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ The African News Aggregation System is working properly.');
    console.log('\n📡 You can now use the API endpoint:');
    console.log('   GET /api/african-news - Get all articles');
    console.log('   GET /api/african-news?country=Kenya - Get Kenya articles');
    console.log('   GET /api/african-news?category=business - Get business articles');
    console.log('   GET /api/african-news?search=economy - Search articles');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testAfricanNewsSystem();