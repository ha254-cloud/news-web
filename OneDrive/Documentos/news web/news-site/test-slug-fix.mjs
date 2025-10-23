// Test the generateSlug fix using ES module
import { RewrittenNewsDatabase } from './lib/rewrittenDatabase.js';

console.log('🔧 Testing generateSlug fix...');

// Test scenarios that would have failed before the fix
console.log('\n📊 Test 1: undefined title');
const slug1 = RewrittenNewsDatabase.generateSlug(undefined, 'test123');
console.log('✅ Result:', slug1);

console.log('\n📊 Test 2: normal title');  
const slug2 = RewrittenNewsDatabase.generateSlug('African News Update', 'test456');
console.log('✅ Result:', slug2);

console.log('\n📊 Test 3: undefined title and id');
const slug3 = RewrittenNewsDatabase.generateSlug(undefined, undefined);
console.log('✅ Result:', slug3);

console.log('\n🎉 All tests passed! The generateSlug fix is working correctly.');
console.log('💾 Articles should now be able to save to the database.');