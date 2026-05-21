import React, { useState } from "react";
import "./HomeSecond.css";
import Categories from "../CategoriesNav/Categories";
import NextNavbar from "../NextNavbar/NextNavbar";
import ProductListing from "../ProductListing/ProductListing";

function HomeSecond({ wishlistIds, onAddToWishlist, onAddToCart, cartCount }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <>
      {/* ✅ cart badge in navbar */}
      <NextNavbar
        wishlistIds={wishlistIds}
        cartCount={cartCount}
      />

      <div className="app-layout">
        {/* LEFT SIDEBAR */}
        <Categories
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        {/* RIGHT CONTENT */}
        <div className="product-section">
          <ProductListing
            selectedCategory={selectedCategory}
            wishlistIds={wishlistIds}
            onAddToWishlist={onAddToWishlist}
            onAddToCart={onAddToCart}   
          />
        </div>
      </div>
    </>
  );
}

export default HomeSecond;