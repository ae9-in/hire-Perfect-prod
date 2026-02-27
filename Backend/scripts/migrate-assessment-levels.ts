import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

async function run(): Promise<void> {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

    const { default: connectDB } = await import('../lib/db');
    await connectDB();
    const collection = mongoose.connection.db.collection('assessments');

    const beforeCounts = {
        easy: await collection.countDocuments({ difficulty: 'easy' }),
        medium: await collection.countDocuments({ difficulty: 'medium' }),
        hard: await collection.countDocuments({ difficulty: 'hard' }),
        beginner: await collection.countDocuments({ difficulty: 'beginner' }),
        intermediate: await collection.countDocuments({ difficulty: 'intermediate' }),
        advanced: await collection.countDocuments({ difficulty: 'advanced' }),
    };

    const easyResult = await collection.updateMany({ difficulty: 'easy' }, { $set: { difficulty: 'beginner' } });
    const mediumResult = await collection.updateMany({ difficulty: 'medium' }, { $set: { difficulty: 'intermediate' } });
    const hardResult = await collection.updateMany({ difficulty: 'hard' }, { $set: { difficulty: 'advanced' } });

    const afterCounts = {
        beginner: await collection.countDocuments({ difficulty: 'beginner' }),
        intermediate: await collection.countDocuments({ difficulty: 'intermediate' }),
        advanced: await collection.countDocuments({ difficulty: 'advanced' }),
    };

    console.log(
        JSON.stringify(
            {
                success: true,
                beforeCounts,
                migrated: {
                    easyToBeginner: easyResult.modifiedCount || 0,
                    mediumToIntermediate: mediumResult.modifiedCount || 0,
                    hardToAdvanced: hardResult.modifiedCount || 0,
                },
                afterCounts,
            },
            null,
            2
        )
    );

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(async (error) => {
    console.error('Failed to migrate assessment levels:', error.message);
    await mongoose.disconnect();
    process.exit(1);
});
