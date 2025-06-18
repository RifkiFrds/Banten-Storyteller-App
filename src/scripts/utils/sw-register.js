class ServiceWorkerRegister {
  constructor() {
    this.deferredPrompt = null;
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOnlineOfflineHandlers();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      console.log('App was installed');
      this.hideInstallPrompt();
      this.deferredPrompt = null;
    });
  }

  showInstallPrompt() {
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.innerHTML = `
      <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #2c3e50; color: white; padding: 1rem; z-index: 1000;">
        <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
          <span>Install Banten Storyteller for a better experience</span>
          <div>
            <button id="install-button" style="background: #27ae60; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">Install App</button>
            <button id="dismiss-install" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.5rem; border-radius: 4px; cursor: pointer;">✕</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(installBanner);

    document.getElementById('install-button').addEventListener('click', () => {
      this.installApp();
    });

    document.getElementById('dismiss-install').addEventListener('click', () => {
      this.hideInstallPrompt();
    });
  }

  hideInstallPrompt() {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.remove();
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    this.deferredPrompt = null;
    this.hideInstallPrompt();
  }

  setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      this.showStatusMessage('You are back online!', 'online');
    });

    window.addEventListener('offline', () => {
      this.showStatusMessage('You are currently offline. Some features may be limited.', 'offline');
    });

    if (!navigator.onLine) {
      this.showStatusMessage('You are currently offline. Some features may be limited.', 'offline');
    }
  }

  showStatusMessage(message, type) {
    const statusDiv = document.createElement('div');
    statusDiv.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; background: ${type === 'online' ? '#27ae60' : '#e74c3c'}; color: white; padding: 0.75rem; z-index: 1001;">
        <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
          <span>${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; color: white; border: none; cursor: pointer;">✕</button>
        </div>
      </div>
    `;
    document.body.appendChild(statusDiv);

    if (type === 'online') {
      setTimeout(() => {
        if (statusDiv.parentNode) {
          statusDiv.remove();
        }
      }, 3000);
    }
  }
}

export default ServiceWorkerRegister;
