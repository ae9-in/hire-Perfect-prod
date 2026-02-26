import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function getMongoUri(): string {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI is not defined in .env.local');
    }

    return uri;
}

const MONGODB_URI = getMongoUri();

// Minimal User Schema to query only email and name
const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    role: String,
    createdAt: Date
});

// Check if model already exists to avoid recompilation error
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUsers() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        // Hide password in logs
        console.log('📍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully!');

        console.log('\n🔎 Querying "users" collection...');
        const users = await User.find({});

        if (users.length === 0) {
            console.log('⚠️ No users found in the database.');
        } else {
            console.log(`✅ Found ${users.length} user(s):`);
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected.');
    }
}

checkUsers();

