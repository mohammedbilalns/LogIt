import { useEffect, Suspense } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, AppDispatch, RootState } from './store';
import { router } from './Router';
import { theme } from './theme';
import { checkAuth } from './store/slices/authSlice';
import { LoadingUI } from './components/LoadingUI';
import { GoogleOAuthProvider } from '@react-oauth/google';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log("App Initialized")
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized) {
      const rootLoader = document.getElementById('root-loader');
      if (rootLoader) {
        rootLoader.remove();
      }
    }
  }, [isInitialized]);

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
