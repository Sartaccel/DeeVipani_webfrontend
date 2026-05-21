import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import "./Otp.css";

function Otp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pass email via navigation state from Register page
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer === 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // allow only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp: otpString,
      });
      console.log("OTP verified:", response.data);
      setSuccess(true);
      setTimeout(() => navigate("/Login"), 1500);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Invalid OTP. Please try again.";
      setError(message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await api.post("/auth/resend-otp", { email });
      setResendTimer(30);
      setError("");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-card">

        <div className="otp-icon">
          <span>✉</span>
        </div>

        <h1>Verify Your Email</h1>
        <p className="otp-subtext">
          We sent a 6-digit code to <br />
          <strong>{email || "your email address"}</strong>
        </p>

        {success ? (
          <div className="otp-success">
            <span>✓</span> Verified successfully! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="otp-inputs" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`otp-box ${digit ? "filled" : ""}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && <p className="otp-error">{error}</p>}

            <button type="submit" className="otp-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        <p className="resend-text">
          Didn't receive the code?{" "}
          <button
            className="resend-btn"
            onClick={handleResend}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default Otp;