import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * A component that specifically restricts access to admin routes
 * Only instructors can access routes wrapped with this component
 */
const AdminProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      const token = Cookies.get("authToken");
      if (!token) {
        console.log("Admin access denied: No auth token");
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Check if user has instructor role
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userRole = userInfo.role;
        
        if (userRole === "instructor") {
          setIsAuthorized(true);
        } else {
          console.log(`Admin access denied: User role '${userRole}' is not instructor`);
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error checking admin authorization:", error);
        setIsAuthorized(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
    
    // Add event listener for auth changes
    window.addEventListener('user:login', checkAuth);
    window.addEventListener('user:logout', checkAuth);
    
    return () => {
      window.removeEventListener('user:login', checkAuth);
      window.removeEventListener('user:logout', checkAuth);
    };
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Redirect unauthorized users to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute; 