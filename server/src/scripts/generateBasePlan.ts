import mongoose from 'mongoose';
import SubscriptionModel from '../infrastructure/mongodb/subscription.schema';
import { configDotenv } from 'dotenv';
configDotenv();
const MONGO_URI = process.env.MONGODB_URI || '';

const plans = [
  {
    name: 'Base',
    description: 'Base plan',
    price: 0,
    maxLogsPerMonth: 10,
    maxArticlesPerMonth: 10,
  },
  {
    name: 'Plus',
    description: 'Plus plan',
    price: 10,
    maxLogsPerMonth: 100,
    maxArticlesPerMonth: 100,
  },
  {
    name: 'Pro',
    description: 'Pro plan',
    price: 50,
    maxLogsPerMonth: -1,
    maxArticlesPerMonth: -1,
  },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  for (const plan of plans) {
    const existing = await SubscriptionModel.findOne({ name: { $regex: new RegExp(`^${plan.name}$`, 'i') } });
    if (existing) {
      console.log(`${plan.name} plan already exists:`, existing);
    } else {
      const created = await SubscriptionModel.create(plan);
      console.log(`${plan.name} plan created:`, created);
    }
  }
  const all = await SubscriptionModel.find();
  console.log('All subscriptions:', all);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 