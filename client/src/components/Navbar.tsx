import { IconBell, IconMoon, IconSearch, IconSun, IconLogout } from '@tabler/icons-react';
import { ActionIcon, Group, Image, Switch, TextInput, useMantineColorScheme, Button, UnstyledButton, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authSlice';

export default function Navbar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
      }}
    >
      <Group justify="space-between" p="md" bg={isDark ? 'dark.7' : 'gray.0'}>
        <UnstyledButton onClick={() => navigate('/')}>
          <Group align="center" gap="xs">
            <Image 
              src={isDark ? '/logo-dark.png' : '/logo-light.png'}
              alt="LogIt logo" 
              w={35}
              h={35}
              fit="contain"
            />
            <span style={{ 
              fontFamily: 'cursive', 
              fontWeight: 'bold', 
              fontSize: 24,
              color: isDark ? 'white' : 'black',
              marginLeft: '4px'
            }}>
              LogIt
            </span>
          </Group>
        </UnstyledButton>

        {isAuthenticated && (
          <TextInput
            placeholder="Search LogIt"
            leftSection={<IconSearch size={16} />}
            radius="md"
            styles={{ input: { width: 300 } }}
          />
        )}

        <Group>
          {isAuthenticated ? (
            <>
              <ActionIcon variant="subtle">
                <IconBell />
              </ActionIcon>
              <ActionIcon variant="subtle" onClick={handleLogout}>
                <IconLogout />
              </ActionIcon>
            </>
          ) : (
            <Group>
              <Button variant="subtle" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </Group>
          )}

          <Switch
            size="md"
            onLabel={<IconSun size={14} />}
            offLabel={<IconMoon size={14} />}
            checked={isDark}
            onChange={() => toggleColorScheme()}
          />
        </Group>
      </Group>
    </Box>
  );
}
