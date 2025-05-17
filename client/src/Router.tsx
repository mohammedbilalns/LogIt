import { createBrowserRouter } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { EmailVerification } from './pages/EmailVerification';
import { Home } from './pages/Home';
import { Layout, ProtectedRoute, PublicRoute } from './components/RouteGuards';

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
