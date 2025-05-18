import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { Layout, ProtectedRoute, PublicRoute } from './components/RouteGuards';

// Lazy load all pages
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const Home = lazy(() => import('./pages/Home'));

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <Home />,
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
        ],
      },
    ],
  },
]);
