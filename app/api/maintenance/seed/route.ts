import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Assessment from '@/models/Assessment';
import Question from '@/models/Question';
import { CATEGORIES } from '@/lib/constants';
import { toSlug } from '@/lib/slug';
import { adminMiddleware } from '@/middleware/auth';

export async function POST(request: NextRequest) {
    try {
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { success: false, error: 'Maintenance seed is disabled in production.' },
                { status: 403 }
            );
        }

        const authResult = await adminMiddleware(request);
        if (!authResult.authorized) {
            return authResult.response!;
        }

        await connectDB();

        let seededAssessments = 0;
        await Category.deleteMany({});
        await Assessment.deleteMany({});
        await Question.deleteMany({});

        for (let i = 0; i < CATEGORIES.length; i++) {
            const categoryData = CATEGORIES[i];
            const subjectTitles: string[] = [
                ...(categoryData.subjects || categoryData.assessments || []),
            ];

            const category = await Category.create({
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description,
                subjects: subjectTitles,
                order: i + 1,
                isActive: true,
            });

            for (const subjectTitle of subjectTitles) {
                const slug = toSlug(subjectTitle);

                const assessment = await Assessment.create({
                    title: subjectTitle,
                    slug: `${categoryData.slug}-${slug}`,
                    description: `Comprehensive assessment track for ${subjectTitle}.`,
                    category: category._id,
                    duration: 50,
                    price: 500,
                    totalQuestions: 50,
                    passingScore: 60,
                    difficulty: 'intermediate',
                    tags: [categoryData.name, subjectTitle],
                    isActive: true,
                });

                seededAssessments += 1;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Database seeded successfully with ${seededAssessments} assessments.`,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
