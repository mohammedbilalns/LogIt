import { SubscriptionPlan } from '../../domain/entities/subscription.entity';
import { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import SubscriptionModel, { SubscriptionDocument } from '../mongodb/subscription.schema';
import { BaseRepository } from './base.repository';

export class MongoSubscriptionRepository extends BaseRepository<SubscriptionDocument, SubscriptionPlan> implements ISubscriptionRepository {
  constructor() {
    super(SubscriptionModel);
  }

  protected getSearchFields(): string[] {
    return ['name', 'description'];
  }

  protected mapToEntity(doc: SubscriptionDocument): SubscriptionPlan {
    return {
      id: String(doc._id),
      name: doc.name,
      isActive: doc.isActive,
      description: doc.description,
      price: doc.price,
      maxLogsPerMonth: doc.maxLogsPerMonth,
      maxArticlesPerMonth: doc.maxArticlesPerMonth,
    };
  }

  async findByName(name: string): Promise<SubscriptionPlan | null> {
    const doc = await this.model.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByDetails(price: number, maxLogsPerMonth: number, maxArticlesPerMonth: number): Promise<SubscriptionPlan | null> {
    const doc = await this.model.findOne({
      price,
      maxLogsPerMonth,
      maxArticlesPerMonth
    });
    return doc ? this.mapToEntity(doc) : null;
  }
} 