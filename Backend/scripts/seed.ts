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
        const { toSlug } = await import('../lib/slug');

        console.log('Connecting to database...');
        await connectDB();
        console.log('Starting database seed for categories and assessments...');

        await Category.deleteMany({});
        await Assessment.deleteMany({});
        await Question.deleteMany({});
        console.log('Cleared existing categories, assessments, and questions');

        for (let i = 0; i < CATEGORIES.length; i++) {
            const categoryData = CATEGORIES[i];
            const subjectTitles = categoryData.subjects || categoryData.assessments || [];

            const category = await Category.create({
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description,
                subjects: subjectTitles,
                order: i + 1,
                isActive: true,
            });
            console.log(`Created category: ${category.name}`);

            for (const subjectTitle of subjectTitles) {
                const slug = toSlug(subjectTitle);

                const assessment = await Assessment.create({
                    title: subjectTitle,
                    slug: `${categoryData.slug}-${slug}`,
                    description: `Comprehensive assessment track for ${subjectTitle}.`,
                    category: category._id,
                    duration: 30,
                    price: 500,
                    totalQuestions: 0,
                    passingScore: 60,
                    difficulty: 'intermediate',
                    tags: [categoryData.name, subjectTitle],
                    isActive: true,
                });
                console.log(`  Created subject assessment: ${subjectTitle}`);
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
