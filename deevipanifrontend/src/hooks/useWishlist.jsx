// src/hooks/useWishlist.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useWishlist() {
  const navigate = useNavigate();
  const location = useLocation();

  // Stores product.productId strings (e.g. "P4001") — used for heart icon UI state
  const [wishlistIds, setWishlistIds] = useState([]);

  // ── Load wishlist from backend ─────────────────────────────────────────────
  // JWT token in Authorization header (set by axios interceptor in api.js)
  // Backend reads email from SecurityContextHolder — NO ?email= param needed
  const loadWishlist = useCallback(async () => {
    const user = getUserFromStorage();
    if (!user?.id) {
  setWishlistIds([]);
  return;
}
    try {
      const response = await api.get("/wishlist"); // ✅ JWT only, no params
      const list = Array.isArray(response.data) ? response.data : [];
      // Each entry shape: { id, userEmail, product: { id, productId, name, ... }, createdAt }
      setWishlistIds(list);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // ── Toggle wishlist (add or remove) ───────────────────────────────────────
  // Always receives the FULL item object: { id (Long), productId (String), name, ... }
  // - item.id        = Product table PK / Wishlist row PK used in API path
  // - item.productId = frontend string like "P4001" used for UI state (heart icon)
  const toggleWishlist = useCallback(
    async (item) => {
      if (!item || typeof item !== "object") {
        console.warn("toggleWishlist: expected full item object, got", item);
        return;
      }

      const numericId  = item.id;        // Long — used in /api/wishlist/{id}
      const frontendId = item.productId; // String — used for wishlistIds[] state

      if (!numericId) {
        console.warn("toggleWishlist: item.id is missing", item);
        return;
      }

      const user = getUserFromStorage();

      // ── Not logged in → redirect to Login with pending action ────────────
      if (!user?.id) {
  navigate("/Login", {
    state: {
      returnTo: location.pathname,
      pendingNumericId: numericId,
      pendingWishlist: frontendId,
    },
  });
  return;
}

      // ── Logged in → optimistic UI update ─────────────────────────────────
      const existingWishlist = wishlistIds.find(
  (w) => w.product?.productId === frontendId
);

const isInList = !!existingWishlist;

      setWishlistIds((prev) =>
  isInList
    ? prev.filter(
        (w) => w.product?.productId !== frontendId
      )
    : [...prev, item]
);

      try {
        if (isInList) {
         await api.delete(`/wishlist/${existingWishlist.id}`); // ✅ no email param
        } else {
          const url =
  item.variantId !== null &&
  item.variantId !== undefined
    ? `/wishlist/${numericId}?variantId=${item.variantId}`
    : `/wishlist/${numericId}`;

await api.post(url);   // ✅ no email param
        }
      } catch (err) {
        console.error("Wishlist toggle failed:", err);
        // Rollback on error
        setWishlistIds((prev) =>
  isInList
    ? [...prev, existingWishlist]
    : prev.filter(
        (w) => w.product?.productId !== frontendId
      )
);
      }
    },
    [wishlistIds, navigate, location.pathname]
  );

  return { wishlistIds, setWishlistIds, toggleWishlist, loadWishlist };
}