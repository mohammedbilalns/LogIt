import { Socket } from "socket.io";
import { logger } from "../../../utils/logger";
import { onlineUsers } from "../../../config/socket";
import { emitNotificationToUser } from "./notification.handler";
import { Notification } from "../../../domain/entities/notification.entity";
import { RemoteSocket, DefaultEventsMap } from "socket.io";
import { ChatParticipantRepository, ChatParticipantWithUser } from '../../../infrastructure/repositories/chat-participant.repository';

interface CallEndData {
  callId: string;
  chatId: string;
  from: string;
  endedBy: string;
  fromName?: string;
}

interface CallRequestData {
  callId: string;
  chatId: string;
  from: string;
  to: string;
  type: 'audio' | 'video';
  fromPeerId: string;
}

interface CallAcceptData {
  callId: string;
  from: string;
  fromPeerId: string;
}

interface CallRejectData {
  callId: string;
  from: string;
}

interface PeerRegisterData {
  peerId: string;
  userId: string;
}

const peerToUserMap = new Map<string, string>();
const userToPeerMap = new Map<string, string>();
const socketToUserMap = new Map<string, string>();
const userToSocketMap = new Map<string, string>();
const pendingCalls = new Map<string, { callerId: string; callerPeerId: string }>();

export const chatHandler = (socket: Socket) => {
  socket.on("join_user_room", (userId: string) => {
    socket.join(userId);
    //  socket-to-user mapping
    socketToUserMap.set(socket.id, userId);
    userToSocketMap.set(userId, socket.id);
  });

  socket.on("join_chat_room", (chatId: string) => {
    socket.join(chatId);
  });

  socket.on("leave_chat_room", (chatId: string) => {
    socket.leave(chatId);
  });

  socket.on("force_leave_chat_room", (chatId: string) => {
    socket.leave(chatId);
  });

  socket.on(
    "get_group_online_count",
    (userIds: string[], callback: (count: number) => void) => {
      if (!Array.isArray(userIds)) return callback(0);
      let count = 0;
      for (const uid of userIds) {
        if (onlineUsers.has(uid)) count++;
      }
      callback(count);
    }
  );

  // Peer registration for call signaling
  socket.on('peer:register', (data: PeerRegisterData) => {
    try {
      const { peerId, userId } = data;
      peerToUserMap.set(peerId, userId);
      userToPeerMap.set(userId, peerId);
      
      socket.join(userId);
      socketToUserMap.set(socket.id, userId);
      userToSocketMap.set(userId, socket.id);
      
    } catch (error) {
      logger.red('SOCKET_PEER_ERROR', `Failed to register peer: ${error}`);
    }
  });

  socket.on('call:request', async (data: CallRequestData & { fromName?: string }) => {
    try {
      const { callId, chatId, from, to, type, fromPeerId, fromName } = data;
      
      // Get target peer ID
      const targetPeerId = userToPeerMap.get(to);
      
      if (!targetPeerId) {
        // Target user is not online, send rejection
        logger.red('SOCKET_CALL_ERROR', `Target user ${to} not found in peer map`);
        socket.emit('call:rejected', { callId, reason: 'User not online' });
        return;
      }

      pendingCalls.set(callId, { callerId: from, callerPeerId: fromPeerId });

      socket.to(to).emit('call:request', {
        callId,
        from,
        fromName, 
        chatId,
        type,
        fromPeerId
      });

    } catch (error) {
      logger.red('SOCKET_CALL_ERROR', `Failed to handle call request: ${error}`);
      socket.emit('call:rejected', { callId: data.callId, reason: 'Server error' });
    }
  });

  // Call accept event
  socket.on('call:accept', async (data: CallAcceptData) => {
    try {
      const { callId, from } = data;
      
      const pendingCall = pendingCalls.get(callId);
      if (!pendingCall) {
        logger.red('SOCKET_CALL_ERROR', `Pending call not found: ${callId}`);
        return;
      }

      socket.to(pendingCall.callerId).emit('call:accepted', {
        callId,
        from,
        fromPeerId: userToPeerMap.get(from) || ''
      });

      pendingCalls.delete(callId);

    } catch (error) {
      logger.red('SOCKET_CALL_ERROR', `Failed to handle call accept: ${error}`);
    }
  });

  // Call reject event
  socket.on('call:reject', async (data: CallRejectData) => {
    try {
      const { callId } = data;
      
      const pendingCall = pendingCalls.get(callId);
      if (!pendingCall) {
        logger.red('SOCKET_CALL_ERROR', `Pending call not found: ${callId}`);
        return;
      }

      // Forward  reject signal to room
      socket.to(pendingCall.callerId).emit('call:rejected', { callId });

      // Remove the pending call
      pendingCalls.delete(callId);

    } catch (error) {
      logger.red('SOCKET_CALL_ERROR', `Failed to handle call reject: ${error}`);
    }
  });

  // Call end event
  socket.on('call:end', async (data: CallEndData) => {
    try {
      const { callId, chatId, fromName } = data;
      // Notify  participants
      socket.to(chatId).emit('call:ended', { callId });
      pendingCalls.delete(callId);

      const chatParticipantRepo = new ChatParticipantRepository();
      let leaverName = fromName || data.from;
      if (!fromName) {
        try {
          const participant = await chatParticipantRepo.findParticipant(chatId, data.from) as ChatParticipantWithUser | null;
          if (participant && participant.name) {
            leaverName = participant.name;
          }
        } catch (err) {
          logger.red('SOCKET_CALL_ERROR', `Failed to fetch leaver name: ${err}`);
        }
      }

      // Send notification to all other users in the chat
      const io = socket.nsp.server;
      const socketsInRoom = await io.in(chatId).fetchSockets();
      const userIds = socketsInRoom
        .map((s: RemoteSocket<DefaultEventsMap, DefaultEventsMap>) => {
          let userId: unknown = s.data?.userId || s.handshake.auth?.userId || s.handshake.query?.userId;
          if (!userId && s.id && socketToUserMap.has(s.id)) {
            userId = socketToUserMap.get(s.id);
          }
          return userId;
        })
        .filter((uid: unknown) => typeof uid === 'string' && uid !== data.from) as string[];
      const uniqueUserIds = Array.from(new Set(userIds));
      for (const userId of uniqueUserIds) {
        if (typeof userId === 'string') {
          const notification: Notification & { leaverId?: string } = {
            userId,
            type: 'chat',
            title: 'Call ended',
            message: `${leaverName} has left the call`,
            isRead: false,
            leaverId: data.from
          };
          emitNotificationToUser(io, userId, notification);
        }
      }
    } catch (error) {
      logger.red('SOCKET_CALL_ERROR', `Failed to handle call end: ${error}`);
    }
  });

  socket.on('call:status-update', (data) => {
    socket.to(data.chatId).emit('call:status-update', data);
  });



  socket.on('disconnect', () => {
    const userId = socketToUserMap.get(socket.id);
    if (userId) {
      socketToUserMap.delete(socket.id);
      userToSocketMap.delete(userId);
      
      const peerId = userToPeerMap.get(userId);
      if (peerId) {
        peerToUserMap.delete(peerId);
        userToPeerMap.delete(userId);
      }
      
      for (const [callId, pendingCall] of pendingCalls.entries()) {
        if (pendingCall.callerId === userId) {
          pendingCalls.delete(callId);
        }
      }
      
    }
  });
};
