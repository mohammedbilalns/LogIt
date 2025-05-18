import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../config/env';
import { MongoUserRepository } from '../infrastructure/repositories/mongodb/user.repository';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '1234Bilal@';
const ADMIN_NAME = 'Test Admin';

async function initializeAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const userRepository = new MongoUserRepository();

    // Check if admin already exists
    const existingAdmin = await userRepository.findByEmail(ADMIN_EMAIL);
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const adminUser = await userRepository.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      isVerified: true,
      role: 'admin',
      provider: 'local'
    });

    console.log('Admin user created successfully:', adminUser.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

initializeAdmin(); 