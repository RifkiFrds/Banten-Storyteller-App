import CONFIG from "../config";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  GUEST_STORIES: `${CONFIG.BASE_URL}/stories/guest`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

// Helper function untuk menangani respons fetch
async function handleApiResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    // Jika respons bukan 2xx (misalnya 4xx atau 5xx), lemparkan error
    // Pesan error dari API akan digunakan jika tersedia, jika tidak, gunakan status teks
    throw new Error(data.message || response.statusText);
  }
  return data;
}

export async function registerUser({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  return await handleApiResponse(response);
}

export async function loginUser({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return await handleApiResponse(response);
}

/**
 * Mengambil daftar cerita dari API.
 * @param {object} params - Objek parameter.
 * @param {number} [params.page] - Nomor halaman.
 * @param {number} [params.size] - Jumlah cerita per halaman.
 * @param {boolean} [params.location] - Filter berdasarkan lokasi (1 untuk ada lokasi, 0 untuk tidak ada).
 * @param {string} [params.query] - Kata kunci pencarian (misalnya, nama cerita atau deskripsi).
 * @param {string} params.token - Token autentikasi pengguna.
 * @returns {Promise<object>} Data respons dari API.
 */
export async function getStories({ page, size, location, query, token }) {
  const queryParams = new URLSearchParams();

  if (page) queryParams.append("page", page);
  if (size) queryParams.append("size", size);
  if (location !== undefined) queryParams.append("location", location ? 1 : 0);
  if (query) queryParams.append("q", query); // Menambahkan parameter 'q' untuk pencarian

  const url = `${ENDPOINTS.STORIES}?${queryParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await handleApiResponse(response);
}

export async function getStoryDetail({ id, token }) {
  const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await handleApiResponse(response);
}

export async function addStory({ description, photo, lat, lon, token }) {
  const formData = new FormData();

  formData.append("description", description);
  formData.append("photo", photo);

  if (lat !== undefined && lat !== null) formData.append("lat", lat); 
  if (lon !== undefined && lon !== null) formData.append("lon", lon); 

  const response = await fetch(ENDPOINTS.STORIES, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return await handleApiResponse(response);
}

export async function addGuestStory({ description, photo, lat, lon }) {
  const formData = new FormData();

  formData.append("description", description);
  formData.append("photo", photo);

  if (lat !== undefined && lat !== null) formData.append("lat", lat);
  if (lon !== undefined && lon !== null) formData.append("lon", lon);

  const response = await fetch(ENDPOINTS.GUEST_STORIES, {
    method: "POST",
    body: formData,
  });

  return await handleApiResponse(response);
}

export async function subscribeNotification({ subscription, token }) {
  // Body yang dikirim sekarang akan menyertakan objek 'keys'
  const body = {
    endpoint: subscription.endpoint,
    keys: subscription.keys, // <-- KITA TAMBAHKAN FIELD INI SESUAI ERROR
  };

  const response = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return await handleApiResponse(response);
}

export async function unsubscribeNotification({ endpoint, token }) {
  const response = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: "DELETE", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint,
    }),
  });

  return await handleApiResponse(response);
}