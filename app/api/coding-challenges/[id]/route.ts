import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware, adminMiddleware } from '@/middleware/auth';
import CodingChallenge from '@/models/CodingChallenge';

// GET /api/coding-challenges/[id] — get single challenge with starterCode
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const challenge = await CodingChallenge.findById(id);
        if (!challenge || !challenge.isActive) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, challenge });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/coding-challenges/[id] — admin updates a challenge
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
        const challenge = await CodingChallenge.findByIdAndUpdate(id, body, { new: true });

        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, challenge });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/coding-challenges/[id] — admin soft-deletes
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authResult = await adminMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        await CodingChallenge.findByIdAndUpdate(id, { isActive: false });

        return NextResponse.json({ success: true, message: 'Challenge archived' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
