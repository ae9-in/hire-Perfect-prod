import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Assessment from '@/models/Assessment';
import Question from '@/models/Question';
import { CATEGORIES } from '@/lib/constants';
import { generateAssessmentQuestions } from '@/lib/questionBank';
import { toSlug } from '@/lib/slug';

export async function GET(_request: NextRequest) {
    try {
        await connectDB();

        let seededAssessments = 0;
        let seededQuestions = 0;

        await Category.deleteMany({});
        await Assessment.deleteMany({});
        await Question.deleteMany({});

        for (let i = 0; i < CATEGORIES.length; i++) {
            const categoryData = CATEGORIES[i];

            const category = await Category.create({
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description,
                order: i + 1,
                isActive: true,
            });

            for (const assessmentTitle of categoryData.assessments) {
                const slug = toSlug(assessmentTitle);

                const assessment = await Assessment.create({
                    title: assessmentTitle,
                    slug: `${categoryData.slug}-${slug}`,
                    description: `Comprehensive assessment for ${assessmentTitle}. This 30-minute timed exam evaluates your core competency in ${assessmentTitle} through randomized MCQ questions.`,
                    category: category._id,
                    duration: 30,
                    price: 500,
                    totalQuestions: 15,
                    passingScore: 60,
                    difficulty: 'medium',
                    tags: [categoryData.name, assessmentTitle],
                    isActive: true,
                });

                const questions = generateAssessmentQuestions({
                    assessmentTitle,
                    assessmentId: assessment._id.toString(),
                    totalQuestions: 15,
                });
                await Question.insertMany(questions);

                seededAssessments += 1;
                seededQuestions += questions.length;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Database seeded successfully with ${seededAssessments} assessments and ${seededQuestions} questions.`,
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
