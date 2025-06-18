import { getToken } from '../../utils/auth';
import * as DicodingAPI from '../../data/api';

export default class MapPresenter {
  #view;
  #model;

  constructor({ view, model = DicodingAPI }) {
    this.#view = view;
    this.#model = model;
  }

  async loadStoriesWithLocation() {
    const token = getToken();

    if (!token) {
      this.#view.showLoginRequired();
      return;
    }

    try {
      // Dicoding API dengan location=1 akan mengembalikan HANYA cerita yang punya lat/lon.
      const response = await this.#model.getStories({ token, location: 1 });

      if (response.error) {
        throw new Error(response.message || 'Gagal mengambil data cerita dari server.');
      }

      const storiesFromAPI = response.listStory;

      if (!storiesFromAPI) {
        // Kasus jika field listStory tidak ada, meskipun error: false
        console.warn("Respons API tidak memiliki field 'listStory'.");
        this.#view.showError('Format data cerita dari server tidak sesuai.');
        return;
      }

      if (storiesFromAPI.length === 0) {
        // Jika API (dengan location=1) tidak mengembalikan cerita,
        // berarti tidak ada cerita DENGAN LOKASI yang ditemukan.
        this.#view.showEmptyStoriesWithLocation();
        return;
      }

      // Filter tambahan di frontend untuk memastikan validitas data, meskipun API seharusnya sudah benar.
      const validStoriesWithLocation = storiesFromAPI.filter(
        story =>
          story.lat != null &&
          story.lon != null &&
          !isNaN(parseFloat(story.lat)) &&
          !isNaN(parseFloat(story.lon))
      );

      if (validStoriesWithLocation.length === 0) {
        // Jika setelah filter frontend, tidak ada yang valid.
        this.#view.showEmptyStoriesWithLocation(); // Tetap message ini karena query awal adalah untuk yang berlokasi
        return;
      }

      this.#view.displayMap(validStoriesWithLocation);
    } catch (error) {
      console.error('MapPresenter - loadStoriesWithLocation Error:', error);
      this.#view.showError(
        error.message || 'Tidak dapat memuat cerita untuk peta. Periksa koneksi Anda.'
      );
    }
  }
}
