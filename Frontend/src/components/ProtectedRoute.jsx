import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../api/service';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const user = await authService.getMe();
        setUserRole(user.role);
        
        if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Auth verification failed', error);
        localStorage.removeItem('token');
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cpsu-green"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    if (localStorage.getItem('token')) {
      // User is logged in but has wrong role
      if (userRole === 'admin') return <Navigate to="/admin" replace />;
      if (userRole === 'staff') return <Navigate to="/staff" replace />;
      return <Navigate to="/student" replace />;
    }
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
