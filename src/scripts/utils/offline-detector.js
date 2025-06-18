class OfflineDetector {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkInitialStatus();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'OFFLINE_STATUS') {
          this.updateOfflineStatus(event.data.isOffline);
        }
      });
    }
  }

  checkInitialStatus() {
    if (!this.isOnline) {
      this.handleOffline();
    }
  }

  handleOnline() {
    this.isOnline = true;
    this.showOnlineNotification();
    this.processOfflineQueue();
    this.updateUI();
  }

  handleOffline() {
    this.isOnline = false;
    this.showOfflineNotification();
    this.updateUI();
  }

  updateOfflineStatus(isOffline) {
    if (isOffline !== this.isOnline) {
      if (isOffline) {
        this.handleOffline();
      } else {
        this.handleOnline();
      }
    }
  }

  showOnlineNotification() {
    this.showNotification('You are back online!', 'online');
  }

  showOfflineNotification() {
    this.showNotification('You are currently offline. Some features may be limited.', 'offline');
  }

  showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.offline-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `offline-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add styles if not already present
    if (!document.getElementById('offline-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'offline-notification-styles';
      style.textContent = `
        .offline-notification {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 0.75rem;
          transform: translateY(-100%);
          transition: transform 0.3s ease-in-out;
        }
        
        .offline-notification.show {
          transform: translateY(0);
        }
        
        .offline-notification.online {
          background: #27ae60;
          color: white;
        }
        
        .offline-notification.offline {
          background: #e74c3c;
          color: white;
        }
        
        .notification-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .notification-close {
          background: transparent;
          color: white;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .notification-close:hover {
          background: rgba(255,255,255,0.2);
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Show with animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto-hide online notifications
    if (type === 'online') {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.classList.remove('show');
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 300);
        }
      }, 3000);
    }
  }

  updateUI() {
    // Update any UI elements that depend on online status
    const offlineElements = document.querySelectorAll('[data-offline-only]');
    const onlineElements = document.querySelectorAll('[data-online-only]');

    offlineElements.forEach(element => {
      element.style.display = this.isOnline ? 'none' : 'block';
    });

    onlineElements.forEach(element => {
      element.style.display = this.isOnline ? 'block' : 'none';
    });

    // Update form submit buttons
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => {
      if (!this.isOnline) {
        button.disabled = true;
        button.title = 'Cannot submit while offline';
      } else {
        button.disabled = false;
        button.title = '';
      }
    });
  }

  addToOfflineQueue(action) {
    this.offlineQueue.push(action);
    this.saveOfflineQueue();
  }

  processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    console.log('Processing offline queue...');
    
    // Process queued actions
    this.offlineQueue.forEach((action, index) => {
      try {
        // Attempt to process the action
        this.processAction(action);
        // Remove from queue if successful
        this.offlineQueue.splice(index, 1);
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    });

    this.saveOfflineQueue();
  }

  processAction(action) {
    // Implement action processing logic here
    // This could include retrying API calls, syncing data, etc.
    console.log('Processing action:', action);
  }

  saveOfflineQueue() {
    try {
      localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  loadOfflineQueue() {
    try {
      const saved = localStorage.getItem('offlineQueue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  // Check if a specific resource is available offline
  async isResourceAvailableOffline(url) {
    if (this.isOnline) return true;

    try {
      const cache = await caches.open('app-shell-v1');
      const response = await cache.match(url);
      return response !== undefined;
    } catch (error) {
      console.error('Error checking offline resource:', error);
      return false;
    }
  }

  // Get current online status
  getOnlineStatus() {
    return this.isOnline;
  }

  // Force refresh when back online
  refreshWhenOnline() {
    if (this.isOnline) {
      window.location.reload();
    } else {
      // Wait for online event
      const handleOnline = () => {
        window.location.reload();
        window.removeEventListener('online', handleOnline);
      };
      window.addEventListener('online', handleOnline);
    }
  }
}

export default OfflineDetector; 