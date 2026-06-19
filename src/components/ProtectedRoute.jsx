import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component ensures that the wrapped component is only accessible
 * when a JWT token exists in localStorage. If the token is missing, the user is
 * redirected to the /login page.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }
  // Authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
