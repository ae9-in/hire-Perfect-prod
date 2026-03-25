import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware, adminMiddleware } from '@/middleware/auth';
import Skill from '@/models/Skill';

// GET /api/skills — get all active skills
export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const skills = await Skill.find({ isActive: true }).sort({ category: 1, name: 1 });

        return NextResponse.json({ success: true, skills });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/skills — admin creates a skill
export async function POST(request: NextRequest) {
    try {
        const authResult = await adminMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const body = await request.json();
        const { name, category } = body;

        if (!name) {
            return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
        }

        const skill = await Skill.create({ name, category: category || 'other' });

        return NextResponse.json({ success: true, skill }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Skill already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
