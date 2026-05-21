// src/ProductListing/ProductListing.jsx
import React, { useState, useEffect } from "react";
import "./ProductListing.css";
import { FaHeart, FaRegHeart, FaShoppingCart, FaCheck } from "react-icons/fa";
import atta from "../assets/atta.png";
import ProductDetail from "./ProductDetail";
import api from "../api";
import { useLocation, useNavigate } from "react-router-dom";
import { isLoggedIn, getLoggedUserId } from "../utils/auth";

function SkeletonCard() {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-text short" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text shorter" />
        <div className="skeleton skeleton-text short" />
      </div>
    </div>
  );
}

function ProductCard({
  item,
  isWishlisted,
  onToggleWishlist,
  onClick,
  onAddToCart,
}) {
  const variants =
    item.variants && item.variants.length > 0 ? item.variants : null;
  const [selectedVariant, setSelectedVariant] = useState(
    variants ? variants[0] : null
  );

  const [cartState, setCartState] = useState("idle");

  const actualPrice =
    selectedVariant?.price ??
    item.price;

  const discountPrice =
    selectedVariant?.discountPrice ??
    item.discountPrice ??
    null;

  const hasDiscount =
    discountPrice != null &&
    discountPrice < actualPrice;

  const finalPrice =
    hasDiscount
      ? discountPrice
      : actualPrice;

  const discountPct = hasDiscount
    ? Math.round(
        ((actualPrice - discountPrice) / actualPrice) * 100
      )
    : null;

  const mrpPrice = actualPrice;
  const salePrice = finalPrice;

  const isOutOfStock =
    item.stockStatus === "OUT_OF_STOCK" ||
    (selectedVariant && selectedVariant.stock === 0);

  const isLowStock =
    !isOutOfStock &&
    (selectedVariant ? selectedVariant.stock <= 5 : item.stock <= 5);

  const getBadge = () => {
    if (discountPct >= 20) return { label: `${discountPct}% OFF`, cls: "badge-sale" };
    if (discountPct > 0)   return { label: `${discountPct}% OFF`, cls: "badge-sale" };
    if (item.isNew)        return { label: "New",      cls: "badge-new" };
    if (item.isHot)        return { label: "Hot deal", cls: "badge-hot" };
    if (item.isPopular)    return { label: "Popular",  cls: "badge-popular" };
    return null;
  };

  const badge    = getBadge();
  const qtyLabel = selectedVariant?.variantName || item.quantity || item.weight || null;

  // ✅ FIX: use variantId ?? id so the correct variant is saved to wishlist
 const navigate = useNavigate();

const handleToggleWishlist = (e) => {
  e.stopPropagation();

  if (!isLoggedIn()) {
    navigate("/Login");
    return;
  }

  onToggleWishlist({
    ...item,
    selectedVariant,
    variantId: selectedVariant?.variantId ?? selectedVariant?.id ?? null,
    variantName: selectedVariant?.variantName ?? null,
    price: actualPrice,
    discountPrice: discountPrice,
  });
};
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (cartState === "loading" || isOutOfStock) return;

    if (!isLoggedIn()) {
      if (onAddToCart) {
        onAddToCart({
          ...item,
          selectedVariant,
          price:        mrpPrice,
          variantId:    selectedVariant?.variantId ?? selectedVariant?.id ?? null,
          requiresAuth: true,
        });
      }
      return;
    }

    const productId = item.id;
    const variantId = selectedVariant?.variantId ?? selectedVariant?.id ?? null;

    if (variants && !variantId) {
      alert("Please select a variant before adding to cart.");
      return;
    }

    try {
      setCartState("loading");

      const params = new URLSearchParams({ qty: 1 });
      if (variantId) params.append("variantId", variantId);

      await api.post(`/cart/${productId}?${params.toString()}`);

      setCartState("success");

      if (onAddToCart) {
        onAddToCart({ ...item, selectedVariant, price: mrpPrice, variantId });
      }

      setTimeout(() => setCartState("idle"), 2000);
    } catch (err) {
      console.error("Add to cart failed:", err);
      setCartState("error");
      setTimeout(() => setCartState("idle"), 2000);
    }
  };

  const cartBtnLabel = () => {
    if (cartState === "loading") return "Adding…";
    if (cartState === "success") return "Added!";
    if (cartState === "error")   return "Failed";
    return "Add to Cart";
  };

  const cartBtnClass = () => {
    const base = "add-to-cart-btn";
    if (cartState === "loading") return `${base} cart-loading`;
    if (cartState === "success") return `${base} cart-success`;
    if (cartState === "error")   return `${base} cart-error`;
    return base;
  };

  return (
    <div
      className={`product-card ${isOutOfStock ? "oos-card" : ""}`}
      onClick={!isOutOfStock ? onClick : undefined}
      style={{ cursor: isOutOfStock ? "default" : "pointer" }}
    >
      <div className="product-img-wrap">
        {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
        {isOutOfStock && (
          <div className="oos-overlay">
            <span className="oos-label">Out of Stock</span>
          </div>
        )}

        <button
          className={`heart-btn ${isWishlisted ? "active" : ""}`}
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? <FaHeart color="#e05c5c" /> : <FaRegHeart />}
        </button>

        <img
          src={item.imageUrl || atta}
          alt={item.name}
          className={isOutOfStock ? "img-oos" : ""}
          onError={(e) => { e.target.onerror = null; e.target.src = atta; }}
        />
      </div>

      <div className="product-info">
        {item.brand && <p className="product-brand">{item.brand}</p>}
        <h4 className="product-name">{item.name}</h4>
        {qtyLabel && <span className="qty-pill">{qtyLabel}</span>}

        {variants && (
          <div className="weight-selector">
            {variants.map((v, vi) => (
              <button
                key={`${v.variantName ?? v.id ?? "v"}-${vi}`}
                className={`weight-btn ${
                  selectedVariant?.variantName === v.variantName ? "selected" : ""
                } ${v.stock === 0 ? "oos-variant" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVariant(v);
                  setCartState("idle");
                }}
                disabled={v.stock === 0}
                title={v.stock === 0 ? "Out of stock" : `Stock: ${v.stock}`}
              >
                {v.variantName}
              </button>
            ))}
          </div>
        )}

        <div className="price-wrap">
          <span className="price-main">
            {mrpPrice != null ? `₹${mrpPrice}` : "—"}
          </span>
          {hasDiscount && !isOutOfStock && (
            <span className="price-strike">₹{actualPrice}</span>
          )}
          {hasDiscount && !isOutOfStock && (
            <span className="saving-tag">Save ₹{mrpPrice - salePrice}</span>
          )}
        </div>

        {item.taxIncluded && <p className="tax-label">Incl. all taxes</p>}

        <div
          className={`stock-row ${
            isOutOfStock ? "out-stock" : isLowStock ? "low-stock" : "in-stock"
          }`}
        >
          <span className="stock-dot" />
          <span className="stock-label">
            {isOutOfStock
              ? "Out of stock"
              : isLowStock
              ? `Only ${selectedVariant?.stock ?? item.stock} left`
              : "In stock"}
          </span>
        </div>

        {!isOutOfStock && (
          <button
            className={cartBtnClass()}
            onClick={handleAddToCart}
            disabled={cartState === "loading" || cartState === "success"}
          >
            {cartState === "success" ? (
              <FaCheck style={{ marginRight: 6 }} />
            ) : (
              <FaShoppingCart style={{ marginRight: 6 }} />
            )}
            {cartBtnLabel()}
          </button>
        )}
      </div>
    </div>
  );
}

function ProductListing({
  selectedCategory,
  onAddToWishlist,
  wishlistIds = [],
  onAddToCart,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [products,        setProducts]        = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const justAdded = location.state?.justAddedWishlist || null;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/products");
      const data     = response.data;
      const list     = Array.isArray(data)
        ? data
        : data.products ?? data.content ?? data.data ?? [];

      const seen   = new Set();
      const unique = list.filter((p) => {
        const id = p.productId ?? p.id;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      setProducts(unique);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { setSelectedProduct(null); }, [selectedCategory]);

  const handleAddToCart = (cartItem) => {
    if (cartItem.requiresAuth) {
      navigate("/Login", {
        state: {
          returnTo:       location.pathname,
          pendingCartId:  cartItem.productId ?? cartItem.id,
          pendingCartQty: 1,
        },
      });
      return;
    }
    if (onAddToCart) onAddToCart(cartItem);
  };

  const visibleProducts = selectedCategory
    ? products.filter((p) => {
        const catName = p.category?.name ?? p.category ?? "";
        const catId   = p.category?.id ?? p.categoryId ?? p.category?.categoryId;
        return (
          catName === selectedCategory.name ||
          catId   === selectedCategory.categoryId
        );
      })
    : products;

  if (selectedProduct) {
    return (
      <ProductDetail
        item={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        isWishlisted={wishlistIds.includes(
  `${selectedProduct.id}-${
    selectedProduct.variants?.[0]?.id ?? "no-variant"
  }`
)}
        onToggleWishlist={onAddToWishlist}
        onAddToCart={handleAddToCart}
      />
    );
  }

  const pageTitle = selectedCategory
    ? selectedCategory.name.toUpperCase()
    : "ALL PRODUCTS";

  return (
    <div className="product-container">

      {justAdded && (
        <div className="wishlist-return-toast">
          ❤️ Item added to your wishlist!
        </div>
      )}

      {!loading && (
        <div className="page-header">
          <h2 className="title">{pageTitle}</h2>
          {!error && (
            <span className="product-count">
              {visibleProducts.length} item
              {visibleProducts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="fetch-error">
          <p>{error}</p>
          <button onClick={fetchProducts}>Retry</button>
        </div>
      )}

      {!loading && !error && visibleProducts.length === 0 && selectedCategory && (
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <p className="empty">
            No products found in "{selectedCategory.name}".
          </p>
        </div>
      )}

      {!loading && !error && visibleProducts.length > 0 && (
        <div className="product-grid">
          {visibleProducts.map((item, index) => (
            <ProductCard
              key={`${item.productId ?? item.id ?? "item"}-${index}`}
              item={item}
             isWishlisted={wishlistIds.includes(
  `${item.id}-${item.variants?.[0]?.id ?? "no-variant"}`
)}
              onToggleWishlist={onAddToWishlist}
              onClick={() => setSelectedProduct(item)}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductListing;