import mongoose from 'mongoose';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import UserModel from '../mongodb/user.schema';
import bcrypt from 'bcryptjs';

export class MongoUserRepository implements IUserRepository {
  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser = await UserModel.create(user);
    return this.mapToUser(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.mapToUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.mapToUser(user) : null;
  }

  async updateVerificationStatus(id: string, isVerified: boolean): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { isVerified, updatedAt: new Date() },
      { new: true }
    );
    return user ? this.mapToUser(user) : null;
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
    return user ? this.mapToUser(user) : null;
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await UserModel.findById(id);
    if (!user || !user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  async delete(email: string): Promise<void> {
    await UserModel.deleteOne({ email });
  }

  async updateById(id: string, update: Partial<User>): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { ...update, updatedAt: new Date() },
      { new: true }
    );
    return user ? this.mapToUser(user) : null;
  }

  async fetch(page = 1, limit = 10, search = ''): Promise<{ users: User[]; total: number; }> {
    const query = search
      ? {
          $and: [
            {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
              ],
            },
            { role: 'user' },
          ],
        }
      : { role: 'user' };

    const skip = (page - 1) * limit;
    const [userDocs, total] = await Promise.all([
      UserModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select('-password'),
      UserModel.countDocuments(query)
    ]);

    const users = userDocs.map(doc => this.mapToUser(doc));
    return { users, total };
  }

  async updateUser(id: string, update: Partial<User>): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { ...update, updatedAt: new Date() },
      { new: true }
    );
    return user ? this.mapToUser(user) : null;
  }

  async isUserBlocked(id: string): Promise<boolean> {
    const user = await UserModel.findById(id);
    return user?.isBlocked || false;
  }

  private mapToUser(doc: mongoose.Document): User {
    const user = doc.toObject();
    return {
      ...user,
      id: user._id.toString(),
    };
  }
} 