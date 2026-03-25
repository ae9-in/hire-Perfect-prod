import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware, adminMiddleware } from '@/middleware/auth';
import CodingSubmission from '@/models/CodingSubmission';
import CodingChallenge from '@/models/CodingChallenge';

// GET /api/coding-submissions — candidate: own submissions | admin: all submissions
export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const { searchParams } = new URL(request.url);
        const challengeId = searchParams.get('challengeId');
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        const isAdmin = authResult.user!.role === 'admin';
        const query: Record<string, unknown> = {};

        if (isAdmin) {
            if (userId) query.userId = userId;
            if (challengeId) query.challengeId = challengeId;
            if (status) query.status = status;
        } else {
            // Candidate can only see their own submissions
            query.userId = authResult.user!.userId;
            if (challengeId) query.challengeId = challengeId;
        }

        const submissions = await CodingSubmission.find(query)
            .populate('userId', 'name email')
            .populate('challengeId', 'title difficulty')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, submissions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/coding-submissions — candidate submits a solution
export async function POST(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const body = await request.json();
        const { challengeId, code, language, explanation } = body;

        if (!challengeId || !code || !language || !explanation) {
            return NextResponse.json(
                { error: 'Challenge ID, code, language, and explanation are required' },
                { status: 400 }
            );
        }

        if (explanation.length < 10) {
            return NextResponse.json(
                { error: 'Explanation must be at least 10 characters' },
                { status: 400 }
            );
        }

        // Verify challenge exists
        const challenge = await CodingChallenge.findOne({ _id: challengeId, isActive: true });
        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        const submission = await CodingSubmission.create({
            userId: authResult.user!.userId,
            challengeId,
            code,
            language,
            explanation,
            status: 'pending',
        });

        const populated = await CodingSubmission.findById(submission._id)
            .populate('challengeId', 'title difficulty');

        return NextResponse.json({ success: true, submission: populated }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
