import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import {
  Layout,
  UserProtectedRoute,
  PublicRoute,
  AdminProtectedRoute,
  SuperAdminProtectedRoute
} from './components/RouteGuards';

// Lazy load all pages
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const Home = lazy(() => import('./pages/Home'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // User Protected Routes
      {
        element: <UserProtectedRoute />,
        children: [
          {
            path: '/',
            element: <Home />,
          },
        ],
      },
      // Admin Protected Routes
      {
        element: <AdminProtectedRoute />,
        children: [
          {
            path: '/admin',
            element: <AdminDashboard />,
          },
        ],
      },
      // Super Admin Protected Routes
      {
        element: <SuperAdminProtectedRoute />,
        children: [
          
        ],
      },
      // Public Routes
      {
        element: <PublicRoute />,
        children: [
          {
            path: '/login',
            element: <Login />,
          },
          {
            path: '/signup',
            element: <Signup />,
          },
          {
            path: '/verify-email',
            element: <EmailVerification />,
          },
          {
            path: '/reset-password',
            element: <ResetPassword />,
          },
        ],
      },
      // 404 Route - Must be last
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
