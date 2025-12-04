import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin credentials
    const adminData = {
      name: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@educationalweb.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      authProvider: 'local',
      role: 'admin',
      isEmailVerified: true,
      isPremium: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email }).select('+password');
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Current Role: ${existingAdmin.role}`);
      console.log(`   Email Verified: ${existingAdmin.isEmailVerified}`);
      
      // Update admin user: set password (will be hashed by pre-save hook), role, and email verification
      existingAdmin.password = adminData.password; // Setting password triggers pre-save hook to hash it
      existingAdmin.authProvider = 'local'; // Ensure auth provider is local
      existingAdmin.role = 'admin'; // Ensure role is admin
      existingAdmin.isEmailVerified = true; // Ensure email is verified
      existingAdmin.isPremium = true; // Ensure premium status
      
      // Save to trigger password hashing via pre-save hook
      await existingAdmin.save();
      
      console.log('\n✅ Admin user updated successfully!');
      console.log('════════════════════════════════════════');
      console.log('   👤 Name:', existingAdmin.name);
      console.log('   📧 Email:', existingAdmin.email);
      console.log('   🔑 Password:', adminData.password, '(hashed in database)');
      console.log('   🛡️  Role:', existingAdmin.role);
      console.log('   ✅ Email Verified:', existingAdmin.isEmailVerified);
      console.log('   ⭐ Premium:', existingAdmin.isPremium);
      console.log('════════════════════════════════════════');
      console.log('\n⚠️  IMPORTANT: Change the password after first login!');
      console.log('💡 Admin panel URL: http://localhost:5173/login\n');
    } else {
      // Create admin user (password will be hashed by pre-save hook)
      const admin = await User.create(adminData);
      
      console.log('\n✅ Admin user created successfully!');
      console.log('════════════════════════════════════════');
      console.log('   👤 Name:', admin.name);
      console.log('   📧 Email:', admin.email);
      console.log('   🔑 Password:', adminData.password, '(hashed in database)');
      console.log('   🛡️  Role:', admin.role);
      console.log('   ✅ Email Verified:', admin.isEmailVerified);
      console.log('   ⭐ Premium:', admin.isPremium);
      console.log('════════════════════════════════════════');
      console.log('\n⚠️  IMPORTANT: Change the password after first login!');
      console.log('💡 Admin panel URL: http://localhost:5173/login\n');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the script
createAdminUser();

