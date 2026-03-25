import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Assessment from '@/models/Assessment';
import Question from '@/models/Question';
import Attempt from '@/models/Attempt';
import { evaluateQuestionQuality } from '@/Backend/lib/questionQuality';

type AssessmentLevel = 'beginner' | 'intermediate' | 'advanced';

function normalizeLevel(value: unknown): AssessmentLevel | null {
    const normalized = String(value || '').toLowerCase().trim();
    if (normalized === 'beginner' || normalized === 'easy') return 'beginner';
    if (normalized === 'advanced' || normalized === 'hard') return 'advanced';
    if (normalized === 'intermediate' || normalized === 'medium') return 'intermediate';
    return null;
}

function toQuestionDifficulty(level: AssessmentLevel): 'easy' | 'medium' | 'hard' {
    if (level === 'beginner') return 'easy';
    if (level === 'advanced') return 'hard';
    return 'medium';
}

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
        let requestedLevel: AssessmentLevel | null = null;

        try {
            const body = await request.json();
            requestedLevel = normalizeLevel(body?.level || body?.selectedLevel);
        } catch {
            requestedLevel = null;
        }

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

        const defaultLevel = normalizeLevel(assessment.difficulty) || 'intermediate';
        const selectedLevel = requestedLevel || defaultLevel;
        const selectedDifficulty = toQuestionDifficulty(selectedLevel);

        // Get random questions for selected level
        const allQuestions = await Question.find({
            assessment: assessmentId,
            difficulty: selectedDifficulty,
        });

        const usableQuestions = allQuestions.filter((question) =>
            evaluateQuestionQuality({
                question: question.question,
                options: question.options,
                tags: question.tags,
            }).isUsable
        );

        if (usableQuestions.length === 0) {
            return NextResponse.json(
                { error: `No ${selectedLevel} level questions are available for this assessment yet.` },
                { status: 409 }
            );
        }

        // If assessment.totalQuestions is 0 or invalid, fall back to all available questions.
        const requestedCount = typeof assessment.totalQuestions === 'number' && assessment.totalQuestions > 0
            ? assessment.totalQuestions
            : usableQuestions.length;
        const finalQuestionCount = Math.min(requestedCount, usableQuestions.length);

        const shuffled = usableQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, finalQuestionCount);

        // Create attempt
        const attempt = await Attempt.create({
            user: authResult.user.userId,
            assessment: assessmentId,
            selectedLevel,
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
                selectedLevel,
            },
            attempt: {
                id: attempt._id,
                duration: assessment.duration,
                totalQuestions: selectedQuestions.length,
            },
            questions: questionsForExam,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Start assessment error:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
