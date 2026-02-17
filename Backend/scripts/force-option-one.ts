import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function forceOptionOne() {
    try {
        const { default: connectDB } = await import('../lib/db');
        const { default: Question } = await import('../models/Question');

        await connectDB();

        console.log('🛠️ Force setting EVERY single question to Option 1...');
        const result = await Question.updateMany({}, { $set: { correctAnswer: 0 } });
        console.log(`✅ Successfully updated ${result.modifiedCount} questions.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating answers:', error);
        process.exit(1);
    }
}

forceOptionOne();
