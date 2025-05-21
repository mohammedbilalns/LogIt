import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../domain/entities/user.entity';
import { MongoUserRepository } from '../infrastructure/repositories/mongodb/user.repository';
import bcrypt from 'bcryptjs';

dotenv.config();

const generateRandomUser = async (): Promise<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });
  const password = await bcrypt.hash('password123', 10);
  
  return {
    name: `${firstName} ${lastName}`,
    email,
    password,
    isVerified: faker.datatype.boolean(),
    googleId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
    profileImage: faker.image.avatar(),
    provider: faker.helpers.arrayElement(['local', 'google']),
    role: faker.helpers.arrayElement(['user', 'admin']),
  };
};

const generateUsers = async (count: number = 10000) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/logit');
    console.log('Connected to MongoDB');

    const userRepository = new MongoUserRepository();
    const users = [];

    // Generate users
    for (let i = 0; i < count; i++) {
      const user = await generateRandomUser();
      const createdUser = await userRepository.create(user);
      users.push(createdUser);
      console.log(`Created user: ${createdUser.name} (${createdUser.email})`);
    }

    console.log(`\nSuccessfully generated ${users.length} users`);
    return users;
  } catch (error) {
    console.error('Error generating users:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
generateUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 