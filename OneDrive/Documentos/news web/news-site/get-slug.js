const articles = JSON.parse(require('fs').readFileSync('./data/rewritten-articles.json', 'utf8'));
console.log('Sample article slug:', articles[0].slug);