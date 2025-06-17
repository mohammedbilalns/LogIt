import { Document, Model, UpdateQuery, FilterQuery } from "mongoose";
import {
  IBaseRepository,
  BaseEntity,
} from "../../domain/repositories/base.repository.interface";

export abstract class BaseRepository<T extends Document, E extends BaseEntity>
  implements IBaseRepository<E>
{
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  protected abstract getSearchFields(): string[];

  protected abstract mapToEntity(doc: T): E;

  async create(data: Omit<E, "id" | "createdAt" | "updatedAt">): Promise<E> {
    const doc = await this.model.create(data as unknown as Partial<T>);
    return this.mapToEntity(doc);
  }

  async findById(
    id: string,
    filters?: Record<string, unknown>
  ): Promise<E | null> {
    const doc = await this.model.findById(id, filters);
    return doc ? this.mapToEntity(doc) : null;
  }

  async update(id: string, data: Partial<E>): Promise<E | null> {
    const doc = await this.model.findByIdAndUpdate(id, data as UpdateQuery<T>, {
      new: true,
    });
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    filters?: Record<string, unknown>;
  }): Promise<{ data: E[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      filters = {},
    } = params || {};

    const query: FilterQuery<T> = { ...filters } as FilterQuery<T>;

    const trimmedSearch = search ? search.trim() : null;

    if (trimmedSearch) {
      const searchFields = this.getSearchFields();
      const searchQuery = searchFields.map((field) => ({
        [field]: { $regex: trimmedSearch, $options: "i" },
      })) as FilterQuery<T>[];
      query.$or = searchQuery;
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.model.find(query).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(query),
    ]);

    return {
      data: data.map((doc) => this.mapToEntity(doc)),
      total,
    };
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.countDocuments({ _id: id });
    return count > 0;
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    return await this.model.countDocuments(filters || {});
  }
}
