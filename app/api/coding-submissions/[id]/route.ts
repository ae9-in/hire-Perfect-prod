import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware, adminMiddleware } from '@/middleware/auth';
import CodingSubmission from '@/models/CodingSubmission';

// GET /api/coding-submissions/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const submission = await CodingSubmission.findById(id)
            .populate('userId', 'name email')
            .populate('challengeId', 'title description difficulty')
            .populate('reviewedBy', 'name email');

        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        // Allow admin or owner
        const isAdmin = authResult.user!.role === 'admin';
        const isOwner = submission.userId._id?.toString() === authResult.user!.userId;
        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ success: true, submission });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/coding-submissions/[id] — admin evaluates submission
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authResult = await adminMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const body = await request.json();
        const { score, feedback, status } = body;

        const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'needs_improvement'];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        if (score !== undefined && (score < 0 || score > 100)) {
            return NextResponse.json({ error: 'Score must be between 0 and 100' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {
            reviewedBy: authResult.user!.userId,
            reviewedAt: new Date(),
        };
        if (score !== undefined) updateData.score = score;
        if (feedback !== undefined) updateData.feedback = feedback;
        if (status !== undefined) updateData.status = status;

        const submission = await CodingSubmission.findByIdAndUpdate(id, updateData, { new: true })
            .populate('userId', 'name email')
            .populate('challengeId', 'title difficulty')
            .populate('reviewedBy', 'name email');

        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, submission });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
