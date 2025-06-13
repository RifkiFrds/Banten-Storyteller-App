/**
 * Memformat string tanggal ke format yang lebih mudah dibaca.
 * @param {string} date - String tanggal yang akan diformat.
 * @returns {string} String tanggal yang diformat (contoh: "January 1, 2023").
 */
export function showFormattedDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-US", options);
}

/**
 * Menerapkan animasi transisi halaman.
 * @param {Function} updateCallback - Fungsi untuk memperbarui DOM.
 * @param {string} animationType - Jenis animasi yang akan diterapkan ('fade', 'slide', 'zoom').
 */
export async function applyPageTransition(
  updateCallback,
  animationType = "fade"
) {
  // Memeriksa apakah browser mendukung View Transitions API
  if (document.startViewTransition) {
    try {
      // Menerapkan animasi berdasarkan jenis yang diminta
      document.documentElement.dataset.transitionType = animationType;

      // Memulai transisi tampilan
      const transition = document.startViewTransition(() => {
        updateCallback();
      });

      // Menunggu hingga transisi selesai
      await transition.finished;

      // Membersihkan atribut
      delete document.documentElement.dataset.transitionType;
    } catch (error) {
      console.error("Terjadi kesalahan selama transisi tampilan:", error);
      // Fallback jika transisi gagal
      updateCallback();
    }
  } else {
    // Fallback untuk browser yang tidak mendukung View Transitions API
    updateCallback();
  }
}

/**
 * Menambahkan kelas CSS untuk memicu animasi pada sebuah elemen.
 * @param {HTMLElement} element - Elemen yang akan dianimasikan.
 * @param {string} animationClass - Kelas CSS yang mendefinisikan animasi.
 * @param {number} duration - Durasi animasi dalam milidetik.
 */
export function animateElement(element, animationClass, duration = 500) {
  if (!element) return;

  element.classList.add(animationClass);

  // Menghapus kelas setelah animasi selesai
  setTimeout(() => {
    element.classList.remove(animationClass);
  }, duration);
}

/**
 * Menjeda eksekusi untuk waktu yang ditentukan.
 * @param {number} time - Waktu jeda dalam milidetik.
 * @returns {Promise<void>} Sebuah Promise yang akan selesai setelah waktu yang ditentukan.
 */
export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}