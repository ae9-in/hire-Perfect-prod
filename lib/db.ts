import mongoose from 'mongoose';
import dns from 'dns';

// Force IPv4 DNS resolution to fix Windows IPv6 issues
dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireperfect';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            family: 4, // Force IPv4 to fix querySrv ECONNREFUSED issues
            serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
            socketTimeoutMS: 45000,
            retryWrites: true,
            // Additional options to help with Windows DNS/SRV issues
            maxPoolSize: 10,
            minPoolSize: 2,
        };

        console.log('🔄 Attempting to connect to MongoDB...');
        console.log('📍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('✅ MongoDB connected successfully');
                console.log('📊 Connection state:', mongoose.connection.readyState);
                return mongoose;
            })
            .catch((error) => {
                console.error('❌ MongoDB connection error:', error.message);
                console.error('Error code:', error.code);
                console.error('Error name:', error.name);

                // If it's an SRV error, provide helpful message
                if (error.code === 'ECONNREFUSED' && error.message.includes('querySrv')) {
                    console.error('💡 Tip: This appears to be a DNS SRV resolution issue.');
                    console.error('   Your DNS can resolve the hostname but the MongoDB driver cannot perform SRV lookups.');
                    console.error('   This is a known issue on some Windows systems.');
                }

                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e: any) {
        cached.promise = null;
        console.error('❌ Failed to establish MongoDB connection');
        console.error('Error details:', e.message);
        throw e;
    }

    return cached.conn;
}

export default connectDB;
