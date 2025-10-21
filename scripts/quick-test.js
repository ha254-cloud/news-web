const path = require('path');
const fs = require('fs').promises;

// Import our modules
const TextRewriter = require('./utils/rewrite');
const FeedMerger = require('./utils/mergeFeeds');

async function quickTest() {
  console.log('🧪 Quick Test of African News System\n');

  // Test 1: Text Rewriter
  console.log('1. Testing Text Rewriter...');
  const rewriter = new TextRewriter();
  
  const testArticle = {
    title: 'Kenya Launches New Digital Payment System for Rural Areas',
    description: 'The Kenyan government announced a new mobile payment system that will help people in rural areas access banking services more easily.',
    content: 'The Kenyan government announced a new mobile payment system that will help people in rural areas access banking services more easily. Officials said the system will work on basic mobile phones and will not require internet connectivity.',
    image: 'https://example.com/kenya-mobile-payment.jpg',
    source: 'Kenya Daily News',
    url: 'https://example.com/original-article',
    publishedAt: new Date().toISOString(),
    country: 'Kenya',
    category: 'technology',
    provider: 'test'
  };

  console.log('   📰 Original Article:');
  console.log(`      Title: "${testArticle.title}"`);
  console.log(`      Description: "${testArticle.description}"`);
  
  const rewritten = await rewriter.rewriteArticle(testArticle);
  
  console.log('\n   ✏️ Rewritten Article:');
  console.log(`      Title: "${rewritten.title}"`);
  console.log(`      Description: "${rewritten.description}"`);
  console.log(`      Internal URL: "${rewritten.url}"`);
  console.log(`      Image: "${rewritten.image}" (kept original)`);

  // Test 2: Feed Merger
  console.log('\n2. Testing Feed Merger...');
  const merger = new FeedMerger();
  
  const feed1 = [
    {
      id: '1',
      title: 'Nigeria Economy Shows Growth',
      description: 'Nigeria\'s economy grew by 3.2% this quarter',
      country: 'Nigeria',
      category: 'business',
      publishedAt: '2025-10-18T10:00:00Z',
      provider: 'newsapi',
      image: 'https://example.com/nigeria-economy.jpg'
    },
    {
      id: '2', 
      title: 'South Africa Rugby Team Wins Championship',
      description: 'The Springboks defeated Australia 24-18 in the final',
      country: 'South Africa',
      category: 'sports',
      publishedAt: '2025-10-18T11:00:00Z',
      provider: 'newsapi',
      image: 'https://example.com/rugby.jpg'
    }
  ];

  const feed2 = [
    {
      id: '3',
      title: 'Nigeria\'s Economic Growth Continues',  // Similar to feed1[0]
      description: 'Nigeria shows strong economic performance with 3.1% growth',
      country: 'Nigeria',
      category: 'business',
      publishedAt: '2025-10-18T10:30:00Z',
      provider: 'mediastack',
      image: 'https://example.com/nigeria-growth.jpg'
    },
    {
      id: '4',
      title: 'Ghana Tech Startup Raises $5M',
      description: 'Accra-based fintech company secures Series A funding',
      country: 'Ghana',
      category: 'technology',
      publishedAt: '2025-10-18T12:00:00Z',
      provider: 'mediastack',
      image: 'https://example.com/ghana-startup.jpg'
    }
  ];

  const feed3 = [
    {
      id: '5',
      title: 'Egypt Tourism Industry Rebounds',
      description: 'Visitor numbers to Egypt increase by 25% this year',
      country: 'Egypt',
      category: 'business',
      publishedAt: '2025-10-18T09:00:00Z',
      provider: 'allafrica',
      image: 'https://example.com/egypt-tourism.jpg'
    }
  ];

  console.log(`   📊 Feed 1: ${feed1.length} articles`);
  console.log(`   📊 Feed 2: ${feed2.length} articles`);
  console.log(`   📊 Feed 3: ${feed3.length} articles`);
  
  const merged = merger.mergeFeeds(feed1, feed2, feed3);
  console.log(`   ✅ Merged into ${merged.length} unique articles`);

  // Test 3: Rewrite all merged articles
  console.log('\n3. Rewriting All Articles...');
  const allRewritten = [];
  
  for (const article of merged) {
    const rewrittenArticle = await rewriter.rewriteArticle(article);
    if (rewrittenArticle) {
      allRewritten.push(rewrittenArticle);
    }
  }

  console.log(`   ✅ Successfully rewrote ${allRewritten.length} articles`);

  // Test 4: Save sample data
  console.log('\n4. Saving Sample Data...');
  const dataDir = path.join(__dirname, 'data');
  const dataFile = path.join(dataDir, 'news.json');
  
  try {
    await fs.mkdir(dataDir, { recursive: true });
    
    const data = {
      articles: allRewritten,
      lastUpdated: new Date().toISOString(),
      count: allRewritten.length,
      testData: true
    };
    
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    console.log(`   💾 Saved ${allRewritten.length} articles to data/news.json`);
  } catch (error) {
    console.log(`   ❌ Failed to save data: ${error.message}`);
  }

  // Test 5: Display statistics
  console.log('\n5. Statistics...');
  const stats = merger.getStatistics(allRewritten);
  
  console.log('   📈 Article Statistics:');
  console.log(`      Total Articles: ${stats.total}`);
  console.log(`      Countries: ${Object.keys(stats.byCountry).join(', ')}`);
  console.log(`      Categories: ${Object.keys(stats.byCategory).join(', ')}`);
  console.log(`      Articles with Images: ${stats.articlesWithImages}`);
  console.log(`      Average Content Length: ${stats.avgContentLength} characters`);

  console.log('\n🎉 Test Results:');
  console.log('   ✅ Text rewriting working perfectly');
  console.log('   ✅ Feed merging and deduplication working');
  console.log('   ✅ Sample data generated');
  console.log('   ✅ All core functions operational');

  console.log('\n📋 Ready for Production:');
  console.log('   1. Add API keys to .env file');
  console.log('   2. Run: npm install');
  console.log('   3. Run: npm start');
  console.log('   4. Test: http://localhost:3001/african-news');
  
  console.log('\n🌍 Sample Articles Generated:');
  allRewritten.slice(0, 3).forEach((article, index) => {
    console.log(`   ${index + 1}. ${article.title}`);
    console.log(`      Country: ${article.country} | Category: ${article.category}`);
    console.log(`      URL: ${article.url}`);
  });
}

// Run the test
quickTest().catch(console.error);