import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignUp from "./Pages/login-signup/LoginSignUp";
import Customer from "./Pages/customer/Customer";
import Company from "./Pages/company/Company";
import Worker from "./Pages/worker/Worker";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginSignUp />} />
      {/* <Route path="/adminpage" element={<Admin />} /> */}
      <Route
        path="/customerdashboard/*"
        element={
          <ProtectedRoute role="customer">
            <Customer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/companydashboard/*"
        element={
          <ProtectedRoute role="company">
            <Company />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workerdashboard/*"
        element={
          <ProtectedRoute role="worker">
            <Worker />
          </ProtectedRoute>
        }
      />
      {/* Add other routes as needed, e.g., for sub-pages */}
    </Routes>
  );
};

export default App;
