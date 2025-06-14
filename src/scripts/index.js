import 'regenerator-runtime'; // Ingat, jika ada error build, jalankan: npm install regenerator-runtime
import '../styles/styles.css';

import App from './pages/app';
import swRegister from './utils/sw-register';
import NotificationHelper from './utils/notification-helper';

// --- FUNGSI BARU UNTUK MENGATUR TOMBOL ---
const setupSubscriptionButton = async () => {
  const subscribeButton = document.querySelector('#subscribe-button');
  if (!subscribeButton) return; // Keluar jika tombol tidak ada

  // 1. Cek status langganan saat ini
  const serviceWorkerRegistration = await navigator.serviceWorker.ready;
  const existingSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
  let isSubscribed = existingSubscription !== null;

  // 2. Fungsi untuk memperbarui tampilan tombol
  const updateButtonUI = () => {
    if (isSubscribed) {
      subscribeButton.textContent = 'Batal Langganan';
    } else {
      subscribeButton.textContent = 'Langganan Notifikasi';
    }
  };

  // 3. Atur tampilan tombol pertama kali
  updateButtonUI();

  // 4. Tambahkan event listener yang cerdas
  subscribeButton.addEventListener('click', async (event) => {
    event.preventDefault();
    
    // Nonaktifkan tombol sementara untuk mencegah klik ganda
    subscribeButton.disabled = true;

    if (isSubscribed) {
      // Jika sudah langganan, jalankan unsubscribe
      await NotificationHelper.unsubscribe();
    } else {
      // Jika belum, jalankan proses subscribe
      await NotificationHelper.askPermission();
    }
    
    // Cek ulang status setelah aksi dan perbarui UI
    const newSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
    isSubscribed = newSubscription !== null;
    updateButtonUI();

    // Aktifkan kembali tombolnya
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

  // "skip to content"
  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-link');
  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    skipLink.blur();
    mainContent.focus();
    mainContent.scrollIntoView();
  });
  
  // Daftarkan service worker, lalu atur tombol langganan
  await swRegister();
  await setupSubscriptionButton(); // Panggil fungsi baru kita di sini
});