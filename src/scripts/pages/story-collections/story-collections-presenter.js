export default class StoryCollectionsPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadCollections() {
    try {
      this.#view.showLoading();

      const stories = await this.#model.getAllStories();

      if (!stories || stories.length === 0) {
        this.#view.showEmptyCollections();
        return;
      }

      this.#view.displayCollections(stories);
      this.#setupRemoveButtons();
    } catch (error) {
      console.error('loadCollections: error:', error);
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async addToCollection(story) {
    try {
      await this.#model.addStory(story);
      return { success: true, message: 'Story added to collection successfully' };
    } catch (error) {
      console.error('addToCollection: error:', error);
      return { success: false, message: error.message };
    }
  }

  async removeFromCollection(storyId) {
    try {
      await this.#model.deleteStory(storyId);
      return { success: true, message: 'Story removed from collection successfully' };
    } catch (error) {
      console.error('removeFromCollection: error:', error);
      return { success: false, message: error.message };
    }
  }

  async clearCollection() {
    try {
      await this.#model.clearCollection();
      this.#view.showEmptyCollections();
      return { success: true, message: 'Collection cleared successfully' };
    } catch (error) {
      console.error('clearCollection: error:', error);
      return { success: false, message: error.message };
    }
  }

  async isStoryInCollection(storyId) {
    try {
      return await this.#model.isStoryInCollection(storyId);
    } catch (error) {
      console.error('isStoryInCollection: error:', error);
      return false;
    }
  }

  async getCollectionCount() {
    try {
      return await this.#model.getCollectionCount();
    } catch (error) {
      console.error('getCollectionCount: error:', error);
      return 0;
    }
  }

  #setupRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-from-collection-btn');

    removeButtons.forEach(button => {
      button.addEventListener('click', async event => {
        event.preventDefault();
        event.stopPropagation();

        const storyId = button.getAttribute('data-story-id');
        const storyCard = button.closest('.story-card');

        if (confirm('Are you sure you want to remove this story from your collection?')) {
          // Show loading state
          button.disabled = true;
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';

          try {
            const result = await this.removeFromCollection(storyId);

            if (result.success) {
              // Remove the card from DOM with animation
              storyCard.style.opacity = '0';
              storyCard.style.transform = 'scale(0.8)';

              setTimeout(() => {
                storyCard.remove();
                this.#updateCollectionCountAfterRemoval();
              }, 300);
            } else {
              // Reset button state
              button.disabled = false;
              button.innerHTML = '<i class="fas fa-trash"></i> Remove';
              alert('Failed to remove story: ' + result.message);
            }
          } catch (error) {
            // Reset button state
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-trash"></i> Remove';
            alert('Failed to remove story from collection');
          }
        }
      });
    });
  }

  async #updateCollectionCountAfterRemoval() {
    try {
      const count = await this.getCollectionCount();
      this.#view.displayCollections(await this.#model.getAllStories());
    } catch (error) {
      console.error('Error updating collection count:', error);
    }
  }
}
