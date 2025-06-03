import { useEffect, Suspense } from 'react';
import { MantineProvider, LoadingOverlay } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store, AppDispatch, RootState } from '@/store';
import { router } from '@/Router';
import { theme } from '@/theme';
import { initializeApp } from '@slices/initSlice';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

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
    console.log("App not initialized showing loading ui");
    return <LoadingOverlay />;
  }

  return (
    <Suspense fallback={<LoadingOverlay />}>
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
