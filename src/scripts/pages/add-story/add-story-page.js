import AddStoryPresenter from './add-story-presenter';
import * as DicodingAPI from '../../data/api';

export default class AddStoryPage {
  #presenter = null;
  #map = null;
  #marker = null;
  #selectedLocation = null;
  #mediaStream = null;
  #locationWatchId = null;

  async render() {
    return `
      <section class="container add-story-page-container" aria-labelledby="add-story-heading">
        <div class="form-container glass-card add-story-form-wrapper">
          <h2 class="form-title" id="add-story-heading">Bagikan Cerita Bantenmu</h2>
          <p class="form-subtitle">Lengkapi detail di bawah ini untuk mengabadikan kisahmu. Bidang dengan tanda <span class="required-asterisk">*</span> wajib diisi.</p>

          <div id="alert-container" role="alert" aria-live="assertive"></div>

          <form id="add-story-form" aria-describedby="form-description" novalidate>
            <p id="form-description" class="sr-only">Isi formulir di bawah ini untuk membagikan cerita Banten Anda dengan foto dan lokasi (opsional).</p>

            <fieldset class="form-section photo-section">
              <legend class="section-legend">
                <i class="fas fa-camera-retro icon-legend"></i> Foto Cerita <span class="required-asterisk">*</span>
              </legend>
              <div class="photo-options">
                <div class="option-tabs" role="tablist">
                  <button type="button" class="option-tab active" data-tab="camera" id="camera-tab-btn" role="tab" aria-selected="true" aria-controls="camera-tab">
                    <i class="fas fa-camera icon-tab"></i> Ambil Foto
                  </button>
                  <button type="button" class="option-tab" data-tab="gallery" id="gallery-tab-btn" role="tab" aria-selected="false" aria-controls="gallery-tab">
                    <i class="fas fa-images icon-tab"></i> Dari Galeri
                  </button>
                </div>

                <div class="tab-content" id="camera-tab" role="tabpanel" aria-labelledby="camera-tab-btn">
                  <div class="camera-ui-container">
                    <div class="camera-preview-area" id="camera-preview-container">
                      <video id="camera-stream" autoplay playsinline aria-label="Pratinjau kamera" style="display: none;"></video>
                      <canvas id="camera-canvas" style="display: none;" aria-hidden="true"></canvas>
                      <img id="captured-image" class="captured-image" style="display: none;" alt="Foto yang diambil untuk cerita" aria-live="polite">
                      <div id="camera-placeholder" class="camera-placeholder-content">
                        <i class="fas fa-video fa-3x"></i>
                        <p>Pratinjau kamera akan muncul di sini.</p>
                        <small>Klik "Buka Kamera" dan berikan izin jika diminta.</small>
                      </div>
                    </div>
                    <div class="camera-controls">
                      <button type="button" id="btn-start-camera" class="btn btn-secondary">
                        <i class="fas fa-play-circle"></i> Buka Kamera
                      </button>
                      <button type="button" id="btn-capture" class="btn btn-primary" disabled>
                        <i class="fas fa-camera-retro"></i> Ambil Foto
                      </button>
                      <button type="button" id="btn-retake" class="btn btn-outline" style="display: none;">
                        <i class="fas fa-sync-alt"></i> Ulangi
                      </button>
                    </div>
                  </div>
                </div>

                <div class="tab-content" id="gallery-tab" style="display: none;" role="tabpanel" aria-labelledby="gallery-tab-btn">
                  <div class="file-upload-ui-container">
                    <input type="file" id="file-upload" accept="image/*" class="file-input sr-only" aria-describedby="file-upload-help">
                    <label for="file-upload" class="file-upload-label" role="button" tabindex="0">
                      <div class="file-upload-content">
                        <i class="fas fa-cloud-upload-alt fa-3x file-upload-icon" aria-hidden="true"></i>
                        <span class="file-upload-text">Pilih berkas atau <strong>seret &amp; lepas</strong> gambar di sini</span>
                        <span class="file-upload-hint">Format: JPG, PNG, GIF (Maks 1MB)</span>
                      </div>
                    </label>
                    <p id="file-upload-help" class="sr-only">Format yang didukung: JPG, PNG, GIF. Ukuran maksimal: 1MB.</p>
                    <div class="file-preview-wrapper" id="file-preview-wrapper" style="display: none;">
                      <img id="file-preview" class="file-preview-image" alt="Pratinjau foto yang diunggah">
                      <button type="button" id="btn-remove-file" class="btn btn-danger btn-remove-preview">
                        <i class="fas fa-times"></i> Hapus Foto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset class="form-section location-section">
              <legend class="section-legend">
                <i class="fas fa-map-marked-alt icon-legend"></i> Lokasi Cerita (Opsional)
              </legend>
              <div class="form-group">
                <div class="location-controls">
                  <button type="button" id="get-current-location" class="btn btn-secondary" aria-describedby="location-help">
                    <i class="fas fa-location-arrow"></i> Gunakan Lokasi Saya
                  </button>
                </div>
                <p id="location-help" class="sr-only">Gunakan lokasi geografis Anda untuk ditambahkan ke cerita</p>
                <div id="location-status" role="status" aria-live="polite" class="location-feedback"></div>
                <div class="map-container" id="location-map-container" aria-label="Peta interaktif untuk memilih lokasi">
                  <div id="map"></div>
                </div>
                <div id="selected-location-text" aria-live="polite" class="location-display">
                  Belum ada lokasi dipilih. Klik peta atau gunakan lokasi saat ini.
                </div>
              </div>
            </fieldset>

            <fieldset class="form-section details-section">
              <legend class="section-legend">
                <i class="fas fa-pencil-alt icon-legend"></i> Deskripsi Cerita <span class="required-asterisk">*</span>
              </legend>
              <div class="form-group">
                <label for="description" class="sr-only">Deskripsi Cerita</label>
                <div class="description-editor-wrapper">
                  <div class="description-toolbar" aria-label="Alat format deskripsi (Contoh)">
                    <button type="button" class="toolbar-btn" title="Bold (Contoh)" aria-disabled="true">
                      <i class="fas fa-bold"></i>
                    </button>
                    <button type="button" class="toolbar-btn" title="Italic (Contoh)" aria-disabled="true">
                      <i class="fas fa-italic"></i>
                    </button>
                    <button type="button" class="toolbar-btn" title="Unordered List (Contoh)" aria-disabled="true">
                      <i class="fas fa-list-ul"></i>
                    </button>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    rows="8"
                    class="form-control description-textarea"
                    required
                    placeholder="Tuliskan deskripsi cerita Anda di sini..."
                    aria-required="true"
                    maxlength="1000"
                    aria-describedby="char-count-desc"
                  ></textarea>
                  <div id="char-count-desc" class="char-counter">0 / 1000 karakter</div>
                </div>
              </div>
            </fieldset>

            <button type="submit" class="btn btn-primary btn-full btn-submit-story" id="submit-button">
              <i class="fas fa-paper-plane"></i> Bagikan Cerita
            </button>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.addAccessibilityStyles();
    this.#presenter = new AddStoryPresenter({ view: this, model: DicodingAPI });
    if (!this.#presenter.checkAuth()) return;
    this.initCamera();
    this.initFileUpload();
    this.initTabSwitching();
    this.initMap();
    this.initLocationFeatures();
    this.setupForm();
  }

  showLoginRequired() {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = `
      <div class="alert alert-error">
        <p>Silakan login untuk menambahkan cerita. <a href="#/login">Login di sini</a> atau <a href="#/register">Daftar</a></p>
      </div>
    `;
  }

  showSuccess(message) {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = `
      <div class="alert alert-success">
        <p>${message}</p>
      </div>
    `;
  }

  showError(message) {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = `
      <div class="alert alert-error">
        <p>${message}</p>
      </div>
    `;
  }

  setLoading(isLoading) {
    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Mengirim...' : 'Bagikan Cerita';
  }

  addAccessibilityStyles() {
    if (!document.getElementById('sr-only-styles')) {
      const style = document.createElement('style');
      style.id = 'sr-only-styles';
      style.innerHTML = `
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `;
      document.head.appendChild(style);
    }
  }

  initTabSwitching() {
    const tabs = document.querySelectorAll('.option-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        tabContents.forEach(content => {
          content.style.display = 'none';
          content.setAttribute('aria-hidden', 'true');
        });

        const tabId = tab.getAttribute('data-tab');
        const activeTabContent = document.getElementById(`${tabId}-tab`);
        activeTabContent.style.display = 'block';
        activeTabContent.setAttribute('aria-hidden', 'false');

        if (tabId === 'camera') {
          this.stopCameraStream();
          document.getElementById('btn-start-camera').disabled = false;
          document.getElementById('btn-capture').disabled = true;
        }
      });
    });
  }

  initCamera() {
    const startButton = document.getElementById('btn-start-camera');
    const captureButton = document.getElementById('btn-capture');
    const retakeButton = document.getElementById('btn-retake');
    const videoElement = document.getElementById('camera-stream');
    const canvasElement = document.getElementById('camera-canvas');
    const capturedImage = document.getElementById('captured-image');
    const placeholderElement = document.getElementById('camera-placeholder');

    startButton.addEventListener('click', async () => {
      try {
        this.#mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        videoElement.srcObject = this.#mediaStream;
        videoElement.style.display = 'block';
        capturedImage.style.display = 'none';
        placeholderElement.style.display = 'none';

        startButton.disabled = true;
        captureButton.disabled = false;
        retakeButton.style.display = 'none';
      } catch (error) {
        console.error('Error accessing camera:', error);
        this.showError(
          'Failed to access camera. Please ensure you have granted camera permissions.'
        );
      }
    });

    captureButton.addEventListener('click', () => {
      const context = canvasElement.getContext('2d');
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

      const imageDataUrl = canvasElement.toDataURL('image/jpeg');
      capturedImage.src = imageDataUrl;
      capturedImage.style.display = 'block';
      videoElement.style.display = 'none';
      placeholderElement.style.display = 'none';

      this.stopCameraStream();

      captureButton.disabled = true;
      retakeButton.style.display = 'inline-block';
      startButton.disabled = false;
    });

    retakeButton.addEventListener('click', () => {
      capturedImage.src = '';
      capturedImage.style.display = 'none';
      retakeButton.style.display = 'none';
      startButton.disabled = false;
      captureButton.disabled = true;
    });
  }

  initFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const filePreview = document.getElementById('file-preview');
    const previewContainer = document.getElementById('file-preview-wrapper');
    const removeButton = document.getElementById('btn-remove-file');
    const fileUploadLabel = document.querySelector('.file-upload-label');
    const dropArea = document.querySelector('.file-upload-ui-container');

    fileInput.addEventListener('change', event => {
      const file = event.target.files[0];

      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          filePreview.src = e.target.result;
          previewContainer.style.display = 'block';
          fileUploadLabel.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(
        eventName,
        () => {
          dropArea.classList.add('highlight');
        },
        false
      );
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(
        eventName,
        () => {
          dropArea.classList.remove('highlight');
        },
        false
      );
    });

    dropArea.addEventListener(
      'drop',
      e => {
        const file = e.dataTransfer.files[0];

        if (file && file.type.startsWith('image/')) {
          fileInput.files = e.dataTransfer.files;

          const reader = new FileReader();
          reader.onload = e => {
            filePreview.src = e.target.result;
            previewContainer.style.display = 'block';
            fileUploadLabel.style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      },
      false
    );

    removeButton.addEventListener('click', () => {
      fileInput.value = '';
      filePreview.src = '';
      previewContainer.style.display = 'none';
      fileUploadLabel.style.display = 'flex';
    });
  }

  stopCameraStream() {
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.#mediaStream = null;
    }
  }

  async initMap() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    document.head.appendChild(script);

    script.onload = () => {
      this.#map = L.map('map').setView([-0.7893, 113.9213], 5);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.#map);

      this.#map.on('click', e => {
        this.updateSelectedLocation(e.latlng.lat, e.latlng.lng);
      });

      setTimeout(() => {
        this.#map.invalidateSize();
      }, 100);
    };
  }

  initLocationFeatures() {
    const getCurrentLocationBtn = document.getElementById('get-current-location');
    const locationStatus = document.getElementById('location-status');

    getCurrentLocationBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        locationStatus.innerHTML = `
        <div class="alert alert-error">
          <p><i class="fas fa-exclamation-triangle"></i> Geolocation is not supported by your browser</p>
        </div>`;
        return;
      }

      locationStatus.innerHTML = `
      <div class="location-loading">
        <span class="loader-small"></span> Getting your location...
      </div>`;
      getCurrentLocationBtn.disabled = true;

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          this.updateSelectedLocation(latitude, longitude);
          this.#map.setView([latitude, longitude], 15);

          locationStatus.innerHTML = `
          <div class="alert alert-success">
            <p><i class="fas fa-check-circle"></i> Location successfully obtained!</p>
          </div>`;
          getCurrentLocationBtn.disabled = false;

          setTimeout(() => {
            locationStatus.innerHTML = '';
          }, 3000);
        },
        error => {
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please allow access to your location.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Request to get location timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred getting your location.';
          }

          locationStatus.innerHTML = `
          <div class="alert alert-error">
            <p><i class="fas fa-exclamation-triangle"></i> ${errorMessage}</p>
          </div>`;
          getCurrentLocationBtn.disabled = false;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  updateSelectedLocation(lat, lng) {
    this.#selectedLocation = { lat, lon: lng };

    document.getElementById('selected-location-text').innerHTML = `
    <span>Selected location: <strong>${lat.toFixed(6)}, ${lng.toFixed(6)}</strong></span>
    <button type="button" id="clear-location" class="btn-small">
      <i class="fas fa-times"></i> Clear
    </button>`;

    document.getElementById('clear-location').addEventListener('click', e => {
      e.preventDefault();
      this.clearLocation();
    });

    if (this.#marker) {
      this.#marker.setLatLng([lat, lng]);
    } else {
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="marker-pin animate-bounce" style="background-color: var(--accent-color); position: relative; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,0,0,0.3);"><i class="fas fa-map-marker-alt" style="color: white;"></i></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });
      this.#marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.#map);
    }
  }

  clearLocation() {
    if (this.#marker) {
      this.#map.removeLayer(this.#marker);
      this.#marker = null;
    }
    this.#selectedLocation = null;
    document.getElementById('selected-location-text').textContent =
      'No location selected. Click on the map to select a location or use your current location.';
  }

  setupForm() {
    const form = document.getElementById('add-story-form');

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const description = document.getElementById('description').value;
      const capturedImage = document.getElementById('captured-image');
      const fileInput = document.getElementById('file-upload');

      const activeTab = document.querySelector('.option-tab.active').getAttribute('data-tab');
      let imageFile = null;

      if (activeTab === 'camera') {
        if (!capturedImage.src || capturedImage.style.display === 'none') {
          this.showError('Please capture a photo using the camera.');
          return;
        }

        const imageBlob = await fetch(capturedImage.src).then(r => r.blob());
        imageFile = new File([imageBlob], 'story-image.jpg', { type: 'image/jpeg' });
      } else {
        if (!fileInput.files || fileInput.files.length === 0) {
          this.showError('Please select an image from your gallery.');
          return;
        }

        imageFile = fileInput.files[0];
      }

      if (!this.#presenter.validateFormData(description, imageFile)) return;

      const success = await this.#presenter.createStory(
        description,
        imageFile,
        this.#selectedLocation
      );

      if (success) {
        this.stopCameraStream();
      }
    });
  }

  async destroy() {
    this.stopCameraStream();
    if (this.#locationWatchId) {
      navigator.geolocation.clearWatch(this.#locationWatchId);
    }
  }
}
