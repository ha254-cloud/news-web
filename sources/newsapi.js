
export async function fetchAfricanNews() {
  const parser = new Parser();
  const feeds = [
    "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
    "http://feeds.bbci.co.uk/news/world/africa/rss.xml",
    "https://www.africanews.com/feed/rss",
    "https://www.theguardian.com/world/africa/rss",
    "https://www.reutersagency.com/feed/?best-regions=africa"
  ];

  const allArticles = [];

  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      feed.items.forEach(item => {
        allArticles.push({
          title: item.title,
          summary: item.contentSnippet || item.summary || item.description || "No summary available",
          image: item.enclosure?.url || item['media:content']?.url || "",
          source: feed.title,
          url: item.link,
          publishedAt: item.pubDate
        });
      });
    } catch (err) {
      console.warn(`Failed to fetch or parse RSS feed: ${url} - ${err.message}`);
    }
  }

  return allArticles;
}
