const PUSH_API_SERVER_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const NotificationHelper = {
  // Meminta izin kepada pengguna untuk menampilkan notifikasi
  async askPermission() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Izin notifikasi diberikan.');
        this._subscribeToPushManager();
      } else {
        console.log('Izin notifikasi tidak diberikan.');
      }
    }
  },

  // push subscription
  async _subscribeToPushManager() {
    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      let subscription = await serviceWorkerRegistration.pushManager.getSubscription();

      if (!subscription) {
        console.log('Belum berlangganan, membuat langganan baru...');
        subscription = await serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUSH_API_SERVER_KEY),
        });
        console.log('Berhasil berlangganan:', subscription.toJSON());

      } else {
        console.log('Sudah berlangganan:', subscription.toJSON());
      }
    } catch (error) {
      console.error('Gagal berlangganan push notification:', error);
    }
  },

  // === FUNGSI BARU UNTUK BERHENTI BERLANGGANAN ===
  async unsubscribe() {
    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      const subscription = await serviceWorkerRegistration.pushManager.getSubscription();

      if (subscription) {
        const successful = await subscription.unsubscribe();
        if (successful) {
          console.log('Berhasil berhenti berlangganan.');
          this._showUnsubscriptionSuccessNotification(serviceWorkerRegistration);
        }
      }
    } catch (error) {
      console.error('Gagal berhenti berlangganan:', error);
    }
  },

  // push UNSUBSCRIBE 
  _showUnsubscriptionSuccessNotification(serviceWorkerRegistration) {
    const options = {
      body: 'Anda telah berhenti berlangganan notifikasi.',
      icon: '/icons/icon-192x192.png',
    };
    serviceWorkerRegistration.showNotification('Langganan Dibatalkan', options);
  },
};

export default NotificationHelper;