import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware, adminMiddleware } from '@/middleware/auth';
import UserSkill from '@/models/UserSkill';
import Skill from '@/models/Skill';

// GET /api/user-skills?userId=xxx — get skills for a user
export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId') || authResult.user!.userId;

        // Non-admins can only view their own skills
        const isAdmin = authResult.user!.role === 'admin';
        if (!isAdmin && targetUserId !== authResult.user!.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const userSkills = await UserSkill.find({ userId: targetUserId })
            .populate('skillId', 'name category')
            .populate('assignedBy', 'name email')
            .sort({ rating: -1 });

        return NextResponse.json({ success: true, userSkills });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/user-skills — admin assigns/updates skill rating for a user
export async function POST(request: NextRequest) {
    try {
        const authResult = await adminMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const body = await request.json();
        const { userId, skillId, rating, notes } = body;

        if (!userId || !skillId || rating === undefined) {
            return NextResponse.json(
                { error: 'userId, skillId, and rating are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 10) {
            return NextResponse.json({ error: 'Rating must be between 1 and 10' }, { status: 400 });
        }

        // Upsert skill rating
        const userSkill = await UserSkill.findOneAndUpdate(
            { userId, skillId },
            { rating, notes: notes || '', assignedBy: authResult.user!.userId },
            { upsert: true, new: true }
        ).populate('skillId', 'name category');

        return NextResponse.json({ success: true, userSkill });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/user-skills?userId=xxx&skillId=xxx — admin removes a skill
export async function DELETE(request: NextRequest) {
    try {
        const authResult = await adminMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const skillId = searchParams.get('skillId');

        if (!userId || !skillId) {
            return NextResponse.json({ error: 'userId and skillId are required' }, { status: 400 });
        }

        await UserSkill.findOneAndDelete({ userId, skillId });

        return NextResponse.json({ success: true, message: 'Skill removed' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
