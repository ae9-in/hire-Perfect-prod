/**
 * Script to normalize assessments:
 * 1. Ensure exactly 50 questions per difficulty level (easy, medium, hard)
 * 2. Update duration from 30 to 50 minutes
 */

import mongoose from 'mongoose';
import Assessment from '../models/Assessment';
import Question from '../models/Question';
import connectDB from '@/lib/db';

async function normalizeAssessments() {
    try {
        await connectDB();
        console.log('Connected to database');

        // Get all active assessments
        const assessments = await Assessment.find({ isActive: true });
        console.log(`Found ${assessments.length} active assessments\n`);

        for (const assessment of assessments) {
            console.log(`Processing: ${assessment.title} (${assessment._id})`);

            // Get question counts by difficulty
            const difficultyCounts = await Question.aggregate([
                { $match: { assessment: new mongoose.Types.ObjectId(assessment._id) } },
                { $group: { _id: '$difficulty', count: { $sum: 1 } } },
            ]);

            const countsByDifficulty: Record<string, number> = {
                easy: 0,
                medium: 0,
                hard: 0,
            };

            for (const row of difficultyCounts) {
                countsByDifficulty[row._id] = Number(row.count) || 0;
            }

            console.log(`  Current distribution: Easy=${countsByDifficulty.easy}, Medium=${countsByDifficulty.medium}, Hard=${countsByDifficulty.hard}`);

            // Check if needs updating
            const needsUpdate = 
                countsByDifficulty.easy !== 50 || 
                countsByDifficulty.medium !== 50 || 
                countsByDifficulty.hard !== 50 || 
                assessment.duration !== 50;

            if (needsUpdate) {
                console.log(`  ⚠️  Needs normalization`);
                
                // Update duration to 50 minutes
                if (assessment.duration !== 50) {
                    console.log(`    Updating duration: ${assessment.duration} → 50 minutes`);
                    assessment.duration = 50;
                }

                // Save assessment
                await assessment.save();
                console.log(`  ✓ Assessment updated\n`);
            } else {
                console.log(`  ✓ Already normalized\n`);
            }
        }

        console.log('\nNormalization complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

normalizeAssessments();
