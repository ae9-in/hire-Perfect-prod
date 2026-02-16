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
} else {
    // Mask password
    console.log('✅ MONGODB_URI loaded:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@').split('?')[0]);
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
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Assessment.deleteMany({});
        await Question.deleteMany({});
        console.log('✅ Cleared existing data');

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@hireperfect.com',
            password: 'admin123',
            role: 'admin',
        });
        console.log('✅ Created admin user (admin@hireperfect.com / admin123)');

        // Create test candidate
        const candidate = await User.create({
            name: 'Test Candidate',
            email: 'candidate@test.com',
            password: 'test123',
            role: 'candidate',
        });
        console.log('✅ Created test candidate (candidate@test.com / test123)');

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

            // Create assessments for this category
            for (const assessmentTitle of categoryData.assessments) {
                const slug = assessmentTitle.toLowerCase().replace(/\s+/g, '-');

                const assessment = await Assessment.create({
                    title: assessmentTitle,
                    slug: `${categoryData.slug}-${slug}`,
                    description: `Comprehensive assessment for ${assessmentTitle}`,
                    category: category._id,
                    duration: 30,
                    price: 500,
                    totalQuestions: 15,
                    passingScore: 60,
                    difficulty: 'medium',
                    tags: [categoryData.name, assessmentTitle],
                    isActive: true,
                });
                console.log(`  ✅ Created assessment: ${assessmentTitle}`);

                // Create sample questions for this assessment
                const sampleQuestions = generateSampleQuestions(assessmentTitle, assessment._id.toString());
                await Question.insertMany(sampleQuestions);
                console.log(`    ✅ Added ${sampleQuestions.length} sample questions`);
            }
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   Admin: admin@hireperfect.com / admin123');
        console.log('   Candidate: candidate@test.com / test123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

function generateSampleQuestions(assessmentTitle: string, assessmentId: string) {
    const questions = [];

    // Generate 15 sample MCQ questions
    for (let i = 1; i <= 15; i++) {
        questions.push({
            assessment: assessmentId,
            type: 'mcq',
            question: `${assessmentTitle} - Sample Question ${i}: What is the correct answer?`,
            options: [
                'Option A - First choice',
                'Option B - Second choice',
                'Option C - Third choice',
                'Option D - Fourth choice',
            ],
            correctAnswer: Math.floor(Math.random() * 4), // Random correct answer
            explanation: `This is the explanation for question ${i}. The correct answer demonstrates key concepts in ${assessmentTitle}.`,
            points: 1,
            difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
            tags: [assessmentTitle],
        });
    }

    return questions;
}

seed();
