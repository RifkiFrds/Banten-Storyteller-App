self.addEventListener('push', (event) => {
  console.log('Service Worker: Menerima Push Notification...');

  let notificationData;
  try {
    // Coba parse data push sebagai JSON
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Notifikasi Baru',
      options: {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png', // Ganti dengan path ikon Anda
      },
    };
  }

  // Schema notifikasi yang diharapkan dari API
  const { title, options } = notificationData;

  // Opsi default jika tidak ada dari server
  const defaultOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
  };

  const notificationOptions = { ...defaultOptions, ...options };

  // Menampilkan notifikasi
  const showNotificationPromise = self.registration.showNotification(title, notificationOptions);

  event.waitUntil(showNotificationPromise);
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notifikasi diklik.');

  // Menutup notifikasi yang diklik
  event.notification.close();

  // Membuka aplikasi/window baru ketika notifikasi diklik
  const openPromise = clients.openWindow('/'); // Buka halaman utama
  event.waitUntil(openPromise);
});