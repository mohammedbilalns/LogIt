export interface CreateLogData {
  title: string;
  content: string;
  tags?: string[];
  mediaUrls?: string[];
  createdAt?: Date;
}

export interface UpdateLogData {
  title: string;
  content: string;
  tags?: string[];
  mediaUrls?: string[];
  createdAt?: Date;
}

export interface GetLogsOptions {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TagWithName {
  id: string;
  name: string;
}

export interface LogWithRelations {
  id?: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: TagWithName[];
  mediaUrls: string[];
} 