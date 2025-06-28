import { BaseEntity } from './base.entity';

export interface UserSubscription extends BaseEntity {
  userId: string;
  paymentId: string;
  planId: string;
  expiryDate: Date;
  isActive: boolean;
} 