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
      description: doc.description,
      price: doc.price,
      maxLogsPerMonth: doc.maxLogsPerMonth,
      maxArticlesPerMonth: doc.maxArticlesPerMonth,
    };
  }
} 