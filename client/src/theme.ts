import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue', // global primary color 
  fontFamily: 'Inter, sans-serif', // global font family
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
  }, // individual component overrides
});
