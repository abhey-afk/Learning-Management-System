import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * A component that protects routes based on authentication and user role
 * @param {Object} props
 * @param {React.ReactNode} props.children - The route content to render if authorized
 * @param {Array<string>} [props.allowedRoles] - Optional list of roles that can access this route
 * @param {string} [props.redirectPath="/"] - The path to redirect to if unauthorized
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [],
  redirectPath = "/"
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      const token = Cookies.get("authToken");
      if (!token) {
        console.log("Access denied: No auth token found");
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // If no role restriction, any authenticated user is authorized
      if (allowedRoles.length === 0) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Check if user has the required role
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userRole = userInfo.role;
        
        if (userRole && allowedRoles.includes(userRole)) {
          setIsAuthorized(true);
        } else {
          console.log(`Access denied: User role '${userRole}' not in allowed roles:`, allowedRoles);
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [allowedRoles, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    // For admin routes, redirect to home
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/" replace />;
    }
    
    // For other protected routes, redirect to login
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute; 