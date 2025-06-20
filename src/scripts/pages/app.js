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
      // Only toggle on mobile (max-width: 1000px)
      if (window.matchMedia('(max-width: 1000px)').matches) {
        this.#navigationDrawer.classList.toggle('open');
      }
    });

    // Close drawer when a nav link is clicked (on mobile)
    this.#navigationDrawer.addEventListener('click', (e) => {
      if (
        window.matchMedia('(max-width: 1000px)').matches &&
        e.target.closest('a')
      ) {
        this.#navigationDrawer.classList.remove('open');
      }
    });

    // Optional: Close drawer when clicking outside (on mobile)
    document.addEventListener('click', (e) => {
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

      // Scroll to top after transition and afterRender are complete
      window.scrollTo({ top: 0, behavior: 'smooth' });

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
