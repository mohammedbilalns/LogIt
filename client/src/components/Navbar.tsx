import { Group, ActionIcon, useMantineColorScheme, Box, Button } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authSlice';

export function Navbar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <Box
      p="md"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--mantine-color-gray-3)',
      }}
    >
      <Group>
        <h2>LogIt</h2>
      </Group>

      <Group>
        <ActionIcon
          variant="default"
          onClick={() => toggleColorScheme()}
          size={30}
          aria-label="Toggle color scheme"
        >
          {colorScheme === 'dark' ? (
            <IconSun size="1.1rem" />
          ) : (
            <IconMoonStars size="1.1rem" />
          )}
        </ActionIcon>
        {isAuthenticated ? (
          <>
            <span>Welcome, {user?.name}</span>
            <Button variant="light" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button variant="light" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </Group>
    </Box>
  );
} 