// sources/rss_feeds.js
import RSSParser from "rss-parser";
import * as cheerio from "cheerio";
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

  function extractImage(item) {
    if (item.enclosure && item.enclosure.url) return item.enclosure.url;
    if (item.mediaContent && item.mediaContent.url) return item.mediaContent.url;
    if (item.mediaThumbnail && item.mediaThumbnail.url) return item.mediaThumbnail.url;
    if (item.image) return item.image;
    const html = item["content:encoded"] || item.content || item.description || "";
    const regexImg = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
    if (regexImg && regexImg[1]) return regexImg[1];
    const $ = cheerio.load(html);
    const img = $('img').first().attr('src');
    if (img) return img;
    return null;
  }

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

  function assignCategory(item, feedTitle) {
    const text = `${item.title || ''} ${item.contentSnippet || ''} ${item.description || ''}`.toLowerCase();
    if (/business|economy|market|finance|trade|investment/.test(text) || /business/i.test(feedTitle)) return "Business";
    if (/politic|election|government|parliament|minister|president|vote|democracy/.test(text) || /politic/i.test(feedTitle)) return "Politics";
    if (/health|covid|disease|hospital|doctor|medicine|vaccine|malaria|hiv|aids|ebola/.test(text) || /health/i.test(feedTitle)) return "Health";
    return "General";
  }

  try {
    for (const feedUrl of feeds) {
      const feed = await parser.parseURL(feedUrl);
      for (let index = 0; index < feed.items.length; index++) {
        const item = feed.items[index];
        let image = extractImage(item);
        if (!image && item.link) {
          image = await fetchOgImage(item.link);
        }
        if (image && typeof image === 'string' && image.startsWith('http')) {
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
    }
    console.log(`✅ Parsed ${articles.length} total RSS articles with images.`);
    return articles;
  } catch (err) {
    console.error("❌ Error fetching RSS feeds:", err);
    return [];
  }
}
