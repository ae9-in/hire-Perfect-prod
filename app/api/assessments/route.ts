import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Assessment from '@/models/Assessment';
import Purchase from '@/models/Purchase';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || !authResult.user) {
            return authResult.response!;
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('category');

        // Build query
        const query: any = { isActive: true };
        if (categoryId) {
            query.category = categoryId;
        }

        // Get assessments
        const assessments = await Assessment.find(query)
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });

        // Get user's purchases
        const purchases = await Purchase.find({
            user: authResult.user.userId,
            status: 'completed',
        });

        // Check access for each assessment
        const assessmentsWithAccess = assessments.map((assessment) => {
            const hasIndividualAccess = purchases.some(
                (p) => p.purchaseType === 'individual' && p.assessment?.toString() === assessment._id.toString()
            );
            const hasCategoryAccess = purchases.some(
                (p) => p.purchaseType === 'category' && p.category?.toString() === assessment.category._id.toString()
            );
            const hasBundleAccess = purchases.some((p) => p.purchaseType === 'bundle');

            return {
                ...assessment.toObject(),
                hasAccess: hasIndividualAccess || hasCategoryAccess || hasBundleAccess,
            };
        });

        return NextResponse.json({
            success: true,
            assessments: assessmentsWithAccess,
        });
    } catch (error: any) {
        console.error('Get assessments error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
