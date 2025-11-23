import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
   const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobImporter';
   try {
    const conn = await mongoose.connect(mongoURI);
    logger.success(`MongoDB connected: ${conn.connection.host}`);
   } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
   }
}

export default connectDB;