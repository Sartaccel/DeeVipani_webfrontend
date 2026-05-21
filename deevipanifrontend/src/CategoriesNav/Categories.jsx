import React, { useState, useEffect } from "react";
import "./Categories.css";
import { FaBars, FaTimes } from "react-icons/fa";
import api from "../api";

function Categories({ onSelectCategory, selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [open,       setOpen]       = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/categories");
        const data = response.data;

        const list = Array.isArray(data)
          ? data
          : data.categories ?? data.content ?? data.data ?? [];

        const normalized = list.map((item, index) => {
          if (typeof item === "string") {
            return { categoryId: index, name: item };
          }
          return {
            categoryId: item.categoryId ?? item.id ?? index,
            name:       item.name ?? item.category ?? item.title ?? String(item),
          };
        });

        setCategories(normalized);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleClick = (cat) => {
    setOpen(false);
    onSelectCategory(cat);
  };

  return (
    <>
      {/* Toggle button */}
      <div
        className={`sidebar-toggle ${open ? "move" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle categories"
      >
        {open ? <FaTimes /> : <FaBars />}
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${open ? "active" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div className={`sidebar ${open ? "open" : ""}`}>
        <h3 className="sidebar-title">Categories</h3>

        {/* Skeleton */}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="sidebar-skeleton" />
          ))}

        {/* Error */}
        {error && !loading && (
          <div className="sidebar-error">{error}</div>
        )}

        {/* List */}
        {!loading && !error &&
          categories.map((cat) => (
            <div
              key={cat.categoryId}
              className={`sidebar-item ${
                selectedCategory?.categoryId === cat.categoryId ? "active" : ""
              }`}
              onClick={() => handleClick(cat)}
            >
              {cat.name}
            </div>
          ))}
      </div>
    </>
  );
}

export default Categories;