import * as DicodingAPI from '../../data/api';

export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model = DicodingAPI }) {
    this.#view = view;
    this.#model = model;
  }

  async register(name, email, password) {
    try {
      this.#view.setLoading(true);

      const response = await this.#model.registerUser({
        name,
        email,
        password,
      });

      if (response.error) {
        throw new Error(response.message);
      }

      this.#view.showSuccess('Registration successful. Please login with your new account.');

      setTimeout(() => {
        window.location.hash = '#/login';
      }, 2000);

      return true;
    } catch (error) {
      console.error('register: error:', error);
      this.#view.showError(error.message || 'Failed to register. Please try again.');
      return false;
    } finally {
      this.#view.setLoading(false);
    }
  }
}
