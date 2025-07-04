import { IConnectionRepository } from "../../domain/repositories/connection.repository.interface";
import { IConnectionService } from "../../domain/services/connection.service.interface";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";

export class ConnectionService implements IConnectionService {
    constructor(
        private connectionRepository: IConnectionRepository,
        private userRepository: IUserRepository
    ) {}

    async fetchFollowers(userId: string, loggedInUserId?: string): Promise<{ _id: string; name: string; email: string; profession?: string; profileImage?: string; isFollowedByMe?: boolean }[]> {
        // Find all connections where connectedUserId = userId and type = following
        const { data } = await this.connectionRepository.findAll({
            filters: { connectedUserId: userId, connectionType: "following" },
            limit: 1000,
        });
        // The follower is the userId field
        const followerIds = data.map(conn => conn.userId);
        if (followerIds.length === 0) return [];
        const users = await this.userRepository.findManyByIds(followerIds);
        let followedByMeIds: string[] = [];
        if (loggedInUserId) {
            // Find all connections where loggedInUserId follows these users
            const { data: followingData } = await this.connectionRepository.findAll({
                filters: { userId: loggedInUserId, connectionType: "following", connectedUserId: { $in: followerIds } },
                limit: 1000,
            });
            followedByMeIds = followingData.map(conn => conn.connectedUserId);
        }
        return users.map(u => ({
            _id: u.id,
            name: u.name,
            email: u.email,
            profession: u.profession,
            profileImage: u.profileImage,
            isFollowedByMe: loggedInUserId ? followedByMeIds.includes(u.id) : undefined
        }));
    }

    async fetchFollowing(userId: string): Promise<{ _id: string; name: string; email: string; profession?: string; profileImage?: string }[]> {
        // Find all connections where userId = userId and type = following
        const { data } = await this.connectionRepository.findAll({
            filters: { userId, connectionType: "following" },
            limit: 1000,
        });
        // The following is the connectedUserId field
        const followingIds = data.map(conn => conn.connectedUserId);
        if (followingIds.length === 0) return [];
        const users = await this.userRepository.findManyByIds(followingIds);
        return users.map(u => ({
            _id: u.id,
            name: u.name,
            email: u.email,
            profession: u.profession,
            profileImage: u.profileImage
        }));
    }

    async followUser(userId: string, targetUserId: string): Promise<void> {
        if (userId === targetUserId) {
            throw new Error("You cannot follow yourself.");
        }
        // Check if already following
        const existing = await this.connectionRepository.findConnection(userId, targetUserId);
        if (existing && existing.connectionType === "following") {
            throw new Error("Already following this user.");
        }
        // Check if blocked
        if (existing && existing.connectionType === "blocked") {
            throw new Error("You have blocked this user. Unblock to follow.");
        }
        // Create or update connection
        if (existing) {
            await this.connectionRepository.update(existing.id, { connectionType: "following" });
        } else {
            await this.connectionRepository.create({ userId, connectedUserId: targetUserId, connectionType: "following" });
        }
    }

    async unfollowUser(userId: string, targetUserId: string): Promise<void> {
        const existing = await this.connectionRepository.findConnection(userId, targetUserId);
        if (!existing || existing.connectionType !== "following") {
            throw new Error("You are not following this user.");
        }
        await this.connectionRepository.deleteConnection(userId, targetUserId);
    }

    async blockUser(userId: string, targetUserId: string): Promise<void> {
        if (userId === targetUserId) {
            throw new Error("You cannot block yourself.");
        }
        // Remove all connections between the two users (both directions)
        await this.connectionRepository.deleteConnection(userId, targetUserId);
        await this.connectionRepository.deleteConnection(targetUserId, userId);
        // Create block connection
        await this.connectionRepository.create({ userId, connectedUserId: targetUserId, connectionType: "blocked" });
    }

    async unblockUser(userId: string, targetUserId: string): Promise<void> {
        const existing = await this.connectionRepository.findConnection(userId, targetUserId);
        if (!existing || existing.connectionType !== "blocked") {
            throw new Error("User is not blocked.");
        }
        await this.connectionRepository.deleteConnection(userId, targetUserId);
    }
}