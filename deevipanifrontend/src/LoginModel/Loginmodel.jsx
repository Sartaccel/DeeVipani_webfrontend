import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import api from "../api";
import "../../src/LoginPage/Login.css";
import "../../src/LoginModel/Loginmodel.css"

function LoginModal({ onClose, onSuccess }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      onSuccess(user);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="lm-overlay" onClick={onClose}>
      {/* lm-wrapper overrides login-container sizing to fit inside the modal */}
      <div className="lm-wrapper" onClick={(e) => e.stopPropagation()}>

        {/* ✕ close button sits above the card */}
        <button className="lm-close-btn" onClick={onClose} aria-label="Close">✕</button>

        {/* Reuse the exact same .login-container layout your Login page uses */}
        <div className="login-container lm-inner">

          {/* LEFT — same blue panel with logo */}
          <div className="left-side">
            <img src={logo} alt="logo" className="loglogo" />
            <p className="lm-tagline">Login to save your<br />wishlist &amp; cart!</p>
          </div>

          {/* RIGHT — same form box */}
          <div className="right-side">
            <div className="form-box">
              <img src={logo} alt="logo" className="loglogo1" />

              {error && <p className="error-message">{error}</p>}

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="input-group">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="login-footer">
                <p>
                  Don't have an account?{" "}
                  {/* Closes modal first, then navigates to the existing register page */}
                  <Link to="/register" className="link-text" onClick={onClose}>
                    Register
                  </Link>
                  {" | "}
                  <Link to="/ForgetPassword" className="link-text" onClick={onClose}>
                    Forgot Password?
                  </Link>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}

export default LoginModal;