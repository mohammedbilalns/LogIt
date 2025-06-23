import { Connection } from "../entities/connection.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface IConnectionRepository extends  IBaseRepository<Connection> {
    findConnection(userId: string, targetUserId: string): Promise<Connection | null>;
    deleteConnection(userId: string, targetUserId: string): Promise<void>;
}