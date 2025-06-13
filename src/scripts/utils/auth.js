const AUTH_KEY = "dicoding_story_auth";

export function saveAuth(authData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
}

export function getAuth() {
  const authData = localStorage.getItem(AUTH_KEY);
  return authData ? JSON.parse(authData) : null;
}

export function removeAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated() {
  const authData = getAuth();
  return !!authData && !!authData.loginResult && !!authData.loginResult.token;
}

export function getToken() {
  const authData = getAuth();
  return authData && authData.loginResult ? authData.loginResult.token : null;
}
