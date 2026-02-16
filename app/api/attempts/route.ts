import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Attempt from '@/models/Attempt';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || !authResult.user) {
            return authResult.response!;
        }

        await connectDB();

        const attempts = await Attempt.find({ user: authResult.user.userId })
            .populate('assessment', 'title category')
            .sort({ startedAt: -1 });

        return NextResponse.json({
            success: true,
            attempts,
        });
    } catch (error: any) {
        console.error('List user attempts error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
