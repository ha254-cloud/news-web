

import RSSParser from "rss-parser";
import fetch from "node-fetch";
import cheerio from "cheerio";
const parser = new RSSParser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["image", "image", { keepArray: false }],
    ],
  },
});

export async function fetchAfricanNews() {
  console.log("🌍 Fetching African news via RSS...");

  const feeds = [
    "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
    "http://feeds.bbci.co.uk/news/world/africa/rss.xml",
    "https://www.africanews.com/feed/rss",
    "https://www.theguardian.com/world/africa/rss"
  ];

  const articles = [];

  // Helper to extract image from RSS item
  function extractImage(item) {
  // 1. enclosure
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  // 2. media:content
  if (item.mediaContent && item.mediaContent.url) return item.mediaContent.url;
  // 3. media:thumbnail
  if (item.mediaThumbnail && item.mediaThumbnail.url) return item.mediaThumbnail.url;
  // 4. image field
  if (item.image) return item.image;
  // 5. Try to extract from <img> in description/content
  const html = item["content:encoded"] || item.content || item.description || "";
  // Regex fallback for <img src="...">
  const regexImg = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  if (regexImg && regexImg[1]) return regexImg[1];
  // Cheerio fallback
  const $ = cheerio.load(html);
  const img = $('img').first().attr('src');
  if (img) return img;
  // No image found
  return null;
  }

  // Optionally, try to fetch og:image from article page if no image found
  async function fetchOgImage(url) {
    try {
      const res = await fetch(url, { timeout: 5000 });
      if (!res.ok) return null;
      const html = await res.text();
      const $ = cheerio.load(html);
      const ogImg = $('meta[property="og:image"]').attr('content');
      return ogImg || null;
    } catch {
      return null;
    }
  }

  // Helper to assign category based on keywords or feed
  function assignCategory(item, feedTitle) {
    const text = `${item.title || ''} ${item.contentSnippet || ''} ${item.description || ''}`.toLowerCase();
    if (/business|economy|market|finance|trade|investment/.test(text) || /business/i.test(feedTitle)) return "Business";
    if (/politic|election|government|parliament|minister|president|vote|democracy/.test(text) || /politic/i.test(feedTitle)) return "Politics";
    if (/health|covid|disease|hospital|doctor|medicine|vaccine|malaria|hiv|aids|ebola/.test(text) || /health/i.test(feedTitle)) return "Health";
    // Add more rules as needed
    return "General";
  }

  try {
    for (const feedUrl of feeds) {
      const feed = await parser.parseURL(feedUrl);
      for (let index = 0; index < feed.items.length; index++) {
        const item = feed.items[index];
        let image = extractImage(item);
        // If no image, try to fetch og:image from article page (async)
        if (!image && item.link) {
          image = await fetchOgImage(item.link);
        }
        // Always fallback to default image if none found
        if (!image || typeof image !== 'string' || !image.startsWith('http')) {
          image = "https://trendingnews.org.za/default-image.jpg";
        }
        const category = assignCategory(item, feed.title);
        articles.push({
          id: `${feed.title}-${index}`,
          title: item.title || "Untitled",
          summary: item.contentSnippet || "",
          url: item.link,
          image,
          source: feed.title,
          publishedAt: item.pubDate || new Date().toISOString(),
          category,
        });
      }
    }

    console.log(`✅ Parsed ${articles.length} total RSS articles with images.`);
    return articles;
  } catch (err) {
    console.error("❌ Error fetching RSS feeds:", err);
    return [];
  }
}
