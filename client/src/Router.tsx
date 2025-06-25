import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import {
  AdminProtectedRoute,
  Layout,
  PublicRoute,
  SuperAdminProtectedRoute,
  UserProtectedRoute,
} from '@/components/RouteGuards';
import UserPublicProfile from './pages/user/UserPublicProfile';
import SingleChatPage from './pages/user/SingleChat';

// Lazy load pages
const Landing = lazy(() => import('@/pages/public/Landing'));
const Login = lazy(() => import('@/pages/public/Login'));
const Signup = lazy(() => import('@/pages/public/Signup'));
const EmailVerification = lazy(() => import('@/pages/public/EmailVerification'));
const Home = lazy(() => import('@/pages/user/Home'));
const Articles = lazy(() => import('@/pages/user/Articles'));
const ArticleDetail = lazy(() => import('@pages/ArticleDetail'));
const ArticleEditor = lazy(() => import('@/pages/user/ArticleEditor'));
const ResetPassword = lazy(() => import('@pages/public/ResetPassword'));
const AdminDashboard = lazy(() => import('@pages/admin/Dashboard'));
const AdminLayout = lazy(() => import('@components/admin/AdminLayout'));
const UserManagement = lazy(() => import('@pages/admin/UserManagement'));
const NotFound = lazy(() => import('@pages/NotFound'));
const Profile = lazy(() => import('@pages/user/Profile'));
const LogsPage = lazy(() => import('@/pages/user/LogsPage'));
const LogEditor = lazy(() => import('@/pages/user/LogEditor'));
const ReportManagement = lazy(() => import('@pages/admin/ReportsManagement'));
const TagManagement = lazy(() => import('@pages/admin/TagManagement'));
const Network = lazy(() => import('@/pages/user/Network'));
const Chats = lazy(() => import('@/pages/user/Chats'));


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
            path: '/user/:id',
            element: <UserPublicProfile />,
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
            element: <Chats />,
          },
          {
            path: '/chats/:id',
            element: <SingleChatPage />,
          },
          {
            path: '/network',
            element: <Network />,
          },
          {
            path: '/profile',
            element: <Profile />,
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
                element: <ReportManagement />,
              },
              {
                path: '/admin/tags',
                element: <TagManagement />,
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
