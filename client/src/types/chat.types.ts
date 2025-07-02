export interface Chat {
  id: string;
  isGroup: boolean;
  name?: string;
  creator?: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    userId: string;
    name: string;
    profileImage?: string;
    role: string;
  }>;
  lastMessageDetails?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content?: string;
  media?: string;
  log?: string;
  replyTo?: string;
  deletedFor: string[];
  seenBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  role: 'admin' | 'member' | 'removed-user' | 'left-user';
  joinedAt: string;
  isMuted?: boolean;
  isBlocked?: boolean;
  leftAt?: string;
  name: string;
  profileImage?: string;
}


export interface ChatState {
  singleChats: Chat[];
  groupChats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  participants: ChatParticipant[];
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;
  socketConnected: boolean;
  page: number;
  hasMore: boolean;
  singleHasMore: boolean;
  groupHasMore: boolean;
  limit: number;
  total: number;
  singleTotal: number;
  groupTotal: number;
}