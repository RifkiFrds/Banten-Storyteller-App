import { showFormattedDate, animateElement } from '../../utils';
import MapPresenter from './map-presenter';
import * as DicodingAPI from '../../data/api';

export default class MapPage {
  #presenter = null;
  #mapInstance = null; // Menyimpan instance peta Leaflet
  #storyMarkersGroup = null; // Menyimpan layer group untuk marker cerita

  async render() {
    return `
      <section class="container map-page-container" aria-labelledby="map-page-title">
        <h1 id="map-page-title" class="page-title">Peta Jelajah Cerita Banten</h1>
        <p class="page-subtitle">Temukan dan ikuti jejak kisah-kisah menarik dari berbagai penjuru Provinsi Banten.</p>
        
        <div id="map-content-wrapper" class="glass-card map-content-wrapper">
          <div id="map-main-area">
            <div class="loader-container" role="status" aria-live="polite">
              <div class="loader"></div>
              <span class="sr-only">Memuat peta cerita...</span>
            </div>
          </div>
          <aside id="map-sidebar" class="map-sidebar" style="display:none;">
            <h3 class="sidebar-title">Informasi Peta</h3>
            <div class="sidebar-section">
              <p><i class="fas fa-info-circle icon-legend"></i> Klik marker <span class="marker-example"><i class="fas fa-book-open"></i></span> di peta untuk melihat detail cerita.</p>
              <p><i class="fas fa-layer-group icon-legend"></i> Gunakan kontrol di kanan atas peta untuk mengganti gaya atau menyembunyikan/menampilkan cerita.</p>
            </div>
            <div id="map-stats" class="sidebar-section map-stats">
              <h4>Statistik Cerita</h4>
              <p id="total-stories-on-map">Total Cerita di Peta: <strong>-</strong></p>
            </div>
          </aside>
        </div>
        <div id="map-summary-text" class="map-summary-text" style="display:none;"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new MapPresenter({
      view: this,
      model: DicodingAPI,
    });
    await this.#presenter.loadStoriesWithLocation();

    const resetBtn = document.getElementById('reset-map-view-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this._resetMapView());
    }
  }

  _updateMainMapArea(htmlContent) {
    const mapMainArea = document.getElementById('map-main-area');
    const mapSidebar = document.getElementById('map-sidebar');
    const mapSummaryText = document.getElementById('map-summary-text');
    const resetBtn = document.getElementById('reset-map-view-btn');

    if (mapMainArea) {
      mapMainArea.innerHTML = htmlContent;
      // Sembunyikan elemen terkait peta jika bukan peta yang ditampilkan
      const isMapView = htmlContent.includes('<div id="map"></div>');
      if (mapSidebar) mapSidebar.style.display = isMapView ? 'block' : 'none';
      if (mapSummaryText) mapSummaryText.style.display = isMapView ? 'block' : 'none';
      if (resetBtn) resetBtn.style.display = isMapView ? 'inline-block' : 'none';

      if (isMapView) {
        animateElement(mapSidebar, 'fadeInUp');
        animateElement(mapSummaryText, 'fadeInUp', 200); // Delay sedikit
      }
    } else {
      console.error("Element 'map-main-area' tidak ditemukan.");
    }
  }

  showLoginRequired() {
    this._updateMainMapArea(`
      <div class="alert alert-error animate-fade-in">
        <p><i class="fas fa-exclamation-circle"></i> Anda perlu masuk untuk melihat peta cerita. <a href="#/login">Masuk di sini</a> atau <a href="#/register">Daftar</a></p>
      </div>
    `);
  }

  showEmptyStories() {
    this._updateMainMapArea(`
      <div class="alert animate-fade-in">
        <p><i class="fas fa-ghost"></i> Belum ada cerita yang dibagikan di Banten Storyteller. <a href="#/add">Jadilah yang pertama!</a></p>
      </div>
    `);
  }

  showEmptyStoriesWithLocation() {
    this._updateMainMapArea(`
      <div class="alert animate-fade-in">
        <p><i class="fas fa-map-marker-slash"></i> Tidak ada cerita dengan data lokasi yang dapat ditampilkan di peta saat ini. <a href="#/add">Tambahkan cerita barumu dengan lokasi!</a></p>
      </div>
    `);
  }

  showError(message) {
    this._updateMainMapArea(`
      <div class="alert alert-error animate-fade-in">
        <p><i class="fas fa-exclamation-triangle"></i> ${
          message || 'Gagal memuat peta cerita. Mohon coba lagi nanti.'
        }</p>
      </div>
    `);
  }

  displayMap(storiesWithLocation) {
    this._updateMainMapArea(`
      <div class="map-container large animate-fade-in">
        <div id="map"></div>
      </div>
    `);

    const totalStoriesEl = document.getElementById('total-stories-on-map');
    if (totalStoriesEl) {
      totalStoriesEl.innerHTML = `Total Cerita di Peta: <strong>${storiesWithLocation.length}</strong>`;
    }

    const mapSummaryEl = document.getElementById('map-summary-text');
    if (mapSummaryEl) {
      mapSummaryEl.innerHTML = `<p>Menampilkan <strong>${storiesWithLocation.length} cerita</strong> yang tersebar di berbagai lokasi menarik di Banten. Jelajahi lebih lanjut!</p>`;
    }

    this._initLeafletMap(storiesWithLocation);
  }

  async _initLeafletMap(stories) {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafletCSS);
    }

    // Pemuatan Leaflet JS
    if (typeof L === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(script);
      script.onload = () => this._setupMapInstance(stories);
      script.onerror = () => this.showError('Gagal memuat pustaka peta (Leaflet JS).');
    } else {
      this._setupMapInstance(stories);
    }
  }

  _setupMapInstance(stories) {
    if (this.#mapInstance) {
      this.#mapInstance.remove(); // Hapus instance lama jika ada
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Elemen #map tidak ditemukan untuk inisialisasi Leaflet.');
      this.showError('Kesalahan internal: Kontainer peta tidak ditemukan.');
      return;
    }

    this.#mapInstance = L.map('map'); // Inisialisasi baru
    const defaultCenter = [-6.1754, 106.15]; // Pusat Banten (lebih ke arah Serang/Barat)
    const defaultZoom = 9;

    const tileLayers = this._getTileLayers();
    tileLayers['OpenStreetMap'].addTo(this.#mapInstance);

    this.#storyMarkersGroup = L.layerGroup().addTo(this.#mapInstance); // Buat dan langsung tambahkan
    const markerBounds = L.latLngBounds();

    if (stories && stories.length > 0) {
      stories.forEach(story => {
        if (
          story.lat != null &&
          story.lon != null &&
          !isNaN(parseFloat(story.lat)) &&
          !isNaN(parseFloat(story.lon))
        ) {
          const marker = this._createStoryMarker(story);
          this.#storyMarkersGroup.addLayer(marker);
          markerBounds.extend([parseFloat(story.lat), parseFloat(story.lon)]);
        }
      });

      if (markerBounds.isValid()) {
        this.#mapInstance.fitBounds(markerBounds, {
          padding: [40, 40],
          maxZoom: 17,
          animate: true,
        });
      } else {
        this.#mapInstance.setView(defaultCenter, defaultZoom);
      }
    } else {
      this.#mapInstance.setView(defaultCenter, defaultZoom);
    }

    L.control
      .layers(
        tileLayers,
        { 'Lokasi Cerita': this.#storyMarkersGroup },
        {
          collapsed: window.innerWidth < 768, // True untuk mobile/tablet
          position: 'topright',
        }
      )
      .addTo(this.#mapInstance);

    L.control.scale({ imperial: false }).addTo(this.#mapInstance);

    // Re-validate size after slight delay
    setTimeout(() => {
      if (this.#mapInstance) {
        this.#mapInstance.invalidateSize(true);
      }
    }, 100);
  }

  _getTileLayers() {
    return {
      OpenStreetMap: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }),
    };
  }

  _createStoryMarker(story) {
    const iconHtml = `
      <div class="marker-pin" style="background-color: var(--color-accent);">
        <i class="fas fa-book-open" style="color: white;"></i>
      </div>
      <div class="marker-pulse" style="background-color: rgba(var(--color-accent-rgb), 0.4);"></div>
    `;

    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: iconHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 32],
      popupAnchor: [0, -34],
    });

    const marker = L.marker([parseFloat(story.lat), parseFloat(story.lon)], {
      icon: customIcon,
      title: story.name || 'Tanpa Judul',
      riseOnHover: true,
    });

    const authorDisplayName = story.createdBy || story.name || 'Kontributor';

    const popupContent = `
      <div class="map-popup">
        ${story.photoUrl ? `<img src="${story.photoUrl}" alt="${story.name || 'Foto Cerita'}" class="popup-image">` : ''}
        <div class="popup-content-text">
          <h4 class="popup-title">${story.name || 'Tanpa Judul'}</h4>
          <p class="popup-description">${this.truncateText(story.description, 100)}</p>
          <div class="popup-meta">
            <span class="popup-meta-item popup-date">
                <i class="far fa-calendar-alt"></i> ${showFormattedDate(story.createdAt)}
            </span>
            <span class="popup-meta-item popup-author">
                <i class="fas fa-user-edit"></i> ${authorDisplayName}
            </span>
          </div>
          <a href="#/detail/${story.id}" class="btn btn-primary popup-btn"><i class="fas fa-feather-alt"></i> Baca Kisahnya</a>
        </div>
      </div>
    `;
    marker.bindPopup(popupContent);
    return marker;
  }

  _resetMapView() {
    if (this.#mapInstance) {
      if (this.#storyMarkersGroup && this.#storyMarkersGroup.getLayers().length > 0) {
        const bounds = this.#storyMarkersGroup.getBounds();
        if (bounds.isValid()) {
          this.#mapInstance.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 0.8 });
        }
      } else {
        this.#mapInstance.setView([-6.1754, 106.15], 9, { animate: true, duration: 0.8 }); // Default Banten view
      }
    }
  }

  truncateText(text = '', maxLength) {
    if (typeof text !== 'string' || !text) return '<i>Deskripsi tidak tersedia.</i>';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
}
