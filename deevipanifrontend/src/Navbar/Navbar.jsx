import React, { useState, useEffect } from "react";
import logo from "../../src/assets/logo.png";
import "../../src/Navbar/Navbar.css";
import { FaBars, FaTimes, FaUserPlus, FaSignInAlt,FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`nav-wrapper ${scrolled ? "scrolled" : ""}`}>
      <nav className="navbar">

        {/* Logo */}
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>

        {/* Links */}
        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li><Link to="/HomeSecond">Products</Link></li>
          <li><Link to="/Combooffers">Combo Offers</Link></li>
          
          <li><Link to="/Contact">Contact Page</Link></li>
        </ul>

        {/* Auth Buttons (RIGHT SIDE) */}
        <div className="auth-section">
          <Link to="/Login" className="icon-btn"><FaUserPlus /></Link>
         <button
    className="icon-btn"
    onClick={() => {
      localStorage.removeItem("token");
      window.location.href = "/Login";
    }}
  >
    <FaSignOutAlt />
  </button>
          
        </div>

        {/* Toggle */}
        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

      </nav>
    </header>
  );
}

export default Navbar;