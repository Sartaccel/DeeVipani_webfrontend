// src/wishlistAPI.js
import api from "./api";

const GUEST_KEY = "guest_wishlist";
const PENDING_KEY = "pending_buy";

// ── Auth ─────────────────────────────
export const getToken = () => localStorage.getItem("token");
export const isLoggedIn = () => !!getToken();

// ── Guest Wishlist ───────────────────
export const getGuestWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveGuestWishlist = (ids) =>
  localStorage.setItem(GUEST_KEY, JSON.stringify(ids));

export const clearGuestWishlist = () =>
  localStorage.removeItem(GUEST_KEY);

// ── Pending Buy ──────────────────────
export const savePendingBuy = (productId) =>
  sessionStorage.setItem(PENDING_KEY, String(productId));

export const getPendingBuy = () =>
  sessionStorage.getItem(PENDING_KEY);

export const clearPendingBuy = () =>
  sessionStorage.removeItem(PENDING_KEY);

// ── API Calls ────────────────────────
const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const fetchWishlistAPI = async () => {
  try {
    const res = await api.get("/wishlist", {
      headers: authHeader(),
    });

    const data = res.data;

    const list = Array.isArray(data)
      ? data
      : data.wishlist ?? data.items ?? data.data ?? [];

    return list.map((item) => ({
      wishlistId: item.id,
      productId: item.product?.id ?? item.productId,
    }));

  } catch (err) {
    console.error("fetchWishlistAPI:", err);
    return [];
  }
};

export const addWishlistAPI = async (productId) => {
  try {
    await api.post(`/wishlist/${productId}`, null, {
      headers: authHeader(),
    });
    return true;
  } catch (err) {
    console.error("addWishlistAPI:", err);
    return false;
  }
};

export const removeWishlistAPI = async (wishlistId) => {
  try {
    await api.delete(`/wishlist/${wishlistId}`, {
      headers: authHeader(),
    });
    return true;
  } catch (err) {
    console.error("removeWishlistAPI:", err);
    return false;
  }
};

// ── Merge Guest → API ────────────────
export const mergeGuestToAPI = async (apiIds = []) => {
  const guestIds = getGuestWishlist();
  const toAdd = guestIds.filter((id) => !apiIds.includes(id));

  await Promise.allSettled(toAdd.map((id) => addWishlistAPI(id)));
  clearGuestWishlist();

  return [...new Set([...apiIds, ...toAdd])];
};

// ── Toggle Wishlist ──────────────────
export const toggleWishlist = async (
  productId,
  currentIds,
  setWishlistIds
) => {
  const isIn = currentIds.includes(productId);

  // Optimistic update
  setWishlistIds((prev) =>
    isIn ? prev.filter((id) => id !== productId) : [...prev, productId]
  );

  if (isLoggedIn()) {
    const ok = isIn
  ? await removeWishlistAPI(productId)
  : await addWishlistAPI(productId);

    if (!ok) {
      setWishlistIds((prev) =>
        isIn ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
    }
  } else {
    const updated = isIn
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId];

    saveGuestWishlist(updated);
  }
};