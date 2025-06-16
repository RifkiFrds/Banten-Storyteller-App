import 'regenerator-runtime';
import '../styles/styles.css';

import App from './pages/app';
import swRegister from './utils/sw-register';
import NotificationHelper from './utils/notification-helper';

const setupSubscriptionButton = async () => {
  const subscribeButton = document.querySelector('#subscribe-button');
  if (!subscribeButton) return;

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

  subscribeButton.addEventListener('click', async () => {
    subscribeButton.disabled = true;

    if (isSubscribed) {
      await NotificationHelper.unsubscribe();
    } else {
      try {
        await NotificationHelper.subscribe();
      } catch (error) {
        console.log(error.message);
      }
    }
    
    const newSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
    isSubscribed = newSubscription !== null;
    updateButtonUI();

    subscribeButton.disabled = false;
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-link');
  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    skipLink.blur();
    mainContent.focus();
    mainContent.scrollIntoView();
  });

  await swRegister();
  await setupSubscriptionButton();
});