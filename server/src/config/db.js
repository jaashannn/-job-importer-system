import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// dotenv.config();

const connectDB = async () => {
   const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobImporter';
   try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
   } catch (error) {
    console.log(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
   }
}

export default connectDB;