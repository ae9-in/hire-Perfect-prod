// @ts-ignore
import dotenv from 'dotenv';
import path from 'path';

// 1. Load environment variables FIRST
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('🔄 Loading environment from:', envPath);
dotenv.config({ path: envPath });

// Verify env load
if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is undefined after loading .env.local');
    process.exit(1);
}

// 2. Import everything else dynamically
async function seed() {
    try {
        console.log('📦 Importing modules...');
        const { default: connectDB } = await import('../lib/db');
        const { default: User } = await import('../models/User');
        const { default: Category } = await import('../models/Category');
        const { default: Assessment } = await import('../models/Assessment');
        const { default: Question } = await import('../models/Question');
        const { CATEGORIES } = await import('../lib/constants');

        console.log('🚀 Connecting to database...');
        await connectDB();
        console.log('🌱 Starting database seeding for 36 assessments...');

        // Clear existing data
        await Category.deleteMany({});
        await Assessment.deleteMany({});
        await Question.deleteMany({});
        console.log('✅ Cleared existing categories, assessments, and questions');

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
            console.log(`✅ Created category: ${category.name}`);

            // Create 6 assessments for this category
            for (const assessmentTitle of categoryData.assessments) {
                const slug = assessmentTitle.toLowerCase().replace(/\s+/g, '-');

                const assessment = await Assessment.create({
                    title: assessmentTitle,
                    slug: `${categoryData.slug}-${slug}`,
                    description: `Comprehensive assessment for ${assessmentTitle}. This 30-minute timed exam evaluates your core competency in ${assessmentTitle} through randomized MCQ questions.`,
                    category: category._id,
                    duration: 30, // 30 minutes as requested
                    price: 500,
                    totalQuestions: 15, // Standardizing to 15 questions per exam
                    passingScore: 60,
                    difficulty: 'medium',
                    tags: [categoryData.name, assessmentTitle],
                    isActive: true,
                });
                console.log(`  ✅ Created assessment: ${assessmentTitle}`);

                // Create 15 sample questions for this assessment
                const sampleQuestionsList = generateQuestions(assessmentTitle, assessment._id.toString());
                await Question.insertMany(sampleQuestionsList);
                console.log(`    ✅ Added ${sampleQuestionsList.length} MCQ questions`);
            }
        }

        console.log('\n🎉 Scaling Complete: 6 Categories, 36 Assessments, 540 Questions created.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

function generateQuestions(assessmentTitle: string, assessmentId: string) {
    const questions = [];
    for (let i = 1; i <= 15; i++) {
        questions.push({
            assessment: assessmentId,
            type: 'mcq',
            question: `${assessmentTitle} Proficiency - Q${i}: What is the primary characteristic of ${assessmentTitle} in a professional environment?`,
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
    return questions;
}

seed();
