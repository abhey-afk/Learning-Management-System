import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 50,
            wtimeoutMS: 2500,
            maxTimeMS: 20000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
        });
        
        // Add connection error handler
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        // Add disconnection handler
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
        });

        // Add reconnection handler
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;