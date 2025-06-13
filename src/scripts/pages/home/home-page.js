import { showFormattedDate } from "../../utils";
import HomePresenter from "./home-presenter";
import * as DicodingAPI from "../../data/api";

export default class HomePage {
  #presenter = null;

  async render() {
    return `
      <section class="home-hero" role="banner" aria-label="Banner utama Banten Storyteller">
        <div class="container home-hero-container">
          <div class="home-hero-content">
            <h1 class="home-title">Banten Storyteller</h1>
            <p class="home-subtitle">Punya kisah seru dari Banten? Yuk, bagikan cerita paling menarik dan inspiratif tentang petualangan tak terlupakanmu di tanah jawara ini!</p>
            <a href="#/add" class="btn btn-primary home-hero-btn" aria-label="Buat cerita baru">Buat Cerita</a>
          </div>
          <aside class="hero-glass-card" aria-label="Galeri foto Banten Storyteller">
            <div class="hero-image-carousel">
              <img src="/images/tangerang.jpg" alt="Pemandangan indah dari Tangerang, Banten" class="hero-carousel-image active" loading="lazy" data-index="0" />
              <img src="/images/banten-lama.jpg" alt="Masjid Agung Banten Lama" class="hero-carousel-image" loading="lazy" data-index="1" style="display:none;" />
              <img src="/images/ujung-kulon.jpg" alt="Keindahan Taman Nasional Ujung Kulon" class="hero-carousel-image" loading="lazy" data-index="2" style="display:none;" />
              <div class="carousel-nav">
                <button class="carousel-dot active" data-index="0" aria-label="Tampilkan gambar 1"></button>
                <button class="carousel-dot" data-index="1" aria-label="Tampilkan gambar 2"></button>
                <button class="carousel-dot" data-index="2" aria-label="Tampilkan gambar 3"></button>
              </div>
            </div>
            <div class="hero-glass-text">
              <h3>Jelajahi Keindahan Banten</h3>
              <p>Temukan cerita dan budaya yang kaya dari tanah Banten.</p>
            </div>
          </aside>
        </div>
      </section>

      <section class="container home-content" aria-labelledby="recent-stories-heading">
        <div class="home-section-header">
          <h2 id="recent-stories-heading" class="section-title">Kisah Petualangan</h2>
          <div class="search-options">
            <label for="story-search" class="sr-only">Cari cerita:</label>
            <div class="search-input-group">
                <input type="text" id="story-search" placeholder="Cari cerita berdasarkan nama..." aria-label="Cari cerita" class="form-input search-input">
                <button id="search-button" class="btn btn-primary search-button" aria-label="Mulai pencarian">Cari</button>
            </div>
            <a href="#/map" class="btn btn-outline" aria-label="Lihat cerita di peta">Lihat Peta</a>
          </div>
        </div>
        
        <div id="stories-container" role="region" aria-live="polite" class="stories-container">
          <div class="loader-container" role="status" aria-live="assertive">
            <div class="loader"></div>
            <span class="sr-only">Memuat cerita...</span>
          </div>
        </div>
        
        <div class="text-center mt-5">
          <a href="#/add" class="btn btn-primary btn-lg" aria-label="Jadilah bagian dari Banten Storyteller, buat cerita barumu sekarang!">
            Bagikan Ceritamu Sekarang!
          </a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Pastikan metode ini ada di kelas HomePage
    if (typeof this.addAccessibilityStyles === 'function') {
        this.addAccessibilityStyles();
    } else {
        console.warn("Method 'addAccessibilityStyles' is not defined on HomePage.");
    }
    
    this.#setupHeroCarousel(); 
    this.#presenter = new HomePresenter({
      view: this,
      model: DicodingAPI,
    });

    await this.#presenter.loadStories();
    this.#setupStorySearch(); 
  }

  #setupHeroCarousel() {
    const images = document.querySelectorAll('.hero-carousel-image');
    const dots = document.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    const totalImages = images.length;
    let autoSlideInterval; 

    const showImage = (index) => {
      images.forEach((img, i) => {
        img.style.display = (i === index) ? 'block' : 'none';
        img.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-label', `Tampilkan gambar ${i + 1}`);
      });
    };

    const nextImage = () => {
      currentIndex = (currentIndex + 1) % totalImages;
      showImage(currentIndex);
    };

    // Fungsi untuk memulai atau mereset interval otomatis
    const startAutoSlide = () => {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextImage, 5000); 
    };

    dots.forEach(dot => {
      dot.addEventListener('click', (event) => {
        currentIndex = parseInt(event.target.dataset.index);
        showImage(currentIndex);
        startAutoSlide(); 
      });
    });

    showImage(currentIndex);
    startAutoSlide(); 
  }

  // Fitur Opsional Setup Pencarian Cerita
  #setupStorySearch() {
    const searchInput = document.getElementById('story-search');
    const searchButton = document.getElementById('search-button');

    if (searchInput && searchButton) {
      const performSearch = async () => {
        const query = searchInput.value.trim(); 
        await this.#presenter.loadStories(query || null); 
      };

      searchButton.addEventListener('click', performSearch);

      // Tambahkan event listener untuk 'Enter' di input search
      searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault(); 
          performSearch();
        }
      });
    } else {
        console.warn("Search input or button not found.");
    }
  }


  // --- Metode View 
  showLoginRequired() {
    const container = document.getElementById("stories-container");
    container.innerHTML = `
        <div class="alert alert-error" role="alert">
            <p>Anda perlu <a href="#/login">Login</a> untuk melihat cerita.</p>
        </div>
    `;
  }

  showEmptyStories(query = null) { 
    const container = document.getElementById("stories-container");
    let message = "Belum ada cerita yang tersedia.";
    if (query) {
        message = `Tidak ada cerita yang cocok dengan pencarian "${query}".`;
    }
    container.innerHTML = `
      <div class="alert" role="alert">
        <p>${message} Jadilah yang pertama <a href="#/add">membuat cerita!</a></p>
      </div>
    `;
  }

  showError(message) {
    const container = document.getElementById("stories-container");
    container.innerHTML = `
      <div class="alert alert-error" role="alert">
        <p>Gagal memuat cerita: ${message}. Silakan coba lagi.</p>
      </div>
    `;
  }

  addAccessibilityStyles() {
    const interactiveElements = document.querySelectorAll(
      'a, button, input, select, [tabindex="0"]'
    );
    interactiveElements.forEach((el) => {
      el.style.outlineOffset = '2px';
      el.style.transition = 'outline-color 0.2s ease';
      el.addEventListener('focus', () => {
        el.style.outline = '2px solid var(--color-primary-dark)';
      });
      el.addEventListener('blur', () => {
        el.style.outline = 'none'; 
      });
    });
  }

  showLoading() {
    const container = document.getElementById("stories-container");
    container.innerHTML = `
      <div class="loader-container" role="status" aria-live="assertive">
        <div class="loader"></div>
        <span class="sr-only">Memuat cerita...</span>
      </div>
    `;
  }

  hideLoading() {
  }

  displayStories(stories) {
    const container = document.getElementById("stories-container");

    const storiesHtml = stories
      .map(
        (story) => `
        <article class="story-card" aria-labelledby="story-title-${story.id}" tabindex="0">
          <figure class="story-image-container">
            <img 
              src="${story.photoUrl}" 
              alt="Foto cerita oleh ${story.name}" 
              class="story-image"
              loading="lazy"
            />
          </figure>
          <div class="story-content">
            <h3 class="story-title" id="story-title-${story.id}"><a href="#/detail/${story.id}" aria-label="Baca cerita ${story.name}">${story.name}</a></h3>
            <p class="story-description">${this.truncateText(story.description, 120)}</p>
            <div class="story-meta">
              <time class="story-date" datetime="${new Date(story.createdAt).toISOString()}">
                📅 ${showFormattedDate(story.createdAt)}
              </time>
              <a href="#/detail/${story.id}" class="btn btn-outline" aria-label="Baca selengkapnya cerita ${story.name}">Baca Selengkapnya</a>
            </div>
          </div>
        </article>
      `
      )
      .join("");

    container.innerHTML = `<div class="story-list">${storiesHtml}</div>`;
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }
}