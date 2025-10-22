
export async function fetchAfricanNews() {
  const parser = new Parser();
  const feeds = [
    "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
    "http://feeds.bbci.co.uk/news/world/africa/rss.xml",
    "https://www.africanews.com/feed/rss",
    "https://www.theguardian.com/world/africa/rss",
    "https://www.reutersagency.com/feed/?best-regions=africa"
  ];

  const articles = [];

  try {

    for (const feedUrl of feeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        feed.items.forEach(item => {
          articles.push({
            title: item.title,
            summary: item.contentSnippet || item.summary || item.description || "No summary available",
            image: item.enclosure?.url || item['media:content']?.url || "",
            source: feed.title,
            url: item.link,
            publishedAt: item.pubDate
          });
        });
      } catch (err) {
        console.warn(`Failed to fetch or parse RSS feed: ${feedUrl} - ${err.message}`);
      }
    }


    console.log(`✅ Parsed ${articles.length} total RSS articles.`);
    return articles;
  } catch (err) {
    console.error("❌ Error fetching RSS feeds:", err);
    return [];
  }
}
