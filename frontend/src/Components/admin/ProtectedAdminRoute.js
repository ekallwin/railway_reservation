import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedAdminRoute = ({ children }) => {
  const [showRedirect, setShowRedirect] = useState(false);
  const isAdminAuthenticated = !!sessionStorage.getItem("adminId");

  useEffect(() => {
    if (!isAdminAuthenticated) {
      toast.error("Unauthorized access");
      const timer = setTimeout(() => {
        setShowRedirect(true);
      }); 

      return () => clearTimeout(timer);
    }
  }, [isAdminAuthenticated]);

  if (isAdminAuthenticated) {
    return children;
  }

  if (showRedirect) {
    return <Navigate to="/admin" />;
  }

  return null;
};

export default ProtectedAdminRoute;
