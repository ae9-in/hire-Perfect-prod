import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function updateAnswers() {
    try {
        const { default: connectDB } = await import('../lib/db');
        const { default: Question } = await import('../models/Question');

        console.log('🚀 Connecting to database...');
        await connectDB();

        console.log('🛠️ Updating all questions to set correctAnswer to 0 (Option 1)...');
        const result = await Question.updateMany(
            { type: 'mcq' },
            { $set: { correctAnswer: 0 } }
        );

        console.log(`✅ Updated ${result.modifiedCount} MCQ questions.`);

        // Also handle scenarios if they exist and use the same logic
        const scenarioResult = await Question.updateMany(
            { type: 'scenario' },
            { $set: { correctAnswer: 0 } }
        );
        console.log(`✅ Updated ${scenarioResult.modifiedCount} scenario questions.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Update error:', error);
        process.exit(1);
    }
}

updateAnswers();
