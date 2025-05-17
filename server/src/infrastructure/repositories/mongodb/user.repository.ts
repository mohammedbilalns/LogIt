import mongoose, { Schema } from 'mongoose';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.model<User>('User', userSchema);

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

  async updatePassword(id: string, password: string): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { password, updatedAt: new Date() },
      { new: true }
    );
    return user ? this.mapToUser(user) : null;
  }

  private mapToUser(doc: mongoose.Document): User {
    const user = doc.toObject();
    return {
      ...user,
      id: user._id.toString(),
    };
  }
} 