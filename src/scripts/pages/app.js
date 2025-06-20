import routes from '../routes/routes';
import { getActiveRoute, parseActivePathname } from '../routes/url-parser';
import { getAuth, isAuthenticated } from '../utils/auth';
import { applyPageTransition } from '../utils/index';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #authButton = null;
  #closeDrawerButton = null;
  #currentPage = null;
  #currentPageInstance = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#authButton = document.querySelector('#auth-button');
    this.#closeDrawerButton = document.querySelector('#close-drawer-button');

    this.#setupDrawer();
    this.#initAuth();
  }

  // Setup event listener untuk drawer navigasi
  #setupDrawer() {
    // Event: toggle drawer saat tombol ☰ ditekan
    this.#drawerButton.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 1000px)').matches) {
        this.#navigationDrawer.classList.toggle('open');
      }
    });

    // Event: tutup drawer saat tombol ✕ ditekan
    if (this.#closeDrawerButton) {
      this.#closeDrawerButton.addEventListener('click', () => {
        this.#navigationDrawer.classList.remove('open');
      });
    }

    // Event: tutup drawer saat klik link di dalam nav
    this.#navigationDrawer.addEventListener('click', e => {
      if (window.matchMedia('(max-width: 1000px)').matches && e.target.closest('a')) {
        this.#navigationDrawer.classList.remove('open');
      }
    });

    // Event: tutup drawer saat klik di luar menu
    document.addEventListener('click', e => {
      if (
        window.matchMedia('(max-width: 1000px)').matches &&
        this.#navigationDrawer.classList.contains('open') &&
        !this.#navigationDrawer.contains(e.target) &&
        e.target !== this.#drawerButton
      ) {
        this.#navigationDrawer.classList.remove('open');
      }
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
    // Hapus event listener logout lama agar tidak duplikat
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
    if (!this.#currentPage) return 'fade';

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
      return 'fade';
    } else if (currentCategory === 'auth' && newCategory === 'home') {
      return 'zoom';
    } else if (newCategory === 'content') {
      return 'slide';
    } else {
      return 'fade';
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
      // Jalankan destroy() dari halaman sebelumnya jika ada
      if (this.#currentPageInstance && typeof this.#currentPageInstance.destroy === 'function') {
        await this.#currentPageInstance.destroy();
      }

      const animationType = this.#getAnimationType(url);

      // Render dengan animasi transisi
      await applyPageTransition(async () => {
        this.#content.innerHTML = await page.render(urlParams);
        await page.afterRender(urlParams);
      }, animationType);

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Simpan state halaman
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
