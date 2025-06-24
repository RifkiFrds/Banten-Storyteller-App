import 'regenerator-runtime';
import '../styles/styles.css';

import App from './pages/app';
import swRegister from './utils/sw-register';
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

  await new swRegister();

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