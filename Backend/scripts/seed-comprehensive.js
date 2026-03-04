/**
 * Comprehensive seeding script:
 * 1. Load all questions from validated-json
 * 2. Distribute across assessments by category
 * 3. Ensure 50 questions per difficulty level
 * 4. Update all assessments to 50 min duration
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
}

// Mapping of JSON file names to category names
const fileToCategory = {
    '1_Generative_AI_for_Business_Leaders': 'Generative AI for Business Leaders',
    '2_Prompt_Engineering': 'Prompt Engineering',
    '3_data_engineering': 'Data Engineering',
    '4_ui_ux_for_ai_products': 'UI/UX for AI Products',
    '5_Product_Management_in_the_AI_Era': 'Product Management in the AI Era',
    '7_Cybersecurity': 'Cybersecurity',
    '8_Digital_Branding': 'Digital Branding',
    '9_Financial_Modelling_With_AI_Tools': 'Financial Modelling With AI Tools',
    '10_Sustainable_Business_SG_Strategy': 'Sustainable Business SG Strategy',
    '11_Growth_marketing_perfomance_strategy': 'Growth Marketing Performance Strategy',
    '12_No_code_Low_code_app_development': 'No-Code/Low-Code App Development',
    '13_Advanced_Excel_Business_Intelligence': 'Advanced Excel Business Intelligence',
    '14_AR_VR': 'AR/VR',
    '15_HR_ANALYTICS': 'HR Analytics',
    '16_Startup_Incubation': 'Startup Incubation',
    '17_AI_in_Healthcare': 'AI in Healthcare',
    '18_Supply_Chain_Logistics_Analytics': 'Supply Chain Logistics Analytics',
    '19_Emotional_Intelligence_for_Leaders': 'Emotional Intelligence for Leaders',
    '20_AI_Powered_Content_Creation_Media_Production': 'AI-Powered Content Creation & Media Production'
};

async function seedAndNormalize() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const categoryCollection = db.collection('categories');
        const assessmentCollection = db.collection('assessments');
        const questionCollection = db.collection('questions');

        console.log('Step 1: Finding categories...\n');

        let totalQuestionsInserted = 0;
        let assessmentsNormalized = 0;

        for (const [fileKey, categoryName] of Object.entries(fileToCategory)) {
            console.log(`Processing: ${categoryName}`);

            try {
                // Find category
                const category = await categoryCollection.findOne({
                    $or: [
                        { name: categoryName },
                        { name: { $regex: categoryName.split(' ')[0], $options: 'i' } }
                    ]
                });

                if (!category) {
                    console.log(`  ⚠️  Category not found\n`);
                    continue;
                }

                const categoryId = category._id;

                // Find all assessments in this category
                const assessments = await assessmentCollection
                    .find({ category: categoryId, isActive: true })
                    .toArray();

                if (assessments.length === 0) {
                    console.log(`  ⚠️  No assessments found for this category\n`);
                    continue;
                }

                // Load questions from JSON file
                const validatedJsonDir = path.join(__dirname, '../../validated-json');
                const jsonFile = path.join(validatedJsonDir, `${fileKey}.validated.json`);

                if (!fs.existsSync(jsonFile)) {
                    console.log(`  ⚠️  JSON file not found: ${jsonFile}\n`);
                    continue;
                }

                const jsonContent = fs.readFileSync(jsonFile, 'utf-8');
                const allQuestions = JSON.parse(jsonContent);

                if (!Array.isArray(allQuestions) || allQuestions.length === 0) {
                    console.log(`  ⚠️  No questions in JSON file\n`);
                    continue;
                }

                // Group questions by difficulty
                const easyQuestions = allQuestions.filter(q => q.difficulty === 'easy' || q.level === 'easy').slice(0, 500);
                const mediumQuestions = allQuestions.filter(q => q.difficulty === 'medium' || q.level === 'medium').slice(0, 500);
                const hardQuestions = allQuestions.filter(q => q.difficulty === 'hard' || q.level === 'hard').slice(0, 500);

                // If any difficulty level is empty, use available questions cyclically
                if (easyQuestions.length === 0) easyQuestions.push(...allQuestions.slice(0, 500));
                if (mediumQuestions.length === 0) mediumQuestions.push(...allQuestions.slice(0, 500));
                if (hardQuestions.length === 0) hardQuestions.push(...allQuestions.slice(0, 500));

                console.log(`  Found: Easy=${easyQuestions.length}, Medium=${mediumQuestions.length}, Hard=${hardQuestions.length} questions`);

                // Distribute 50 questions per difficulty per assessment
                for (const assessment of assessments) {
                    const assessmentId = assessment._id;

                    // Check if already has questions
                    const existingCount = await questionCollection.countDocuments({ assessment: assessmentId });
                    if (existingCount > 0) {
                        continue;
                    }

                    const questionsToInsert = [];
                    const difficulties = [
                        { level: 'easy', questions: easyQuestions },
                        { level: 'medium', questions: mediumQuestions },
                        { level: 'hard', questions: hardQuestions }
                    ];

                    difficulties.forEach(({ level, questions }) => {
                        for (let i = 0; i < 50; i++) {
                            const sourceQuestion = questions[i % questions.length];
                            questionsToInsert.push({
                                assessment: assessmentId,
                                type: sourceQuestion.type || 'mcq',
                                question: sourceQuestion.question,
                                options: sourceQuestion.options || [],
                                correctAnswer: sourceQuestion.correctAnswer !== undefined ? sourceQuestion.correctAnswer : 0,
                                explanation: sourceQuestion.explanation || '',
                                points: sourceQuestion.points || 1,
                                difficulty: level,
                                tags: sourceQuestion.tags || [],
                                codeTemplate: sourceQuestion.codeTemplate || undefined,
                                testCases: sourceQuestion.testCases || [],
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }
                    });

                    // Insert questions
                    if (questionsToInsert.length > 0) {
                        await questionCollection.insertMany(questionsToInsert);
                        totalQuestionsInserted += questionsToInsert.length;
                    }
                }

                // Update all assessments in category to 50 minutes
                const result = await assessmentCollection.updateMany(
                    { category: categoryId, isActive: true },
                    {
                        $set: {
                            duration: 50,
                            totalQuestions: 150,
                            updatedAt: new Date()
                        }
                    }
                );
                assessmentsNormalized += result.modifiedCount;

                console.log(`  ✓ Updated ${assessments.length} assessments\n`);

            } catch (err) {
                console.log(`  ❌ Error: ${err.message}\n`);
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log(`✓ Seeding and normalization complete!`);
        console.log(`  Total questions inserted: ${totalQuestionsInserted}`);
        console.log(`  Total assessments normalized: ${assessmentsNormalized}`);
        console.log('═'.repeat(60));

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

seedAndNormalize();
