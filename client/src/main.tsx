import ReactDOM from 'react-dom/client';
import App from '@/App';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './index.css';

import { MantineProvider } from '@mantine/core';
import { theme } from '@/presentation/themes/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme}>
    <App />
  </MantineProvider>
);
