import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Purchase from '@/models/Purchase';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || !authResult.user) {
            return authResult.response!;
        }

        await connectDB();

        const purchases = await Purchase.find({
            user: authResult.user.userId,
            status: 'completed',
        });

        return NextResponse.json({
            success: true,
            purchases: purchases,
        });
    } catch (error: any) {
        console.error('Get purchases error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
