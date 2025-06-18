import { Suspense, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initializeApp } from '@slices/initSlice';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { LoadingOverlay, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { setupAxiosInterceptors } from '@/api/axios';
import { router } from '@/Router';
import { AppDispatch, RootState, store } from '@/store';
import { theme } from '@/theme';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitialized } = useSelector((state: RootState) => state.init);

  useEffect(() => {
    dispatch(initializeApp());
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
    console.log('App not initialized showing loading ui');
    return <LoadingOverlay />;
  }

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default function App() {
  //  axios interceptors
  useEffect(() => {
    setupAxiosInterceptors(store);
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
