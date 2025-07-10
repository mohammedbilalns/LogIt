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
  Badge,
  Popover,
} from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/infrastructure/store';
import { logout } from '@/infrastructure/store/slices/authSlice';
import { useMediaQuery } from '@mantine/hooks';
import { BellIcon } from './icons/BellIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { SearchIcon } from './icons/SearchIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import NotificationList from './NotificationModal';
import { showNotification } from '@mantine/notifications';
import { addNotification, fetchUnreadCount } from '@/infrastructure/store/slices/notificationSlice';

interface NavbarProps {
  fixed?: boolean;
}

export default function Navbar({ fixed = true }: NavbarProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const userId = user?._id;
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);
  const [socket, setSocket] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      if (!(window as any).globalSocket) {
        const s = io(import.meta.env.VITE_SOCKET_URL, { withCredentials: true });
        (window as any).globalSocket = s;
        setSocket(s);
        s.on('connect', () => {
          s.emit('identify', userId);
        });
        s.on('notification', (notif: any) => {
          dispatch(addNotification(notif));
          dispatch(fetchUnreadCount());
          showNotification({
            title: notif.title,
            message: notif.message,
            color: 'blue',
          });
        });
        s.on('disconnect', () => {
        });
      } else {
        setSocket((window as any).globalSocket);
      }
      dispatch(fetchUnreadCount());
      return () => {
        if ((window as any).globalSocket) {
          (window as any).globalSocket.disconnect();
          (window as any).globalSocket = null;
        }
      };
    }
  }, [isAuthenticated, userId, dispatch]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminUser = user?.role === 'admin' || user?.role === 'superadmin';

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const navbarContent = (
    <Box
      style={{
        position: fixed ? 'fixed' : 'static',
        top: fixed ? 0 : undefined,
        left: fixed ? 0 : undefined,
        right: fixed ? 0 : undefined,
        zIndex: fixed ? 1000 : undefined,
        backgroundColor: isDark
          ? 'rgba(24, 24, 27, 0.4)'
          : 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap" px="md" py="xs">
        {/* Logo */}
        <UnstyledButton onClick={() => isAuthenticated ? navigate('/home') : navigate('/')}>
          <Group align="center" gap="xs">
            <Image
              src={isDark ? '/logo-dark.png' : '/logo-light.png'}
              alt="LogIt logo"
              w={28}
              h={28}
              fit="contain"
              radius="md"
            />
            <span
              style={{
                fontFamily: 'cursive',
                fontWeight: 700,
                fontSize: rem(18),
                color: isDark ? 'white' : 'black',
              }}
            >
              LogIt
            </span>
          </Group>
        </UnstyledButton>

        {/* Search */}
        {isAuthenticated && !isMobile && !isAdminRoute && !isAdminUser && (
          <TextInput
            placeholder="Search LogIt"
            leftSection={<SearchIcon width={14} height={14} />}
            radius="md"
            w={rem(250)}
            size="xs"
            styles={{
              input: {
                backgroundColor: isDark
                  ? 'rgba(36, 36, 40, 0.6)'
                  : 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(8px)',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.15)',
              },
            }}
          />
        )}

        {/* Actions */}
        <Group gap="xs" wrap="nowrap">
          {isAuthenticated ? (
            <>
              {isMobile && !isAdminUser && (
                <ActionIcon variant="light" size="lg" color="blue" radius="md">
                  <SearchIcon width={20} height={20} />
                </ActionIcon>
              )}
              {!isAdminUser && (
                <Popover
                  opened={popoverOpen}
                  onChange={setPopoverOpen}
                  position="bottom-end"
                  withArrow
                  shadow="md"
                  offset={12}
                  trapFocus
                  withinPortal
                >
                  <Popover.Target>
                    <ActionIcon
                      variant="light"
                      size="lg"
                      radius="md"
                      onClick={() => setPopoverOpen((v) => !v)}
                      style={{ position: 'relative', overflow: 'visible' }}
                    >
                      <BellIcon width={20} height={20} />
                      {unreadCount > 0 && (
                        <Badge
                          color="red"
                          size="sm"
                          style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            minWidth: 18,
                            height: 18,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            borderRadius: '50%',
                            zIndex: 2,
                            boxShadow: '0 0 0 2px white',
                          }}
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown style={{ padding: 0, minWidth: 360, maxWidth: '90vw', marginTop: 8 }}>
                    <NotificationList
                      onRead={() => dispatch(fetchUnreadCount())}
                      onClose={() => setPopoverOpen(false)}
                    />
                  </Popover.Dropdown>
                </Popover>
              )}
              <ActionIcon
                variant="light"
                size="lg"
                radius="md"
                onClick={handleLogout}
              >
                <LogoutIcon width={20} height={20} />
              </ActionIcon>
            </>
          ) : (
            !isMobile && (
              <Group gap="xs">
                <Button
                  variant="light"
                  size="xs"
                  radius="md"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  size="xs"
                  radius="md"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </Group>
            )
          )}

          {/* Theme Toggle */}
          <Switch
            size="sm"
            onLabel={<SunIcon width={12} height={12} />}
            offLabel={<MoonIcon width={12} height={12} />}
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
  );

  if (fixed) {
    return <Portal>{navbarContent}</Portal>;
  }
  return navbarContent;
}
