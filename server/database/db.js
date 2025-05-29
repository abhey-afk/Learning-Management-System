import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Check if MONGO_URI is defined
        if (!process.env.MONGO_URI) {
            throw new Error('MongoDB URI is not defined in environment variables. Please set MONGO_URI.');
        }

        console.log('Attempting to connect to MongoDB...');
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 50,
            wtimeout: 2500,
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
        console.error("Error connecting to MongoDB:", error.message);
        // Only retry if it's not a configuration error
        if (!error.message.includes('not defined in environment variables')) {
            console.log('Retrying connection in 5 seconds...');
            setTimeout(connectDB, 5000);
        } else {
            console.error('Please configure the MONGO_URI environment variable in Render dashboard.');
        }
    }
};

export default connectDB;