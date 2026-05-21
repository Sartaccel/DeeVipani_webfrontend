import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home           from './HomePage/Home';
import Register       from './RegisterPage/Register';
import Otp            from './RegisterPage/Otp';
import Login          from './LoginPage/Login';
import ForgetPassword from './LoginPage/ForgetPassword';
import HomeSecond     from "./HomeSecond/HomeSecond";
import Wishlist       from "./Wishlish/Wishlist";
import Combooffers    from "./Combooffers/Combooffers";
import CartPage       from "./CartPage/CartPage";
import Contact        from "./Contact/Contact";

// ✅ NEW: central wishlist hook (handles auth check + API calls)
import { useWishlist } from "./hooks/useWishlist";

// ─────────────────────────────────────────────────────────────────────────────
// All Routes live here so they have access to the router context that
// useWishlist needs (useNavigate / useLocation require a Router ancestor).
// ─────────────────────────────────────────────────────────────────────────────
function AppRoutes() {

  // ✅ Replace old wishlist useState + toggleWishlist with the hook
  const { wishlistIds, toggleWishlist, loadWishlist } = useWishlist();

  // ── Cart (unchanged) ──────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.productId === item.productId);
      if (exists) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleUpdateCart = (productId, newQty) => {
    if (newQty < 1) {
      setCartItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, qty: newQty } : i
        )
      );
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <Routes>
      
      <Route path="/"               element={<Home />} />
      <Route path="/Register"       element={<Register />} />
      <Route path="/Otp"            element={<Otp />} />
      <Route path="/ForgetPassword" element={<ForgetPassword />} />
      <Route path="/Combooffers"    element={<Combooffers />} />
      <Route path="/Contact"        element={<Contact />} />

      {/* ✅ Login — after login, re-load wishlist from API so IDs sync */}
      <Route
        path="/Login"
        element={<Login onLoginSuccess={loadWishlist} />}
      />

      {/* HomeSecond — toggleWishlist now handles auth redirect automatically */}
      <Route
        path="/HomeSecond"
        element={
          <HomeSecond
            wishlistIds={wishlistIds}
            onAddToWishlist={toggleWishlist}
            onAddToCart={handleAddToCart}
            cartCount={cartCount}
          />
        }
      />

      {/* Wishlist page — fetches from API directly, onRemove keeps IDs in sync */}
      <Route
        path="/Wishlist"
        element={
          <Wishlist
            wishlistIds={wishlistIds}
            onRemove={toggleWishlist}
            onAddToCart={handleAddToCart}
          />
        }
      />

      {/* Cart page */}
      <Route
        path="/CartPage"
        element={
          <CartPage
            cartItems={cartItems}
            onUpdateCart={handleUpdateCart}
            onRemoveFromCart={handleRemoveFromCart}
            onCheckout={(items, total) => {
              console.log("Checkout →", items, total);
            }}
          />
        }
      />
    </Routes>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — BrowserRouter wraps AppRoutes so hooks can use router context
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <div>
      <ToastContainer />
      <Toaster position="top-right" />
     <BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
  <AppRoutes />
</BrowserRouter>
    </div>
  );
}

export default App;