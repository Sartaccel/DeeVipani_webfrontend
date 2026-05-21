import React, { useState } from "react";
import "../../src/NextNavbar/NextNavbar.css";
import { useNavigate, Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaHeart,
  FaBars,
  FaTimes
} from "react-icons/fa";

import lgoo from "../../src/assets/logo.png";

function NextNavbar({ wishlistIds = [] }) {

  const [dropdown, setDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  // ✅ Get user from localStorage
  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const userEmail = user?.email || "";

  // ✅ First letter from email
  const firstLetter = userEmail
    ? userEmail.charAt(0).toUpperCase()
    : "";

  // ✅ Logout
  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/Login");
  };

  return (
    <>
      <nav className="navbar">

        {/* LEFT - LOGO */}
        <div className="navbar-left">
          <img src={lgoo} alt="logo" />
        </div>

        {/* CENTER MENU */}
        <div className="navbar-center">
          <ul>

            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/Combooffers">
                Combo Offers
              </Link>
            </li>

            <li>
              <Link to="/Contact
              ">
                Contact Page
              </Link>
            </li>

          </ul>
        </div>

        {/* RIGHT */}
        <div className="navbar-right">

          {/* ✅ Wishlist */}
          <div
            className="linky"
            onClick={() => navigate("/Wishlist")}
            style={{
              cursor: "pointer",
              position: "relative"
            }}
          >
            <FaHeart className="icon11" />

            {wishlistIds.length > 0 && (
              <span className="nav-wishlist-count">
                {wishlistIds.length}
              </span>
            )}

            <span>Wishlist</span>
          </div>

          {/* ✅ Cart */}
          <Link to="/CartPage" className="linky">
            <FaShoppingCart className="icon11" />
            <span>Cart</span>
          </Link>

          {/* ✅ USER SECTION */}
          {/* ✅ LOGOUT SECTION */}
<div className="user-section linky">

  <button
    className="logout-btn"
    onClick={handleLogout}
  >
    Logout
  </button>

</div>

          {/* MOBILE MENU BUTTON */}
          <div
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>

        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <ul>

          <li>
            <Link to="/">
              Home
            </Link>
          </li>

          <li>
            <Link to="/Combooffers">
              Combo Offers
            </Link>
          </li>

          <li>
            <Link to="/Contact">
              Contact
            </Link>
          </li>

          

        </ul>
      </div>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}

export default NextNavbar;