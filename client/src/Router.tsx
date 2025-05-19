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
const Articles = lazy(() => import('./pages/Articles'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
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
          {
            path: '/articles',
            element: <Articles />,
          },
          {
            path: '/logs',
            element: <Home />,
          },
          {
            path: '/chats',
            element: <Home />,
          },
          {
            path: '/network',
            element: <Home />,
          },
        ],
      },
      // Admin Protected Routes
      {
        element: <AdminProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: '/admin',
                element: <AdminDashboard />,
              },
              {
                path: '/admin/users',
                element: <UserManagement />,
              },
              {
                path: '/admin/reports',
                element: <AdminDashboard />, // Replace with ReportsManagement component
              },
              {
                path: '/admin/tags',
                element: <AdminDashboard />, // Replace with TagManagement component
              },
              {
                path: '/admin/subscriptions',
                element: <AdminDashboard />, // Replace with SubscriptionSettings component
              },
              {
                path: '/admin/analytics',
                element: <AdminDashboard />, // Replace with Analytics component
              },
            ],
          },
        ],
      },
      // Super Admin Protected Routes
      {
        element: <SuperAdminProtectedRoute />,
        children: [
          {
            path: '/admin/manage-admins',
            element: <AdminDashboard />, // Replace with actual AdminManagement component when created
          },
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
