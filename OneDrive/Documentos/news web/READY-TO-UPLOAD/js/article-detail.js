/**
 * Article Detail Page JavaScript
 * Handles loading and displaying individual article content
 */

let currentArticle = null;

document.addEventListener('DOMContentLoaded', function() {
    loadArticleFromUrl();
});

/**
 * Load article based on URL parameters
 */
function loadArticleFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (articleId && window.articleData) {
        const article = window.articleData.find(a => a.id === articleId);
        if (article) {
            displayArticle(article);
            loadRelatedArticles(article);
        } else {
            showArticleNotFound();
        }
    } else {
        showArticleNotFound();
    }
}

/**
 * Display the article content
 */
function displayArticle(article) {
    currentArticle = article;
    
    // Update page title
    document.title = `${article.title} - Trending African News`;
    
    // Update meta information
    document.getElementById('article-category').textContent = article.category;
    document.getElementById('article-date').textContent = formatDate(article.publishedAt);
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-country').textContent = article.country;
    document.getElementById('article-reading-time').textContent = article.readingTime;
    
    // Update image
    const image = document.getElementById('article-image');
    const highResImage = article.image.replace('/240/', '/976/');
    image.src = highResImage;
    image.alt = article.title;
    
    // Update content
    document.getElementById('article-description').textContent = article.description || article.originalDescription;
    
    // Generate full article body
    const articleBody = generateFullArticleContent(article);
    document.getElementById('article-body').innerHTML = articleBody;
    
    // Update tags
    displayTags(article.tags);
    
    // Update source link
    const sourceLink = document.getElementById('original-source');
    sourceLink.href = article.originalUrl;
    sourceLink.textContent = getSourceName(article.originalUrl);
}

/**
 * Generate enhanced full article content
 */
function generateFullArticleContent(article) {
    const sections = [
        {
            title: "Background",
            content: generateBackgroundSection(article)
        },
        {
            title: "Current Developments",
            content: generateCurrentDevelopments(article)
        },
        {
            title: "Regional Impact",
            content: generateRegionalImpact(article)
        },
        {
            title: "Looking Ahead", 
            content: generateLookingAhead(article)
        }
    ];
    
    return sections.map(section => `
        <h3>${section.title}</h3>
        <p>${section.content}</p>
    `).join('');
}

/**
 * Generate background section based on article category and country
 */
function generateBackgroundSection(article) {
    const templates = {
        'Politics': `The political landscape in ${article.country} continues to evolve as ${article.description}. This development reflects broader trends across the African continent, where democratic institutions are being tested and reformed. Political analysts note that such events often have far-reaching implications for governance and civil society in the region.`,
        
        'Health': `Healthcare systems across Africa face numerous challenges, and the situation in ${article.country} highlights these ongoing issues. ${article.description}. This development underscores the critical importance of accessible healthcare infrastructure and the need for sustainable health policies that serve all citizens effectively.`,
        
        'Economy': `Economic developments in ${article.country} are closely watched by international observers and regional partners. ${article.description}. This economic activity reflects the dynamic nature of African markets and their increasing integration with global trade networks and investment flows.`,
        
        'Technology': `Technology adoption across Africa continues to accelerate, with ${article.country} playing a significant role in this digital transformation. ${article.description}. This technological advancement represents the continent's commitment to innovation and its potential to leapfrog traditional development challenges.`,
        
        'Environment': `Environmental concerns in ${article.country} reflect broader sustainability challenges facing the African continent. ${article.description}. This environmental initiative demonstrates the growing awareness of climate change impacts and the need for sustainable development practices across the region.`,
        
        'Sports': `Sports play a vital role in African culture and international recognition, with ${article.country} contributing significantly to this legacy. ${article.description}. This sporting achievement brings pride to the nation and showcases the talent and determination of African athletes on the global stage.`,
        
        'Culture': `Cultural developments in ${article.country} reflect the rich heritage and contemporary evolution of African societies. ${article.description}. This cultural milestone demonstrates the vibrant artistic and social traditions that continue to shape modern African identity and expression.`
    };
    
    return templates[article.category] || `Recent developments in ${article.country} have captured international attention. ${article.description}. This situation reflects the complex dynamics shaping contemporary African societies and their place in the global community.`;
}

/**
 * Generate current developments section
 */
function generateCurrentDevelopments(article) {
    const baseContent = article.description || article.originalDescription;
    return `${baseContent} Local authorities and international observers are closely monitoring the situation as it continues to develop. The response from various stakeholders has been swift, with many calling for transparent dialogue and peaceful resolution of any outstanding issues. These developments are taking place against a backdrop of broader regional cooperation and international engagement with African nations.`;
}

/**
 * Generate regional impact section
 */
function generateRegionalImpact(article) {
    const regionalBodies = {
        'Kenya': 'East African Community (EAC)',
        'Nigeria': 'Economic Community of West African States (ECOWAS)', 
        'South Africa': 'Southern African Development Community (SADC)',
        'Ghana': 'Economic Community of West African States (ECOWAS)',
        'Ethiopia': 'Intergovernmental Authority on Development (IGAD)',
        'Tanzania': 'East African Community (EAC)',
        'Uganda': 'East African Community (EAC)',
        'Rwanda': 'East African Community (EAC)'
    };
    
    const regionalBody = regionalBodies[article.country] || 'African Union (AU)';
    
    return `The implications of these developments extend beyond ${article.country}'s borders, with potential impacts on regional stability and cooperation within the ${regionalBody}. Neighboring countries are watching closely as similar challenges and opportunities exist across the region. Regional partnerships and collaborative approaches are essential for addressing shared challenges and maximizing opportunities for sustainable development and prosperity.`;
}

/**
 * Generate looking ahead section
 */
function generateLookingAhead(article) {
    return `As this situation continues to evolve, stakeholders across ${article.country} and the broader region are focused on constructive solutions and positive outcomes. The international community remains engaged and supportive of efforts to promote peace, prosperity, and sustainable development. These events serve as important milestones in ${article.country}'s ongoing journey toward achieving its development goals and contributing to Africa's collective progress on the global stage.`;
}

/**
 * Display article tags
 */
function displayTags(tags) {
    const tagsContainer = document.getElementById('article-tags');
    if (tags && tags.length > 0) {
        tagsContainer.innerHTML = tags.map(tag => 
            `<span class="article-tag">${tag}</span>`
        ).join('');
    }
}

/**
 * Load related articles based on category and country
 */
function loadRelatedArticles(currentArticle) {
    if (!window.articleData) return;
    
    const relatedArticles = window.articleData
        .filter(article => 
            article.id !== currentArticle.id && 
            (article.category === currentArticle.category || 
             article.country === currentArticle.country)
        )
        .slice(0, 3);
    
    const relatedGrid = document.getElementById('related-articles-grid');
    
    if (relatedArticles.length > 0) {
        relatedGrid.innerHTML = relatedArticles.map(article => createRelatedArticleCard(article)).join('');
        
        // Add click events to related articles
        relatedGrid.querySelectorAll('.related-card').forEach((card, index) => {
            card.addEventListener('click', function() {
                const articleId = relatedArticles[index].id;
                window.location.href = `article.html?id=${articleId}`;
            });
        });
    } else {
        relatedGrid.innerHTML = '<p>No related articles found.</p>';
    }
}

/**
 * Create a related article card
 */
function createRelatedArticleCard(article) {
    const formattedDate = formatDate(article.publishedAt);
    const highResImage = article.image.replace('/240/', '/976/');
    
    return `
        <div class="related-card">
            <div class="related-card-image">
                <img src="${highResImage}" alt="${article.title}">
                <span class="related-card-category">${article.category}</span>
            </div>
            <div class="related-card-content">
                <h4 class="related-card-title">${article.title}</h4>
                <p class="related-card-excerpt">${(article.description || article.originalDescription).substring(0, 120)}...</p>
                <div class="related-card-meta">
                    <span>${article.country}</span>
                    <span>${formattedDate}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Show article not found message
 */
function showArticleNotFound() {
    document.getElementById('article-title').textContent = 'Article Not Found';
    document.getElementById('article-description').textContent = 'The requested article could not be found.';
    document.getElementById('article-body').innerHTML = '<p>Please return to the <a href="index.html">homepage</a> to browse our latest articles.</p>';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Get source name from URL
 */
function getSourceName(url) {
    try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '').replace('.com', '').replace('.org', '').replace('.net', '');
    } catch {
        return 'External Source';
    }
}

/**
 * Social sharing functions
 */
function shareOnTwitter() {
    if (!currentArticle) return;
    const text = encodeURIComponent(`${currentArticle.title} - ${window.location.href}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareOnFacebook() {
    if (!currentArticle) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        // Show feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#28a745';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    });
}