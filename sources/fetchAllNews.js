// sources/fetchAllNews.js
import { fetchAfricanNews as fetchRssNews } from "./rss_feeds.js";
import NewsAPIFetcher from "../fetchers/newsapi.js";

export async function fetchAllNews() {
  console.log("🚀 Starting combined fetch (RSS + NewsAPI)...");

  // Fetch RSS (AllAfrica, BBC, etc)
  const rssArticles = await fetchRssNews();

  // Fetch NewsAPI.org (using API key from env)
  const apiKey = process.env.NEWS_API_KEY;
  let apiArticles = [];
  if (apiKey) {
    const fetcher = new NewsAPIFetcher(apiKey);
    apiArticles = await fetcher.fetchAfricanNews();
  } else {
    console.warn("No NEWS_API_KEY set, skipping NewsAPI fetch.");
  }

  console.log(`✅ RSS: ${rssArticles.length}, NewsAPI: ${apiArticles.length}`);

  // Combine and remove duplicates by URL
  const merged = [
    ...rssArticles,
    ...apiArticles.filter(
      (a) => !rssArticles.some((b) => b.url === a.url)
    ),
  ];

  console.log(`🧩 Total combined articles: ${merged.length}`);
  return merged;
}
