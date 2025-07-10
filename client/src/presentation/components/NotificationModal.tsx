import { useEffect, useCallback, useRef } from 'react';
import { List, Button, Group, Text, Loader, Badge, ScrollArea, UnstyledButton } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/infrastructure/store';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  fetchUnreadCount,
  loadMoreNotifications,
  resetNotifications,
} from '@/infrastructure/store/slices/notificationSlice';
import { Notification } from '@/types/notification.types';
import { useNavigate } from 'react-router-dom';

interface NotificationListProps {
  onRead: () => void;
  onClose?: () => void;
}

export default function NotificationList({ onRead, onClose }: NotificationListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notifications, loading, hasMore, page, limit } = useSelector((state: RootState) => state.notifications);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && onCloseRef.current) onCloseRef.current();
  }, []);

  useEffect(() => {
    dispatch(resetNotifications());
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
    dispatch(fetchUnreadCount());

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const handleMarkAsRead = useCallback((id: string) => {
    dispatch(markAsRead(id)).then(() => {
      dispatch(fetchUnreadCount());
    });
  }, [dispatch]);

  const handleMarkAllAsRead = useCallback(() => {
    dispatch(markAllAsRead()).then(() => {
      dispatch(fetchUnreadCount());
    });
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    dispatch(loadMoreNotifications({ page: page + 1, limit: limit }));
  }, [dispatch, page, limit]);

  const handleNotificationClick = useCallback((notif: Notification) => {
    dispatch(markAsRead(notif.id)).then(() => {
      dispatch(fetchUnreadCount());
      if (notif.link) {
        navigate(notif.link);
      }
    });
  }, [dispatch, navigate]);

  return (
    <div style={{ width: 360, maxWidth: '90vw', minHeight: 200, maxHeight: '70vh', borderRadius: 12, boxShadow: '0 4px 32px rgba(0,0,0,0.15)', background: 'var(--mantine-color-body, #fff)', overflow: 'hidden', padding: 0 }}>
      <Group justify="space-between" mb="xs" px="md" pt="md">
        <Text fw={600} size="md">Notifications</Text>
        <Button size="xs" onClick={handleMarkAllAsRead} loading={loading} disabled={loading} variant="light">
          Mark all as read
        </Button>
      </Group>
      <ScrollArea h={320} px="md">
        {loading && notifications.length === 0 ? (
          <Loader />
        ) : notifications.length === 0 ? (
          <Text c="dimmed" ta="center" py="md">No notifications</Text>
        ) : (
          <List spacing="xs">
            {notifications.map((notif: Notification) => (
              <UnstyledButton
                key={notif.id}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: notif.isRead ? 'inherit' : '#e6f7ff',
                  borderRadius: 6,
                  padding: 8,
                  marginBottom: 4,
                  cursor: 'pointer',
                  border: 'none',
                  display: 'block',
                }}
                onClick={() => handleNotificationClick(notif)}
              >
                <Group justify="space-between">
                  <div>
                    <Text fw={notif.isRead ? 400 : 700} size="sm">{notif.title}</Text>
                    <Text size="xs" c="dimmed">
                      {notif.senderName ? <b>{notif.senderName}: </b> : null}
                      {notif.message}
                    </Text>
                    <Text size="xs" c="gray">{new Date(notif.createdAt).toLocaleString()}</Text>
                  </div>
                  {!notif.isRead && <Badge color="blue" size="xs">New</Badge>}
                </Group>
              </UnstyledButton>
            ))}
          </List>
        )}
        {hasMore && !loading && (
          <Group justify="center" mt="sm">
            <Button size="xs" variant="subtle" onClick={handleLoadMore}>
              Load more
            </Button>
          </Group>
        )}
      </ScrollArea>
    </div>
  );
} 