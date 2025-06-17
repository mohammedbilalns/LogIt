import { User } from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import UserModel, { UserDocument } from "../mongodb/user.schema";
import bcrypt from "bcryptjs";
import { BaseRepository } from "./base.repository";

export class MongoUserRepository
  extends BaseRepository<UserDocument, User>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }

  protected getSearchFields(): string[] {
    return ["name", "email"];
  }

  protected mapToEntity(doc: UserDocument): User {
    const user = doc.toObject();
    return {
      ...user,
      id: user._id.toString(),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.mapToEntity(user) : null;
  }

  async updateVerificationStatus(
    userId: string,
    isVerified: boolean
  ): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { isVerified, updatedAt: new Date() },
      { new: true }
    );
    return user ? this.mapToEntity(user) : null;
  }

  async updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        updatedAt: new Date(),
      },
      { new: true }
    );
    return user ? this.mapToEntity(user) : null;
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    if (!user || !user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  async deleteByEmail(email: string): Promise<void> {
    await UserModel.deleteOne({ email });
  }

  async isUserBlocked(userId: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    return user?.isBlocked || false;
  }
}
