
import RSSParser from "rss-parser";
const parser = new RSSParser();

export async function fetchAfricanNews() {
  console.log("🌍 Fetching African news via RSS...");

  const feeds = [
    "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
    "http://feeds.bbci.co.uk/news/world/africa/rss.xml",
    "https://www.africanews.com/feed/rss",
    "https://www.theguardian.com/world/africa/rss"
  ];

  const articles = [];

  try {
    for (const feedUrl of feeds) {
      const feed = await parser.parseURL(feedUrl);
      feed.items.forEach((item, index) => {
        articles.push({
          id: `${feed.title}-${index}`,
          title: item.title || "Untitled",
          summary: item.contentSnippet || "",
          url: item.link,
          image: item.enclosure?.url || "",
          source: feed.title,
          publishedAt: item.pubDate || new Date().toISOString(),
        });
      });
    }

    console.log(`✅ Parsed ${articles.length} total RSS articles.`);
    return articles;
  } catch (err) {
    console.error("❌ Error fetching RSS feeds:", err);
    return [];
  }
}
