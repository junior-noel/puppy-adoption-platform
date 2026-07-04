import mongoose from "mongoose";

// Connects to MongoDB Atlas using the connection string in MONGO_URI.
// Get your connection string from Atlas > Connect > Drivers.
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri)
      throw new Error(
        "MongoDB URI not set in environment (MONGO_URI or MONGODB_URI)",
      );
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
