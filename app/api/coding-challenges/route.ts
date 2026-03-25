import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware, adminMiddleware } from '@/middleware/auth';
import CodingChallenge from '@/models/CodingChallenge';

// GET /api/coding-challenges — public list for candidates
export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const { searchParams } = new URL(request.url);
        const difficulty = searchParams.get('difficulty');

        const query: Record<string, unknown> = { isActive: true };
        if (difficulty) query.difficulty = difficulty;

        const challenges = await CodingChallenge.find(query)
            .select('-starterCode') // don't send all starter code to list view
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, challenges });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/coding-challenges — admin creates a challenge
export async function POST(request: NextRequest) {
    try {
        const authResult = await adminMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const body = await request.json();
        const { title, description, difficulty, constraints, examples, starterCode, tags } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const challenge = await CodingChallenge.create({
            title,
            description,
            difficulty: difficulty || 'medium',
            constraints: constraints || '',
            examples: examples || [],
            starterCode: starterCode || {},
            tags: tags || [],
            createdBy: authResult.user!.userId,
        });

        return NextResponse.json({ success: true, challenge }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
