import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const verifyAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = process.env.ADMIN_EMAIL || 'admin@educationalweb.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Find admin user with password field
    const admin = await User.findOne({ email }).select('+password');

    if (!admin) {
      console.error('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('📋 Admin User Details:');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Email Verified:', admin.isEmailVerified);
    console.log('   Premium:', admin.isPremium);
    
    // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    const isHashed = admin.password && (
      admin.password.startsWith('$2a$') ||
      admin.password.startsWith('$2b$') ||
      admin.password.startsWith('$2y$')
    );

    console.log('\n🔐 Password Status:');
    if (isHashed) {
      console.log('   ✅ Password is properly hashed (bcrypt)');
      console.log('   Hash prefix:', admin.password.substring(0, 7) + '...');
    } else {
      console.log('   ❌ Password is NOT hashed!');
      console.log('   Password value:', admin.password);
      console.log('   ⚠️  This will cause login failures!');
      process.exit(1);
    }

    // Test password comparison
    console.log('\n🧪 Testing Password Comparison:');
    console.log('   Testing with correct password...');
    const isValid = await admin.comparePassword(password);
    
    if (isValid) {
      console.log('   ✅ Password comparison successful!');
    } else {
      console.log('   ❌ Password comparison failed!');
      console.log('   ⚠️  Login will fail with this password.');
      process.exit(1);
    }

    // Test with wrong password
    console.log('   Testing with wrong password...');
    const isWrongValid = await admin.comparePassword('WrongPassword123');
    if (!isWrongValid) {
      console.log('   ✅ Correctly rejected wrong password');
    } else {
      console.log('   ❌ Wrong password was accepted! This is a security issue!');
      process.exit(1);
    }

    console.log('\n✅ All checks passed! Admin user is properly configured.');
    console.log('   The admin can now login successfully.\n');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying admin password:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the script
verifyAdminPassword();

