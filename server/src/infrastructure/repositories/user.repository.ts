import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import UserModel, { UserDocument } from '../mongodb/user.schema';
import bcrypt from 'bcryptjs';
import { BaseRepository } from './base.repository';
import { UpdateQuery } from 'mongoose';

export class MongoUserRepository extends BaseRepository<UserDocument, User> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  protected getSearchFields(): string[] {
    return ['name', 'email'];
  }

  protected mapToEntity(doc: UserDocument): User {
    const user = doc.toObject();
    return {
      ...user,
      id: user._id.toString(),
    };
  }

  // Implement IUserRepository methods
  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.mapToEntity(user) : null;
  }

  async updateVerificationStatus(id: string, isVerified: boolean): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { isVerified, updatedAt: new Date() },
      { new: true }
    );
    return user ? this.mapToEntity(user) : null;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { 
        password: hashedPassword,
        updatedAt: new Date()
      },
      { new: true }
    );
    return user ? this.mapToEntity(user) : null;
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await UserModel.findById(id);
    if (!user || !user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  async deleteByEmail(email: string): Promise<void> {
    await UserModel.deleteOne({ email });
  }

  async updateById(id: string, update: Partial<User>): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { ...update, updatedAt: new Date() },
      { new: true }
    );
    return user ? this.mapToEntity(user) : null;
  }

  async isUserBlocked(id: string): Promise<boolean> {
    const user = await UserModel.findById(id);
    return user?.isBlocked || false;
  }

  // Override base repository methods to handle mapping
  async create(data: Partial<User>): Promise<User> {
    const doc = await UserModel.create(data as unknown as Partial<UserDocument>);
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? this.mapToEntity(doc) : null;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(
      id,
      data as UpdateQuery<UserDocument>,
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
  }): Promise<{ data: User[]; total: number }> {
    const { filters = {}, ...restParams } = params || {};
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = restParams;

    const query: Record<string, unknown> = {
      ...filters,
      role: 'user'
    };

    if (search) {
      const searchFields = this.getSearchFields();
      const searchQuery = searchFields.map(field => ({
        [field]: { $regex: search, $options: 'i' }
      }));
      query.$or = searchQuery;
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      UserModel.find(query).sort(sort).skip(skip).limit(limit),
      UserModel.countDocuments(query)
    ]);

    return {
      data: data.map(doc => this.mapToEntity(doc)),
      total
    };
  }
} 