// src/Pages/login-signup/LoginSignUp.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginSignUp.css";

const LoginSignUp = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signin");
  const [userType, setUserType] = useState("customer");
  const [signinData, setSigninData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    dob: "",
    phone: "",
    companyName: "",
    contactPerson: "",
    aadharNumber: "",
    specialization: "",
    experience: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [resendTimeoutId, setResendTimeoutId] = useState(null);
  const [forgotError, setForgotError] = useState("");
  const otpRefs = useRef([]);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash === "signup" || hash === "signin") setActiveTab(hash);
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/session", { credentials: "include" });
      const data = await res.json();
      if (data.authenticated) {
        const role = data.user.role;
        if (role === "customer") navigate("/customerdashboard");
        else if (role === "company") navigate("/companydashboard");
        else if (role === "worker") navigate("/workerdashboard");
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFiles([]);
    setErrors({});
  };

  const handleInputChange = (e, formType) => {
    const { id, value, type, checked } = e.target;
    if (formType === "signin") {
      setSigninData({ ...signinData, [id.replace("signin-", "")]: value });
    } else if (formType === "signup") {
      setSignupData({
        ...signupData,
        [id]: type === "checkbox" ? checked : value,
      });
    } else if (formType === "forgot") {
      if (id === "forgot-email") setForgotEmail(value);
      if (id === "new-password") setNewPassword(value);
      if (id === "confirm-new-password") setConfirmNewPassword(value);
    }
  };

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  // Validation
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validatePassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}[\]|\\:;"'<,>.?/]).{8,}$/.test(
      pw
    );
  const validateAadhar = (aadhar) => /^\d{12}$/.test(aadhar);
  const validateDOB = (dob) => {
    if (!dob) return false;
    const dobDate = new Date(dob);
    const minAge = new Date();
    minAge.setFullYear(minAge.getFullYear() - 18);
    return dobDate <= minAge;
  };
  const validateExperience = (exp) =>
    !exp || (/^\d+$/.test(exp) && parseInt(exp) >= 0);

  const validateSignin = () => {
    const newErrors = {};
    if (!validateEmail(signinData.email))
      newErrors["signin-email"] = "Invalid email.";
    if (!signinData.password)
      newErrors["signin-password"] = "Password required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!validateEmail(signupData.email)) newErrors.email = "Invalid email.";
    if (!validatePhone(signupData.phone))
      newErrors.phone = "10-digit phone required.";
    if (!validatePassword(signupData.password))
      newErrors.password =
        "Min 8 chars: 1 uppercase, 1 lowercase, 1 number, 1 special.";
    if (signupData.password !== signupData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!signupData.termsAccepted) newErrors.terms = "Accept terms.";

    if (userType === "customer" || userType === "worker") {
      if (!signupData.name) newErrors.name = "Name required.";
      if (!validateDOB(signupData.dob)) newErrors.dob = "Must be 18+.";
    }

    if (userType === "company") {
      if (!signupData.companyName)
        newErrors.companyName = "Company name required.";
      if (!signupData.contactPerson)
        newErrors.contactPerson = "Contact person required.";
    }

    if (userType === "worker") {
      if (!validateAadhar(signupData.aadharNumber))
        newErrors.aadharNumber = "12-digit Aadhar required.";
      if (!signupData.specialization)
        newErrors.specialization = "Select specialization.";
      if (!validateExperience(signupData.experience))
        newErrors.experience = "Valid experience required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSigninSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignin()) return;
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(signinData),
      });
      const data = await res.json();
      if (res.ok) navigate(data.redirect);
      else setErrors({ general: data.message });
    } catch (err) {
      setErrors({ general: "Server error" });
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    const formData = new FormData();
    Object.keys(signupData).forEach((key) => {
      if (key !== "confirmPassword") formData.append(key, signupData[key]);
    });
    formData.append("role", userType);
    files.forEach((file) => formData.append("documents", file));

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) setActiveTab("signin");
      else setErrors({ general: data.message });
    } catch (err) {
      setErrors({ general: "Server error" });
    }
  };

  // Forgot Password
  const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

  const disableResend = () => {
    if (resendTimeoutId) clearInterval(resendTimeoutId);
    let count = 30;
    const id = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(id);
        setResendTimeoutId(null);
      }
    }, 1000);
    setResendTimeoutId(id);
  };

  const handleSendOTP = () => {
    if (!validateEmail(forgotEmail)) {
      setForgotError("Enter valid email");
      return;
    }
    setGeneratedOTP(generateOTP());
    console.log("OTP:", generatedOTP);
    setForgotStep("otp");
    disableResend();
  };

  const handleVerifyOTP = () => {
    if (otp.join("") === generatedOTP) {
      setForgotError("");
      setForgotStep("password");
    } else {
      setForgotError("Invalid OTP");
      setOtp(["", "", "", ""]);
    }
  };

  const handleResendOTP = (e) => {
    e.preventDefault();
    if (resendTimeoutId) return;
    setGeneratedOTP(generateOTP());
    console.log("Resent OTP:", generatedOTP);
    disableResend();
    setOtp(["", "", "", ""]);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setForgotError("Passwords don't match");
      return;
    }
    if (!validatePassword(newPassword)) {
      setForgotError("Password too weak");
      return;
    }
    console.log("Password reset");
    setShowForgotModal(false);
    resetForgotForm();
    setActiveTab("signin");
  };

  const handleOtpChange = (i, val) => {
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 3) otpRefs.current[i + 1].focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1].focus();
    }
  };

  const resetForgotForm = () => {
    setForgotEmail("");
    setOtp(["", "", "", ""]);
    setNewPassword("");
    setConfirmNewPassword("");
    setGeneratedOTP("");
    setResendTimeoutId(null);
    setForgotError("");
    setForgotStep("email");
  };

  return (
    <div className="landing-page">
      <div className="admin-link">
        <Link to="/adminpage" className="admin-login-btn">
          Admin Login
        </Link>
      </div>

      <div className="main-container">
        <div className="hero-content">
          <h1>Build & Beyond</h1>
          <p>
            Welcome to Build & Beyond, your ultimate platform for seamless
            construction project management. Connect customers, companies, and
            workers effortlessly.
          </p>
          <div className="btn-container">
            <button
              onClick={() => handleTabChange("signup")}
              className="btn btn-primary"
            >
              Get Started
            </button>
            <button
              onClick={() => handleTabChange("signin")}
              className="btn btn-secondary"
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`tab-button ${activeTab === "signin" ? "active" : ""}`}
              onClick={() => handleTabChange("signin")}
            >
              Sign In
            </button>
            <button
              className={`tab-button ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => handleTabChange("signup")}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-content">
            {/* SIGN IN */}
            {activeTab === "signin" && (
              <div className="form-content active">
                <form onSubmit={handleSigninSubmit}>
                  <div className="form-header">
                    <h2>Welcome Back</h2>
                    <p>Please enter your details</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="signin-email">Email</label>
                    <input
                      type="email"
                      id="signin-email"
                      className={`form-input ${
                        errors["signin-email"] ? "error" : ""
                      }`}
                      value={signinData.email}
                      onChange={(e) => handleInputChange(e, "signin")}
                      required
                    />
                    <div className="error-message">
                      {errors["signin-email"]}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="signin-password">Password</label>
                    <input
                      type="password"
                      id="signin-password"
                      className={`form-input ${
                        errors["signin-password"] ? "error" : ""
                      }`}
                      value={signinData.password}
                      onChange={(e) => handleInputChange(e, "signin")}
                      required
                    />
                    <div className="error-message">
                      {errors["signin-password"]}
                    </div>
                  </div>

                  <div className="form-options">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowForgotModal(true);
                      }}
                    >
                      Forgot Password?
                    </a>
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Sign In
                  </button>
                  {errors.general && (
                    <div className="validation-error">{errors.general}</div>
                  )}
                </form>
              </div>
            )}

            {/* SIGN UP */}
            {activeTab === "signup" && (
              <div className="form-content active">
                <form onSubmit={handleSignupSubmit}>
                  <div className="form-header">
                    <h2>Create Account</h2>
                    <p>Join Build & Beyond today</p>
                  </div>

                  <div className="user-type-selection">
                    <label>User Type</label>
                    <div className="user-type-buttons">
                      {["customer", "company", "worker"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`user-type-btn ${
                            userType === type ? "active" : ""
                          }`}
                          onClick={() => handleUserTypeChange(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="signup-columns">
                    <div className="signup-left">
                      {(userType === "customer" || userType === "worker") && (
                        <>
                          <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                              type="text"
                              id="name"
                              className={`form-input ${
                                errors.name ? "error" : ""
                              }`}
                              value={signupData.name}
                              onChange={(e) => handleInputChange(e, "signup")}
                              required
                            />
                            <div className="error-message">{errors.name}</div>
                          </div>
                        </>
                      )}

                      {userType === "company" && (
                        <>
                          <div className="form-group">
                            <label htmlFor="companyName">Company Name</label>
                            <input
                              type="text"
                              id="companyName"
                              className={`form-input ${
                                errors.companyName ? "error" : ""
                              }`}
                              value={signupData.companyName}
                              onChange={(e) => handleInputChange(e, "signup")}
                              required
                            />
                            <div className="error-message">
                              {errors.companyName}
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="contactPerson">
                              Contact Person
                            </label>
                            <input
                              type="text"
                              id="contactPerson"
                              className={`form-input ${
                                errors.contactPerson ? "error" : ""
                              }`}
                              value={signupData.contactPerson}
                              onChange={(e) => handleInputChange(e, "signup")}
                              required
                            />
                            <div className="error-message">
                              {errors.contactPerson}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          className={`form-input ${
                            errors.email ? "error" : ""
                          }`}
                          value={signupData.email}
                          onChange={(e) => handleInputChange(e, "signup")}
                          required
                        />
                        <div className="error-message">{errors.email}</div>
                      </div>
                    </div>

                    <div className="signup-right">
                      {(userType === "customer" || userType === "worker") && (
                        <div className="form-group">
                          <label htmlFor="dob">Date of Birth</label>
                          <input
                            type="date"
                            id="dob"
                            className={`form-input ${
                              errors.dob ? "error" : ""
                            }`}
                            value={signupData.dob}
                            onChange={(e) => handleInputChange(e, "signup")}
                            required
                          />
                          <div className="error-message">{errors.dob}</div>
                        </div>
                      )}

                      <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                          type="tel"
                          id="phone"
                          className={`form-input ${
                            errors.phone ? "error" : ""
                          }`}
                          value={signupData.phone}
                          onChange={(e) => handleInputChange(e, "signup")}
                          required
                        />
                        <div className="error-message">{errors.phone}</div>
                      </div>

                      {userType === "worker" && (
                        <>
                          <div className="form-group">
                            <label htmlFor="aadharNumber">Aadhar Number</label>
                            <input
                              type="text"
                              id="aadharNumber"
                              className={`form-input ${
                                errors.aadharNumber ? "error" : ""
                              }`}
                              value={signupData.aadharNumber}
                              onChange={(e) => handleInputChange(e, "signup")}
                              required
                            />
                            <div className="error-message">
                              {errors.aadharNumber}
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="specialization">
                              Specialization
                            </label>
                            <select
                              id="specialization"
                              className={`form-input ${
                                errors.specialization ? "error" : ""
                              }`}
                              value={signupData.specialization}
                              onChange={(e) => handleInputChange(e, "signup")}
                              required
                            >
                              <option value="">Select Specialization</option>
                              <option value="architect">Architect</option>
                              <option value="interiordesign">Interior Design</option>
                            </select>
                            <div className="error-message">
                              {errors.specialization}
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="experience">
                              Experience (years)
                            </label>
                            <input
                              type="number"
                              id="experience"
                              className={`form-input ${
                                errors.experience ? "error" : ""
                              }`}
                              value={signupData.experience}
                              onChange={(e) => handleInputChange(e, "signup")}
                              min="0"
                            />
                            <div className="error-message">
                              {errors.experience}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="password-section">
                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                        type="password"
                        id="password"
                        className={`form-input ${
                          errors.password ? "error" : ""
                        }`}
                        value={signupData.password}
                        onChange={(e) => handleInputChange(e, "signup")}
                        required
                      />
                      <div className="error-message">{errors.password}</div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className={`form-input ${
                          errors.confirmPassword ? "error" : ""
                        }`}
                        value={signupData.confirmPassword}
                        onChange={(e) => handleInputChange(e, "signup")}
                        required
                      />
                      <div className="error-message">
                        {errors.confirmPassword}
                      </div>
                    </div>
                  </div>

                  {(userType === "company" || userType === "worker") && (
                    <div className="file-upload-container">
                      <label>
                        {userType === "company"
                          ? "Company Documents"
                          : "Certificates"}
                      </label>
                      <input type="file" multiple onChange={handleFileChange} />
                      <div className="file-list">
                        {files.map((f, i) => (
                          <div key={i}>{f.name}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FIXED CHECKBOX */}
                  <div className="terms-section">
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        id="signup-terms"
                        checked={signupData.termsAccepted}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            termsAccepted: e.target.checked,
                          })
                        }
                      />
                      <label htmlFor="signup-terms">
                        I accept the terms and conditions
                      </label>
                    </div>
                    <div className="validation-error">{errors.terms}</div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Sign Up
                  </button>
                  {errors.general && (
                    <div className="validation-error">{errors.general}</div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="modal"
          onClick={() => {
            setShowForgotModal(false);
            resetForgotForm();
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span
              className="close"
              onClick={() => {
                setShowForgotModal(false);
                resetForgotForm();
              }}
            >
              ×
            </span>

            <form onSubmit={handleResetPassword}>
              {forgotStep === "email" && (
                <div id="email-step">
                  <h2>Reset Password</h2>
                  <div className="form-group">
                    <label htmlFor="forgot-email">Email</label>
                    <input
                      type="email"
                      id="forgot-email"
                      value={forgotEmail}
                      onChange={(e) => handleInputChange(e, "forgot")}
                      required
                    />
                  </div>
                  <button type="button" onClick={handleSendOTP}>
                    Send OTP
                  </button>
                </div>
              )}

              {forgotStep === "otp" && (
                <div id="otp-step">
                  <h2>Enter OTP</h2>
                  <div className="otp-container">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength="1"
                        className="otp-input"
                        value={d}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        ref={(el) => (otpRefs.current[i] = el)}
                      />
                    ))}
                  </div>
                  <button type="button" onClick={handleVerifyOTP}>
                    Verify
                  </button>
                  <a
                    href="#"
                    onClick={handleResendOTP}
                    className={resendTimeoutId ? "disabled" : ""}
                  >
                    {resendTimeoutId ? "Resend Code (30s)" : "Resend Code"}
                  </a>
                </div>
              )}

              {forgotStep === "password" && (
                <div id="password-step">
                  <h2>Set New Password</h2>
                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input
                      type="password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => handleInputChange(e, "forgot")}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-new-password">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirm-new-password"
                      value={confirmNewPassword}
                      onChange={(e) => handleInputChange(e, "forgot")}
                      required
                    />
                  </div>
                  <button type="submit">Reset Password</button>
                </div>
              )}
              {forgotError && (
                <div className="validation-error">{forgotError}</div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginSignUp;
