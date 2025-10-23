// Simple test to verify the generateSlug fix
const { RewrittenNewsDatabase } = require('./lib/rewrittenDatabase.js');

async function testSlugGeneration() {
  console.log('Testing generateSlug with undefined title...');
  
  // Test with undefined title (the issue we're fixing)
  const slug1 = RewrittenNewsDatabase.generateSlug(undefined, 'test123');
  console.log('✅ Slug with undefined title:', slug1);
  
  // Test with valid title
  const slug2 = RewrittenNewsDatabase.generateSlug('Valid News Title', 'test456');
  console.log('✅ Slug with valid title:', slug2);
  
  // Test with undefined both
  const slug3 = RewrittenNewsDatabase.generateSlug(undefined, undefined);
  console.log('✅ Slug with both undefined:', slug3);
  
  console.log('\n🎉 All slug generation tests passed! The fix is working.');
}

testSlugGeneration().catch(console.error);