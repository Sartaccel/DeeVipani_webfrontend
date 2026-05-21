import "../../src/LoginPage/ForgetPassword.css";
import { useState, useRef } from "react";
import logo from "../../src/assets/logo.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../api";

function ForgetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const inputRefs = useRef([]);

  // ─── Step 1: Send OTP ─────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/password/forgot-password", { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to send OTP. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: OTP Box Handlers ─────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length < 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/password/verify-otp", { email, otp: otpString });
      toast.success("OTP verified!");
      setStep(3);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Invalid OTP. Please try again.";
      toast.error(message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/password/forgot-password", { email });
      toast.success("OTP resent!");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error("Failed to resend OTP.");
    }
  };

  // ─── Step 3: Reset Password ───────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/password/reset-password", {
        email,
        newPassword: password,
        confirmPassword,
      });
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/Login"), 1500);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to reset password. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="fp-container">

      {/* LEFT SIDE */}
      <div className="fp-left">
        <img src={logo} alt="logo" className="fp-logo" />
      </div>

      {/* RIGHT SIDE */}
      <div className="fp-right">
        <div className="fp-box">
          <img src={logo} alt="namelogo" className="resetlogo" />
          <h2>Forgot Password</h2>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? "active" : ""}`}>1</div>
            <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
            <div className={`step-dot ${step >= 2 ? "active" : ""}`}>2</div>
            <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
            <div className={`step-dot ${step >= 3 ? "active" : ""}`}>3</div>
          </div>

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <>
              <p className="fp-subtext">Enter your registered email address.</p>
              <form onSubmit={handleSendOtp}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <>
              <p className="fp-subtext">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
              <form onSubmit={handleVerifyOtp}>
                <div className="otp-inputs" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`otp-box ${digit ? "filled" : ""}`}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>

              {/* Resend — no timer */}
              <p className="resend-text">
                Didn't receive the code?{" "}
                <button className="resend-btn" onClick={handleResend}>
                  Resend OTP
                </button>
              </p>

              <p className="back-link">
                <button className="resend-btn" onClick={() => setStep(1)}>
                  ← Change Email
                </button>
              </p>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 3 && (
            <>
              <p className="fp-subtext">Set your new password.</p>
              <form onSubmit={handleResetPassword}>
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

        </div>
      </div>

    </div>
  );
}

export default ForgetPassword;