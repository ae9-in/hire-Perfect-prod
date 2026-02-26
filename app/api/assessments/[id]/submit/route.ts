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

        const assessmentId = id;
        const body = await request.json();
        const { attemptId, answers, status } = body;

        // Get attempt
        const attempt = await Attempt.findById(attemptId);
        if (!attempt) {
            return NextResponse.json(
                { error: 'Attempt not found' },
                { status: 404 }
            );
        }

        const assessmentIdFromAttempt = attempt.assessment.toString();

        // Verify ownership
        if (attempt.user.toString() !== authResult.user.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get all questions for this assessment using the correct assessment ID
        const questions = await Question.find({ assessment: assessmentIdFromAttempt });
        console.log(`Scoring: Found ${questions.length} questions for assessment ${assessmentIdFromAttempt}`);
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
        attempt.percentage = (correctAnswers / attempt.totalQuestions) * 100;
        attempt.status = status || 'completed';
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
                debug: gradedAnswers // Temporary for testing
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
