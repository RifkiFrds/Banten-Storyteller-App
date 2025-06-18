import { showFormattedDate } from '../../utils';
import StoryCollectionsPresenter from './story-collections-presenter';
import indexedDBService from '../../utils/indexeddb';

export default class StoryCollectionsPage {
  #presenter = null;

  async render() {
    return `
      <section class="container story-collections-hero" role="banner" aria-label="Story Collections">
        <div class="story-collections-header">
          <h1 class="page-title">My Story Collections</h1>
          <p class="page-subtitle">Your saved stories for offline reading</p>
          <div class="collection-stats">
            <div class="stat-item">
              <i class="fas fa-bookmark"></i>
              <span id="collection-count">0</span>
              <span>Stories</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-wifi"></i>
              <span id="offline-status">Online</span>
            </div>
          </div>
        </div>
      </section>

      <section class="container story-collections-content" aria-labelledby="collections-heading">
        <div class="collections-section-header">
          <h2 id="collections-heading" class="section-title">Saved Stories</h2>
          <div class="collections-actions">
            <button id="clear-collection-btn" class="btn btn-outline btn-danger" aria-label="Clear all stories from collection">
              <i class="fas fa-trash"></i> Clear All
            </button>
          </div>
        </div>
        
        <div id="collections-container" role="region" aria-live="polite" class="collections-container">
          <div class="loader-container" role="status" aria-live="assertive">
            <div class="loader"></div>
            <span class="sr-only">Loading your story collections...</span>
          </div>
        </div>
        
        <div class="text-center mt-5">
          <a href="#/" class="btn btn-primary btn-lg" aria-label="Browse more stories to add to your collection">
            <i class="fas fa-plus"></i> Mulai Petualangan Ceritamu
          </a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new StoryCollectionsPresenter({
      view: this,
      model: indexedDBService,
    });

    await this.#presenter.loadCollections();
    this.#setupEventListeners();
    this.#updateOfflineStatus();
  }

  #setupEventListeners() {
    const clearButton = document.getElementById('clear-collection-btn');
    if (clearButton) {
      clearButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all stories from your collection? This action cannot be undone.')) {
          await this.#presenter.clearCollection();
        }
      });
    }

    // Listen for online/offline status changes
    window.addEventListener('online', () => this.#updateOfflineStatus());
    window.addEventListener('offline', () => this.#updateOfflineStatus());
  }

  #updateOfflineStatus() {
    const statusElement = document.getElementById('offline-status');
    if (statusElement) {
      const isOnline = navigator.onLine;
      statusElement.textContent = isOnline ? 'Online' : 'Offline';
      statusElement.className = isOnline ? 'online' : 'offline';
    }
  }

  // View methods
  showLoading() {
    const container = document.getElementById('collections-container');
    container.innerHTML = `
      <div class="loader-container" role="status" aria-live="assertive">
        <div class="loader"></div>
        <span class="sr-only">Loading your story collections...</span>
      </div>
    `;
  }

  hideLoading() {
    const container = document.getElementById('collections-container');
    const loader = container.querySelector('.loader-container');
    if (loader) {
      loader.remove();
    }
  }

  showEmptyCollections() {
    const container = document.getElementById('collections-container');
    container.innerHTML = `
      <div class="empty-collections" role="alert">
        <div class="empty-collections-icon">
          <i class="fas fa-bookmark"></i>
        </div>
        <h3>Oops! Koleksimu Masih Kosong</h3>
        <p>Belum ada cerita yang kamu simpan di sini.</p>
        <p>Yuk, jelajahi cerita seru dan klik <strong>"Add to My Collections"</strong> biar bisa kamu baca kapan pun, bahkan tanpa internet!</p>
        <a href="#/" class="btn btn-primary">
          <i class="fas fa-search"></i> Temukan Ceritamu
        </a>
      </div>
    `;
  }

  showError(message) {
    const container = document.getElementById('collections-container');
    container.innerHTML = `
      <div class="alert alert-error" role="alert">
        <p>Failed to load your collections: ${message}. Please try again.</p>
        <button onclick="location.reload()" class="btn btn-outline">Retry</button>
      </div>
    `;
  }

  displayCollections(stories) {
    const container = document.getElementById('collections-container');
    
    if (!stories || stories.length === 0) {
      this.showEmptyCollections();
      return;
    }

    const storiesHTML = stories.map(story => this.#createStoryCard(story)).join('');
    
    container.innerHTML = `
      <div class="collections-grid">
        ${storiesHTML}
      </div>
    `;

    // Update collection count
    this.#updateCollectionCount(stories.length);
  }

  #createStoryCard(story) {
    const formattedDate = showFormattedDate(story.createdAt);
    const addedDate = showFormattedDate(story.addedToCollectionAt);
    const locationText = story.lat && story.lon ? 'Has Location' : 'No Location';
    const locationIcon = story.lat && story.lon ? 'fas fa-map-marker-alt' : 'fas fa-map-marker-alt text-muted';

    return `
      <article class="story-card collection-card" data-story-id="${story.id}">
        <div class="story-card-header">
          <div class="story-card-image">
            <img src="${story.photoUrl}" alt="${story.name}" loading="lazy" />
            <div class="story-card-overlay">
              <div class="story-card-actions">
                <a href="#/detail/${story.id}" class="btn btn-primary btn-sm" aria-label="View story details">
                  <i class="fas fa-eye"></i> View
                </a>
                <button class="btn btn-danger btn-sm remove-from-collection-btn" 
                        data-story-id="${story.id}" 
                        aria-label="Remove story from collection">
                  <i class="fas fa-trash"></i> Remove
                </button>
              </div>
            </div>
          </div>
          <div class="story-card-badge">
            <i class="fas fa-bookmark"></i>
          </div>
        </div>
        
        <div class="story-card-content">
          <h3 class="story-card-title">
            <a href="#/detail/${story.id}" aria-label="View story: ${story.name}">
              ${story.name}
            </a>
          </h3>
          <p class="story-card-description">
            ${this.#truncateText(story.description, 100)}
          </p>
          
          <div class="story-card-meta">
            <div class="meta-item">
              <i class="fas fa-user"></i>
              <span>${story.name}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>${formattedDate}</span>
            </div>
            <div class="meta-item">
              <i class="${locationIcon}"></i>
              <span>${locationText}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-clock"></i>
              <span>Added: ${addedDate}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  #truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  #updateCollectionCount(count) {
    const countElement = document.getElementById('collection-count');
    if (countElement) {
      countElement.textContent = count;
    }
  }

  // Method to handle story removal
  async handleStoryRemoval(storyId) {
    try {
      await this.#presenter.removeFromCollection(storyId);
      // Refresh the collections display
      await this.#presenter.loadCollections();
    } catch (error) {
      console.error('Error removing story from collection:', error);
      this.showError('Failed to remove story from collection');
    }
  }
} 