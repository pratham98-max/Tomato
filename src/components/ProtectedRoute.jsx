import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to the user's proper dashboard
    const dashboardMap = {
      customer: '/customer',
      restaurant: '/restaurant',
      delivery: '/delivery'
    };
    return <Navigate to={dashboardMap[user.role] || '/'} />;
  }

  return children;
};

export default ProtectedRoute;
