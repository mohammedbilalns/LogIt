export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_OTP: '/auth/verify-otp',
    VERIFY_RESET_OTP: '/auth/verify-resetotp',
    RESEND_OTP: '/auth/resend-otp',
    RESET_PASSWORD: '/auth/reset-password',
    UPDATE_PASSWORD: '/auth/update-password',
    CHANGE_PASSWORD: '/user/change-password',
    GOOGLE: '/auth/google',
    REFRESH: '/auth/refresh',
    CSRF: '/auth/csrf',
  },
  ARTICLES: {
    BASE: '/articles',
    BY_ID: (id: string) => `/articles/${id}`,
    FETCH_USER_ARTICLES: 'articles/fetchUserArticles',
  },
  LOGS: {
    BASE: '/logs',
    BY_ID: (id: string) => `/logs/${id}`,
  },
  REPORTS: {
    BASE: '/reports',
    REPORT_STATUS: (id: string) => `/reports/${id}/status`,
    BLOCK_ARTICLE: (id: string) => `/reports/block-article/${id}`,
  },
  TAGS: {
    BASE: '/tags',
    BY_ID: (id: string) => `/tags/${id}`,
    BY_IDS: (ids: string[]) => `/tags/by-ids?ids=${ids.join(',')}`,
    PROMOTE: (id: string) => `/tags/${id}/promote`,
    DEMOTE: (id: string) => `/tags/${id}/demote`,
  },
  UPLOAD: {
    UPLOAD_IMAGE:'/upload/upload-image',
    UPLOAD_AUDIO:'/upload/upload-audio'
  },
  USER_MANAGEMENT: {
    BASE: '/admin/users',
    BY_ID: (id: string) => `/admin/users/${id}`,
    UPDATE_PROFILE: '/user/update-profile',
    FETCH_STATS :'/user/stats'
  },
  HOME: {
    BASE: '/user/home',
  },
  CONNECTIONS: {
    FOLLOW: '/connections/follow',
    UNFOLLOW: '/connections/unfollow',
    BLOCK: '/connections/block',
    UNBLOCK: '/connections/unblock',
    FETCH_FOLLOWERS: (userId: string) => `/connections/followers/${userId}`,
    FETCH_FOLLOWING: (userId: string) => `/connections/following/${userId}`,
  },
  PAYMENTS: {
    ORDER: '/payments/order',
    VERIFY: '/payments/verify',
  },
  CALLS: {
    CREATE_LOG: '/calls/log',
    UPDATE_LOG: (id: string) => `/calls/log/${id}`,
    HISTORY: '/calls/history',
    EVENT: '/calls/event',
  },
  CHATS: {
    BASE: '/chats',
    GROUP: '/chats/group',
    BY_ID: (id: string) => `/chats/${id}`,
    PRIVATE: (userId: string) => `/chats/private/${userId}`,
    MESSAGES: (chatId: string) => `/chats/${chatId}/messages`,
    PARTICIPANTS: (chatId: string) => `/chats/${chatId}/participants`,
    PARTICIPANT: (chatId: string, userId: string) => `/chats/${chatId}/participants/${userId}`,
    PROMOTE_PARTICIPANT: (chatId: string, userId: string) =>
      `/chats/${chatId}/participants/${userId}/promote`,
    LEAVE: (chatId: string) => `/chats/${chatId}/leave`,
    GROUP_NAME: (chatId: string) => `/chats/${chatId}/name`,
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    CHART_DATA: '/dashboard/chart-data',
  },
  SUBSCRIPTION: {
    BASE: '/subscription',
    DEACTIVATE: (subscriptionId: string) => `/subscription/${subscriptionId}/deactivate`,
    NEXT_PLANS: (resource: 'articles' | 'logs', currentLimit: number) =>
      `/subscription/next-plans?resource=${resource}&currentLimit=${currentLimit}`,
  }    
  
};
