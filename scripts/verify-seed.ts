// @ts-ignore
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function verify() {
    try {
        const { default: connectDB } = await import('../lib/db');
        const { default: Category } = await import('../models/Category');
        const { default: Assessment } = await import('../models/Assessment');
        const { default: Question } = await import('../models/Question');

        await connectDB();

        const catCount = await Category.countDocuments();
        const assessCount = await Assessment.countDocuments();
        const questCount = await Question.countDocuments();

        console.log('--- Database Verification ---');
        console.log(`Categories: ${catCount}`);
        console.log(`Assessments: ${assessCount}`);
        console.log(`Questions: ${questCount}`);

        if (catCount === 6 && assessCount === 36) {
            console.log('✅ Data seeding verified successfully!');
        } else {
            console.log('⚠️ Data mismatch. Expected 6 categories and 36 assessments.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Verification error:', error);
        process.exit(1);
    }
}

verify();
