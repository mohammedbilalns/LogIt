import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/infrastructure/store';
import { Suspense, useMemo } from 'react';
import { LoadingOverlay, Box } from '@mantine/core';
import Navbar from '@/presentation/components/Navbar';
import UserSidebar from '@/presentation/components/user/UserSidebar';

export function Layout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const nonFixedRoutes = ['/', '/login', '/signup', '/reset-password', '/verify-email'];
  const isNonFixed = nonFixedRoutes.includes(location.pathname);
  return (
    <Box>
      <Navbar fixed={!isNonFixed} />
      {user?.role === 'user' && <UserSidebar />}
      <Box style={{ marginTop: !isNonFixed ? '4.5rem' : 0 }}>
        <Suspense fallback={<LoadingOverlay visible />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}

// Public Route Guard 
export function PublicRoute() {
  const { isAuthenticated, user, isInitialized } = useSelector((state: RootState) => state.auth);
  const { isInitialized: appInitialized } = useSelector((state: RootState) => state.init);

  const redirectPath = useMemo(() => {
    if (!appInitialized || !isInitialized) {
      return null;
    }

    if (isAuthenticated && user) {
      if (user._id && user.role && user.name && user.email) {
        if (user.role === 'admin' || user.role === 'superadmin') {
          return '/admin';
        }
        return '/home';
      } else {
        return null;
      }
    }

    return null;
  }, [appInitialized, isInitialized, isAuthenticated, user]);

  if (!appInitialized || !isInitialized) {
    return <LoadingOverlay visible />;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

// User Protected Route
export function UserProtectedRoute() {
  const { isAuthenticated, user, isInitialized } = useSelector((state: RootState) => state.auth);
  const { isInitialized: appInitialized } = useSelector((state: RootState) => state.init);
  const location = useLocation();

  if (!appInitialized || !isInitialized) {
    return <LoadingOverlay visible />;
  }

  if (!isAuthenticated || !user || user.role !== 'user') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// Admin Protected Route
export function AdminProtectedRoute() {
  const { isAuthenticated, user, isInitialized } = useSelector((state: RootState) => state.auth);
  const { isInitialized: appInitialized } = useSelector((state: RootState) => state.init);
  const location = useLocation();

  if (!appInitialized || !isInitialized) {
    return <LoadingOverlay visible />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function SuperAdminProtectedRoute() {
  const { isAuthenticated, user, isInitialized } = useSelector((state: RootState) => state.auth);
  const { isInitialized: appInitialized } = useSelector((state: RootState) => state.init);
  const location = useLocation();

  if (!appInitialized || !isInitialized) {
    return <LoadingOverlay visible />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
} 