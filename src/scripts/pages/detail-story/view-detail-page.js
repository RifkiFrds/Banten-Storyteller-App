import { showFormattedDate } from "../../utils";
import ViewDetailPresenter from "./view-detail-presenter";
import * as DicodingAPI from "../../data/api";

export default class ViewDetailPage {
  #presenter = null;

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
    this.#injectAlert("Login required. <a href='#/login'>Login</a> or <a href='#/register'>Register</a>");
  }

  showError(message) {
    this.#injectAlert(message || "Failed to load story. Please try again later.");
  }

  #injectAlert(message) {
    const container = document.getElementById("story-detail-container");
    container.innerHTML = `
      <div class="alert alert-error" role="alert">
        <p>${message}</p>
      </div>
    `;
  }

  displayStoryDetail(story) {
    const container = document.getElementById("story-detail-container");

    const wordCount = story.description.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200); 

    container.innerHTML = `
      <div class="detail-container" style="view-transition-name: story-${story.id}">
        <a href="#/" class="btn btn-outline mb-4">← Back to Stories</a>

        <article class="detail-card">
          <header>
            <h1 class="detail-title" id="story-title">📖 ${story.name}'s Story</h1>
            <div class="detail-meta">
              <span class="badge">${showFormattedDate(story.createdAt)}</span>
              <span class="badge">${wordCount} words</span>
              <span class="badge">~${readTime} min read</span>
              <button id="copy-link-btn" class="btn btn-sm btn-secondary ml-2">Copy Link</button>
            </div>
          </header>

          <figure class="mt-4">
            <img src="${story.photoUrl}" alt="Photo shared by ${story.name}" class="detail-image rounded" />
          </figure>

          <div class="detail-description mt-4">
            <p>${story.description}</p>
          </div>

          ${story.lat && story.lon ? `
            <div class="map-container mt-4">
              <h3 id="map-heading">📍 Story Location</h3>
              <div id="map" class="map-box" role="img" aria-labelledby="map-heading"></div>
            </div>
          ` : ""}

          <div id="snackbar" class="snackbar">Link copied!</div>
        </article>
      </div>
    `;

    this.#addAccessibilityStyles();
    this.#enableCopyLink(story.id);
  }

  #enableCopyLink(id) {
    const copyBtn = document.getElementById("copy-link-btn");
    const snackbar = document.getElementById("snackbar");
    copyBtn?.addEventListener("click", () => {
      const link = `${location.origin}/#/detail/${id}`;
      navigator.clipboard.writeText(link).then(() => {
        snackbar.classList.add("show");
        setTimeout(() => snackbar.classList.remove("show"), 3000);
      });
    });
  }

  #addAccessibilityStyles() {
    if (!document.getElementById("sr-only-styles")) {
      const style = document.createElement("style");
      style.id = "sr-only-styles";
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
    const leafletCss = document.createElement("link");
    leafletCss.id = "leaflet-css";
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    leafletCss.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    leafletCss.crossOrigin = "";
    if (!document.getElementById("leaflet-css")) {
        document.head.appendChild(leafletCss);
    }
    
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    
    script.onload = () => {
      const map = L.map("map").setView([story.lat, story.lon], 14);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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