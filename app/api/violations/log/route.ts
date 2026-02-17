import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Violation from '@/models/Violation';
import Attempt from '@/models/Attempt';
import { EXAM_CONFIG } from '@/lib/constants';

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || !authResult.user) {
            return authResult.response!;
        }

        await connectDB();

        const body = await request.json();
        const { attemptId, type, severity, description, metadata } = body;

        // Get attempt
        const attempt = await Attempt.findById(attemptId);
        if (!attempt) {
            return NextResponse.json(
                { error: 'Attempt not found' },
                { status: 404 }
            );
        }

        // Create violation
        const violation = await Violation.create({
            attempt: attemptId,
            user: authResult.user.userId,
            type,
            severity: severity || 'medium',
            description,
            metadata,
            timestamp: new Date(),
        });

        // Update attempt
        attempt.violationCount += 1;
        attempt.violations.push(violation._id as any);

        // Check if max violations exceeded or if it's a critical exit
        if (attempt.violationCount >= EXAM_CONFIG.MAX_VIOLATIONS || type === 'SESSION_EXIT' || severity === 'critical') {
            attempt.status = 'terminated';
            attempt.completedAt = new Date();
        }

        await attempt.save();

        return NextResponse.json({
            success: true,
            violation: {
                id: violation._id,
                type: violation.type,
                severity: violation.severity,
            },
            violationCount: attempt.violationCount,
            maxViolations: EXAM_CONFIG.MAX_VIOLATIONS,
            terminated: attempt.status === 'terminated',
        });
    } catch (error: any) {
        console.error('Log violation error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
