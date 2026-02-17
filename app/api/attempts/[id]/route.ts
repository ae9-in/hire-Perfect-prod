import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Attempt from '@/models/Attempt';
import Question from '@/models/Question';
import Violation from '@/models/Violation';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: attemptId } = await params;
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || !authResult.user) {
            return authResult.response!;
        }

        await connectDB();

        const attempt = await Attempt.findById(attemptId)
            .populate('assessment')
            .populate('violations')
            .populate('user', 'name');

        if (!attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        // Check if user is populated (it's an object) or just an ID
        const userId = attempt.user._id ? attempt.user._id.toString() : attempt.user.toString();

        if (userId !== authResult.user.userId) {
            return NextResponse.json({ error: 'Unauthorized access to this attempt' }, { status: 403 });
        }

        // Fetch the stored randomized questions
        const questions = await Question.find({
            _id: { $in: attempt.questions as any }
        });

        // Map questions to maintain the stored order in attempt.questions
        const orderedQuestions = attempt.questions.map(qId => {
            const q = questions.find(qObj => qObj._id.toString() === qId.toString());
            return {
                _id: q?._id,
                type: q?.type,
                question: q?.question,
                options: q?.options,
                points: q?.points,
                codeTemplate: q?.codeTemplate,
            };
        });

        // Calculate time left if in progress
        let timeLeft = 0;
        if (attempt.status === 'in_progress') {
            const now = new Date();
            const startTime = new Date(attempt.startedAt);
            const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            timeLeft = Math.max(0, attempt.duration - elapsedSeconds);
        }

        return NextResponse.json({
            success: true,
            attempt: {
                id: attempt._id,
                status: attempt.status,
                score: attempt.score,
                percentage: attempt.percentage,
                totalQuestions: attempt.totalQuestions,
                correctAnswers: attempt.correctAnswers,
                timeSpent: attempt.timeSpent,
                violationCount: attempt.violationCount,
                violations: attempt.violations,
                startedAt: attempt.startedAt,
                completedAt: attempt.completedAt,
                timeLeft,
                assessment: attempt.assessment,
                user: attempt.user
            },
            questions: orderedQuestions,
        });
    } catch (error: any) {
        console.error('Get attempt error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
