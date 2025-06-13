import { getToken } from "../../utils/auth";
import * as DicodingAPI from "../../data/api";

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model = DicodingAPI }) {
    this.#view = view;
    this.#model = model;
  }

  /**
   * Memuat cerita dari API, dengan opsi pencarian kata kunci.
   * @param {string|null} query - Kata kunci pencarian cerita. Null jika ingin menampilkan semua.
   */
  async loadStories(query = null) {
    try {
      this.#view.showLoading(); 
      const token = getToken();

      if (!token) {
        this.#view.showLoginRequired();
        return;
      }

      let response;
      if (query && this.#model.getStoriesByQuery) {
        // Jika ada query dan API memiliki metode untuk itu
        response = await this.#model.getStoriesByQuery({ token, query });
      } else {
        // Jika tidak ada query atau API tidak mendukung pencarian, panggil getStories biasa
        response = await this.#model.getStories({ token });
      }

      if (response.error) {
        throw new Error(response.message);
      }

      if (!response.listStory || response.listStory.length === 0) {
        this.#view.showEmptyStories(query); 
        return;
      }

      this.#view.displayStories(response.listStory);
    } catch (error) {
      console.error("loadStories: error:", error);
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading(); 
    }
  }
}