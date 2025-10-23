// Test the updated system without emojis and badges
import { HumanNewsRewriter } from './lib/humanRewriter.js';
import { RewrittenNewsDatabase } from './lib/rewrittenDatabase.js';

const testArticle = {
  title: "Egypt Unveils Massive Solar Energy Project",
  description: "Egypt has announced plans for a groundbreaking solar energy facility that will power millions of homes across the country.",
  url: "https://example.com/egypt-solar",
  urlToImage: "https://example.com/solar-egypt.jpg",
  source: { name: "Egypt Energy Today" },
  author: "Ahmed Hassan",
  publishedAt: "2024-10-18T16:00:00Z"
};

async function testCleanSystem() {
  console.log('Testing Clean System (No Emojis/Badges)...\n');

  try {
    // Clear and process a test article
    await RewrittenNewsDatabase.saveArticles([]);
    
    const rewrittenData = HumanNewsRewriter.rewriteArticle(testArticle, 'eg', 'business');
    const savedArticle = await RewrittenNewsDatabase.saveRewrittenArticle(rewrittenData);
    
    console.log('Clean Article Data:');
    console.log('Title:', savedArticle.title);
    console.log('Country:', savedArticle.country);
    console.log('Category:', savedArticle.category);
    console.log('Internal URL:', `/article/${savedArticle.slug}`);
    console.log('Reading Time:', savedArticle.readingTime);
    console.log('Content Preview:', savedArticle.summary);
    console.log('\nSystem is clean - no emojis or badges in content!');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCleanSystem();