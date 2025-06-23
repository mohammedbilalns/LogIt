export interface IConnectionService {
    fetchFollowers(userId: string, loggedInUserId?: string): Promise<{ _id: string; name: string; email: string; profession?: string; profileImage?: string; isFollowedByMe?: boolean }[]>;
    fetchFollowing(userId: string): Promise<{ _id: string; name: string; email: string; profession?: string; profileImage?: string }[]>;
    followUser(userId: string, targetUserId: string): Promise<void>;
    unfollowUser(userId: string, targetUserId: string): Promise<void>;
    blockUser(userId: string, targetUserId: string): Promise<void>;
    unblockUser(userId: string, targetUserId: string): Promise<void>;
}