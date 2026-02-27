import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Assessment from '@/models/Assessment';

type AssessmentResponseItem = Record<string, unknown> & {
    _id: string | { toString(): string };
    category?: unknown;
    hasAccess: boolean;
};

type CategoryGroup = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    subjects: AssessmentResponseItem[];
};

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('category');

        const query: Record<string, string | boolean> = { isActive: true };
        if (categoryId) {
            query.category = categoryId;
        }

        const assessments = await Assessment.find(query)
            .populate('category', 'name slug description')
            .sort({ createdAt: -1 });

        const assessmentsWithAccess: AssessmentResponseItem[] = assessments.map((assessment) => {
            const hasAccess = true;
            const assessmentObj = assessment.toObject<Record<string, unknown>>();

            return {
                ...assessmentObj,
                hasAccess,
            } as AssessmentResponseItem;
        });

        const categoriesMap = new Map<string, CategoryGroup>();
        for (const assessment of assessmentsWithAccess) {
            const category = assessment.category;
            if (!category) continue;

            const categoryObject = (typeof category === 'object' && category !== null)
                ? (category as Record<string, unknown>)
                : null;

            const currentCategoryId = categoryObject?._id
                ? String(categoryObject._id)
                : String(category);

            if (!categoriesMap.has(currentCategoryId)) {
                categoriesMap.set(currentCategoryId, {
                    _id: currentCategoryId,
                    name: String(categoryObject?.name || 'Uncategorized'),
                    slug: String(categoryObject?.slug || ''),
                    description: String(categoryObject?.description || ''),
                    subjects: [],
                });
            }

            categoriesMap.get(currentCategoryId)!.subjects.push(assessment);
        }

        return NextResponse.json({
            success: true,
            assessments: assessmentsWithAccess,
            categories: Array.from(categoriesMap.values()),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Get assessments error:', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
