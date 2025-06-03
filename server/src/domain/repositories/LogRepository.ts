import { Log } from "../entities/Log";

export interface LogRepository {
  create(log: Log): Promise<Log>;
  findById(id: string): Promise<Log | null>;
  findByUserId(userId: string): Promise<Log[]>;
  update(log: Log): Promise<Log | null>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<Log[]>;
} 