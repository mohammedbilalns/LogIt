import { Log } from '../entities/Log';

export interface LogRepository {
  create(data: Omit<Log, '_id'>): Promise<Log>;
  findById(id: string): Promise<Log | null>;
  findMany(userId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Log[]>;
  count(userId: string, options: {
    search?: string;
    tags?: string[];
  }): Promise<number>;
  update(id: string, data: Partial<Log>): Promise<Log>;
  delete(id: string): Promise<void>;
} 