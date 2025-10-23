// Individual article page - displays full rewritten content
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArticleDatabase } from '../../lib/database.js';

export default function ArticlePage({ article, relatedArticles }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!article);

  if (router.isFallback || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Split content into paragraphs for better SEO structure
  const paragraphs = article.content ? article.content.split('\n\n').filter(p => p.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{article.title} - Trending News</title>
        <meta name="description" content={article.summary?.substring(0, 160)} />
        <meta name="keywords" content={article.tags ? article.tags.join(', ') : `${article.country}, ${article.category}, Africa news`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary?.substring(0, 160)} />
        <meta property="og:image" content={article.image} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:modified_time" content={article.updatedAt} />
        <meta property="article:author" content="Trending News" />
        <meta property="article:section" content={article.category} />
        {article.tags && article.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.summary?.substring(0, 160)} />
        <meta name="twitter:image" content={article.image} />
        <link rel="canonical" href={`https://trendingnews.com/article/${article.slug}`} />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-red-600 hover:text-red-700">
              Trending News
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/?category=${article.category}`} className="hover:text-gray-700 capitalize">{article.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{article.title.substring(0, 50)}...</span>
        </nav>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Article Content */}
          <article className="lg:col-span-3 bg-white rounded-lg shadow-sm p-8">
            {/* Article Header */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {article.category}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {article.country}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {article.readingTime || '5 min read'}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>{article.readingTime || '5 min read'}</span>
                </div>
                {article.wordCount && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span>{article.wordCount} words</span>
                  </div>
                )}
              </div>
            </header>

            {/* Content spacing */}
            <div className="mb-8">
            </div>

            {/* Featured Image */}
            {article.image && (
              <figure className="mb-8">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <figcaption className="text-sm text-gray-600 mt-2 text-center italic">
                  {article.title} - Image source: Original publication
                </figcaption>
              </figure>
            )}

            {/* Article Content - Structured for SEO */}
            <div className="prose prose-lg max-w-none">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => {
                  // Insert mid-article ad after 2nd paragraph
                  if (index === 2) {
                    return (
                      <div key={`content-${index}`}>
                        <p className="mb-6 text-gray-800 leading-relaxed text-lg">
                          {paragraph}
                        </p>
                        {/* Content spacing */}
                        <div className="my-8">
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <p key={index} className="mb-6 text-gray-800 leading-relaxed text-lg">
                      {paragraph}
                    </p>
                  );
                })
              ) : (
                <p className="mb-6 text-gray-800 leading-relaxed text-lg">
                  {article.summary || article.content}
                </p>
              )}
            </div>

            {/* Tags Section */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/?search=${encodeURIComponent(tag)}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-gray-500">
                  <p>
                    <span className="font-medium">Original source:</span>{' '}
                    <a 
                      href={article.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View original article
                    </a>
                  </p>
                  <p className="mt-1">Analyzed and rewritten by Trending News editorial team</p>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  <p>Published: {new Date(article.publishedAt).toLocaleDateString()}</p>
                  <p>Last updated: {new Date(article.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </footer>

            {/* Content spacing */}
            <div className="mt-8">
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Sidebar spacing */}
            <div className="mb-8 sticky top-4">
            </div>
          </aside>
        </div>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedArticles.map((related) => (
                <Link 
                  key={related.id} 
                  href={`/article/${related.slug}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  {related.image && (
                    <img 
                      src={related.image} 
                      alt={related.title}
                      className="w-full h-32 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {related.summary}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{related.country}</span>
                    <span>{related.readingTime}</span>
                    <span>{related.views || 0} views</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>←</span>
            Back to All Articles
          </Link>
        </div>
      </main>
    </div>
  );
}

// Server-side rendering for better SEO
export async function getServerSideProps({ params }) {
  try {
    const { slug } = params;
    
    // Extract article ID from slug (everything after the last dash)
    const parts = slug.split('-');
    const articleId = parts[parts.length - 1]; // This is now the full MD5 hash
    
    console.log('Looking for article with ID:', articleId); // Debug log
    
    // Get the main article by ID from our real images database
    const article = await ArticleDatabase.getArticleById(articleId);
    
    if (!article) {
      return {
        notFound: true,
      };
    }

    // Transform article to match expected format
    const transformedArticle = {
      ...article,
      slug: slug,
      summary: article.originalDescription || article.title,
      content: article.aiSummary || article.originalDescription,
      readingTime: article.readingTime || `${Math.ceil((article.aiSummary?.length || 0) / 1000)} min read`,
      rewrittenAt: article.updatedAt,
      tags: article.tags || [article.country, article.category, 'Africa'],
      wordCount: article.wordCount || (article.aiSummary?.split(' ').length || 0)
    };

    // Get related articles (same category or country)
    const relatedResult = await ArticleDatabase.getArticlesByFilters({
      category: article.category,
      limit: 4
    });
    
    const relatedArticles = relatedResult.articles
      .filter(a => a.id !== article.id)
      .slice(0, 4)
      .map(a => ({
        ...a,
        slug: generateSlug(a.title, a.id),
        summary: a.originalDescription || a.title,
        readingTime: a.readingTime || `${Math.ceil((a.aiSummary?.length || 0) / 1000)} min read`,
        tags: a.tags || [a.country, a.category]
      }));

    return {
      props: {
        article: JSON.parse(JSON.stringify(transformedArticle)),
        relatedArticles: JSON.parse(JSON.stringify(relatedArticles))
      },
    };
  } catch (error) {
    console.error('Error loading article:', error);
    return {
      notFound: true,
    };
  }
}

// Helper function to generate slugs
function generateSlug(title, id) {
  if (!title) {
    title = 'untitled-article';
  }
  
  if (!id) {
    id = Date.now().toString();
  }
  
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
  return `${slug}-${id}`; // Use full ID to match API
}