import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

type Args = {
    assessmentId?: string;
    count: number;
    all: boolean;
};

function parseArgs(argv: string[]): Args {
    const assessmentArg = argv.find((arg) => arg.startsWith('--assessmentId='));
    const countArg = argv.find((arg) => arg.startsWith('--count='));
    const allArg = argv.find((arg) => arg.startsWith('--all='));

    const assessmentId = assessmentArg?.split('=')[1] || process.env.npm_config_assessmentid;
    const countValue = countArg?.split('=')[1] || process.env.npm_config_count || '10';
    const count = Math.max(1, Number(countValue));
    const allValue = allArg?.split('=')[1] || process.env.npm_config_all || 'false';
    const all = String(allValue).toLowerCase() === 'true';

    return { assessmentId, count, all };
}

async function run(): Promise<void> {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
    const { assessmentId, count, all } = parseArgs(process.argv.slice(2));

    const { default: connectDB } = await import('../lib/db');
    const { default: Assessment } = await import('../models/Assessment');
    const { default: Question } = await import('../models/Question');

    await connectDB();

    const targetAssessments = all
        ? await Assessment.find({ isActive: true }).sort({ createdAt: 1 })
        : assessmentId
            ? await Assessment.find({ _id: assessmentId })
            : await Assessment.find({ isActive: true }).sort({ createdAt: 1 }).limit(1);

    if (!targetAssessments || targetAssessments.length === 0) {
        throw new Error('No assessment found. Please seed assessments first.');
    }

    const existingDummyCount = await Question.countDocuments({
        assessment: targetAssessments[0]._id,
        tags: 'dummy',
    });

    const topics = [
        'strategy', 'automation', 'analytics', 'governance', 'innovation',
        'leadership', 'optimization', 'security', 'growth', 'compliance',
    ];
    const batchId = Date.now();

    let totalInserted = 0;
    const results: Array<Record<string, unknown>> = [];

    for (const targetAssessment of targetAssessments) {
        const existingDummyForAssessment = await Question.countDocuments({
            assessment: targetAssessment._id,
            tags: 'dummy',
        });

        const needed = Math.max(0, count - existingDummyForAssessment);
        if (needed > 0) {
            const dummyQuestions = Array.from({ length: needed }).map((_, index) => {
                const topic = topics[index % topics.length];
                const qNo = existingDummyForAssessment + index + 1;
                return {
                    assessment: targetAssessment._id,
                    type: 'mcq' as const,
                    question: `Dummy Question ${qNo} [${batchId}]: Which option best matches the core ${topic} principle?`,
                    options: [
                        `A) Best-practice ${topic} approach`,
                        `B) Secondary ${topic} approach`,
                        `C) Optional ${topic} approach`,
                        `D) Irrelevant ${topic} approach`,
                    ],
                    correctAnswer: 0,
                    explanation: 'For temporary testing, option A is marked as correct.',
                    points: 1,
                    difficulty: 'easy' as const,
                    tags: ['dummy', 'testing', topic],
                };
            });

            await Question.insertMany(dummyQuestions, { ordered: true });
            totalInserted += dummyQuestions.length;
        }

        const totalQuestions = await Question.countDocuments({ assessment: targetAssessment._id });
        await Assessment.findByIdAndUpdate(targetAssessment._id, { totalQuestions });

        results.push({
            assessmentId: String(targetAssessment._id),
            assessmentTitle: targetAssessment.title,
            inserted: needed,
            totalQuestions,
        });
    }

    console.log(JSON.stringify({
        success: true,
        mode: all ? 'all-assessments' : 'single-assessment',
        assessed: targetAssessments.length,
        inserted: totalInserted,
        correctAnswerRule: 'All dummy questions use option A (index 0)',
        results,
    }, null, 2));
    await mongoose.disconnect();
    process.exit(0);
}

run().catch((error) => {
    console.error('Failed to add dummy questions:', error.message);
    void mongoose.disconnect();
    process.exit(1);
});
