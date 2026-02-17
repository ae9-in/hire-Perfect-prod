const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    // Hardcode fallback just for testing if env fails
    // process.env.MONGODB_URI = 'mongodb+srv://...';
    process.exit(1);
}

// Minimal User Schema
const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    role: String,
});

// Avoid recompilation error
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUsers() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        // Hide password
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
