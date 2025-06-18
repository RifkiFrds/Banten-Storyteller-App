import { saveAuth } from '../../utils/auth';
import * as DicodingAPI from '../../data/api';

export default class LoginPresenter {
  #view;
  #model;

  constructor({ view, model = DicodingAPI }) {
    this.#view = view;
    this.#model = model;
  }

  async login(email, password) {
    try {
      this.#view.setLoading(true);

      const response = await this.#model.loginUser({ email, password });

      if (response.error) {
        throw new Error(response.message);
      }

      // 1. Simpan data otentikasi (termasuk token)
      saveAuth(response);

      // 2. Tampilkan pesan sukses kepada pengguna
      this.#view.showSuccess('Login berhasil!');

      // 3. Kirim sinyal 'auth-changed' yang jelas bahwa login SUKSES
      //    Hanya satu dispatchEvent yang diperlukan.
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { success: true } }));

      return true;
    } catch (error) {
      console.error('login: error:', error);
      this.#view.showError(error.message || 'Gagal login. Silakan coba lagi.');

      // Kirim sinyal 'auth-changed' bahwa login GAGAL
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { success: false } }));
      return false;
    } finally {
      this.#view.setLoading(false);
    }
  }
}
