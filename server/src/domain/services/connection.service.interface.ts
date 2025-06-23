import { Connection } from "../entities/connection.entity";

export interface IConnectionService {
    fetchFollowers(userId: string): Promise<Connection[]>;
    fetchFollowing(userId: string): Promise<Connection[]>;
    followUser(userId: string, targetUserId: string): Promise<void>;
    unfollowUser(userId: string, targetUserId: string): Promise<void>;
    blockUser(userId: string, targetUserId: string): Promise<void>;
    unblockUser(userId: string, targetUserId: string): Promise<void>;
}