import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Navbar from './Navbar/Navbar';

// Layout component 
export const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

// Protected Route Guard
export const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Public Route Guard 
export const PublicRoute = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}; 