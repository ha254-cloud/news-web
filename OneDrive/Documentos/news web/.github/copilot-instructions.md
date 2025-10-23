# Copilot Instructions for Africa News Aggregation System

## Big Picture Architecture
- **Three main folders:**
  - `africa-news/`: Node.js Express backend for fetching, filtering, deduplicating, and rewriting African news from NewsAPI, MediaStack, and AllAfrica RSS. Exposes REST API endpoints.
  - `news-site/` and `deployment-package/`: Next.js frontend for displaying news, with search, filtering, and pagination. Can run dynamic (Node.js) or static (HTML) builds.
  - `READY-TO-UPLOAD/`: Static HTML and JS assets for deployment.

## Key Workflows
- **Backend (`africa-news/`):**
  - Start server: `npm start` or `npm run dev` (auto-restart)
  - Configure `.env` with API keys for NewsAPI and MediaStack
  - Main entry: `server.js`
  - Fetchers in `fetchers/` (one per provider)
  - Utilities in `utils/` (rewriting, merging, cleaning)
  - Data cached in `data/news.json`
  - Test scripts in `test/`
- **Frontend (`news-site/`, `deployment-package/`):**
  - Install: `npm install`
  - Configure: `.env.local` for API keys and provider selection
  - Run dev server: `npm run dev` (Next.js)
  - Build static: `npm run build` → deploy `static-version.html` or `.next/out` folder
  - API proxy: `pages/api/news.js` (do not call news APIs directly from client code)

## Project-Specific Patterns
- **Provider Switching:**
  - Use `NEWS_PROVIDER` env variable to switch between `newsapi` and `mediastack`.
- **Filtering:**
  - Country/category filters supported in both backend and frontend.
- **Deduplication & Rewriting:**
  - Deduplication via `utils/mergeFeeds.js`.
  - Rewriting via `utils/rewrite.js`.
- **Static Hosting:**
  - For static deployments, update API endpoint in `static-version.html`.
- **Troubleshooting:**
  - If no articles: check API keys, provider, and search terms.
  - For CORS/static: always use API proxy endpoint.

## Integration Points
- **External APIs:** NewsAPI, MediaStack, AllAfrica RSS
- **Environment Variables:**
  - Backend: `.env` (`NEWS_API_KEY`, `MEDIASTACK_API_KEY`, `PORT`)
  - Frontend: `.env.local` (`NEWS_PROVIDER`, `NEWS_API_KEY`, `NEXT_PUBLIC_SITE_TITLE`)

## Examples
- **Backend API call:** `GET /african-news?country=Nigeria&category=business&limit=20`
- **Frontend provider switch:**
  ```env
  NEWS_PROVIDER=mediastack
  NEWS_API_KEY=your_mediastack_access_key
  ```

## Key Files & Directories
- `africa-news/server.js`: Express server
- `africa-news/fetchers/`: Source integrations
- `africa-news/utils/`: Deduplication, rewriting, cleaning
- `news-site/pages/api/news.js`: API proxy
- `news-site/components/ArticleCard.jsx`: Article display
- `news-site/static-version.html`: Static build

---
For unclear workflows or missing conventions, ask the user for clarification or examples from their recent work.