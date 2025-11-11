import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CompanyDashboard from "./src/pages/CompanyDashboard/CompanyDashboard";
import CompanySettings from "./src/pages/CompanySettings/CompanySettings";
import CompanyRevenue from "./src/pages/CompanyRevenue/CompanyRevenue";
import CompanyPublicProfile from "./src/pages/CompanyPublicProfile/CompanyPublicProfile";
import CompanyBids from "./src/pages/CompanyBids/CompanyBids";
import CompanyOngoingProjects from "./src/pages/CompanyOngoingProjects/CompanyOngoingProjects";
import NavbarCompany from "./src/components/NavbarCompany/NavbarCompany";

const Company = () => {
  // SET FAKE TOKEN IMMEDIATELY
  useEffect(() => {
    localStorage.setItem("token", "fake-jwt-token");
    localStorage.setItem("userType", "company");
  }, []);

  return (
    <>
      <NavbarCompany />
      <Routes>
        <Route path="/" element={<Navigate to="companydashboard" replace />} />
        <Route path="companydashboard" element={<CompanyDashboard />} />
        <Route path="company-settings" element={<CompanySettings />} />
        <Route path="company-revenue" element={<CompanyRevenue />} />
        <Route path="company-public-profile" element={<CompanyPublicProfile />} />
        <Route path="company-bids" element={<CompanyBids />} />
        <Route path="company-ongoing-projects" element={<CompanyOngoingProjects />} />
      </Routes>
    </>
  );
};

export default Company;