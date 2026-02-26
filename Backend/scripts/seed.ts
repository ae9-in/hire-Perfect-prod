// @ts-ignore
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is undefined after loading .env.local');
    process.exit(1);
}

async function seed() {
    try {
        console.log('Importing modules...');
        const { default: connectDB } = await import('../lib/db');
        const { default: Category } = await import('../models/Category');
        const { default: Assessment } = await import('../models/Assessment');
        const { default: Question } = await import('../models/Question');
        const { CATEGORIES } = await import('../lib/constants');
        const { generateAssessmentQuestions } = await import('../lib/questionBank');
        const { toSlug } = await import('../lib/slug');

        console.log('Connecting to database...');
        await connectDB();
        console.log('Starting database seed for assessments and questions...');

        await Category.deleteMany({});
        await Assessment.deleteMany({});
        await Question.deleteMany({});
        console.log('Cleared existing categories, assessments, and questions');

        for (let i = 0; i < CATEGORIES.length; i++) {
            const categoryData = CATEGORIES[i];

            const category = await Category.create({
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description,
                order: i + 1,
                isActive: true,
            });
            console.log(`Created category: ${category.name}`);

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
                console.log(`  Created assessment: ${assessmentTitle}`);

                const sampleQuestionsList = generateAssessmentQuestions({
                    assessmentTitle,
                    assessmentId: assessment._id.toString(),
                    totalQuestions: 15,
                });
                await Question.insertMany(sampleQuestionsList);
                console.log(`    Added ${sampleQuestionsList.length} MCQ questions`);
            }
        }

        console.log('Seed complete.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
