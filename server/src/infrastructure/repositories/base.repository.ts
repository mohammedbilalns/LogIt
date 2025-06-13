import { Document, Model, UpdateQuery, FilterQuery } from 'mongoose';
import { IBaseRepository, BaseEntity } from '../../domain/repositories/base.repository.interface';
import { logger } from '../../utils/logger';

export abstract class BaseRepository<T extends Document, E extends BaseEntity> implements IBaseRepository<E> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  protected abstract getSearchFields(): string[];

  protected abstract mapToEntity(doc: T): E;

  async create(data: Omit<E, 'id' | 'createdAt' | 'updatedAt'>): Promise<E> {
    try {
      
      const doc = await this.model.create(data as unknown as Partial<T>);

      return this.mapToEntity(doc);
    } catch (error) {
      logger.red('CREATE_ERROR', error instanceof Error ? error.message : 'Failed to create entity');
      throw error;
    }
  }

  async findById(id: string, filters?: Record<string, unknown>): Promise<E | null> {
    try {
      const doc = await this.model.findById(id, filters);
      return doc ? this.mapToEntity(doc) : null;
    } catch (error) {
      logger.red('FIND_BY_ID_ERROR', error instanceof Error ? error.message : 'Failed to find entity by id');
      throw error;
    }
  }

  async update(id: string, data: Partial<E>): Promise<E | null> {
    try {
      const doc = await this.model.findByIdAndUpdate(id, data as UpdateQuery<T>, { new: true });
      return doc ? this.mapToEntity(doc) : null;
    } catch (error) {
      logger.red('UPDATE_ERROR', error instanceof Error ? error.message : 'Failed to update entity');
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      logger.red('DELETE_ERROR', error instanceof Error ? error.message : 'Failed to delete entity');
      throw error;
    }
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
  }): Promise<{ data: E[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        filters = {}
      } = params || {};

      const query: FilterQuery<T> = { ...filters } as FilterQuery<T>;

      const trimmedSearch = search ? search.trim() : null;

      console.log('Search parameter received:', search);
      console.log('Trimmed search parameter:', trimmedSearch);

      if (trimmedSearch) {
        const searchFields = this.getSearchFields();
        const searchQuery = searchFields.map(field => ({
          [field]: { $regex: trimmedSearch, $options: 'i' }
        })) as FilterQuery<T>[];
        query.$or = searchQuery;
      }
      
      console.log('MongoDB Query object:', JSON.stringify(query, null, 2));

      const skip = (page - 1) * limit;
      const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [data, total] = await Promise.all([
        this.model.find(query).sort(sort).skip(skip).limit(limit),
        this.model.countDocuments(query)
      ]);

      return {
        data: data.map(doc => this.mapToEntity(doc)),
        total
      };
    } catch (error) {
      logger.red('FIND_ALL_ERROR', error instanceof Error ? error.message : 'Failed to find entities');
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.model.countDocuments({ _id: id });
      return count > 0;
    } catch (error) {
      logger.red('EXISTS_ERROR', error instanceof Error ? error.message : 'Failed to check entity existence');
      throw error;
    }
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    try {
      return await this.model.countDocuments(filters || {});
    } catch (error) {
      logger.red('COUNT_ERROR', error instanceof Error ? error.message : 'Failed to count entities');
      throw error;
    }
  }
} 