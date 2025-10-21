import fetch from "node-fetch";

export async function fetchAfricanNews() {
  const apiKey = process.env.NEWSAPI_KEY;
  const url = `https://newsapi.org/v2/top-headlines?language=en&q=Africa&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.articles) throw new Error("No articles found from NewsAPI");

    return data.articles.map((article, index) => ({
      title: article.title || "Untitled Article",
      image: article.urlToImage || `https://picsum.photos/seed/${index}/600/400`,
      summary:
        article.description ||
        "No summary available for this article.",
      source: article.source?.name || "Unknown Source",
      url: article.url,
    }));
  } catch (err) {
    console.error("Error fetching African news:", err.message);
    return [];
  }
}
