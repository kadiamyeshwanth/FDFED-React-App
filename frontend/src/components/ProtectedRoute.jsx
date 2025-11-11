import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ role, children }) => {
  // FAKE AUTH — NO API CALL
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  // Allow access if fake token + correct role
  if (token && userType === role) {
    return children;
  }

  // Otherwise redirect to login
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;