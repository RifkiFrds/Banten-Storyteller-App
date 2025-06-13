import "../styles/styles.css";

import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  // Handle skip to content functionality
  const mainContent = document.querySelector("#main-content");
  const skipLink = document.querySelector(".skip-link");
  skipLink.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent page refresh
    skipLink.blur(); // Remove focus from skip link
    mainContent.focus(); // Focus on main content
    mainContent.scrollIntoView(); // Scroll to main content
  });
});
