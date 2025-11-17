import { Routes, Route } from "react-router-dom";
import AppLayout from "../../components/AppLayout";

import AdminDashboard from "./AdminDashboard/AdminDashboard";
import AdminBidDetail from "./AdminBidDetail/AdminBidDetail";
import AdminCompanyDetail from "./AdminCompanyDetail/AdminCompanyDetail";
import AdminConstructionProjectDetail from "./AdminConstructionProjectDetail/AdminConstructionProjectDetail";
import AdminCustomerDetail from "./AdminCustomerDetail/AdminCustomerDetail";
import AdminDesignRequestDetail from "./AdminDesignRequestDetail/AdminDesignRequestDetail";
import AdminJobApplicationDetail from "./AdminJobApplicationDetail/AdminJobApplicationDetail";
import AdminWorkerDetail from "./AdminWorkerDetail/AdminWorkerDetail";
import ArchitectHiringDetail from "./ArchitectHiringDetail/ArchitectHiringDetail";

const Admin = () => {
  return (
    <AppLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="admindashboard" element={<AdminDashboard />} />
        <Route path="bids/:id" element={<AdminBidDetail />} />
        <Route path="companies/:id" element={<AdminCompanyDetail />} />
        <Route path="construction-projects/:id" element={<AdminConstructionProjectDetail />} />
        <Route path="customers/:id" element={<AdminCustomerDetail />} />
        <Route path="design-requests/:id" element={<AdminDesignRequestDetail />} />
        <Route path="job-applications/:id" element={<AdminJobApplicationDetail />} />
        <Route path="workers/:id" element={<AdminWorkerDetail />} />
        <Route path="architect-hiring/:id" element={<ArchitectHiringDetail />} />
        <Route path="*" element={<div>Admin page not found</div>} />
      </Routes>
    </AppLayout>
  );
};

export default Admin;