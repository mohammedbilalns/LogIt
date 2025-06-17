export interface BaseEntity {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBaseRepository<T extends BaseEntity> {
  // Create operation
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;

  // Read operations
  findById(id: string): Promise<T | null>;
  findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    filters?: Record<string, unknown>;
  }): Promise<{ data: T[]; total: number }>;

  // Update operations
  update(id: string, data: Partial<T>): Promise<T | null>;

  // Delete operations
  delete(id: string): Promise<boolean>;

  // Utility operations
  exists(id: string): Promise<boolean>;
  count(filters?: Record<string, unknown>): Promise<number>;
}
