import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Assessment from '@/models/Assessment';
import Question from '@/models/Question';
import Attempt from '@/models/Attempt';

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

        // Get assessment
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return NextResponse.json(
                { error: 'Assessment not found' },
                { status: 404 }
            );
        }

        // No resume policy: close any stale in-progress attempts before creating a new attempt.
        await Attempt.updateMany(
            {
                user: authResult.user.userId,
                assessment: assessmentId,
                status: 'in_progress',
            },
            {
                $set: {
                    status: 'terminated',
                    completedAt: new Date(),
                },
            }
        );

        // Get random questions
        const allQuestions = await Question.find({ assessment: assessmentId });
        if (allQuestions.length === 0) {
            return NextResponse.json(
                { error: 'No questions are available for this assessment yet.' },
                { status: 409 }
            );
        }

        // If assessment.totalQuestions is 0 or invalid, fall back to all available questions.
        const requestedCount = typeof assessment.totalQuestions === 'number' && assessment.totalQuestions > 0
            ? assessment.totalQuestions
            : allQuestions.length;
        const finalQuestionCount = Math.min(requestedCount, allQuestions.length);

        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, finalQuestionCount);

        // Create attempt
        const attempt = await Attempt.create({
            user: authResult.user.userId,
            assessment: assessmentId,
            status: 'in_progress',
            totalQuestions: selectedQuestions.length,
            questions: selectedQuestions.map(q => q._id), // Store the randomized set
            duration: assessment.duration * 60, // Store in seconds
            answers: [],
            startedAt: new Date(),
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
        });

        // Return questions without correct answers
        const questionsForExam = selectedQuestions.map((q) => ({
            _id: q._id,
            type: q.type,
            question: q.question,
            options: q.options,
            points: q.points,
            codeTemplate: q.codeTemplate,
        }));

        return NextResponse.json({
            success: true,
            assessment: {
                _id: assessment._id,
                title: assessment.title,
                duration: assessment.duration,
            },
            attempt: {
                id: attempt._id,
                duration: assessment.duration,
                totalQuestions: selectedQuestions.length,
            },
            questions: questionsForExam,
        });
    } catch (error: any) {
        console.error('Start assessment error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
