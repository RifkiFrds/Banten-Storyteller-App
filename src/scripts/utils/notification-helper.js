import { subscribeNotification, unsubscribeNotification } from '../data/api'; 

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
  async subscribe(token) {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('Browser tidak mendukung notifikasi.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Izin notifikasi tidak diberikan oleh pengguna.');
      throw new Error('Izin notifikasi ditolak.'); 
    }

     await this._subscribeToPushManager(token);
  },
 async _subscribeToPushManager(token) {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    let subscription = await serviceWorkerRegistration.pushManager.getSubscription();

    if (subscription) {
      console.log('Pengguna sudah berlangganan.');
      return;
    }

    try {
      subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUSH_API_SERVER_KEY),
      });
      
      console.log('Berhasil berlangganan di browser, mengirim ke server...');
      // IMPLEMENTASI TODO: Kirim subscription ke server
      await subscribeNotification({
        subscription: subscription.toJSON(), // Kirim objek subscription
        token, // Kirim token untuk otentikasi
      });
      console.log('Berhasil mengirim subscription ke server.');

    } catch (error) {
      console.error('Gagal berlangganan push notification:', error);
      // Jika gagal, langsung batalkan subscription di browser
      if (subscription) {
        await subscription.unsubscribe();
      }
      throw error;
    }
  },

  // Tambahkan parameter 'token' untuk otentikasi
  async unsubscribe(token) {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();

    if (!subscription) {
      console.log('Tidak ada langganan yang aktif.');
      return;
    }

    const endpoint = subscription.endpoint;

    try {
      const successful = await subscription.unsubscribe();
      if (successful) {
        console.log('Berhasil berhenti berlangganan dari browser, mengirim ke server...');
        await unsubscribeNotification({
          endpoint, // Gunakan endpoint yang sudah disimpan
          token,
        });
        console.log('Berhasil mengirim notifikasi unsubscribe ke server.');
      }
    } catch (error) {
      console.error('Gagal berhenti berlangganan:', error);
      throw error;
    }
  },
};

export default NotificationHelper;