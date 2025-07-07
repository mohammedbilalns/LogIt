import { BaseEntity } from './base.entity';

export interface UserSubscription extends BaseEntity {
  userId: string;
  planId: string;
  expiryDate: Date;
  isActive: boolean;
  amount: number;
  paymentId: string; 
} 