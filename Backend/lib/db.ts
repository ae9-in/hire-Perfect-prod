import mongoose from 'mongoose';
import dns from 'dns';

/**
 * Force-register all models to avoid MissingSchemaError in Next.js,
 * especially when using .populate().
 */
import '../models/User';
import '../models/Assessment';
import '../models/Question';
import '../models/Attempt';
import '../models/Violation';
import '../models/Purchase';
import '../models/Category';
import '../models/Transaction';
import '../models/FAQSubmission';
import '../models/CodingChallenge';
import '../models/CodingSubmission';
import '../models/Skill';
import '../models/UserSkill';
import '../models/Project';

// Force IPv4 DNS resolution to reduce Windows IPv6/SRV issues.
dns.setDefaultResultOrder('ipv4first');

function getMongoUri(): string {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }
    return uri;
}

const MONGODB_URI = getMongoUri();

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

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
            family: 4,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            maxPoolSize: 10,
            minPoolSize: 2,
        };

        console.log('Attempting to connect to MongoDB...');
        console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((instance) => {
                console.log('MongoDB connected successfully');
                console.log('Connection state:', instance.connection.readyState);
                console.log('Connected host:', instance.connection.host);
                console.log('Connected database:', instance.connection.name);
                return instance;
            })
            .catch((error: any) => {
                console.error('MongoDB connection error:', error.message);
                console.error('Error code:', error.code);
                console.error('Error name:', error.name);

                if (error.code === 'ECONNREFUSED' && error.message.includes('querySrv')) {
                    console.error('Tip: This appears to be a DNS SRV resolution issue.');
                    console.error('Your DNS can resolve the hostname but the MongoDB driver cannot perform SRV lookups.');
                }

                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error: any) {
        cached.promise = null;
        console.error('Failed to establish MongoDB connection');
        console.error('Error details:', error.message);
        throw error;
    }

    return cached.conn;
}

export default connectDB;
