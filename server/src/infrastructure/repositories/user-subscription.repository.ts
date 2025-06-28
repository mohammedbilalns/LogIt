import { UserSubscription } from '../../domain/entities/user-subscription.entity';
import { IUserSubscriptionRepository } from '../../domain/repositories/user-subscription.repository.interface';
import UserSubscriptionModel, { UserSubscriptionDocument } from '../mongodb/user-subscription.schema';
import { BaseRepository } from './base.repository';

export class UserSubscriptionRepository extends BaseRepository<UserSubscriptionDocument, UserSubscription> implements IUserSubscriptionRepository {
  constructor() {
    super(UserSubscriptionModel);
  }

  protected getSearchFields(): string[] {
    return ['userId', 'paymentId', 'planId'];
  }

  protected mapToEntity(doc: UserSubscriptionDocument): UserSubscription {
    return {
      id: String(doc._id),
      userId: doc.userId,
      paymentId: doc.paymentId,
      planId: doc.planId,
      expiryDate: doc.expiryDate,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createUserSubscription(data: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSubscription> {
    return this.create(data);
  }

  async updateUserSubscription(id: string, data: Partial<UserSubscription>): Promise<UserSubscription | null> {
    return this.update(id, data);
  }

  async findActiveSubscriptionByUserId(userId: string): Promise<UserSubscription | null> {
    const doc = await this.model.findOne({
      userId,
      isActive: true,
      expiryDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    return doc ? this.mapToEntity(doc) : null;
  }

  async findSubscriptionsByUserId(userId: string): Promise<UserSubscription[]> {
    const docs = await this.model.find({ userId }).sort({ createdAt: -1 });
    return docs.map(doc => this.mapToEntity(doc));
  }

  async deactivateSubscription(id: string): Promise<UserSubscription | null> {
    return this.update(id, { isActive: false });
  }

  async findExpiredSubscriptions(): Promise<UserSubscription[]> {
    const docs = await this.model.find({
      isActive: true,
      expiryDate: { $lt: new Date() }
    });
    return docs.map(doc => this.mapToEntity(doc));
  }
} 