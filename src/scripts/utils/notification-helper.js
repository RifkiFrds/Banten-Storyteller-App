const PUSH_API_SERVER_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const NotificationHelper = {
  // Menggabungkan permintaan izin dan subscribe 
  async subscribe() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('Browser tidak mendukung notifikasi.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Izin notifikasi tidak diberikan oleh pengguna.');
      throw new Error('Izin notifikasi ditolak.'); 
    }

    await this._subscribeToPushManager();
  },

  // Fungsi internal untuk menangani logika subscription
  async _subscribeToPushManager() {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    let subscription = await serviceWorkerRegistration.pushManager.getSubscription();

    if (subscription) {
      console.log('Pengguna sudah berlangganan:', subscription.toJSON());
      return; // Keluar jika sudah ada subscription
    }

    try {
      console.log('Membuat langganan baru...');
      subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUSH_API_SERVER_KEY),
      });
      console.log('Berhasil berlangganan:', subscription.toJSON());
      // TODO: Kirim subscription ke server Anda di sini
    } catch (error) {
      console.error('Gagal berlangganan push notification:', error);
      throw error;
    }
  },

  // Fungsi untuk berhenti berlangganan
  async unsubscribe() {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();

    if (!subscription) {
      console.log('Tidak ada langganan yang aktif untuk dibatalkan.');
      return;
    }

    try {
      const successful = await subscription.unsubscribe();
      if (successful) {
        console.log('Berhasil berhenti berlangganan.');
        // TODO: Kirim pemberitahuan ke server Anda untuk menghapus subscription
      }
    } catch (error) {
      console.error('Gagal berhenti berlangganan:', error);
      throw error;
    }
  },
};

export default NotificationHelper;