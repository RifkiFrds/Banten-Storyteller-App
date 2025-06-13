import RegisterPresenter from "./register-presenter";
import * as DicodingAPI from "../../data/api";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="register-page"> 
        <div class="auth-container"> 
          
          <div class="login-header">
            <img src="images/logo-banten.png" alt="Logo Banten Storyteller" class="login-logo" />
            <h2 class="form-title">Daftar ke Banten Storyteller</h2>
            <p class="login-subtitle">Buat akunmu dan mulai berkisah di Tanah Jawara!</p>
          </div>

          <div id="alert-container" class="alert-wrapper"></div>
          
          <form id="register-form">
            <div class="form-group">
              <label for="name">Nama Lengkap</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-control" 
                required 
                autocomplete="name"
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-control" 
                required 
                autocomplete="email"
                placeholder="Masukkan alamat email Anda"
              />
            </div>
            
            <div class="form-group">
              <label for="password">Kata Sandi</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-control" 
                required 
                autocomplete="new-password"
                placeholder="Buat kata sandi (min. 8 karakter)"
                minlength="8"
              />
            </div>

            <div class="form-group">
              <label for="confirm-password">Konfirmasi Kata Sandi</label>
              <input 
                type="password" 
                id="confirm-password" 
                name="confirm-password" 
                class="form-control" 
                required 
                autocomplete="new-password"
                placeholder="Ulangi kata sandi Anda"
              />
            </div>
            
            <button type="submit" class="btn btn-full" id="register-button">
              Daftar
            </button>
          </form>
          
          <div class="form-footer">
            <p>Sudah punya akun? <a href="#/login">Masuk</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: DicodingAPI,
    });

    this.attachFormListener();
  }

  attachFormListener() {
    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (password !== confirmPassword) {
        this.showError("Kata sandi dan konfirmasi kata sandi tidak cocok.");
        return;
      }

      this.setLoading(true);
      await this.#presenter.register(name, email, password);
    });
  }

  setLoading(isLoading) {
    const registerButton = document.getElementById("register-button");

    if (isLoading) {
      registerButton.disabled = true;
      registerButton.innerHTML = `Mendaftar... <span class="spinner"></span>`; // Anda perlu CSS untuk .spinner
    } else {
      registerButton.disabled = false;
      registerButton.innerHTML = "Daftar";
    }
  }

  showSuccess(message) {
    const alertContainer = document.getElementById("alert-container");
    alertContainer.innerHTML = `
      <div class="alert alert-success">
        <p><i class="fas fa-check-circle"></i> ${message || "Pendaftaran Anda berhasil! Silakan masuk."}</p>
        <p><a href="#/login" class="alert-link">Masuk sekarang</a></p>
      </div>
    `;
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  showError(message) {
    const alertContainer = document.getElementById("alert-container");
    alertContainer.innerHTML = `
      <div class="alert alert-error">
        <p><i class="fas fa-exclamation-triangle"></i> ${message || "Pendaftaran gagal. Mohon coba lagi nanti."}</p>
      </div>
    `;
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}