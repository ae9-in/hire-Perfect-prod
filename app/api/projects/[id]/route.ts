import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware, adminMiddleware } from '@/middleware/auth';
import Project from '@/models/Project';

// GET /api/projects/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const project = await Project.findById(id)
            .populate('userId', 'name email')
            .populate('reviewedBy', 'name email');

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const isAdmin = authResult.user!.role === 'admin';
        const isOwner = (project.userId as any)?._id?.toString() === authResult.user!.userId;
        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ success: true, project });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/projects/[id] — candidate edits their own | admin rates
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const body = await request.json();
        const isAdmin = authResult.user!.role === 'admin';

        let updateData: Record<string, unknown> = {};

        if (isAdmin) {
            // Admin can rate and give feedback
            const { rating, feedback, status } = body;
            if (rating !== undefined) {
                if (rating < 1 || rating > 10) {
                    return NextResponse.json({ error: 'Rating must be 1–10' }, { status: 400 });
                }
                updateData.rating = rating;
            }
            if (feedback !== undefined) updateData.feedback = feedback;
            if (status !== undefined) updateData.status = status;
            updateData.reviewedBy = authResult.user!.userId;
            updateData.reviewedAt = new Date();
        } else {
            // Candidate can edit their own project details
            const project = await Project.findById(id);
            if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            if ((project.userId as any).toString() !== authResult.user!.userId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const { title, description, techStack, githubLink, liveLink, screenshots } = body;
            if (title) updateData.title = title;
            if (description) updateData.description = description;
            if (techStack) updateData.techStack = techStack;
            if (githubLink) updateData.githubLink = githubLink;
            if (liveLink !== undefined) updateData.liveLink = liveLink;
            if (screenshots) updateData.screenshots = screenshots;
        }

        const project = await Project.findByIdAndUpdate(id, updateData, { new: true })
            .populate('userId', 'name email')
            .populate('reviewedBy', 'name email');

        return NextResponse.json({ success: true, project });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/projects/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const project = await Project.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        const isAdmin = authResult.user!.role === 'admin';
        const isOwner = (project.userId as any).toString() === authResult.user!.userId;
        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await Project.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Project deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
