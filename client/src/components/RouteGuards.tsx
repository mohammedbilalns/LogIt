import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Suspense } from 'react';
import { LoadingOverlay } from '@mantine/core';
import Navbar from './Navbar/Navbar';

// Layout component 
export function Layout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingOverlay visible />}>
        <Outlet />
      </Suspense>
    </>
  );
}

// Public Route Guard 
export function PublicRoute() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  
  if (isAuthenticated && user) {
    if (user.role === 'admin' || user.role === 'superadmin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// User Protected Route
export function UserProtectedRoute() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated ||  user?.role !== 'user') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// Admin Protected Route
export function AdminProtectedRoute() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// Super Admin Protected Route
export function SuperAdminProtectedRoute() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
} 