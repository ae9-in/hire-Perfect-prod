import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Assessment from '@/models/Assessment';
import Question from '@/models/Question';
import Attempt from '@/models/Attempt';
import Purchase from '@/models/Purchase';

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

        // Check if user has access
        const purchases = await Purchase.find({
            user: authResult.user.userId,
            status: 'completed',
        });

        const hasAccess = purchases.some(
            (p) =>
                (p.purchaseType === 'individual' && p.assessment?.toString() === assessmentId) ||
                (p.purchaseType === 'category' && p.category?.toString() === assessment.category.toString()) ||
                p.purchaseType === 'bundle'
        );

        /* Bypassed for testing
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this assessment' },
                { status: 403 }
            );
        }
        */

        // Check for existing in-progress attempt
        const existingAttempt = await Attempt.findOne({
            user: authResult.user.userId,
            assessment: assessmentId,
            status: 'in_progress',
        });

        if (existingAttempt) {
            return NextResponse.json(
                { error: 'You already have an in-progress attempt for this assessment' },
                { status: 400 }
            );
        }

        // Get random questions
        const allQuestions = await Question.find({ assessment: assessmentId });
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, assessment.totalQuestions);

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
