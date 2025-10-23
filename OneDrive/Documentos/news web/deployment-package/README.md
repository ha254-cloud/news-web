# Africa News Demo

A Next.js news website that fetches news from NewsAPI or Mediastack with search, filtering, and pagination capabilities.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.local` and add your API key:
   ```env
   NEWS_PROVIDER=mediastack   # or 'newsapi'
   NEWS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   NEXT_PUBLIC_SITE_TITLE="Africa News Demo"
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Getting API Keys

### Mediastack (Recommended)
- Sign up at [mediastack.com](https://mediastack.com)
- Get your `access_key` from the dashboard
- Free tier: 1,000 requests/month

### NewsAPI
- Sign up at [newsapi.org](https://newsapi.org)
- Get your API key from the dashboard  
- Free tier: 1,000 requests/day (development only)

## 🌍 Features

- **Search**: Find news by keywords
- **Country Filter**: Focus on African countries (Kenya, Nigeria, South Africa, Egypt)
- **Category Filter**: Business, Sports, Technology, Entertainment
- **Pagination**: Navigate through multiple pages
- **Responsive Design**: Works on mobile and desktop
- **Dual Provider Support**: Switch between NewsAPI and Mediastack

## 📁 Project Structure

```
news-site/
├── pages/
│   ├── index.jsx          # Main homepage
│   ├── _app.js            # Next.js app configuration
│   └── api/
│       └── news.js        # API proxy endpoint
├── components/
│   └── ArticleCard.jsx    # Article display component
├── styles/
│   └── globals.css        # Global styles with Tailwind
├── static-version.html    # Static HTML version
└── .env.local            # Environment variables
```

## 🌐 Static HTML Version

For simple static hosting (no Node.js required):

1. **Deploy the static version:**
   - Upload `static-version.html` to any static host
   - Rename it to `index.html`
   - Make sure your API endpoint is accessible

2. **Compatible hosts:**
   - Netlify
   - Vercel (static)
   - GitHub Pages
   - HostAfrica
   - AWS S3

3. **Important:** Update the API URL in the static version to point to your deployed API endpoint.

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload the .next/out folder to Netlify
```

### Traditional Hosting
```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEWS_PROVIDER` | `newsapi` or `mediastack` | Yes |
| `NEWS_API_KEY` | Your API key | Yes |
| `NEXT_PUBLIC_SITE_TITLE` | Site title displayed in header | No |

### Switching News Providers

**For Mediastack:**
```env
NEWS_PROVIDER=mediastack
NEWS_API_KEY=your_mediastack_access_key
```

**For NewsAPI:**
```env
NEWS_PROVIDER=newsapi
NEWS_API_KEY=your_newsapi_key
```

## 🐛 Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Check your `.env.local` file exists
   - Verify `NEWS_API_KEY` is set correctly
   - Restart the development server

2. **No articles found**
   - Verify your API key is valid
   - Check the NEWS_PROVIDER setting
   - Try different search terms or countries

3. **CORS errors (static version)**
   - Make sure you're using the API proxy endpoint
   - Don't call news APIs directly from client code

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- Mobile browsers

## 📜 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Happy coding!** 🚀