import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // MongoDB is REQUIRED - check if URI is configured
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not configured in environment variables');
      console.error('💥 Server cannot start without database connection');
      process.exit(1); // Exit with error
    }

    // Connect to MongoDB (required for all features)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.error('❌ MongoDB disconnected - this may affect functionality');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('💥 Failed to connect to database');
    console.error('🔧 Please check your MONGODB_URI in .env file');
    console.error('🔧 Make sure MongoDB is running and credentials are correct');
    process.exit(1); // Exit with error - server won't start
  }
};

export default connectDB;

