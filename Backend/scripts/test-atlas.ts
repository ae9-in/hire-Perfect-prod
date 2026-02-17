import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    console.log('🔍 Starting MongoDB Atlas Connection Diagnostic...');

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is missing from .env');
        process.exit(1);
    }

    // Hide password in logs
    const safeUri = MONGODB_URI.replace(/:[^:@]+@/, ':****@');
    console.log(`📍 URI: ${safeUri}`);

    try {
        console.log('🔄 Attempting to connect...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ SUCCESS: Connected to MongoDB Atlas cluster.');
        console.log('📊 Connection State:', mongoose.connection.readyState);

        // Try a simple operation
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log(`📂 Found ${collections?.length || 0} collections in database.`);

        await mongoose.disconnect();
        console.log('🔌 Disconnected safely.');
        console.log('\n✨ Database protocol is now fully operational.');

    } catch (error: any) {
        console.error('\n❌ FAILED: MongoDB Connection Error');
        console.error(`Message: ${error.message}`);
        console.error(`Code: ${error.code || 'N/A'}`);

        if (error.message.includes('IP address') || error.message.includes('whitelisted')) {
            console.error('\n💡 TIP: Your IP might still not be fully whitelisted or the change is still propagating.');
        } else if (error.message.includes('SRV')) {
            console.error('\n💡 TIP: This looks like a DNS SRV resolution issue (common on some Windows/ISP setups).');
        }

        process.exit(1);
    }
}

testConnection();
