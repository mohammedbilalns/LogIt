import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../config/env';
import { MongoUserRepository } from '../infrastructure/repositories/user.repository';

const SUPERADMIN_EMAIL = 'superadmin@gmail.com';
const SUPERADMIN_PASSWORD = '1234Bilal@';
const SUPERADMIN_NAME = 'Super Admin';

async function initializeSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const userRepository = new MongoUserRepository();

    // Check if superadmin already exists
    const existingSuperAdmin = await userRepository.findByEmail(SUPERADMIN_EMAIL);
    if (existingSuperAdmin) {
      console.log('SuperAdmin user already exists');
      process.exit(0);
    }

    // Create superadmin user
    const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
    const superAdminUser = await userRepository.create({
      name: SUPERADMIN_NAME,
      email: SUPERADMIN_EMAIL,
      password: hashedPassword,
      isVerified: true,
      role: 'superadmin',
      provider: 'local'
    });

    console.log('SuperAdmin user created successfully:', superAdminUser.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating superadmin user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

initializeSuperAdmin(); 