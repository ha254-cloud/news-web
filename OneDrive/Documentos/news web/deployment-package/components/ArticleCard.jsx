import { generateCommentary } from '../utils/commentary';
import Link from 'next/link';

export default function ArticleCard({ article, country, category }) {
  const img = article.image || article.image_url || article.urlToImage || article.thumbnail || '';
  
  // Check if this is a rewritten article (stays on our site) or external
  const isRewritten = article.isRewritten;
  const internalUrl = isRewritten ? article.url : null;
  const externalUrl = !isRewritten ? article.url : null;
  
  // Use our rewritten content or generate commentary for external articles
  const hasRewrittenContent = isRewritten;
  const { commentary, analysis, impact } = hasRewrittenContent 
    ? { commentary: article.description, analysis: '', impact: '' }
    : generateCommentary(article, country, category);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
      
      {/* Image with better aspect ratio and hover effect */}
      <div className="relative overflow-hidden">
        {img ? (
          <img 
            src={img} 
            alt={article.title} 
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📰</div>
              <span className="text-gray-500 text-sm">No image available</span>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        {(category || article.category) && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
              {category || article.category}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {/* Article Title with better typography */}
        <h3 className="font-bold text-xl mb-3 leading-tight">
          {internalUrl ? (
            <Link href={internalUrl} className="text-gray-900 hover:text-red-600 transition-colors line-clamp-2">
              {article.title}
            </Link>
          ) : (
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-red-600 transition-colors line-clamp-2">
              {article.title}
            </a>
          )}
        </h3>
        
        {/* Source and Date - moved up for better hierarchy */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span className="font-medium px-2 py-1 bg-gray-100 rounded">
            {article.source || article.source?.name}
          </span>
          <span>•</span>
          <time dateTime={article.published_at || article.publishedAt || article.published}>
            {new Date(article.published_at || article.publishedAt || article.published).toLocaleDateString()}
          </time>
        </div>
        
        {/* Article Description/Summary */}
        <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
          {article.description && article.description.length > 160 
            ? article.description.substring(0, 160) + '...'
            : article.description
          }
        </p>
        
        {/* Content Preview or Commentary Section */}
        <div className={hasRewrittenContent 
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4" 
          : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4"
        }>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              hasRewrittenContent ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            <h4 className={`text-xs font-semibold uppercase tracking-wide ${
              hasRewrittenContent ? 'text-green-800' : 'text-blue-800'
            }`}>
              {hasRewrittenContent ? 'Full Article Available' : 'Editorial Analysis'}
            </h4>
          </div>
          <p className={`text-sm line-clamp-2 ${
            hasRewrittenContent ? 'text-green-700' : 'text-blue-700'
          }`}>
            {commentary && commentary.length > 130 
              ? commentary.substring(0, 130) + '...'
              : commentary
            }
          </p>
        </div>
        
        {/* Reading Time and Views for Rewritten Articles */}
        {isRewritten && (
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            {article.readingTime && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>{article.readingTime}</span>
              </div>
            )}
            {article.views > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>{article.views} views</span>
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {internalUrl ? (
            <Link 
              href={internalUrl}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors group"
            >
              Read Full Article
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ) : (
            <a 
              href={externalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors group"
            >
              Read Original
              <svg 
                className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                />
              </svg>
            </a>
          )}
          
          {/* Share button placeholder */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}