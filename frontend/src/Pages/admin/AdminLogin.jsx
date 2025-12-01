// src/Pages/admin/AdminLogin.jsx
import React, { useState } from "react";
import "./AdminLogin.css";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
   const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passKey, setPassKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassKey, setShowPassKey] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    password: false,
    passKey: false,
  });

  const ADMIN_CREDENTIALS = {
    email: "admin@example.com",
    password: "Admin123!",
    passKey: "secret123",
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pwd) => pwd.length >= 8;
  const validatePassKey = (key) => key.trim() !== "";

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);
    const passKeyValid = validatePassKey(passKey);

    setErrors({
      email: !emailValid,
      password: !passwordValid,
      passKey: !passKeyValid,
    });

    if (!emailValid || !passwordValid || !passKeyValid) return;

    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password &&
      passKey === ADMIN_CREDENTIALS.passKey
    ) {
      // Replace with your actual route
      navigate("/admin/admindashboard")
    } else {
      alert("Invalid admin credentials");
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (validateEmail(email)) {
      alert("Password reset link has been sent to your email address.");
    } else {
      alert("Please enter a valid email address first.");
    }
  };

  return (
    <div className="admin-login-body">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>Admin Login</h1>
          <p>Enter your details to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} id="adminLoginForm">
          {/* Email Field */}
          <div
            className={`admin-login-input-group ${
              errors.email ? "admin-login-error" : ""
            }`}
            id="emailGroup"
          >
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() =>
                setErrors((prev) => ({ ...prev, email: !validateEmail(email) }))
              }
              placeholder="Enter your email"
            />
            <span className="admin-login-error-message">
              Please enter a valid email address
            </span>
          </div>

          {/* Password Field */}
          <div
            className={`admin-login-input-group ${
              errors.password ? "admin-login-error" : ""
            }`}
            id="passwordGroup"
          >
            <label htmlFor="password">Password</label>
            <div className="admin-login-password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    password: !validatePassword(password),
                  }))
                }
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="admin-login-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Show" : "Hide"}
              </button>
            </div>
            <span className="admin-login-error-message">
              Password must be at least 8 characters
            </span>
          </div>

          {/* Pass Key Field */}
          <div
            className={`admin-login-input-group ${
              errors.passKey ? "admin-login-error" : ""
            }`}
            id="passKeyGroup"
          >
            <label htmlFor="passKey">Pass Key</label>
            <div className="admin-login-password-container">
              <input
                type={showPassKey ? "text" : "password"}
                id="passKey"
                value={passKey}
                onChange={(e) => setPassKey(e.target.value)}
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    passKey: !validatePassKey(passKey),
                  }))
                }
                placeholder="Enter your secret pass key"
              />
              <button
                type="button"
                className="admin-login-toggle-password"
                onClick={() => setShowPassKey(!showPassKey)}
              >
                {showPassKey ? "Show" : "Hide"}
              </button>
            </div>
            <p className="admin-login-pass-key-info">
              Enter your personal secret code for additional security
            </p>
            <span className="admin-login-error-message">
              Please enter your pass key
            </span>
          </div>

          <div className="admin-login-remember-forgot">
            <div className="admin-login-remember-me">
              <input type="checkbox" id="rememberMe" />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <div className="admin-login-forgot-password">
              <a href="#" onClick={handleForgotPassword}>
                Forgot password?
              </a>
            </div>
          </div>

          <button type="submit" className="admin-login-submit-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
