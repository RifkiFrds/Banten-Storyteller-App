import { getToken } from "../../utils/auth";
import * as DicodingAPI from "../../data/api";

export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model = DicodingAPI }) {
    this.#view = view;
    this.#model = model;
  }

  // Memeriksa status autentikasi pengguna
  checkAuth() {
    const token = getToken();

    if (!token) {
      this.#view.showLoginRequired();
      return false;
    }

    return true;
  }

  // Membuat dan mengirim cerita baru
  async createStory(description, photo, location) {
    const token = getToken();

    if (!token) {
      this.#view.showLoginRequired();
      return false;
    }

    try {
      this.#view.setLoading(true);

      // Memanggil API untuk menambahkan cerita
      const response = await this.#model.addStory({
        description,
        photo,
        lat: location?.lat, 
        lon: location?.lon, 
        token,
      });

      if (response.error) {
        throw new Error(response.message);
      }

      // Menampilkan pesan sukses dan mengarahkan ke halaman utama
      this.#view.showSuccess(
        "Cerita berhasil dibagikan! Mengarahkan ke Beranda..."
      );

      setTimeout(() => {
        window.location.hash = "#/";
      }, 2000);

      return true;
    } catch (error) {
      console.error("createStory: error:", error);
      this.#view.showError(
        error.message || "Gagal membagikan cerita. Mohon coba lagi."
      );
      return false;
    } finally {
      this.#view.setLoading(false);
    }
  }

  // Memvalidasi data formulir sebelum pengiriman
  validateFormData(description, imageFile) {
    if (!imageFile) {
      this.#view.showError("Mohon ambil foto atau unggah gambar.");
      return false;
    }

    if (!description.trim()) {
      this.#view.showError("Mohon masukkan deskripsi cerita.");
      return false;
    }

    return true;
  }
}