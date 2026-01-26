import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  BarChart3,
  Users,
  Building2,
  Home,
  LogOut,
  ChevronRight,
} from "lucide-react";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", icon: Home, path: "/admin/admindashboard" },
    { label: "Revenue Analytics", icon: BarChart3, path: "/admin/revenue-analytics" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/admin-login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/admin-login");
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Building2 size={24} />
            <span>Admin</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                className="nav-item"
                onClick={() => navigate(item.path)}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <>
                    <span>{item.label}</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${sidebarOpen ? "" : "expanded"}`}>
        {!sidebarOpen && (
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        )}
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
