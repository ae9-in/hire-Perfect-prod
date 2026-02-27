import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import { USER_ROLES } from '@/lib/constants';
import FAQSubmission from '@/models/FAQSubmission';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const query = searchParams.get('query');

        const filter: any = {};
        if (status) filter.status = status;
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { subject: { $regex: query, $options: 'i' } },
                { message: { $regex: query, $options: 'i' } },
            ];
        }

        const submissions = await FAQSubmission.find(filter).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            submissions,
        });
    } catch (error: any) {
        console.error('Admin FAQ submission fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const submissionId = String(body?.submissionId || '').trim();
        const status = String(body?.status || '').trim();

        if (!submissionId || !status) {
            return NextResponse.json({ error: 'submissionId and status are required' }, { status: 400 });
        }

        if (!['new', 'reviewed', 'resolved'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }

        await connectDB();

        const updatedSubmission = await FAQSubmission.findByIdAndUpdate(
            submissionId,
            { status },
            { new: true }
        );

        if (!updatedSubmission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            submission: updatedSubmission,
        });
    } catch (error: any) {
        console.error('Admin FAQ submission update error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
