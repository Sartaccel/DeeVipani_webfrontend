// src/Wishlish/Wishlist.jsx
import { FaRegHeart, FaArrowLeft, FaShoppingCart, FaTrash, FaTag } from "react-icons/fa";
import { MdLocalShipping } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import NextNavbar from "../NextNavbar/NextNavbar";
import ProductDetail from "../ProductListing/ProductDetail";
import api from "../api";
import "./Wishlist.css";

/* ── Skeleton ── */
function WishlistSkeleton() {
  return (
    <div className="fk-wl-item skeleton-wl-item">
      <div className="fk-wl-img-col">
        <div className="skeleton fk-sk-img" />
      </div>
      <div className="fk-wl-info-col">
        <div className="skeleton fk-sk-line long" />
        <div className="skeleton fk-sk-line medium" />
        <div className="skeleton fk-sk-line short" />
        <div className="skeleton fk-sk-line short" />
      </div>
    </div>
  );
}

/* ── Auth helper ── */
function isLoggedIn() {
  try {
    const token = localStorage.getItem("token");
    const raw   = localStorage.getItem("user");
    return !!token && !!raw && raw !== "undefined" && raw !== "null";
  } catch { return false; }
}

/* ═══════════════════════════════════════════════
   Wishlist Component
   ═══════════════════════════════════════════════ */
function Wishlist({ wishlistIds = [], onRemove, onAddToCart }) {
  const navigate = useNavigate();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState(null);
  const [selectedProduct,  setSelectedProduct]  = useState(null);
  const [movingToCart,     setMovingToCart]      = useState(null);
  const [removingId,       setRemovingId]        = useState(null);
  const [cartError,        setCartError]         = useState(null);

  // ── FETCH ─────────────────────────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn()) { setWishlistProducts([]); return; }
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/wishlist");
      const list = Array.isArray(response.data) ? response.data : [];

      const mapped = list
        .map((entry) => {
          const product = entry.product ?? entry;
          if (!product) return null;
          return {
            ...product,
            productDbId:     product.id,
            wishlistEntryId: entry.id,
            variantId:
              entry.variantId ??
              entry.variant?.variantId ??
              entry.variant?.id ??
              null,
            variantName:
              entry.variantName ??
              entry.variant?.variantName ??
              null,
            // Use saved variant price if available, fall back to product price
            price:
              entry.variant?.price ??
              product.price,
            discountPrice:
  entry.variant
    ? null
    : product.discountPrice ?? null,
          };
        })
        .filter(Boolean);

      setWishlistProducts(mapped);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setError("Could not load your wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Only fetch on mount — not on every wishlistIds change to avoid
  // infinite loop: onRemove → toggleWishlist → wishlistIds → fetchWishlist
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // ── REMOVE ────────────────────────────────────────────────────
  const handleRemove = async (item) => {
    const wishlistId = item.wishlistEntryId;
    setRemovingId(wishlistId);
    try {
      await api.delete(`/wishlist/${wishlistId}`);

      // ✅ Update local list immediately without waiting for a refetch
      setWishlistProducts((prev) =>
        prev.filter((p) => p.wishlistEntryId !== wishlistId)
      );

      // ✅ Notify parent to sync wishlistIds state (heart icon) only —
      //    do NOT let parent call api.delete again (it would double-delete)
      if (onRemove) {
        onRemove(item);
      }
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      setCartError(`Failed to remove "${item.name}" from wishlist.`);
    } finally {
      setRemovingId(null);
    }
  };

  // ── MOVE TO CART ──────────────────────────────────────────────
  const handleMoveToCart = async (item) => {
    const entryId = item.wishlistEntryId ?? item.id;
    setMovingToCart(entryId);
    setCartError(null);

    try {
      const params = new URLSearchParams();
      params.append("qty", 1);

      // ✅ Only append variantId if it exists
      if (item.variantId) {
        params.append("variantId", Number(item.variantId));
      }

      const productId = item.productDbId ?? item.id;

      await api.post(`/cart/${productId}?${params.toString()}`);

      if (onAddToCart) {
        onAddToCart(item);
      }

      // ✅ Remove from wishlist after successful cart add
      await handleRemove(item);
    } catch (err) {
      console.error("Failed to move to cart:", err);
      setCartError(`Failed to add "${item.name}" to cart. Please try again.`);
    } finally {
      setMovingToCart(null);
    }
  };

  // ── TOTALS ────────────────────────────────────────────────────
  const totalMRP = wishlistProducts.reduce(
    (s, i) => s + (i.price ?? 0),
    0
  );

  const totalSale = wishlistProducts.reduce(
    (s, i) => s + ((i.discountPrice ?? i.price) ?? 0),
    0
  );

  const totalSavings = totalMRP - totalSale;

  // ── PRODUCT DETAIL OVERLAY ────────────────────────────────────
  if (selectedProduct) {
    return (
      <ProductDetail
        item={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        isWishlisted={wishlistProducts.some(
          (p) =>
            (p.wishlistEntryId ?? p.id) ===
            (selectedProduct.wishlistEntryId ?? selectedProduct.id)
        )}
        onToggleWishlist={handleRemove}
        onAddToCart={onAddToCart}
      />
    );
  }

  // ── NOT LOGGED IN ─────────────────────────────────────────────
  if (!isLoggedIn()) {
    return (
      <>
        <NextNavbar wishlistIds={wishlistIds} />
        <div className="fk-wl-empty-wrap">
          <div className="fk-wl-empty-card">
            <FaRegHeart size={64} className="fk-empty-heart" />
            <h2>Your Wishlist is empty!</h2>
            <p>Login to view items you've saved earlier.</p>
            <button className="fk-login-btn" onClick={() => navigate("/Login")}>
              Login
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <NextNavbar wishlistIds={wishlistIds} />
        <div className="fk-wl-page">
          <div className="fk-wl-header-bar"><h1>My Wishlist</h1></div>
          <div className="fk-wl-body">
            <div className="fk-wl-list">
              {[1, 2, 3].map((i) => <WishlistSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────
  if (error) {
    return (
      <>
        <NextNavbar wishlistIds={wishlistIds} />
        <div className="fk-wl-empty-wrap">
          <div className="fk-wl-empty-card">
            <p className="fk-error-msg">{error}</p>
            <button className="fk-login-btn" onClick={fetchWishlist}>Retry</button>
          </div>
        </div>
      </>
    );
  }

  // ── EMPTY ─────────────────────────────────────────────────────
  if (wishlistProducts.length === 0) {
    return (
      <>
        <NextNavbar wishlistIds={wishlistIds} />
        <div className="fk-wl-empty-wrap">
          <div className="fk-wl-empty-card">
            <FaRegHeart size={64} className="fk-empty-heart" />
            <h2>Your Wishlist is empty!</h2>
            <p>
              Add items you like to your wishlist. Review them anytime and
              easily move them to the cart.
            </p>
            <button
              className="fk-continue-btn"
              onClick={() => navigate("/HomeSecond")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── MAIN WISHLIST ─────────────────────────────────────────────
  return (
    <>
      <NextNavbar wishlistIds={wishlistIds} />
      <div className="fk-wl-page">

        <div className="fk-wl-header-bar">
          <h1>
            My Wishlist{" "}
            <span className="fk-wl-count">({wishlistProducts.length} items)</span>
          </h1>
        </div>

        {cartError && (
          <div className="fk-cart-error-banner">
            {cartError}
            <button
              className="fk-cart-error-close"
              onClick={() => setCartError(null)}
            >
              ✕
            </button>
          </div>
        )}

        <div className="fk-wl-body">

          {/* ── Items list ── */}
          <div className="fk-wl-list">
            {wishlistProducts.map((item) => {
              const entryId     = item.wishlistEntryId ?? item.id;
              const mrpPrice    = item.price;
              const salePrice   = item.discountPrice;
              const hasDiscount =
                salePrice != null && mrpPrice != null && salePrice < mrpPrice;
              const saving      = hasDiscount ? mrpPrice - salePrice : 0;
              const discountPct = hasDiscount
                ? Math.round(((mrpPrice - salePrice) / mrpPrice) * 100)
                : null;
              const isOOS      =
                item.stockStatus === "OUT_OF_STOCK" || item.stockQuantity === 0;
              const isMoving   = movingToCart === entryId;
              const isRemoving = removingId   === entryId;

              return (
                <div
                  className={`fk-wl-item ${isOOS ? "fk-wl-oos" : ""} ${isRemoving ? "fk-wl-removing" : ""}`}
                  key={entryId}
                >
                  {/* Image */}
                  <div
                    className="fk-wl-img-col"
                    onClick={() => !isOOS && setSelectedProduct(item)}
                    style={{ cursor: isOOS ? "default" : "pointer" }}
                  >
                    {isOOS && (
                      <div className="fk-oos-overlay"><span>Out of Stock</span></div>
                    )}
                    <img
                      src={item.imageUrl || require("../assets/atta.png")}
                      alt={item.name}
                      className={isOOS ? "fk-img-grayscale" : ""}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = require("../assets/atta.png");
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="fk-wl-info-col">
                    {item.brand && <p className="fk-wl-brand">{item.brand}</p>}
                    <h3
                      className="fk-wl-name"
                      onClick={() => !isOOS && setSelectedProduct(item)}
                      style={{ cursor: isOOS ? "default" : "pointer" }}
                    >
                      {item.name}
                    </h3>

                    {/* Show saved variant name if present, else all variant options */}
                    {item.variantName ? (
                      <p className="fk-wl-variant">{item.variantName}</p>
                    ) : item.variants?.length > 0 && (
                      <p className="fk-wl-variant">
                        {item.variants.map((v) => v.variantName).join(" · ")}
                      </p>
                    )}

                    <div className="fk-wl-price-row">
                      <span className="fk-wl-sale">
                        ₹{(salePrice ?? mrpPrice).toLocaleString("en-IN")}
                      </span>
                      {hasDiscount && (
                        <span className="fk-wl-mrp">
                          ₹{mrpPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                      {discountPct && (
                        <span className="fk-wl-disc">{discountPct}% off</span>
                      )}
                    </div>

                    {saving > 0 && (
                      <p className="fk-wl-saving">
                        <FaTag size={10} /> You save ₹{saving.toLocaleString("en-IN")}
                      </p>
                    )}

                    {!isOOS && (
                      <p className="fk-wl-delivery">
                        <MdLocalShipping size={14} /> Free Delivery
                      </p>
                    )}

                    {!isOOS && item.stockQuantity > 0 && item.stockQuantity <= 10 && (
                      <p className="fk-wl-lowstock">Only {item.stockQuantity} left</p>
                    )}

                    <div className="fk-wl-actions">
                      <button
                        className={`fk-move-cart-btn ${isMoving ? "fk-moving" : ""}`}
                        disabled={isOOS || isMoving || isRemoving}
                        onClick={() => handleMoveToCart(item)}
                      >
                        <FaShoppingCart />
                        {isMoving ? "Moving…" : "Move to Cart"}
                      </button>
                      <button
                        className="fk-remove-btn"
                        disabled={isRemoving || isMoving}
                        onClick={() => handleRemove(item)}
                      >
                        <FaTrash />
                        {isRemoving ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="fk-wl-footer">
              <button
                className="fk-back-btn"
                onClick={() => navigate("/HomeSecond")}
              >
                <FaArrowLeft /> Continue Shopping
              </button>
            </div>
          </div>

          {/* ── Price summary sidebar ── */}
          <div className="fk-wl-summary">
            <h3 className="fk-sum-title">PRICE DETAILS</h3>

            <div className="fk-sum-row">
              <span>Price ({wishlistProducts.length} items)</span>
              <span>₹{totalMRP.toLocaleString("en-IN")}</span>
            </div>

            {totalSavings > 0 && (
              <div className="fk-sum-row discount">
                <span>Discount</span>
                <span>− ₹{totalSavings.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="fk-sum-row">
              <span>Delivery Charges</span>
              <span className="fk-free">FREE</span>
            </div>

            <div className="fk-sum-divider" />

            <div className="fk-sum-row total">
              <span>Total Amount</span>
              <span>₹{totalSale.toLocaleString("en-IN")}</span>
            </div>

            {totalSavings > 0 && (
              <p className="fk-sum-savings">
                🎉 You will save ₹{totalSavings.toLocaleString("en-IN")} on this wishlist
              </p>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default Wishlist;