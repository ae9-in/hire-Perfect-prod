import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Attempt from '@/models/Attempt';
import Question from '@/models/Question';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        // Authenticate user
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || !authResult.user) {
            return authResult.response!;
        }

        await connectDB();

        const routeId = id;
        const body = await request.json();
        const { attemptId, answers, status } = body;

        if (!attemptId || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'attemptId and answers array are required' },
                { status: 400 }
            );
        }

        // Get attempt
        const attempt = await Attempt.findById(attemptId);
        if (!attempt) {
            return NextResponse.json(
                { error: 'Attempt not found' },
                { status: 404 }
            );
        }

        const assessmentIdFromAttempt = attempt.assessment.toString();

        // Backward-compatible route validation:
        // Some clients call /api/assessments/<attemptId>/submit instead of <assessmentId>.
        const routeMatchesAssessment = routeId === assessmentIdFromAttempt;
        const routeMatchesAttempt = routeId === String(attemptId);
        if (!routeMatchesAssessment && !routeMatchesAttempt) {
            return NextResponse.json(
                { error: 'Attempt does not belong to this assessment' },
                { status: 400 }
            );
        }

        // Verify ownership
        if (attempt.user.toString() !== authResult.user.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Score only against the randomized set assigned at attempt start
        const questions = await Question.find({
            _id: { $in: attempt.questions as any },
            assessment: assessmentIdFromAttempt,
        });
        const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

        // Calculate score
        let correctAnswers = 0;
        let totalPoints = 0;

        const gradedAnswers = answers.map((ans: any) => {
            const question = questionMap.get(ans.question);
            if (!question) {
                return { ...ans, isCorrect: false, points: 0 };
            }

            let isCorrect = false;
            if (question.type === 'mcq') {
                isCorrect = Number(ans.answer) === Number(question.correctAnswer);
            } else if (question.type === 'scenario') {
                isCorrect = ans.answer.toLowerCase().trim() === question.correctAnswer.toString().toLowerCase().trim();
            }
            // For coding questions, we'd need a code execution engine (simplified here)

            if (isCorrect) {
                correctAnswers++;
                totalPoints += question.points;
            }

            return {
                question: ans.question,
                answer: ans.answer,
                isCorrect,
                points: isCorrect ? question.points : 0,
            };
        });

        // Calculate time spent
        const timeSpent = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

        // Update attempt
        attempt.answers = gradedAnswers;
        attempt.score = totalPoints;
        attempt.correctAnswers = correctAnswers;
        const totalQuestions = Math.max(attempt.totalQuestions, 1);
        attempt.percentage = (correctAnswers / totalQuestions) * 100;
        attempt.status = status === 'terminated' ? 'terminated' : 'completed';
        attempt.completedAt = new Date();
        attempt.timeSpent = timeSpent;
        await attempt.save();

        return NextResponse.json({
            success: true,
            result: {
                score: totalPoints,
                correctAnswers,
                totalQuestions: attempt.totalQuestions,
                percentage: attempt.percentage,
                timeSpent,
                status: attempt.status,
            },
        });
    } catch (error: any) {
        console.error('Submit assessment error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
