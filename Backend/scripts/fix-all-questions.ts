import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function fixAll() {
    try {
        const { default: connectDB } = await import('../lib/db');
        const { default: Question } = await import('../models/Question');

        await connectDB();

        console.log('🛠️ Force setting ALL questions to index 0...');
        const result = await Question.updateMany({}, { $set: { correctAnswer: 0 } });
        console.log(`✅ Updated ${result.modifiedCount} questions total.`);

        // Double check a few
        const samples = await Question.find({}).limit(5);
        console.log('🔍 Samples:');
        samples.forEach(s => console.log(`ID: ${s._id}, Type: ${s.type}, Answer: ${s.correctAnswer}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Fix error:', error);
        process.exit(1);
    }
}

fixAll();
