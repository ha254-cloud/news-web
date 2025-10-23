// check-for-updates.js
// Add this to your static site to enable client-side update checking

(function() {
  // How often to check for updates (in milliseconds)
  const CHECK_INTERVAL = 3600000; // 1 hour
  
  // When the page loads
  window.addEventListener('DOMContentLoaded', function() {
    // Check if we've checked recently
    const lastCheck = localStorage.getItem('lastUpdateCheck');
    const now = Date.now();
    
    if (!lastCheck || (now - parseInt(lastCheck)) > CHECK_INTERVAL) {
      // Time to check for updates
      checkForNewArticles();
      localStorage.setItem('lastUpdateCheck', now.toString());
    }
  });
  
  // Function to check for new articles
  function checkForNewArticles() {
    // This URL would point to a tiny JSON file on your server that contains 
    // just the latest article timestamp and a "version" number
    fetch('update-info.json?nocache=' + Date.now())
      .then(response => response.json())
      .then(data => {
        // Check if there's a newer version available
        const currentVersion = localStorage.getItem('articlesVersion') || '0';
        
        if (data.version > currentVersion) {
          // Show update notification
          showUpdateNotification();
          
          // Store the new version
          localStorage.setItem('articlesVersion', data.version);
        }
      })
      .catch(err => {
        console.log('Could not check for updates:', err);
      });
  }
  
  // Function to display update notification
  function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-notification-content">
        <p>New articles are available!</p>
        <button onclick="window.location.reload(true)">Refresh Now</button>
        <button class="dismiss" onclick="this.parentElement.parentElement.remove()">Later</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles for the notification
    const style = document.createElement('style');
    style.textContent = `
      .update-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #dc2626;
        color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      }
      
      .update-notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .update-notification p {
        margin: 0;
        font-weight: 500;
      }
      
      .update-notification button {
        background-color: white;
        color: #dc2626;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .update-notification button.dismiss {
        background: none;
        color: white;
        text-decoration: underline;
      }
      
      @keyframes slideIn {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
  }
})();