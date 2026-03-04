/**
 * Diagnostic script to check question distribution across assessments
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('MONGODB_URI not set in environment');
    process.exit(1);
}

interface IAssessment extends mongoose.Document {
    title: string;
    duration: number;
    _id: string;
}

interface IQuestion extends mongoose.Document {
    assessment: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

async function checkAssessments() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB\n');

        const db = mongoose.connection.db;
        if (!db) throw new Error('Database connection failed');

        const assessmentCollection = db.collection('assessments');
        const questionCollection = db.collection('questions');

        // Get all active assessments
        const assessments = await assessmentCollection
            .find({ isActive: true })
            .sort({ title: 1 })
            .toArray();

        console.log(`Found ${assessments.length} active assessments\n`);
        console.log('Assessment Status Report:');
        console.log('─'.repeat(100));
        console.log('Title | Duration | Easy | Medium | Hard | Total | Issue'.padEnd(100));
        console.log('─'.repeat(100));

        let totalIssues = 0;

        for (const assessment of assessments) {
            const counts = await questionCollection
                .aggregate([
                    { $match: { assessment: new mongoose.Types.ObjectId(assessment._id) } },
                    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
                ])
                .toArray();

            const countsByDifficulty: Record<string, number> = {
                easy: 0,
                medium: 0,
                hard: 0,
            };

            for (const row of counts) {
                countsByDifficulty[row._id] = row.count || 0;
            }

            const total = countsByDifficulty.easy + countsByDifficulty.medium + countsByDifficulty.hard;
            const issues: string[] = [];

            if (countsByDifficulty.easy !== 50) issues.push(`Easy:${countsByDifficulty.easy}`);
            if (countsByDifficulty.medium !== 50) issues.push(`Medium:${countsByDifficulty.medium}`);
            if (countsByDifficulty.hard !== 50) issues.push(`Hard:${countsByDifficulty.hard}`);
            if (assessment.duration !== 50) issues.push(`Duration:${assessment.duration}m`);

            const issueStr = issues.length > 0 ? `⚠️  ${issues.join(', ')}` : '✓';
            if (issues.length > 0) totalIssues++;

            const row = `${assessment.title.substring(0, 30).padEnd(30)} | ${String(assessment.duration).padEnd(8)} | ${String(countsByDifficulty.easy).padEnd(4)} | ${String(countsByDifficulty.medium).padEnd(6)} | ${String(countsByDifficulty.hard).padEnd(4)} | ${String(total).padEnd(5)} | ${issueStr}`;
            console.log(row.substring(0, 100));
        }

        console.log('─'.repeat(100));
        console.log(`\nTotal assessments with issues: ${totalIssues}/${assessments.length}`);
        console.log('\nTarget: 50 questions per difficulty level (150 total), 50 minutes duration');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAssessments();
