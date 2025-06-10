import { createBrowserRouter } from 'react-router-dom';
import  { lazy } from 'react';
import {
  Layout,
  UserProtectedRoute,
  PublicRoute,
  AdminProtectedRoute,
  SuperAdminProtectedRoute
} from '@/components/RouteGuards';

// Lazy load pages
const Landing = lazy(() => import('@pages/Landing'));
const Login = lazy(() => import('@pages/Login'));
const Signup = lazy(() => import('@pages/Signup'));
const EmailVerification = lazy(() => import('@pages/EmailVerification'));
const Home = lazy(() => import('@pages/Home'));
const Articles = lazy(() => import('@pages/Articles'));
const ArticleDetail = lazy(() => import('@pages/ArticleDetail'));
const ArticleEditor = lazy(() => import('@pages/ArticleEditor'));
const ResetPassword = lazy(() => import('@pages/ResetPassword'));
const AdminDashboard = lazy(() => import('@pages/admin/Dashboard'));
const AdminLayout = lazy(() => import('@components/admin/AdminLayout'));
const UserManagement = lazy(() => import('@pages/admin/UserManagement'));
const NotFound = lazy(() => import('@pages/NotFound'));
const Profile = lazy(() => import('@pages/user/Profile'));
const LogsPage = lazy(()=> import('@pages/LogsPage'));
const LogEditor = lazy(()=> import('@pages/LogEditor'));
const ReportManagement = lazy(()=> import('@pages/admin/ReportsManagement'))

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Public Routes
      {
        element: <PublicRoute />,
        children: [
          {
            path: '/',
            element: <Landing />,
          },
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
      // User Protected Routes
      {
        element: <UserProtectedRoute />,
        children: [
          {
            path: '/home',
            element: <Home />,
          },
          {
            path: '/articles',
            element: <Articles />,
          },
          {
            path: '/articles/:id',
            element: <ArticleDetail />,
          },
          {
            path: '/articles/create',
            element: <ArticleEditor mode="create" />,
          },
          {
            path: '/articles/:id/edit',
            element: <ArticleEditor mode="edit" />,
          },
          {
            path: '/logs',
            element: <LogsPage />,
          },
          {
            path: '/logs/create',
            element: <LogEditor mode="create" />,
          },
          {
            path: '/logs/edit/:id',
            element: <LogEditor mode="edit" />,
          },
          {
            path: '/chats',
            element: <Home />,
          },
          {
            path: '/network',
            element: <Home />,
          },
          {
            path: '/profile', 
            element: <Profile />,
          }
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
                element: <ReportManagement />,
              },
              {
                path: '/admin/tags',
                element: <AdminDashboard />,
              },
              {
                path: '/admin/subscriptions',
                element: <AdminDashboard />,
              },
              {
                path: '/admin/analytics',
                element: <AdminDashboard />,
              },
              {
                path: '/admin/articles/:id',
                element: <ArticleDetail />,
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
            element: <AdminDashboard />,
          },
        ],
      },
      // 404 Route 
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
