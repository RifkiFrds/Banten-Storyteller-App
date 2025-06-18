import routes from '../routes/routes';
import { getActiveRoute, parseActivePathname } from '../routes/url-parser';
import { getAuth, isAuthenticated } from '../utils/auth';
import { applyPageTransition } from '../utils/index';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #authButton = null;
  #currentPage = null;
  #currentPageInstance = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#authButton = document.querySelector('#auth-button');

    this.#setupDrawer();
    this.#initAuth();
  }

  // Setup event listener untuk drawer navigasi
  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', event => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach(link => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  // Inisialisasi autentikasi & update tombol login/logout
  #initAuth() {
    this.#updateAuthButton();

    // Dengarkan perubahan autentikasi
    window.addEventListener('auth-changed', () => {
      this.#updateAuthButton();
    });
  }

  // Update tampilan tombol login/logout
  #updateAuthButton() {
    // Hapus dulu event listener logout agar tidak duplikat
    this.#authButton.removeEventListener('click', this.#handleLogout);

    if (isAuthenticated()) {
      const { loginResult } = getAuth();
      this.#authButton.textContent = `Logout (${loginResult.name})`;
      this.#authButton.href = '#/';
      this.#authButton.addEventListener('click', this.#handleLogout);
    } else {
      this.#authButton.textContent = 'Login';
      this.#authButton.href = '#/login';
    }
  }

  // Handler saat tombol logout ditekan
  #handleLogout = event => {
    event.preventDefault();
    localStorage.removeItem('dicoding_story_auth');
    window.dispatchEvent(new CustomEvent('auth-changed'));
    window.location.hash = '#/';
  };

  // Tentukan tipe animasi berdasarkan perpindahan halaman
  #getAnimationType(newUrl) {
    if (!this.#currentPage) return 'fade'; // Default untuk halaman pertama

    const pageCategories = {
      home: ['/'],
      auth: ['/login', '/register'],
      content: ['/view', '/add'],
      info: ['/about', '/map'],
    };

    const getCurrentCategory = url => {
      for (const [category, urls] of Object.entries(pageCategories)) {
        if (urls.some(path => url.startsWith(path))) {
          return category;
        }
      }
      return 'other';
    };

    const currentCategory = getCurrentCategory(this.#currentPage);
    const newCategory = getCurrentCategory(newUrl);

    if (currentCategory === newCategory) {
      return 'fade'; // Sama kategori: fade
    } else if (currentCategory === 'auth' && newCategory === 'home') {
      return 'zoom'; // Dari login/register ke home: zoom
    } else if (newCategory === 'content') {
      return 'slide'; // Halaman konten: slide
    } else {
      return 'fade'; // Default animasi
    }
  }

  // Render halaman berdasarkan route aktif
  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];
    const urlParams = parseActivePathname();

    if (!page) {
      this.#content.innerHTML = `
        <div class="container">
          <h2>Page Not Found</h2>
        </div>`;
      return;
    }

    try {
      // Jika halaman sebelumnya ada dan punya destroy method, jalankan untuk cleanup
      if (this.#currentPageInstance && typeof this.#currentPageInstance.destroy === 'function') {
        await this.#currentPageInstance.destroy();
      }

      // Tentukan animasi transisi
      const animationType = this.#getAnimationType(url);

      // Terapkan animasi saat render halaman baru
      await applyPageTransition(async () => {
        this.#content.innerHTML = await page.render(urlParams);
        await page.afterRender(urlParams);
      }, animationType);

      // Simpan state halaman saat ini
      this.#currentPage = url;
      this.#currentPageInstance = page;
    } catch (error) {
      console.error('Error rendering page:', error);
      this.#content.innerHTML = `
        <div class="container">
          <div class="alert alert-error">
            <p>Failed to load page content. Please try again later.</p>
          </div>
        </div>
      `;
    }
  }
}

export default App;
