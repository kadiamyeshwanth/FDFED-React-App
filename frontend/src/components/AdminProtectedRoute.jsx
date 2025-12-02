import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await fetch("/api/admin/verify-session", { 
          credentials: "include",
          method: "GET"
        });
        const data = await res.json();
        
        if (res.ok && data.authenticated && data.role === 'admin') {
          setAuthenticated(true);
        } else {
          navigate("/admin-login");
        }
      } catch (error) {
        console.error("Admin auth check failed:", error);
        navigate("/admin-login");
      } finally {
        setLoading(false);
      }
    };
    checkAdminAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }
  
  return authenticated ? children : null;
};

export default AdminProtectedRoute;
