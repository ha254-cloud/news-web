import { generateCommentary } from '../utils/commentary';

export default function ArticleCard({ article, country, category }) {
  const img = article.image || article.image_url || article.urlToImage || article.thumbnail || '';
  
  // Generate original commentary for this article
  const { commentary, analysis, impact } = generateCommentary(article, country, category);
  
  return (
    <div className="block border rounded-lg overflow-hidden hover:shadow-lg bg-white transition-shadow">
      {img ? (
        <img src={img} alt={article.title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-sm">No image</span>
        </div>
      )}
      
      <div className="p-4">
        {/* Article Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-blue-600">
            {article.title}
          </a>
        </h3>
        
        {/* Original Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{article.description}</p>
        
        {/* Original Commentary Section */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
          <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Editorial Analysis</h4>
          <p className="text-sm text-blue-700 mb-2">{commentary}</p>
          <p className="text-xs text-blue-600">{analysis}</p>
        </div>
        
        {/* Source and Date */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
          <span className="font-medium">{article.source || article.source?.name}</span>
          <time dateTime={article.published_at || article.publishedAt || article.published}>
            {new Date(article.published_at || article.publishedAt || article.published).toLocaleDateString()}
          </time>
        </div>
        
        {/* Read More Button */}
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          Read full article
          <svg 
            className="ml-1 w-4 h-4" 
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
      </div>
    </div>
  );
}