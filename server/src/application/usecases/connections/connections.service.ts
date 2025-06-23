import { Connection } from "../../../domain/entities/connection.entity";
import { IConnectionRepository } from "../../../domain/repositories/connection.repository.interface";
import { IConnectionService } from "../../../domain/services/connection.service.interface";

export class ConnectionService implements IConnectionService {
    constructor(private connectionRepository: IConnectionRepository) {}

    async fetchFollowers(userId: string): Promise<Connection[]> {
        const { data } = await this.connectionRepository.findAll({
            filters: { connectedUserId: userId, connectionType: "following" },
            limit: 1000,
        });
        return data;
    }

    async fetchFollowing(userId: string): Promise<Connection[]> {
        const { data } = await this.connectionRepository.findAll({
            filters: { userId, connectionType: "following" },
            limit: 1000,
        });
        return data;
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
        const existing = await this.connectionRepository.findConnection(userId, targetUserId);
        if (existing && existing.connectionType === "blocked") {
            throw new Error("User already blocked.");
        }
        // If following, update to blocked
        if (existing) {
            await this.connectionRepository.update(existing.id, { connectionType: "blocked" });
        } else {
            await this.connectionRepository.create({ userId, connectedUserId: targetUserId, connectionType: "blocked" });
        }
    }

    async unblockUser(userId: string, targetUserId: string): Promise<void> {
        const existing = await this.connectionRepository.findConnection(userId, targetUserId);
        if (!existing || existing.connectionType !== "blocked") {
            throw new Error("User is not blocked.");
        }
        await this.connectionRepository.deleteConnection(userId, targetUserId);
    }
}