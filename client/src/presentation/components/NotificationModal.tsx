import { useEffect } from 'react';
import { List, Button, Group, Text, Loader, Badge, ScrollArea } from '@mantine/core';
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

interface NotificationListProps {
  onRead: () => void;
  onClose?: () => void;
}

export default function NotificationList({ onRead, onClose }: NotificationListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading, hasMore, page, limit } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(resetNotifications());
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
    dispatch(fetchUnreadCount());
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, onClose]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id)).then(() => {
      onRead();
    });
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead()).then(() => {
      onRead();
    });
  };

  const handleLoadMore = () => {
    dispatch(loadMoreNotifications({ page: page + 1, limit: limit }));
  };

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
              <List.Item
                key={notif.id}
                style={{ cursor: 'pointer', background: notif.isRead ? 'inherit' : '#e6f7ff', borderRadius: 6, padding: 8, marginBottom: 4 }}
                onClick={() => handleMarkAsRead(notif.id)}
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
              </List.Item>
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