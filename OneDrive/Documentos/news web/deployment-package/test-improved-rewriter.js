// Test the improved human rewriter
const { HumanNewsRewriter } = require('./lib/improvedHumanRewriter');
const fs = require('fs');

async function testImprovedRewriter() {
  console.log('🧪 Testing Improved Human Rewriter...\n');

  // Clear database
  fs.writeFileSync('./data/rewritten-articles.json', '[]');
  console.log('✅ Database cleared');

  // Test articles with various types
  const testArticles = [
    {
      title: "Tim Mayer officially withdraws from FIA presidential election",
      description: "The Briton pulled out of the running to be the next FIA president, leaving incumbent Mohammed Ben Sulayem set for second term",
      urlToImage: "https://cdn-6.motorsport.com/images/amp/YP3vXP32/s6/tim-mayer-2.jpg",
      source: { name: "Motorsport.com" }
    },
    {
      title: "Kenya's economy shows remarkable growth in Q3",
      description: "The East African nation has reported a 6.2% GDP growth in the third quarter, driven by strong performance in agriculture and technology sectors",
      urlToImage: "https://example.com/economy.jpg",
      source: { name: "Business Daily" }
    },
    {
      title: "Liverpool signs new defender in January transfer window",
      description: "The Premier League club has secured the services of a promising young defender from Barcelona's academy",
      urlToImage: "https://example.com/football.jpg", 
      source: { name: "Sky Sports" }
    }
  ];

  console.log('\n📝 Testing rewriter with different article types:\n');

  for (let i = 0; i < testArticles.length; i++) {
    const article = testArticles[i];
    console.log(`--- Test ${i + 1}: ${article.title.substring(0, 50)}... ---`);
    
    const rewritten = await HumanNewsRewriter.rewriteArticle(article, 'Kenya', 'sports');
    
    if (rewritten) {
      console.log('✅ Rewrite successful!');
      console.log(`Original Title: ${article.title}`);
      console.log(`Rewritten Title: ${rewritten.rewrittenTitle}`);
      console.log(`Original Desc: ${article.description.substring(0, 100)}...`);
      console.log(`Rewritten Content: ${rewritten.rewrittenContent.substring(0, 150)}...`);
      console.log(`Summary: ${rewritten.summary.substring(0, 100)}...`);
      console.log('');
    } else {
      console.log('❌ Rewrite failed!');
    }
  }

  console.log('🎉 Test completed!');
}

testImprovedRewriter().catch(console.error);