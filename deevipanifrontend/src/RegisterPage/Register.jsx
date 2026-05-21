import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import Logoo from "../assets/logo.png";
import api from "../api";

function Register() {
  const navigate = useNavigate();

  // Step: "register" | "otp"
  const [step, setStep] = useState("register");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(5000);

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (step !== "otp" || resendTimer === 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer, step]);

  // ─── Register Handlers ───────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", formData);
      setStep("otp");       // ✅ Switch to OTP step
      setResendTimer(30);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Handlers ────────────────────────────────────────────
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

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-otp", {
        email: formData.email,
        otp: otpString,
      });
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
      await api.post("/auth/resend-otp", { email: formData.email });
      setResendTimer(30);
      setError("");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="register-page">
      <div className="register-main">

        {/* LEFT SIDE - IMAGE */}
        <div className="left-section">
          <img src={Logoo} alt="register" />
        </div>

        {/* RIGHT SIDE */}
        <div className="right-section">
          <div className="register-container">

            {/* ── STEP 1: REGISTER FORM ── */}
            {step === "register" && (
              <>
                <h1>Create Account</h1>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleRegisterSubmit}>
                  <div className="name-row">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="mobileNumber"
                    placeholder="Mobile Number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                  <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                  </button>
                </form>

                <p>
                  Already have an account? <Link to="/Login">Login</Link>
                </p>
              </>
            )}

            {/* ── STEP 2: OTP VERIFICATION ── */}
            {step === "otp" && (
              <>
                <div className="otp-icon">✉</div>
                <h1>Verify Your Email</h1>
                <p className="otp-subtext">
                  We sent a 6-digit code to <br />
                  <strong>{formData.email}</strong>
                </p>

                {success ? (
                  <div className="otp-success">
                    ✓ Verified! Redirecting to Login...
                  </div>
                ) : (
                  <form onSubmit={handleOtpSubmit}>
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

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" disabled={loading}>
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

                <p className="back-link">
                  <button className="resend-btn" onClick={() => { setStep("register"); setError(""); }}>
                    ← Back to Register
                  </button>
                </p>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;