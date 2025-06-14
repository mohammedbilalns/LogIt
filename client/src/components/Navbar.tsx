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
    <Portal >
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          borderBottom: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'
            }`,
          backgroundColor: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-gray-0)',
        }}

      >
        <Group justify="space-between" align="center" wrap="nowrap" p="md">
          {/* Logo */}
          <UnstyledButton onClick={() => isAuthenticated ? navigate('/home') : navigate('/')}>
            <Group align="center" gap="xs">
              <Image
                src={isDark ? '/logo-dark.png' : '/logo-light.png'}
                alt="LogIt logo"
                w={35}
                h={35}
                fit="contain"
              />
              <span
                style={{
                  fontFamily: 'cursive',
                  fontWeight: 'bold',
                  fontSize: rem(20),
                  color: isDark ? 'white' : 'black',
                  marginLeft: '4px',
                }}
              >
                LogIt
              </span>
            </Group>
          </UnstyledButton>

          {/* Search  */}
          {isAuthenticated && !isMobile && (
            <TextInput
              placeholder="Search LogIt"
              leftSection={<IconSearch size={16} />}
              radius="md"
              w={rem(300)}
            />
          )}

          {/* Actions */}
          <Group gap="xs" wrap="nowrap">
            {isAuthenticated ? (
              <>
                {isMobile && (
                  <ActionIcon variant="subtle" color="blue">
                    <IconSearch size={20} />
                  </ActionIcon>
                )}
                <ActionIcon variant="subtle">
                  <IconBell />
                </ActionIcon>
                <ActionIcon variant="subtle" onClick={handleLogout}>
                  <IconLogout />
                </ActionIcon>
              </>
            ) : (
              !isMobile && (
                <Group>
                  <Button variant="subtle" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button onClick={() => navigate('/signup')}>Sign Up</Button>
                </Group>
              )
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
   </Portal>
  );
}
