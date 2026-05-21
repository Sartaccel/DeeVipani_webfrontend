// src/ProductListing/ProductDetail.jsx
import React, { useState } from "react";
import "./ProductDetails.css";
import atta from "../assets/atta.png";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import { isLoggedIn, getLoggedUserId } from "../utils/auth";

function ProductDetail({ item, onBack, isWishlisted, onToggleWishlist, onAddToCart, onBuyNow }) {
  const navigate = useNavigate();
  const location = useLocation();

  const variants = item?.variants?.length > 0 ? item.variants : null;
  const [selectedVariant, setSelectedVariant] = useState(variants ? variants[0] : null);

  const [cartLoading, setCartLoading] = useState(false);
  const [cartError,   setCartError]   = useState(null);

  const mrpPrice  = selectedVariant?.price ?? item?.price;
  const salePrice = selectedVariant
    ? selectedVariant.discountPrice ?? null
    : item?.discountPrice ?? null;

  const hasDiscount = salePrice != null && mrpPrice != null && salePrice < mrpPrice;
  const savings     = hasDiscount ? mrpPrice - salePrice : 0;
  const discountPct = hasDiscount ? Math.round((savings / mrpPrice) * 100) : 0;

  const variantStock = selectedVariant
    ? selectedVariant.stock
    : (item?.stockQuantity ?? item?.stockCount);
  const isOutOfStock = item?.stockStatus === "OUT_OF_STOCK" || variantStock === 0;
  const isLowStock   = !isOutOfStock && variantStock > 0 && variantStock <= 10;

  // ── Build cart URL ─────────────────────────────────────────────
  function buildCartUrl(qty = 1) {
    // ✅ FIX: prefer variantId field, fall back to id
    const variantId = selectedVariant?.variantId ?? selectedVariant?.id ?? null;

    if (variants && !variantId) {
      throw new Error("Please select a valid variant before adding to cart.");
    }

    const params = new URLSearchParams({ qty });
    if (variantId) params.append("variantId", variantId);

    const productId = item?.id;
    return `/cart/${productId}?${params.toString()}`;
  }

  // ── Redirect to login with cart intent saved ───────────────────
  function redirectToLogin() {
    navigate("/Login", {
      state: {
        returnTo:       location.pathname,
        pendingCartId:  item?.productId ?? item?.id,
        pendingCartQty: 1,
      },
    });
  }

  // ── Add to Cart ────────────────────────────────────────────────
  async function handleAddToCart() {
    if (!isLoggedIn()) { redirectToLogin(); return; }

    try {
      setCartLoading(true);
      setCartError(null);

      await api.post(buildCartUrl(1));

      if (onAddToCart) {
        onAddToCart({
          ...item,
          selectedVariant,
          price:       mrpPrice,
          salePrice,
          variantName: selectedVariant?.variantName ?? null,
          stock:       variantStock,
        });
      }

      navigate("/CartPage");
    } catch (error) {
      console.error("Add to cart failed:", error);
      setCartError(error.message ?? "Failed to add to cart. Please try again.");
    } finally {
      setCartLoading(false);
    }
  }

  // ── Buy Now ────────────────────────────────────────────────────
  async function handleBuyNow() {
    if (!isLoggedIn()) { redirectToLogin(); return; }

    try {
      setCartLoading(true);
      setCartError(null);

      await api.post(buildCartUrl(1));

      if (onAddToCart) {
        onAddToCart({
          ...item,
          selectedVariant,
          price:       mrpPrice,
          salePrice,
          variantName: selectedVariant?.variantName ?? null,
          stock:       variantStock,
        });
      }

      if (onBuyNow) onBuyNow(item);
      navigate("/CartPage");
    } catch (error) {
      console.error("Buy now failed:", error);
      setCartError(error.message ?? "Failed to process. Please try again.");
    } finally {
      setCartLoading(false);
    }
  }

  return (
    <div className="pd-page">

      <button className="pd-back-btn" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
          stroke="currentColor" strokeWidth="2.5">
          <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to results
      </button>

      <div className="pd-card">
        <div className="pd-grid">

          <div className="pd-img-wrap">
            {/* ✅ FIX: variantId uses variantId ?? id — correct variant saved to wishlist */}
            <button
              className={`pd-heart-btn${isWishlisted ? " active" : ""}`}
              onClick={() => {
                if (!onToggleWishlist) return;
                onToggleWishlist({
                  ...item,
                  variantId:    selectedVariant?.variantId ?? selectedVariant?.id ?? null,
                  variantName:  selectedVariant?.variantName ?? null,
                  price:        selectedVariant?.price ?? item.price,
                  discountPrice:
  selectedVariant
    ? null
    : item.discountPrice ?? null,
                });
              }}
              aria-label="Wishlist"
            >
              {isWishlisted ? <FaHeart color="#e05c5c" /> : <FaRegHeart />}
            </button>

            {discountPct > 0 && (
              <span className="pd-img-badge">{discountPct}% OFF</span>
            )}

            <img
              src={item?.imageUrl || atta}
              alt={item?.name || "Product"}
              onError={(e) => { e.target.onerror = null; e.target.src = atta; }}
            />
          </div>

          <div className="pd-info">
            {item?.brand && <p className="pd-brand">{item.brand}</p>}
            <h1 className="pd-name">{item?.name || "Product"}</h1>

            {(item?.quantity || item?.weight) && (
              <span className="pd-qty-pill">{item.quantity || item.weight}</span>
            )}

            {isOutOfStock && <span className="pd-oos-badge">Out of Stock</span>}
            {isLowStock    && <p className="pd-low-stock">Only {variantStock} left!</p>}

            <div className="pd-price-row">
              <span className="pd-price">
                {mrpPrice != null ? `₹${mrpPrice.toLocaleString("en-IN")}` : "—"}
              </span>
              {hasDiscount && (
                <span className="pd-mrp">₹{salePrice.toLocaleString("en-IN")}</span>
              )}
              {hasDiscount && (
                <span className="pd-save">Save ₹{savings.toLocaleString("en-IN")}</span>
              )}
            </div>

            {item?.taxIncluded && <p className="pd-tax">Inclusive of all taxes</p>}

            {variants && (
              <div className="pd-variants-wrap">
                <p className="pd-variants-label">Pack size</p>
                <div className="pd-variants">
                  {variants.map((v) => (
                    <button
                      key={v.variantName}
                      className={`pd-variant-btn${
                        selectedVariant?.variantName === v.variantName ? " active" : ""
                      }${v.stock === 0 ? " oos" : ""}`}
                      onClick={() => { setSelectedVariant(v); setCartError(null); }}
                      disabled={v.stock === 0}
                      title={v.stock === 0 ? "Out of stock" : `${v.stock} in stock`}
                    >
                      {v.variantName}
                      {v.stock === 0 && <span className="pd-variant-x">✕</span>}
                    </button>
                  ))}
                </div>
                {selectedVariant && (
                  <p className="pd-variant-price-note">
                    Price for <strong>{selectedVariant.variantName}</strong>:{" "}
                    <strong>₹{mrpPrice}</strong>
                  </p>
                )}
              </div>
            )}

            {item?.category?.name && (
              <p className="pd-category">
                Category: <strong>{item.category.name}</strong>
              </p>
            )}

            {cartError && <p className="pd-cart-error">{cartError}</p>}

            <div className="pd-actions">
              <button
                className="pd-cart-btn"
                disabled={isOutOfStock || cartLoading}
                onClick={handleAddToCart}
              >
                <FaShoppingCart />
                {cartLoading ? "Adding..." : isOutOfStock ? "Unavailable" : "Add to Cart"}
              </button>
              <button
                className="pd-buy-btn"
                disabled={isOutOfStock || cartLoading}
                onClick={handleBuyNow}
              >
                {cartLoading ? "Please wait..." : isOutOfStock ? "Unavailable" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {item?.description && (
        <div className="pd-card">
          <p className="pd-section-title">Product description</p>
          <p className="pd-desc">{item.description}</p>
        </div>
      )}

    </div>
  );
}

export default ProductDetail;