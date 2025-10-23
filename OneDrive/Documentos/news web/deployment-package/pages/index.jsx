import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Head from 'next/head';
import ArticleCard from '../components/ArticleCard';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [q, setQ] = useState('');
  const [country, setCountry] = useState(''); // Show all countries by default
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [autoFetching, setAutoFetching] = useState(false);

  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || 'Trending News';

  // Auto-fetch fresh news in background every 30 minutes
  useEffect(() => {
    const autoFetchNews = async () => {
      try {
        setAutoFetching(true);
        
        // Check if we need fresh content (if database is empty or old)
        const stats = await axios.get('/api/rewritten-news', {
          params: { source: 'rewritten', pageSize: 1 }
        });
        
        const hasRecentContent = stats.data.articles && stats.data.articles.length > 0;
        
        if (!hasRecentContent) {
          console.log('No recent content found, triggering auto-fetch...');
          await axios.post('/api/auto-fetch');
          console.log('Auto-fetch completed');
          
          // Refresh the articles after auto-fetch
          fetchNews();
        }
      } catch (error) {
        console.error('Auto-fetch error:', error);
      } finally {
        setAutoFetching(false);
      }
    };

    // Run immediately on load
    autoFetchNews();
    
    // Set up interval to run every 30 minutes
    const interval = setInterval(autoFetchNews, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  async function fetchNews() {
    setLoading(true);
    try {
      console.log('Fetching news with params:', { q, country, category, page });
      
      // Always try to get rewritten articles first
      let res = await axios.get('/api/rewritten-news', {
        params: { q, country, category, page, pageSize: 12, source: 'rewritten' }
      });
      
      let data = res.data.articles || [];
      
      // If no rewritten articles found, automatically fetch fresh news and rewrite
      if (data.length === 0) {
        console.log('No rewritten articles found, fetching fresh news...');
        res = await axios.get('/api/rewritten-news', {
          params: { q, country, category, page, pageSize: 12, source: 'fresh' }
        });
        data = res.data.articles || [];
      }
      
      console.log('Articles found:', data.length);
      setArticles(data);
      
    } catch (e) {
      console.error('Error fetching news:', e);
      alert('Failed to load news: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNews(); }, [q, country, category, page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content="Trending African news stories with analysis and insights from across the continent" />
        <meta name="keywords" content="trending news, Africa news, Kenya news, Nigeria news, South Africa news, African politics, African business" />
      </Head>

      {/* Header with Navigation */}
      <header className="navbar">
        <Link href="/" className="brand-logo-container">
          <img src="/logo.jpg" alt="Trending News" className="brand-logo-img" />
          <span className="brand-text">{siteTitle}</span>
        </Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link active">Home</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </nav>
      </header>

      {/* Advertisement Space */}
      <section className="ad-banner-section">
        <div className="container">
          <div className="ad-banner-placeholder">
            {/* AdSense Banner Ad (728x90 or 970x250) */}
            <div className="ad-content">
              <span className="ad-label">Advertisement</span>
              <div className="ad-space">
                {/* AdSense code will go here */}
              </div>
            </div>
          </div>
          {autoFetching && (
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Updating content...</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Search and Filters Section */}
        <div className="py-4 bg-white mx-4 rounded-lg shadow-sm border relative z-10" style={{marginTop: '20px'}}>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Find Your Stories</h2>
            <div className="flex gap-2 flex-wrap">
              <input 
                value={q} 
                onChange={e=>setQ(e.target.value)} 
                placeholder="Search news..." 
                className="p-2 border rounded-lg flex-1 min-w-[200px] focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              />
              <select 
                value={country} 
                onChange={e=>setCountry(e.target.value)} 
                className="p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Countries</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="Uganda">Uganda</option>
                <option value="Africa">Africa</option>
              </select>
              <select 
                value={category} 
                onChange={e=>setCategory(e.target.value)} 
                className="p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Categories</option>
                <option value="Politics">Politics</option>
                <option value="Health">Health</option>
                <option value="Environment">Environment</option>
                <option value="Education">Education</option>
                <option value="Economy">Economy</option>
              </select>
              <button 
                onClick={()=>setPage(1)} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <section className="pt-8 pb-8">
          {/* Articles Grid with AdSense-Optimized Spacing */}
          <main className="space-y-12">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading trending stories...</p>
                </div>
              </div>
            ) : articles.length ? (
              <>
                {/* First Row of Articles (1-3) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.slice(0, 3).map((a, i) => (
                    <div key={i} className="p-4">
                      <ArticleCard 
                        article={a} 
                        country={country} 
                        category={category} 
                      />
                    </div>
                  ))}
                </div>

                {/* First Ad Space */}
                {articles.length > 3 && (
                  <div className="ad-slot">
                    {/* Google AdSense Code will go here */}
                  </div>
                )}

                {/* Second Row of Articles (4-9) */}
                {articles.length > 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.slice(3, 9).map((a, i) => (
                      <div key={i + 3} className="p-4">
                        <ArticleCard 
                          article={a} 
                          country={country} 
                          category={category} 
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Second Ad Space */}
                {articles.length > 9 && (
                  <div className="ad-slot-large">
                    {/* Google AdSense Code will go here */}
                  </div>
                )}

                {/* Remaining Articles */}
                {articles.length > 9 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.slice(9).map((a, i) => (
                      <div key={i + 9} className="p-4">
                        <ArticleCard 
                          article={a} 
                          country={country} 
                          category={category} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search terms or filters to find more stories.</p>
                <button 
                  onClick={() => {setQ(''); setCountry(''); setCategory(''); setPage(1);}}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Show All Stories
                </button>
              </div>
            )}
          </main>
        </section>

        {/* Pagination Section */}
        <div className="flex justify-center py-12 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={()=>setPage(p=>Math.max(1,p-1))} 
              disabled={page === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium">Page {page}</span>
            <button 
              onClick={()=>setPage(p=>p+1)} 
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Newsletter Signup Section */}
        <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600 -mx-6 px-6 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 text-red-100">
              Get the latest African news and analysis delivered to your inbox
            </p>
            <div className="flex max-w-md mx-auto gap-3">
              <input 
                type="email" 
                placeholder="Enter your email..." 
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
              />
              <button className="px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-red-200 mt-3">
              Join thousands of readers who trust us for African news insights
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">{siteTitle}</h3>
              <p className="text-sm text-gray-600">
                Your trusted source for African news and insights from across the continent.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="text-gray-600 hover:text-gray-900">Disclaimer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>editor@trendingnews.com</li>
                <li>partnerships@trendingnews.com</li>
                <li>support@trendingnews.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center">
            <p className="text-sm text-gray-600">
              © 2025 Trending News. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}