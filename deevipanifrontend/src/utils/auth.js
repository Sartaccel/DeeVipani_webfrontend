// src/utils/auth.js

/** Returns true if a valid token exists in localStorage */
export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

/** Returns the logged-in user's id, or null */
export function getLoggedUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** Clears all auth data */
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}