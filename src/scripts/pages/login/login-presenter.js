import { saveAuth } from "../../utils/auth";
import * as DicodingAPI from "../../data/api";

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

      // Save auth data to local storage
      saveAuth(response);

      // Dispatch auth changed event
      window.dispatchEvent(new CustomEvent("auth-changed"));

      // Show success message and redirect
      this.#view.showSuccess("Login successful. Redirecting to homepage...");

      setTimeout(() => {
        window.location.hash = "#/";
      }, 1500);

      return true;
    } catch (error) {
      console.error("login: error:", error);
      this.#view.showError(
        error.message || "Failed to login. Please try again."
      );
      return false;
    } finally {
      this.#view.setLoading(false);
    }
  }
}
