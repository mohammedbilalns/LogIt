import {
  IconBell,
  IconMoon,
  IconSearch,
  IconSun,
  IconLogout,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Group,
  Image,
  Switch,
  TextInput,
  useMantineColorScheme,
  Button,
  UnstyledButton,
  Box,
  rem,
  Portal,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { logout } from '@slices/authSlice';
import { useMediaQuery } from '@mantine/hooks';

export default function Navbar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <Portal>
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: isDark
            ? 'rgba(24, 24, 27, 0.4)'
            : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap" px="lg" py="sm">
          {/* Logo */}
          <UnstyledButton onClick={() => isAuthenticated ? navigate('/home') : navigate('/')}>
            <Group align="center" gap="xs">
              <Image
                src={isDark ? '/logo-dark.png' : '/logo-light.png'}
                alt="LogIt logo"
                w={35}
                h={35}
                fit="contain"
                radius="md"
              />
              <span
                style={{
                  fontFamily: 'cursive',
                  fontWeight: 700,
                  fontSize: rem(22),
                  color: isDark ? 'white' : 'black',
                }}
              >
                LogIt
              </span>
            </Group>
          </UnstyledButton>

          {/* Search */}
          {isAuthenticated && !isMobile && (
            <TextInput
              placeholder="Search LogIt"
              leftSection={<IconSearch size={16} />}
              radius="xl"
              w={rem(300)}
              size="sm"
              styles={{
                input: {
                  backgroundColor: isDark
                    ? 'rgba(36, 36, 40, 0.6)'
                    : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
              }}
            />
          )}

          {/* Actions */}
          <Group gap="sm" wrap="nowrap">
            {isAuthenticated ? (
              <>
                {isMobile && (
                  <ActionIcon variant="light" size="md" color="blue" radius="xl">
                    <IconSearch size={20} />
                  </ActionIcon>
                )}
                <ActionIcon variant="light" size="md" radius="xl">
                  <IconBell size={20} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  size="md"
                  radius="xl"
                  onClick={handleLogout}
                >
                  <IconLogout size={20} />
                </ActionIcon>
              </>
            ) : (
              !isMobile && (
                <Group gap="xs">
                  <Button
                    variant="light"
                    size="sm"
                    radius="xl"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    radius="xl"
                    onClick={() => navigate('/signup')}
                  >
                    Sign Up
                  </Button>
                </Group>
              )
            )}

            {/* Theme Toggle */}
            <Switch
              size="md"
              onLabel={<IconSun size={14} />}
              offLabel={<IconMoon size={14} />}
              checked={isDark}
              onChange={() => toggleColorScheme()}
              color="blue"
              styles={{
                track: {
                  backgroundColor: isDark
                    ? 'rgba(36, 36, 40, 0.5)'
                    : 'rgba(200, 200, 200, 0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                },
              }}
            />
          </Group>
        </Group>
      </Box>
    </Portal>
  );
}
