import "../../src/LoginPage/Login.css";
import { useState } from "react";
import logo from "../../src/assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Step: "phone" | "otp" ───────────────────────────────────
  const [step, setStep] = useState("phone");

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Redirect path ────────────────────────────────────────────
  const returnTo = location.state?.returnTo || "/HomeSecond";

  // ── Pending wishlist action ──────────────────────────────────
  const pendingNumericId = location.state?.pendingNumericId || null;
  const pendingWishlist  = location.state?.pendingWishlist  || null;

  // ── Pending cart action ──────────────────────────────────────
  const pendingCartId  = location.state?.pendingCartId  || null;
  const pendingCartQty = location.state?.pendingCartQty || 1;

  // ── Countdown helper ─────────────────────────────────────────
  const startCooldown = (seconds = 30) => {
    setResendCooldown(seconds);
    const tick = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(tick); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── STEP 1 — Send OTP ────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!mobile || mobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/send-otp", { mobile });
      setStep("otp");
      startCooldown(30);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to send OTP. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2 — Verify OTP ──────────────────────────────────────
  const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setError("");

  if (!otp || otp.length < 4) {
    setError("Please enter the OTP sent to your number.");
    return;
  }

  setLoading(true);

  try {
    const response = await api.post("/auth/verify-otp", {
      mobile,
      otp,
    });

    const { token, userId } = response.data;

    // ✅ Save auth
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: userId,
        mobile,
      })
    );

    // ✅ Wait small time so interceptor/auth updates properly
    await new Promise((resolve) => setTimeout(resolve, 300));

    // // ✅ Complete pending wishlist
    // if (pendingNumericId) {
    //   try {
    //     await api.post(`/wishlist/${pendingNumericId}`);
    //   } catch (wishErr) {
    //     console.warn("Pending wishlist add failed:", wishErr);
    //   }
    // }

    // ✅ Complete pending cart
    if (pendingCartId) {
      try {
        await api.post(`/cart/${pendingCartId}?qty=${pendingCartQty}`);
      } catch (cartErr) {
        console.warn("Pending cart add failed:", cartErr);
      }
    }

    // ✅ Update parent auth state
    if (onLoginSuccess) {
      onLoginSuccess();
    }

    // ✅ Full refresh fixes repeated login issue
    navigate(returnTo, { replace: true });

  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.response?.data ||
      "Invalid OTP. Please try again.";

    setError(message);

  } finally {
    setLoading(false);
  }
};

  // ── Resend OTP ───────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setOtp("");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { mobile });
      startCooldown(30);
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* LEFT */}
      <div className="left-side">
        <img src={logo} alt="logo" className="loglogo" />
      </div>

      {/* RIGHT */}
      <div className="right-side">
        <div className="form-box">

          <img src={logo} alt="logo" className="loglogo1" />

          {/* Hint messages */}
          {pendingWishlist && (
            <p className="login-wishlist-hint">
              ❤️ Login to save this item to your wishlist
            </p>
          )}
          {pendingCartId && (
            <p className="login-wishlist-hint">
              🛒 Login to add this item to your cart
            </p>
          )}

          {/* Error */}
          {error && <p className="error-message">{error}</p>}

          {/* ── STEP 1: Phone number ── */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp}>
              <p className="otp-step-label">Enter your mobile number</p>

              <div className="input-group phone-input-group">
                <span className="phone-prefix">+91</span>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  maxLength={10}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, ""))
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP entry ── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <p className="otp-step-label">
                OTP sent to <strong>+91 {mobile}</strong>
              </p>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  maxLength={6}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? "Verifying…" : "Verify & Login"}
              </button>

              <div className="login-footer">
                <button
                  type="button"
                  className="link-text resend-btn"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                >
                  {resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>

                <span> | </span>

                <button
                  type="button"
                  className="link-text"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError("");
                  }}
                >
                  Change Number
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;