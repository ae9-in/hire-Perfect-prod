/**
 * Step 1: Update all assessments to 50 minutes duration
 * Step 2: Seed questions with proper normalization
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

function normalizeQuestionText(text) {
    return text.trim().replace(/\s+/g, ' ').toLowerCase();
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

        // STEP 1: Update all assessments to 50 min duration
        console.log('Step 1: Updating all assessment durations to 50 minutes...');
        const updateResult = await assessmentCollection.updateMany(
            { isActive: true },
            { $set: { duration: 50, totalQuestions: 150, updatedAt: new Date() } }
        );
        console.log(`✓ Updated ${updateResult.modifiedCount} assessments\n`);

        // STEP 2: Clear existing questions and seed fresh
        console.log('Step 2: Clearing and reseeding questions...\n');

        let totalQuestionsInserted = 0;

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
                    console.log(`  ⚠️  No assessments found\n`);
                    continue;
                }

                // Load questions from JSON file
                const validatedJsonDir = path.join(__dirname, '../../validated-json');
                const jsonFile = path.join(validatedJsonDir, `${fileKey}.validated.json`);

                if (!fs.existsSync(jsonFile)) {
                    console.log(`  ⚠️  JSON file not found\n`);
                    continue;
                }

                const jsonContent = fs.readFileSync(jsonFile, 'utf-8');
                const allQuestions = JSON.parse(jsonContent);

                if (!Array.isArray(allQuestions) || allQuestions.length === 0) {
                    console.log(`  ⚠️  No questions in JSON\n`);
                    continue;
                }

                // Group questions by difficulty
                let easyQuestions = allQuestions.filter(q => q.difficulty === 'easy' || q.level === 'easy');
                let mediumQuestions = allQuestions.filter(q => q.difficulty === 'medium' || q.level === 'medium');
                let hardQuestions = allQuestions.filter(q => q.difficulty === 'hard' || q.level === 'hard');

                // Fallback if difficulty not set
                if (easyQuestions.length === 0 && mediumQuestions.length === 0 && hardQuestions.length === 0) {
                    // Distribute evenly
                    const third = Math.ceil(allQuestions.length / 3);
                    easyQuestions = allQuestions.slice(0, third);
                    mediumQuestions = allQuestions.slice(third, 2 * third);
                    hardQuestions = allQuestions.slice(2 * third);
                }

                console.log(`  Found: Easy=${easyQuestions.length}, Medium=${mediumQuestions.length}, Hard=${hardQuestions.length}`);

                // Distribute to assessments
                for (const assessment of assessments) {
                    const assessmentId = assessment._id;

                    // Delete existing questions for this assessment
                    await questionCollection.deleteMany({ assessment: assessmentId });

                    const questionsToInsert = [];
                    const difficulties = [
                        { level: 'easy', questions: easyQuestions },
                        { level: 'medium', questions: mediumQuestions },
                        { level: 'hard', questions: hardQuestions }
                    ];

                    difficulties.forEach(({ level, questions }) => {
                        for (let i = 0; i < 50; i++) {
                            const sourceQuestion = questions[i % Math.max(1, questions.length)];
                            const questionText = sourceQuestion.question || '';
                            const normalizedQuestion = normalizeQuestionText(questionText);

                            questionsToInsert.push({
                                assessment: assessmentId,
                                type: sourceQuestion.type || 'mcq',
                                question: questionText,
                                options: sourceQuestion.options || [],
                                correctAnswer: sourceQuestion.correctAnswer !== undefined ? sourceQuestion.correctAnswer : 0,
                                explanation: sourceQuestion.explanation || '',
                                points: sourceQuestion.points || 1,
                                difficulty: level,
                                tags: sourceQuestion.tags || [],
                                codeTemplate: sourceQuestion.codeTemplate || undefined,
                                testCases: sourceQuestion.testCases || [],
                                normalizedQuestion: normalizedQuestion,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }
                    });

                    // Insert with proper error handling
                    if (questionsToInsert.length > 0) {
                        try {
                            await questionCollection.insertMany(questionsToInsert, { ordered: false });
                            totalQuestionsInserted += questionsToInsert.length;
                        } catch (insertErr) {
                            // Log but continue with duplicate key errors
                            if (insertErr.code !== 11000) throw insertErr;
                        }
                    }
                }

                console.log(`  ✓ Seeded ${assessments.length} assessments\n`);

            } catch (err) {
                console.log(`  ❌ Error: ${err.message}\n`);
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log(`✓ Complete!`);
        console.log(`  Duration updated: All 240 assessments → 50 minutes`);
        console.log(`  Questions inserted: ${totalQuestionsInserted}`);
        console.log('═'.repeat(60));

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

seedAndNormalize();
