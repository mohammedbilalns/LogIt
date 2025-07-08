import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import {
  AdminProtectedRoute,
  Layout,
  PublicRoute,
  SuperAdminProtectedRoute,
  UserProtectedRoute,
} from '@/presentation/components/RouteGuards';
import GroupChat from '@/presentation/pages/user/GroupChat';
import SingleChatPage from '@/presentation/pages/user/SingleChat';
import UserPublicProfile from '@/presentation/pages/user/UserPublicProfile';

// Lazy load pages
const Landing = lazy(() => import('@/presentation/pages/public/Landing'));
const Login = lazy(() => import('@/presentation/pages/public/Login'));
const Signup = lazy(() => import('@/presentation/pages/public/Signup'));
const EmailVerification = lazy(() => import('@/presentation/pages/public/EmailVerification'));
const Home = lazy(() => import('@/presentation/pages/user/Home'));
const Articles = lazy(() => import('@/presentation/pages/user/Articles'));
const ArticleDetail = lazy(() => import('@/presentation/pages/ArticleDetail'));
const ArticleEditor = lazy(() => import('@/presentation/pages/user/ArticleEditor'));
const ResetPassword = lazy(() => import('@/presentation/pages/public/ResetPassword'));
const AdminDashboard = lazy(() => import('@/presentation/pages/admin/Dashboard'));
const AdminLayout = lazy(() => import('@/presentation/components/admin/AdminLayout'));
const UserManagement = lazy(() => import('@/presentation/pages/admin/UserManagement'));
const NotFound = lazy(() => import('@/presentation/pages/NotFound'));
const Profile = lazy(() => import('@/presentation/pages/user/Profile'));
const LogsPage = lazy(() => import('@/presentation/pages/user/LogsPage'));
const LogEditor = lazy(() => import('@/presentation/pages/user/LogEditor'));
const ReportManagement = lazy(() => import('@/presentation/pages/admin/ReportsManagement'));
const TagManagement = lazy(() => import('@/presentation/pages/admin/TagManagement'));
const Network = lazy(() => import('@/presentation/pages/user/Network'));
const Chats = lazy(() => import('@/presentation/pages/user/Chats'));
const SubscriptionSettings = lazy(() => import('@/presentation/pages/admin/SubscriptionSettings'));

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
          {
            path: '/group-chats/:id',
            element: <GroupChat />,
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
                element: <SubscriptionSettings />,
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
