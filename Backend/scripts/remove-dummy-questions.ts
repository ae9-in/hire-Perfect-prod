import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

async function run(): Promise<void> {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

    const { default: connectDB } = await import('../lib/db');
    const { default: Assessment } = await import('../models/Assessment');
    const { default: Question } = await import('../models/Question');

    await connectDB();

    const beforeDummyCount = await Question.countDocuments({ tags: 'dummy' });
    const deleteResult = await Question.deleteMany({ tags: 'dummy' });

    const counts = await Question.aggregate([
        { $group: { _id: '$assessment', totalQuestions: { $sum: 1 } } },
    ]);

    await Assessment.updateMany({}, { $set: { totalQuestions: 0 } });

    if (counts.length > 0) {
        await Assessment.bulkWrite(
            counts.map((item) => ({
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: { totalQuestions: item.totalQuestions } },
                },
            }))
        );
    }

    const afterDummyCount = await Question.countDocuments({ tags: 'dummy' });

    console.log(
        JSON.stringify(
            {
                success: true,
                beforeDummyCount,
                deletedDummyCount: deleteResult.deletedCount || 0,
                afterDummyCount,
                assessmentsUpdated: counts.length,
            },
            null,
            2
        )
    );

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(async (error) => {
    console.error('Failed to remove dummy questions:', error.message);
    await mongoose.disconnect();
    process.exit(1);
});
