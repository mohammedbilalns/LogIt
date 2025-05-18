import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, AppDispatch, RootState } from './store';
import { router } from './Router';
import { theme } from './theme';
import { checkAuth } from './store/slices/authSlice';
import { useEffect, Suspense } from 'react';
import { LoadingUI } from './components/LoadingUI';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new Error('Missing VITE_GOOGLE_CLIENT_ID environment variable');
}

function AppContent() {

  const dispatch = useDispatch<AppDispatch>();
  const { isInitialized } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return <LoadingUI />; 
  }

  return (
    <Suspense fallback={<LoadingUI />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default function App() {
  useEffect(() => {
    // Remove the root loader 
    const rootLoader = document.getElementById('root-loader');
    if (rootLoader) {
      rootLoader.remove();
    }
  }, []);

  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <MantineProvider theme={theme}>
          <Notifications />
          <AppContent />
        </MantineProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}
