import React, { useState, useEffect } from "react";
import logo from "../../src/assets/logo.png";
import "./Combooffers.css";
import Navbar from "../Navbar/Navbar";
import api from "../api";

const PREVIEW_COUNT = 4;

function PackCard({ pack }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const previewProducts = pack.products.slice(0, PREVIEW_COUNT);
  const hiddenProducts = pack.products.slice(PREVIEW_COUNT);
  const remainingCount = hiddenProducts.length;

  const mid = Math.ceil(hiddenProducts.length / 2);
  const col1 = hiddenProducts.slice(0, mid);
  const col2 = hiddenProducts.slice(mid);

  const handleCart = async () => {
    try {
      setLoading(true);
      await api.post(`/cart/combo/${pack.id}?qty=1`);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add combo to cart:", error);
      alert("Failed to add combo to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pack-card">

      {/* ── HEAD ── */}
      <div className="pack-head">

        <div className="pack-head-top">
          <p className="pack-title">{pack.name}</p>
          <img src={logo} alt="logo" className="pack-logo" />
        </div>

        {/* Full-width image thumbnail */}
        <div className="pack-image-wrap" onClick={() => setShowImage(true)}>
          <img
            src={pack.imageUrl || "https://via.placeholder.com/600x300"}
            alt={pack.name}
            className="pack-image"
          />
        </div>

        {pack.description && (
          <p className="pack-sub">{pack.description}</p>
        )}

        <div className="pack-price-row">
          <span className="pack-price-now">
            ₹{(pack.comboPrice || 0).toLocaleString("en-IN")}
          </span>
          <span className="pack-total-count">
            {pack.products.length} items
          </span>
        </div>
      </div>

      {/* ── IMAGE MODAL ── */}
      {showImage && (
        <div className="pack-image-modal" onClick={() => setShowImage(false)}>
          <img
            src={pack.imageUrl || "https://via.placeholder.com/900x600"}
            alt={pack.name}
            className="pack-image-modal-img"
          />
        </div>
      )}

      <div className="pack-divider" />

      {/* ── ITEMS ── */}
      <div className="pack-preview">
        <p className="pack-items-lbl">Items included</p>

        <ul className="pack-preview-list">
          {previewProducts.map((item, i) => (
            <li key={i} className="pack-item">
              <span className="pack-item-name">{item.productName}</span>
              <span className="pack-item-qty">{item.quantity}</span>
            </li>
          ))}
        </ul>

        {remainingCount > 0 && (
          <>
            <div
              className={`pack-expand-body ${
                expanded ? "pack-expand-body--open" : ""
              }`}
            >
              <div className="pack-expand-inner">
                <div className="pack-items-grid">
                  <ul className="pack-col">
                    {col1.map((item, i) => (
                      <li key={i} className="pack-item">
                        <span className="pack-item-name">{item.productName}</span>
                        <span className="pack-item-qty">{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="pack-col">
                    {col2.map((item, i) => (
                      <li key={i} className="pack-item">
                        <span className="pack-item-name">{item.productName}</span>
                        <span className="pack-item-qty">{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button
              className="pack-btn-toggle"
              onClick={() => setExpanded((p) => !p)}
            >
              {expanded
                ? "▲ Hide details"
                : `▼ View all ${pack.products.length} items (+${remainingCount} more)`}
            </button>
          </>
        )}
      </div>

      <div className="pack-divider" />

      {/* ── ACTIONS ── */}
      <div className="pack-actions">
        <button
          className={`pack-btn-cart ${added ? "done" : ""}`}
          onClick={handleCart}
          disabled={loading}
        >
          {loading ? "Adding…" : added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>

    </div>
  );
}

function Combooffers() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/combo-offers")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setPacks(data);
      })
      .catch((err) => {
        console.error("Failed to fetch combo offers:", err);
        setError("Failed to load combo offers. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="co-page">
      <Navbar />

      <div className="co-header">
        <h1>Combo Offers</h1>
      </div>

      {loading && (
        <div className="co-state">
          <p>Loading combo offers…</p>
        </div>
      )}

      {error && (
        <div className="co-state co-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && packs.length === 0 && (
        <div className="co-state">
          <p>No combo offers available at the moment.</p>
        </div>
      )}

      <div className="co-row">
        {packs.map((pack, index) => (
          <PackCard key={pack.id ?? index} pack={pack} />
        ))}
      </div>
    </div>
  );
}

export default Combooffers;