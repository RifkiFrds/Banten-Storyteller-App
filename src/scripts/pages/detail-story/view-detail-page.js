import { showFormattedDate } from '../../utils';
import ViewDetailPresenter from './view-detail-presenter';
import * as DicodingAPI from '../../data/api';
import indexedDBService from '../../utils/indexeddb';

export default class ViewDetailPage {
  #presenter = null;
  #currentStory = null;

  async render() {
    return `
      <section class="container" aria-labelledby="story-title">
        <div id="story-detail-container">
          <div class="loader-container" role="status" aria-live="polite">
            <div class="loader"></div>
            <span class="sr-only">Loading story details...</span>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender(params) {
    this.#presenter = new ViewDetailPresenter({
      view: this,
      model: DicodingAPI,
    });

    await this.#presenter.loadStoryDetail(params?.id);
  }

  showMissingIdError() {
    this.#injectAlert("Story ID is missing. <a href='#/'>Go back</a>");
  }

  showLoginRequired() {
    this.#injectAlert(
      "Login required. <a href='#/login'>Login</a> or <a href='#/register'>Register</a>"
    );
  }

  showError(message) {
    this.#injectAlert(message || 'Failed to load story. Please try again later.');
  }

  #injectAlert(message) {
    const container = document.getElementById('story-detail-container');
    container.innerHTML = `
      <div class="alert alert-error" role="alert">
        <p>${message}</p>
      </div>
    `;
  }

  async displayStoryDetail(story) {
    this.#currentStory = story;
    const container = document.getElementById('story-detail-container');

    const wordCount = story.description.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    
    // Check if story is in collection
    const isInCollection = await indexedDBService.isStoryInCollection(story.id);

    container.innerHTML = `
      <div class="detail-container" style="view-transition-name: story-${story.id}">
        <a href="#/" class="btn btn-outline mb-2">← Back to Stories</a>

        <article class="detail-card">
          <header>
            <h1 class="detail-title" id="story-title">📖 ${story.name}'s Story</h1>
            <div class="detail-meta">
              <span class="badge">${showFormattedDate(story.createdAt)}</span>
              <span class="badge">${wordCount} words</span>
              <span class="badge">~${readTime} min read</span>
              <div class="detail-actions">
                <button id="copy-link-btn" class="btn btn-sm btn-secondary">Copy Link</button>
                <button id="add-to-collection-btn" class="btn btn-sm ${isInCollection ? 'btn-success' : 'btn-outline'}" 
                        data-story-id="${story.id}" 
                        data-story-name="${story.name}"
                        ${isInCollection ? 'disabled' : ''}>
                  <i class="fas fa-bookmark"></i> 
                  ${isInCollection ? 'In Collection' : 'Add to Collection'}
                </button>
              </div>
            </div>
          </header>

          <figure class="mt-4">
            <img src="${story.photoUrl}" alt="Photo shared by ${story.name}" class="detail-image rounded" />
          </figure>

          <div class="detail-description">
            <p>${story.description}</p>
          </div>

          <div id="snackbar" class="snackbar">Link copied!</div>
        </article>
      </div>
    `;

    this.#addAccessibilityStyles();
    this.#enableCopyLink(story.id);
    this.#setupCollectionButton();
  }

  #enableCopyLink(id) {
    const copyBtn = document.getElementById('copy-link-btn');
    const snackbar = document.getElementById('snackbar');
    copyBtn?.addEventListener('click', () => {
      const link = `${location.origin}/#/detail/${id}`;
      navigator.clipboard.writeText(link).then(() => {
        snackbar.classList.add('show');
        setTimeout(() => snackbar.classList.remove('show'), 3000);
      });
    });
  }

  #setupCollectionButton() {
    const collectionBtn = document.getElementById('add-to-collection-btn');
    
    if (!collectionBtn) return;
    
    collectionBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      
      const storyId = collectionBtn.getAttribute('data-story-id');
      const storyName = collectionBtn.getAttribute('data-story-name');
      
      // Check if story is already in collection
      const isInCollection = await indexedDBService.isStoryInCollection(storyId);
      
      if (isInCollection) {
        this.#showNotification(`${storyName} is already in your collection!`, 'info');
        return;
      }
      
      try {
        // Show loading state
        collectionBtn.disabled = true;
        const originalText = collectionBtn.innerHTML;
        collectionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        await indexedDBService.addStory(this.#currentStory);
        
        // Update button state
        collectionBtn.innerHTML = '<i class="fas fa-check"></i> In Collection';
        collectionBtn.classList.remove('btn-outline');
        collectionBtn.classList.add('btn-success');
        collectionBtn.disabled = true;
        
        // Show success message
        this.#showNotification(`${storyName} has been added to your collection!`, 'success');
        
      } catch (error) {
        console.error('Error adding story to collection:', error);
        
        // Reset button state
        collectionBtn.disabled = false;
        collectionBtn.innerHTML = originalText;
        
        this.#showNotification(`Failed to add ${storyName} to collection: ${error.message}`, 'error');
      }
    });
  }

  #showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  #addAccessibilityStyles() {
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
        .badge {
          background: #ececec;
          color: #333;
          padding: 0.3em 0.6em;
          border-radius: 999px;
          font-size: 0.8em;
          margin-right: 0.5em;
        }
        .detail-actions {
          display: flex;
          gap: 0.5em;
          align-items: center;
        }
        .snackbar {
          visibility: hidden;
          min-width: 200px;
          background-color: #323232;
          color: #fff;
          text-align: center;
          border-radius: 4px;
          padding: 12px;
          position: fixed;
          z-index: 999;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
        }
        .snackbar.show {
          visibility: visible;
          animation: fadein 0.5s, fadeout 0.5s 2.5s;
        }
        @keyframes fadein {
          from {bottom: 0; opacity: 0;}
          to {bottom: 20px; opacity: 1;}
        }
        @keyframes fadeout {
          from {bottom: 20px; opacity: 1;}
          to {bottom: 0; opacity: 0;}
        }
        .map-box {
          height: 300px;
          border: 1px solid #ccc;
          border-radius: 12px;
          margin-top: 1em;
        }
      `;
      document.head.appendChild(style);
    }
  }

  async initMap(story) {
    const leafletCss = document.createElement('link');
    leafletCss.id = 'leaflet-css';
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    leafletCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    leafletCss.crossOrigin = '';
    if (!document.getElementById('leaflet-css')) {
      document.head.appendChild(leafletCss);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';

    script.onload = () => {
      const map = L.map('map').setView([story.lat, story.lon], 14);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([story.lat, story.lon])
        .addTo(map)
        .bindPopup(`<b>${story.name}</b><br>${story.description.slice(0, 60)}...`)
        .openPopup();

      setTimeout(() => map.invalidateSize(), 300);
    };

    document.head.appendChild(script);
  }
}
