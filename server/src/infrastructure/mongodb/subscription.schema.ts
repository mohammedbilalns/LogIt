import mongoose, { Document } from "mongoose";
import { SubscriptionPlan } from "../../domain/entities/subscription.entity";


type SubscriptionWithoutId = Omit<SubscriptionPlan, 'id'>
export interface SubscriptionDocument extends Document, SubscriptionWithoutId {}

const subscriptionSchema = new mongoose.Schema<SubscriptionDocument>(
    {
        name: {type: String, required: true},
        description:{type:String, required: true},
        price: {type: Number, required:true},
        maxLogsPerMonth: {type: Number, required: true},
        maxArticlesPerMonth: {type: Number, required: true}

        
    }
)

const SubscriptionModel = mongoose.model<SubscriptionDocument>("Subscription", subscriptionSchema)

export default SubscriptionModel