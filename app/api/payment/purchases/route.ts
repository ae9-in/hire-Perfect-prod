import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Purchase from '@/models/Purchase';

type PopulatedAssessment = {
    _id: { toString(): string };
    title: string;
    description?: string;
    duration?: number;
    totalQuestions?: number;
    difficulty?: string;
    price?: number;
    category?: unknown;
};

type PopulatedCategory = {
    _id: { toString(): string };
    name: string;
    slug?: string;
};

type PurchaseRecord = {
    _id: { toString(): string };
    purchaseType: 'individual' | 'category' | 'bundle';
    assessment?: PopulatedAssessment | string | null;
    category?: PopulatedCategory | string | null;
    assessmentSnapshot?: {
        title: string;
        slug?: string;
        categoryName?: string;
        categorySlug?: string;
    };
    categorySnapshot?: {
        name: string;
        slug?: string;
    };
    [key: string]: unknown;
};

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
        })
            .populate('assessment', 'title description duration totalQuestions difficulty price category')
            .populate('category', 'name slug')
            .sort({ purchasedAt: -1 })
            .lean();

        const normalizedPurchases = (purchases as PurchaseRecord[]).map((purchase) => {
            const populatedAssessment =
                purchase.assessment &&
                typeof purchase.assessment === 'object' &&
                'title' in purchase.assessment
                    ? purchase.assessment
                    : null;

            const populatedCategory =
                purchase.category &&
                typeof purchase.category === 'object' &&
                'name' in purchase.category
                    ? purchase.category
                    : null;

            const missingAssessment = purchase.purchaseType === 'individual' && !populatedAssessment;
            const missingCategory = purchase.purchaseType === 'category' && !populatedCategory;

            const assessment = populatedAssessment || (
                purchase.assessmentSnapshot
                    ? {
                        _id: purchase.assessment ? String(purchase.assessment) : '',
                        title: purchase.assessmentSnapshot.title,
                        slug: purchase.assessmentSnapshot.slug,
                        category: purchase.assessmentSnapshot.categoryName
                            ? {
                                _id: '',
                                name: purchase.assessmentSnapshot.categoryName,
                                slug: purchase.assessmentSnapshot.categorySlug || '',
                            }
                            : undefined,
                        isArchived: true,
                    }
                    : null
            );

            const category = populatedCategory || (
                purchase.categorySnapshot
                    ? {
                        _id: purchase.category ? String(purchase.category) : '',
                        name: purchase.categorySnapshot.name,
                        slug: purchase.categorySnapshot.slug || '',
                        isArchived: true,
                    }
                    : null
            );

            return {
                ...purchase,
                assessment,
                category,
                referenceStatus: {
                    missingAssessment,
                    missingCategory,
                },
            };
        });

        return NextResponse.json({
            success: true,
            purchases: normalizedPurchases,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Get purchases error:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
