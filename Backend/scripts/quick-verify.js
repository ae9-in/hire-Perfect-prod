const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const catCount = await db.collection('categories').countDocuments();
        const assessCount = await db.collection('assessments').countDocuments();
        const questCount = await db.collection('questions').countDocuments();

        console.log('--- Database Verification ---');
        console.log(`Categories: ${catCount}`);
        console.log(`Assessments: ${assessCount}`);
        console.log(`Questions: ${questCount}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Verification error:', error);
        process.exit(1);
    }
}

verify();
