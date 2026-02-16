import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Attempt from '@/models/Attempt';
import Purchase from '@/models/Purchase';
import { USER_ROLES } from '@/lib/constants';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        // Basic Stats
        const [totalAttempts, completedAttempts, totalPurchases] = await Promise.all([
            Attempt.countDocuments(),
            Attempt.countDocuments({ status: 'completed' }),
            Purchase.countDocuments({ status: 'completed' }),
        ]);

        // Revenue Calculation
        const revenueResult = await Purchase.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Average Score
        const scoreResult = await Attempt.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, avg: { $avg: '$percentage' } } }
        ]);
        const averageScore = scoreResult[0]?.avg || 0;

        // Violation Trends (Simplified)
        const totalViolationsResult = await Attempt.aggregate([
            { $group: { _id: null, total: { $sum: '$violationCount' } } }
        ]);
        const totalViolations = totalViolationsResult[0]?.total || 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalAttempts,
                completedAttempts,
                totalPurchases,
                totalRevenue,
                averageScore: Math.round(averageScore * 10) / 10,
                totalViolations,
            }
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
