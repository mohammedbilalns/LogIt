import mongoose, { Document } from "mongoose";
import { UserSubscription } from "../../domain/entities/user-subscription.entity";

type UserSubscriptionWithoutId = Omit<UserSubscription, 'id'>;
export interface UserSubscriptionDocument extends Document, UserSubscriptionWithoutId {}

const userSubscriptionSchema = new mongoose.Schema<UserSubscriptionDocument>(
  {
    userId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    amount: { type: Number, required: true },
    paymentId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

userSubscriptionSchema.index({ userId: 1, isActive: 1 });

userSubscriptionSchema.index({ expiryDate: 1 });

const UserSubscriptionModel = mongoose.model<UserSubscriptionDocument>("UserSubscription", userSubscriptionSchema);

export default UserSubscriptionModel; 