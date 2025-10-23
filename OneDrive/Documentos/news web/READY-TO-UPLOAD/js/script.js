/**
 * Trending News Site JavaScript
 * This file contains all the interactive functionality for the news site.
 */


// Wait for the DOM to be fully loaded and fetch articles
window.addEventListener("DOMContentLoaded", loadArticles);

async function loadArticles() {
    try {
        console.log("Fetching live rewritten articles...");
        const response = await fetch("https://news-web-989r.onrender.com/api/articles");
        const articles = await response.json();
        if (Array.isArray(articles) && articles.length > 0) {
            renderArticles(articles);
        } else {
            console.error("No articles found in API response.");
        }
    } catch (error) {
        console.error("Error fetching articles:", error);
    }
}

function renderArticles(articles) {
    const container = document.getElementById("articles-container");
    if (!container) {
        console.error('Articles container not found');
        return;
    }
    container.innerHTML = "";
    articles.forEach(article => {
        const card = document.createElement("div");
        card.classList.add("article-card");
        card.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="article-image" />
            <h2>${article.title}</h2>
            <p>${article.summary || ""}</p>
            <a href="${article.url}" target="_blank">Read more</a>
        `;
        container.appendChild(card);
    });
}

/**
 * Create an article card DOM element
 */
function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    
    // Format the date
    const publishDate = new Date(article.publishedAt);
    const formattedDate = publishDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create card content
    card.innerHTML = `
        <div class="article-image">
            <img src="${article.image.replace('/240/', '/976/')}" alt="${article.title}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg width=\'400\' height=\'250\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'400\' height=\'250\' fill=\'%23e0e0e0\'/%3E%3C/svg%3E'; this.classList.add('placeholder-img');">
            <span class="article-category">${article.category}</span>
        </div>
        <div class="article-content">
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.description || article.originalDescription}</p>
            <div class="article-meta">
                <span>${article.country}</span>
                <span>${formattedDate}</span>
                <span>${article.readingTime}</span>
            </div>
        </div>
    `;
    
    // Add click event to the card
    card.addEventListener('click', function() {
        window.location.href = `article.html?id=${article.id}`;
    });
    
    return card;
}

/**
 * Set up the search functionality
 */
function setupSearchFunctionality() {
    const searchForm = document.querySelector('.search-controls');
    const searchInput = document.querySelector('.search-controls input');
    const countrySelect = document.querySelector('.search-controls select:first-of-type');
    const categorySelect = document.querySelector('.search-controls select:last-of-type');
    const searchButton = document.querySelector('.search-controls button');
    
    if (!searchButton) return;
    
    searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    // Add enter key support for search input
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
    
    // Show all stories button functionality
    const showAllButton = document.querySelector('.no-results button');
    if (showAllButton) {
        showAllButton.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            if (countrySelect) countrySelect.value = '';
            if (categorySelect) categorySelect.value = '';
            performSearch();
        });
    }
    
    // Perform the search based on input values
    function performSearch() {
        const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const countryValue = countrySelect ? countrySelect.value : '';
        const categoryValue = categorySelect ? categorySelect.value : '';
        
        console.log('Searching for:', {
            query: searchValue,
            country: countryValue,
            category: categoryValue
        });
        
        const resultsContainer = document.querySelector('.news-grid');
        if (!resultsContainer) return;
        
        // Clear the container
        resultsContainer.innerHTML = '';
        
        // Filter the articles
        let filteredArticles = window.articleData || [];
        
        if (searchValue) {
            filteredArticles = filteredArticles.filter(article => 
                article.title.toLowerCase().includes(searchValue) || 
                (article.description || article.originalDescription).toLowerCase().includes(searchValue) ||
                (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchValue)))
            );
        }
        
        if (countryValue && countryValue !== '') {
            filteredArticles = filteredArticles.filter(article => 
                article.country === countryValue
            );
        }
        
        if (categoryValue && categoryValue !== '') {
            filteredArticles = filteredArticles.filter(article => 
                article.category === categoryValue
            );
        }
        
        // Display filtered results or no results message
        if (filteredArticles.length > 0) {
            filteredArticles.forEach(article => {
                const articleCard = createArticleCard(article);
                resultsContainer.appendChild(articleCard);
            });
        } else {
            resultsContainer.innerHTML = generateNoResultsHTML();
            
            // Re-attach event listener to the show all button
            const showAllButton = document.querySelector('.no-results button');
            if (showAllButton) {
                showAllButton.addEventListener('click', function() {
                    if (searchInput) searchInput.value = '';
                    if (countrySelect) countrySelect.value = '';
                    if (categorySelect) categorySelect.value = '';
                    loadRealArticles();
                });
            }
        }
    }
}

/**
 * Set up pagination controls
 */
function setupPaginationControls() {
    const prevButton = document.querySelector('.pagination-inner button:first-child');
    const nextButton = document.querySelector('.pagination-inner button:last-child');
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (!this.disabled) {
                console.log('Navigate to previous page');
                // In a real implementation, this would load the previous page
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (!this.disabled) {
                console.log('Navigate to next page');
                // In a real implementation, this would load the next page
            }
        });
    }
}

/**
 * Set up the subscription form
 */
function setupSubscribeForm() {
    const subscribeForm = document.querySelector('.subscribe-form');
    const emailInput = document.querySelector('.subscribe-form input');
    const subscribeButton = document.querySelector('.subscribe-form button');
    
    if (!subscribeForm || !subscribeButton) return;
    
    subscribeButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = emailInput ? emailInput.value.trim() : '';
        if (!email || !isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // In a real implementation, this would make an API request to save the email
        console.log('Subscribing email:', email);
        
        // Show success message
        if (emailInput) emailInput.value = '';
        alert('Thank you for subscribing to our newsletter!');
    });
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

/**
 * Set up the contact form
 */
function setupContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = contactForm.querySelector('#name').value.trim();
        const email = contactForm.querySelector('#email').value.trim();
        const subject = contactForm.querySelector('#subject').value.trim();
        const message = contactForm.querySelector('#message').value.trim();
        
        // Validate form
        if (!name || !email || !subject || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // In a real implementation, this would make an API request to send the message
        console.log('Contact form submission:', { name, email, subject, message });
        
        // Show success message and reset form
        alert('Your message has been sent. We will get back to you soon!');
        contactForm.reset();
    });
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

/**
 * Highlight the active navigation link based on the current page
 */
function highlightActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        // Remove any existing active class
        link.classList.remove('active');
        
        // Get the href attribute and normalize it
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Determine if this link is for the current page
        if (currentPath === '/' && href === 'index.html') {
            link.classList.add('active');
        } else if (currentPath.includes(href) && href !== 'index.html') {
            link.classList.add('active');
        }
    });
}

/**
 * Load featured articles for the featured section
 */
function loadFeaturedArticles() {
    const featuredContainer = document.querySelector('.featured-grid');
    if (!featuredContainer || !window.articleData) return;
    
    // Take the first 3 articles for featured display
    const featuredArticles = window.articleData.slice(0, 3);
    
    featuredContainer.innerHTML = '';
    
    featuredArticles.forEach(article => {
        const featuredCard = document.createElement('div');
        featuredCard.className = 'featured-card';
        
        // Format the date
        const publishDate = new Date(article.publishedAt);
        const formattedDate = publishDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        featuredCard.innerHTML = `
            <div class="featured-image">
                <img src="${article.image.replace('/240/', '/976/')}" alt="${article.title}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg width=\'400\' height=\'250\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'400\' height=\'250\' fill=\'%23e0e0e0\'/%3E%3C/svg%3E'; this.classList.add('placeholder-img');">
                <span class="featured-category">${article.category}</span>
            </div>
            <div class="featured-content">
                <h3 class="featured-title">${article.title}</h3>
                <p class="featured-excerpt">${article.description || article.originalDescription}</p>
                <div class="featured-meta">
                    <span>${article.country}</span>
                    <span>${formattedDate}</span>
                </div>
            </div>
        `;
        
        // Add click event to the card
        featuredCard.addEventListener('click', function() {
            window.location.href = `article.html?id=${article.id}`;
        });
        
        featuredContainer.appendChild(featuredCard);
    });
}

/**
 * Set up category filter buttons
 */
function setupCategoryFilters() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            // Set the category filter in the search section
            const categorySelect = document.querySelector('.search-controls select:last-of-type');
            if (categorySelect) {
                categorySelect.value = category;
            }
            
            // Trigger the search
            const searchButton = document.querySelector('.search-controls button');
            if (searchButton) {
                searchButton.click();
            }
            
            // Scroll to results
            const contentSection = document.querySelector('.content-section');
            if (contentSection) {
                contentSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Fetch articles from the API
fetch('https://news-web-989r.onrender.com/african-news?refresh=true')
  .then(response => response.json())
  .then(data => {
    window.articleData = data.articles;
    loadRealArticles();
    loadFeaturedArticles();
  })
  .catch(error => {
    console.error('Error fetching articles:', error);
  });