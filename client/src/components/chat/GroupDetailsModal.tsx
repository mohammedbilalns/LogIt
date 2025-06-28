import {
  Modal,
  Text,
  Group,
  Stack,
  Avatar,
  Button,
  ActionIcon,
  TextInput,
  ScrollArea,
  rem,
  useMantineColorScheme,
  useMantineTheme,
  Badge,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from '../icons/XIcon';
import PlusIcon from '../icons/PlusIcon';
import UserSearchList from './UserSearchList';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { removeParticipant, promoteParticipant, leaveGroup, addParticipants, fetchChatDetails, updateGroupName } from '@/store/slices/chatSlice';
import { notifications } from '@mantine/notifications';
import { ConfirmModal } from '../confirm';

interface GroupDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  chat: any;
  participants: any[];
  isAdmin: boolean;
  loggedInUser: any;
  isRemovedOrLeft?: boolean;
}

export default function GroupDetailsModal({ opened, onClose, chat, participants, isAdmin, loggedInUser, isRemovedOrLeft = false }: GroupDetailsModalProps) {
  const [editingName, setEditingName] = useState(false);
  const [groupName, setGroupName] = useState(chat?.name || '');
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === 'dark';
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [addingUsers, setAddingUsers] = useState<string[]>([]);
  const [addMembersError, setAddMembersError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [updatingName, setUpdatingName] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [removedUserId, setRemovedUserId] = useState<string | null>(null);
  const [addMembersSuccess, setAddMembersSuccess] = useState<string | null>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });

  useEffect(() => {
    if (opened) {
      setGroupName(chat?.name || '');
    }
  }, [chat?.name, opened]);

  // Close modal if user is removed or left
  useEffect(() => {
    if (opened && isRemovedOrLeft) {
      onClose();
    }
  }, [opened, isRemovedOrLeft, onClose]);

  const handleMemberClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  const handleRemoveUser = (userId: string) => {
    setConfirmRemoveOpen({ open: true, userId });
  };

  const confirmRemoveUser = async () => {
    if (!confirmRemoveOpen.userId) return;
    try {
      setRemovedUserId(confirmRemoveOpen.userId);
      await dispatch(removeParticipant({ chatId: chat.id, userId: confirmRemoveOpen.userId })).unwrap();
      notifications.show({ title: 'Removed', message: 'User removed from group', color: 'green' });
      dispatch(fetchChatDetails({ chatId: chat.id, page: 1, limit: 15 }));
      setTimeout(() => setRemovedUserId(null), 1500);
    } catch (e: any) {
      setRemovedUserId(null);
      notifications.show({ title: 'Error', message: e || 'Failed to remove user', color: 'red' });
    } finally {
      setConfirmRemoveOpen({ open: false, userId: null });
    }
  };

  const handlePromoteUser = async (userId: string) => {
    try {
      await dispatch(promoteParticipant({ chatId: chat.id, userId })).unwrap();
      notifications.show({ title: 'Promoted', message: 'User promoted to admin', color: 'green' });
      dispatch(fetchChatDetails({ chatId: chat.id, page: 1, limit: 15 }));
    } catch (e: any) {
      notifications.show({ title: 'Error', message: e || 'Failed to promote user', color: 'red' });
    }
  };

  const handleLeaveGroup = () => {
    setConfirmLeaveOpen(true);
  };

  const confirmLeaveGroup = async () => {
    try {
      await dispatch(leaveGroup(chat.id)).unwrap();
      onClose();
    } catch (e: any) {
      notifications.show({ title: 'Error', message: e || 'Failed to leave group', color: 'red' });
    } finally {
      setConfirmLeaveOpen(false);
    }
  };

  const handleAddMembers = async () => {
    setAddMembersError(null);
    try {
      await dispatch(addParticipants({ chatId: chat.id, participants: addingUsers })).unwrap();
      setSuccessMessage('Members added to group successfully!');
      setAddMembersOpen(false);
      setAddingUsers([]);
      setTimeout(() => setSuccessMessage(null), 2000);
      dispatch(fetchChatDetails({ chatId: chat.id, page: 1, limit: 15 }));
    } catch (e: any) {
      setAddMembersError(e || 'Failed to add members');
    }
  };

  const handleUpdateName = async () => {
    if (!groupName.trim() || groupName === chat?.name) return;
    setUpdatingName(true);
    try {
      await dispatch(updateGroupName({ chatId: chat.id, name: groupName })).unwrap();
      setSuccessMessage('Group name updated successfully!');
      setEditingName(false);
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e: any) {
      notifications.show({ title: 'Error', message: e || 'Failed to update group name', color: 'red' });
    } finally {
      setUpdatingName(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      centered
      size="lg"
      withCloseButton={false}
      overlayProps={{
        blur: 6,
        backgroundOpacity: 0.35,
        color: '#000',
        zIndex: 3000,
      }}
      zIndex={3100}
      styles={{
        content: {
          borderRadius: rem(16),
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)',
          backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        },
        header: {
          backgroundColor: 'transparent',
          borderBottom: 'none',
        },
      }}
    >
      <Stack gap="md">
        {successMessage && (
          <Text c="green" fw={500} ta="center">{successMessage}</Text>
        )}
        <Group justify="space-between" align="center" mb="xs" style={{ paddingBottom: 8, borderBottom: `1px solid ${theme.colors.gray[isDark ? 8 : 2]}` }}>
          <Group gap="sm" align="center" style={{ flex: 1 }}>
            <Avatar src={chat?.groupImage} size="lg" radius="xl">
              {groupName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </Avatar>
            {editingName ? (
              <>
                <TextInput
                  value={groupName}
                  onChange={e => setGroupName(e.currentTarget.value)}
                  autoFocus
                  size="md"
                  radius="md"
                  style={{ minWidth: 180, maxWidth: 320 }}
                  onKeyDown={e => { if (e.key === 'Enter') handleUpdateName(); }}
                />
                <Button
                  size="xs"
                  variant="filled"
                  color="blue"
                  ml={8}
                  loading={updatingName}
                  disabled={!groupName.trim() || groupName === chat?.name}
                  onClick={handleUpdateName}
                  style={{ marginLeft: 8 }}
                >
                  Update
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  ml={4}
                  onClick={() => { setEditingName(false); setGroupName(chat?.name || ''); }}
                  style={{ marginLeft: 4 }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Text fw={700} size="xl" style={{ letterSpacing: 0.5, minWidth: 180, maxWidth: 320 }} lineClamp={2}>
                  {groupName}
                </Text>
                {isAdmin && (
                  <Button variant="subtle" size="xs" onClick={() => setEditingName(true)} style={{ marginLeft: 8 }}>
                    Edit
                  </Button>
                )}
              </>
            )}
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={onClose} size="lg">
            <XIcon width={20} />
          </ActionIcon>
        </Group>

        {isAdmin && (
          <Button leftSection={<PlusIcon size={16} />} variant="light" size="xs" mb="xs" onClick={() => setAddMembersOpen(true)}>
            Add Members
          </Button>
        )}

        <Text fw={500} size="sm" mb={-8} c="dimmed">Members ({participants.length})</Text>
        <ScrollArea h={320} type="auto" offsetScrollbars>
          <Stack gap="xs">
            {participants.map((user) => (
              <Group key={user.userId} justify="space-between" style={{ cursor: 'pointer', borderRadius: 8, padding: '4px 8px', transition: 'background 0.15s', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                <Group gap="sm" align="center" onClick={() => handleMemberClick(user.userId)}>
                  <Avatar src={user.profileImage} size="sm" radius="xl">
                    {user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Text size="sm" fw={500}>{user.name}</Text>
                  {user.role === 'admin' && (
                    <Badge color="yellow" size="xs" variant="filled" style={{ marginLeft: 4 }}>Admin</Badge>
                  )}
                  {user.userId === loggedInUser?._id && <Text size="xs" c="blue">(You)</Text>}
                </Group>
                <Group>
                  {isAdmin && user.role !== 'admin' && user.userId !== loggedInUser?._id && (
                    <Button
                      size="xs"
                      color="yellow"
                      variant="light"
                      onClick={() => handlePromoteUser(user.userId)}
                      style={{ marginRight: 6 }}
                    >
                      Promote
                    </Button>
                  )}
                  {isAdmin && user.userId !== loggedInUser?._id && user.role !== 'admin' && (
                    <ActionIcon color="red" variant="subtle" size="sm" onClick={() => handleRemoveUser(user.userId)} loading={removedUserId === user.userId}>
                      <XIcon width={16} />
                    </ActionIcon>
                  )}
                </Group>
              </Group>
            ))}
          </Stack>
        </ScrollArea>

        {/* Leave Group Button */}
        <Button color="red" variant="light" mt="md" fullWidth radius="md" onClick={handleLeaveGroup}>
          Leave Group
        </Button>
      </Stack>

      <Modal opened={addMembersOpen} onClose={() => setAddMembersOpen(false)} title="Add Members" centered zIndex={3200}>
        <UserSearchList
          opened={addMembersOpen}
          selectedUsers={addingUsers}
          setSelectedUsers={setAddingUsers}
          maxSelected={10 - participants.length}
          excludeIds={[...participants.map(u => u.userId), loggedInUser._id]}
          label="Add Members"
        />
        {addMembersError && (
          <Text color="red" size="sm" mt="sm">{addMembersError}</Text>
        )}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setAddMembersOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMembers} disabled={addingUsers.length === 0}>Add</Button>
        </Group>
      </Modal>

      {/* Confirm Leave Group Modal */}
      <ConfirmModal
        opened={confirmLeaveOpen}
        onClose={() => setConfirmLeaveOpen(false)}
        onConfirm={confirmLeaveGroup}
        title="Leave Group"
        message="Are you sure you want to leave this group?"
        confirmLabel="Leave"
        confirmColor="red"
      />
      {/* Confirm Remove User Modal */}
      <ConfirmModal
        opened={confirmRemoveOpen.open}
        onClose={() => setConfirmRemoveOpen({ open: false, userId: null })}
        onConfirm={confirmRemoveUser}
        title="Remove User"
        message="Are you sure you want to remove this user from the group?"
        confirmLabel="Remove"
        confirmColor="red"
        loading={removedUserId === confirmRemoveOpen.userId}
      />
    </Modal>
  );
} 