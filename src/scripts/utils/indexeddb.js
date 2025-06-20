class IndexedDBService {
  constructor() {
    this.dbName = 'BantenStorytellerDB';
    this.dbVersion = 1;
    this.storeName = 'storyCollections';
    this.db = null;
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = event => {
        const db = event.target.result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: false,
          });

          // Create indexes for better querying
          store.createIndex('title', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('location', 'lat', { unique: false });
        }
      };
    });
  }

  async addStory(story) {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Add timestamp for when story was added to collection
      const storyWithTimestamp = {
        ...story,
        addedToCollectionAt: new Date().toISOString(),
      };

      const request = store.add(storyWithTimestamp);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        if (request.error.name === 'ConstraintError') {
          reject(new Error('Story already exists in collection'));
        } else {
          reject(new Error('Failed to add story to collection'));
        }
      };
    });
  }

  async getStory(id) {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get story from collection'));
      };
    });
  }

  async getAllStories() {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by date added to collection (newest first)
        const stories = request.result.sort(
          (a, b) => new Date(b.addedToCollectionAt) - new Date(a.addedToCollectionAt)
        );
        resolve(stories);
      };

      request.onerror = () => {
        reject(new Error('Failed to get stories from collection'));
      };
    });
  }

  async deleteStory(id) {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to delete story from collection'));
      };
    });
  }

  async isStoryInCollection(id) {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(!!request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to check if story is in collection'));
      };
    });
  }

  async getCollectionCount() {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get collection count'));
      };
    });
  }

  async clearCollection() {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear collection'));
      };
    });
  }
}

// Create singleton instance
const indexedDBService = new IndexedDBService();

export default indexedDBService;
