import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Assessment from '@/models/Assessment';
import Question from '@/models/Question';
import { CATEGORIES } from '@/lib/constants';

export async function GET(request: NextRequest) {
    try {
        console.log('🚀 Triggering Maintenance Seed...');
        await connectDB();

        // Clear existing data
        await Category.deleteMany({});
        await Assessment.deleteMany({});
        await Question.deleteMany({});
        console.log('✅ Cleared existing data');

        // Create categories and assessments
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
                const slug = assessmentTitle.toLowerCase().replace(/\s+/g, '-');

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

                const questions = [];
                for (let j = 1; j <= 15; j++) {
                    questions.push({
                        assessment: assessment._id.toString(),
                        type: 'mcq',
                        question: `${assessmentTitle} Proficiency - Q${j}: What is the primary characteristic of ${assessmentTitle} in a professional environment?`,
                        options: [
                            'Enhanced efficiency and scalability',
                            'Legacy compatibility and maintenance',
                            'Resource optimization and management',
                            'Regulatory compliance and auditing',
                        ],
                        correctAnswer: 0, // Option 1 for testing
                        explanation: `The correct answer demonstrates fundamental knowledge required for ${assessmentTitle}.`,
                        points: 1,
                        difficulty: 'medium',
                        tags: [assessmentTitle],
                    });
                }
                await Question.insertMany(questions);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully with 36 assessments and 540 questions.'
        });
    } catch (error: any) {
        console.error('❌ Maintenance Seed Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
