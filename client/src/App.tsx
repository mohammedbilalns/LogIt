import { Suspense, useEffect, memo, useRef } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initializeApp } from '@slices/initSlice';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { LoadingOverlay, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { router } from '@/Router';
import { AppDispatch, RootState, store } from '@/store';
import { theme } from '@/theme';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import { useAxiosInterceptors } from './hooks/useAxiosInterceptors';
import { useRemoveRootLoader } from './hooks/useRemoveRootLoader';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AppContent = memo(function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitialized } = useSelector((state: RootState) => state.init);

  useEffect(() => {
    dispatch(initializeApp());
  }, [dispatch]);

  useRemoveRootLoader(isInitialized);
  
  if (!isInitialized) {
    return <LoadingOverlay />;
  }

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <RouterProvider router={router} />
    </Suspense>
  );
});

export default function App() {
  useAxiosInterceptors();

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
