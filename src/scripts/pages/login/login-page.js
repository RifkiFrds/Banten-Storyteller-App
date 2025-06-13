import LoginPresenter from "./login-presenter";
import * as DicodingAPI from "../../data/api";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="login-page">
        <div class="login-container">
          <div class="login-header">
            <img src="images/logo-banten.png" alt="Logo Banten Storyteller" class="login-logo" />
            <h2 class="login-title">Masuk ke Banten Storyteller</h2>
            <p class="login-subtitle">Bagikan kisah terbaikmu di Tanah Jawara</p>
          </div>

          <div id="alert-container" class="alert-wrapper"></div>

          <form id="login-form" class="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                autocomplete="email" 
                placeholder="contoh@mail.com" 
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="password">Kata Sandi</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                minlength="8" 
                autocomplete="current-password" 
                placeholder="Masukkan kata sandi" 
                class="form-input"
              />
            </div>

            <button type="submit" class="btn-login" id="login-button">
              Masuk
            </button>
          </form>

          <div class="form-footer">
            <p>Belum punya akun? <a href="#/register" class="link-register">Daftar Sekarang</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: DicodingAPI,
    });

    this.attachFormListener();
  }

  attachFormListener() {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      await this.#presenter.login(email, password);
    });
  }

 setLoading(isLoading) {
    const loginButton = document.getElementById("login-button");

    if (isLoading) {
      loginButton.disabled = true;
      loginButton.innerHTML = `Memproses... <span class="spinner"></span>`; 
    } else {
      loginButton.disabled = false;
      loginButton.innerHTML = "Masuk";
    }
  }

  showSuccess(message) {
    const alertContainer = document.getElementById("alert-container");
    alertContainer.innerHTML = `
      <div class="alert success">
        ${message}
      </div>
    `;
  }

  showError(message) {
    const alertContainer = document.getElementById("alert-container");
    alertContainer.innerHTML = `
      <div class="alert error">
        ${message}
      </div>
    `;
  }
}
