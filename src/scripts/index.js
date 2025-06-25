import 'regenerator-runtime';
import '../styles/styles.css';

import App from './pages/app';
import OfflineDetector from './utils/offline-detector';
import NotificationHelper from './utils/notification-helper';

import { getToken } from './utils/auth';

const setupSubscriptionButton = async () => {
  const subscribeButton = document.querySelector('#subscribe-button');
  if (!subscribeButton) {
    return;
  }

  const token = getToken();

  if (!token) {
    subscribeButton.style.display = 'inline-block'; 
    subscribeButton.textContent = 'Subscribe';
    subscribeButton.disabled = true;
    subscribeButton.title = 'Silakan login untuk mengaktifkan notifikasi';
    subscribeButton.style.opacity = '0.5';
    subscribeButton.style.cursor = 'not-allowed';
    return;
  }

  subscribeButton.disabled = false;
  subscribeButton.title = '';
  subscribeButton.style.opacity = '1';
  subscribeButton.style.cursor = 'pointer';
  subscribeButton.style.display = 'inline-block';

  const serviceWorkerRegistration = await navigator.serviceWorker.ready;
  const existingSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
  let isSubscribed = existingSubscription !== null;

  const updateButtonUI = () => {
    if (isSubscribed) {
      subscribeButton.textContent = 'Unsubscribe';
    } else {
      subscribeButton.textContent = 'Subscribe';
    }
  };

  updateButtonUI();

  const newButton = subscribeButton.cloneNode(true);
  subscribeButton.parentNode.replaceChild(newButton, subscribeButton);

  newButton.addEventListener('click', async () => {
    newButton.disabled = true;

    // Logika subscribe/unsubscribe
    if (isSubscribed) {
      await NotificationHelper.unsubscribe(token);
    } else {
      try {
        await NotificationHelper.subscribe(token);
      } catch (error) {
        console.log(error.message);
      }
    }

    const newSubscriptionAfterOp = await serviceWorkerRegistration.pushManager.getSubscription();
    isSubscribed = newSubscriptionAfterOp !== null;
    
    if (isSubscribed) {
      newButton.textContent = 'Unsubscribe';
    } else {
      newButton.textContent = 'Subscribe';
    }

    newButton.disabled = false;
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });


  // ===== LOGIKA UNTUK BANNER INSTALL PWA  =====
  let deferredPrompt; 

  const installBanner = document.createElement('div');
  installBanner.id = 'install-banner';
  installBanner.style.display = 'none'; 
  installBanner.innerHTML = `
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #2c3e50; color: white; padding: 1rem; z-index: 1000; display: flex; justify-content: center;">
      <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; width: 100%;">
        <span>Install Banten Storyteller untuk pengalaman lebih baik!</span>
        <div>
          <button id="install-button" style="background: #27ae60; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">Install</button>
          <button id="dismiss-install" style="background: transparent; color: white; border: none; font-size: 1.5rem; cursor: pointer; line-height: 1;">&times;</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(installBanner);

  const installButton = document.getElementById('install-button');
  const dismissButton = document.getElementById('dismiss-install');

  // Fungsi untuk menampilkan banner
  const showInstallPrompt = () => {
    installBanner.style.display = 'block';
  };

  // Fungsi untuk menyembunyikan banner
  const hideInstallPrompt = () => {
    installBanner.style.display = 'none';
  };

  // Fungsi untuk memicu proses instalasi
  const installApp = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Tampilkan prompt instalasi bawaan browser
    deferredPrompt.prompt();
    // Tunggu hasil pilihan pengguna
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    hideInstallPrompt();
  };

  installButton.addEventListener('click', installApp);
  dismissButton.addEventListener('click', hideInstallPrompt);

  // Event listener untuk menangkap event 'beforeinstallprompt'
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
  });

  window.addEventListener('appinstalled', () => {
    console.log('Aplikasi berhasil di-install!');
    hideInstallPrompt();
    deferredPrompt = null;
  });

  // Initialize offline detector
  const offlineDetector = new OfflineDetector();

  const renderContent = async () => {
    await app.renderPage();
    await setupSubscriptionButton();
  };

  window.addEventListener('auth-changed', (event) => {
    if (event.detail && event.detail.success) {
      window.location.hash = '#/';
    }
    
    renderContent();
  });

  window.addEventListener('hashchange', async () => {
    await renderContent();
  });

  await renderContent();

  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-link');
  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    skipLink.blur();
    mainContent.focus();
    mainContent.scrollIntoView();
  });
});