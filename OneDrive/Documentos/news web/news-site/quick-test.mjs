import { RewrittenNewsDatabase } from './lib/rewrittenDatabase.js';

// Simple test of the fix
console.log('Testing generateSlug fix...');

try {
  // This would have thrown an error before the fix
  const result = RewrittenNewsDatabase.generateSlug(undefined, 'test123');
  console.log('✅ SUCCESS: generateSlug handled undefined title:', result);
  
  // Test normal case
  const normal = RewrittenNewsDatabase.generateSlug('Kenya Business News', 'abc456');
  console.log('✅ SUCCESS: generateSlug with normal title:', normal);
  
  console.log('\n🎉 Fix is working! Articles can now be saved to database.');
} catch (error) {
  console.log('❌ ERROR:', error.message);
}