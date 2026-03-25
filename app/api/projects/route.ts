import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware, adminMiddleware } from '@/middleware/auth';
import Project from '@/models/Project';

// GET /api/projects — candidate: own projects | admin: all projects
export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        const isAdmin = authResult.user!.role === 'admin';
        const query: Record<string, unknown> = {};

        if (isAdmin) {
            if (userId) query.userId = userId;
            if (status) query.status = status;
        } else {
            query.userId = authResult.user!.userId;
        }

        const projects = await Project.find(query)
            .populate('userId', 'name email')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, projects });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/projects — candidate submits a project
export async function POST(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const body = await request.json();
        const { title, description, techStack, githubLink, liveLink, screenshots } = body;

        if (!title || !description || !githubLink) {
            return NextResponse.json(
                { error: 'Title, description, and GitHub link are required' },
                { status: 400 }
            );
        }

        const project = await Project.create({
            userId: authResult.user!.userId,
            title,
            description,
            techStack: techStack || [],
            githubLink,
            liveLink: liveLink || '',
            screenshots: screenshots || [],
        });

        return NextResponse.json({ success: true, project }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
