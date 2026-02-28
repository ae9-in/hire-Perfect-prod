import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Assessment from '@/models/Assessment';
import Question from '@/models/Question';

type AssessmentLevel = 'beginner' | 'intermediate' | 'advanced';
type QuestionDifficulty = 'easy' | 'medium' | 'hard';

function toQuestionDifficulty(level: AssessmentLevel): QuestionDifficulty {
    if (level === 'beginner') return 'easy';
    if (level === 'advanced') return 'hard';
    return 'medium';
}

const LEVELS: AssessmentLevel[] = ['beginner', 'intermediate', 'advanced'];

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Invalid assessment id.' }, { status: 400 });
        }

        const assessment = await Assessment.findById(id).populate('category', 'name slug description');
        if (!assessment) {
            return NextResponse.json({ success: false, error: 'Assessment not found.' }, { status: 404 });
        }

        const difficultyCounts = await Question.aggregate([
            { $match: { assessment: new mongoose.Types.ObjectId(id) } },
            { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        ]);

        const countsByDifficulty: Record<QuestionDifficulty, number> = {
            easy: 0,
            medium: 0,
            hard: 0,
        };

        for (const row of difficultyCounts) {
            const key = String(row._id) as QuestionDifficulty;
            if (key in countsByDifficulty) {
                countsByDifficulty[key] = Number(row.count) || 0;
            }
        }

        const levels = LEVELS.map((level) => {
            const difficulty = toQuestionDifficulty(level);
            const questionCount = countsByDifficulty[difficulty] || 0;

            return {
                level,
                questionDifficulty: difficulty,
                questionCount,
                isAvailable: questionCount > 0,
            };
        });

        return NextResponse.json({
            success: true,
            assessment,
            levels,
            hasAllThreeLevels: levels.every((level) => level.isAvailable),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Get assessment detail error:', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
