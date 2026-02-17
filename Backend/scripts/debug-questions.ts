import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function debugQuestions() {
    try {
        const { default: connectDB } = await import('../lib/db');
        const { default: Question } = await import('../models/Question');

        await connectDB();

        const stats = await Question.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 }, sampleAnswers: { $push: '$correctAnswer' } } }
        ]);

        console.log('📊 Question Statistics:');
        stats.forEach(s => {
            console.log(`Type: ${s._id}, Count: ${s.count}`);
            console.log(`Unique Sample Answers: ${[...new Set(s.sampleAnswers.slice(0, 10))]}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Debug error:', error);
        process.exit(1);
    }
}

debugQuestions();
