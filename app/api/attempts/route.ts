import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Attempt from '@/models/Attempt';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || !authResult.user) {
            return authResult.response!;
        }

        await connectDB();

        const attempts = await Attempt.find({ user: authResult.user.userId })
            .populate('assessment', 'title category')
            .sort({ startedAt: -1 });

        const terminatedAssessmentIds = new Set(
            attempts
                .filter((attempt: any) => attempt.status === 'terminated')
                .map((attempt: any) => {
                    const assessment = attempt.assessment as any;
                    return assessment?._id ? assessment._id.toString() : attempt.assessment?.toString();
                })
                .filter(Boolean)
        );

        const filteredAttempts = attempts.filter((attempt: any) => {
            if (attempt.status !== 'in_progress') {
                return true;
            }

            const assessment = attempt.assessment as any;
            const assessmentId = assessment?._id ? assessment._id.toString() : attempt.assessment?.toString();
            return !terminatedAssessmentIds.has(assessmentId);
        });

        return NextResponse.json({
            success: true,
            attempts: filteredAttempts,
        });
    } catch (error: any) {
        console.error('List user attempts error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
