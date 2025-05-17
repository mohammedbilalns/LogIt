import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { router } from './Router';
import { theme } from './theme';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

export default function App() {
  return (
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" />
        <RouterProvider router={router} />
      </MantineProvider>
    </Provider>
  );
}
