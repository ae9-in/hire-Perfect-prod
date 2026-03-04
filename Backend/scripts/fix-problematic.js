/**
 * Fix: Handle categories with skewed difficulty distributions
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const mongoUri = process.env.MONGODB_URI;

function normalizeQuestionText(text) {
    return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

// Categories that failed
const problematicCategories = {
    '3_data_engineering': 'Data Engineering',
    '13_Advanced_Excel_Business_Intelligence': 'Advanced Excel Business Intelligence',
    '14_AR_VR': 'AR/VR',
    '17_AI_in_Healthcare': 'AI in Healthcare',
    '18_Supply_Chain_Logistics_Analytics': 'Supply Chain Logistics Analytics',
};

async function fixProblematicCategories() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Fixing problematic categories...\n');

        const db = mongoose.connection.db;
        const categoryCollection = db.collection('categories');
        const assessmentCollection = db.collection('assessments');
        const questionCollection = db.collection('questions');

        for (const [fileKey, categoryName] of Object.entries(problematicCategories)) {
            console.log(`Processing: ${categoryName}`);

            try {
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

                const assessments = await assessmentCollection
                    .find({ category: category._id, isActive: true })
                    .toArray();

                const validatedJsonDir = path.join(__dirname, '../../validated-json');
                const jsonFile = path.join(validatedJsonDir, `${fileKey}.validated.json`);

                if (!fs.existsSync(jsonFile)) {
                    console.log(`  ⚠️  JSON file not found\n`);
                    continue;
                }

                const jsonContent = fs.readFileSync(jsonFile, 'utf-8');
                let allQuestions = JSON.parse(jsonContent);

                if (!Array.isArray(allQuestions) || allQuestions.length === 0) {
                    console.log(`  ⚠️  No questions in JSON\n`);
                    continue;
                }

                // If we have less than 150 questions total, replicate
                if (allQuestions.length < 150) {
                    const original = allQuestions;
                    while (allQuestions.length < 150) {
                        allQuestions.push(...original);
                    }
                }

                // For problematic files, just use all questions and distribute evenly
                const questionCount = allQuestions.length;
                const perDifficulty = Math.ceil(questionCount / 3);

                console.log(`  Total questions: ${allQuestions.length}`);

                for (const assessment of assessments) {
                    await questionCollection.deleteMany({ assessment: assessment._id });

                    const questionsToInsert = [];
                    const difficulties = ['easy', 'medium', 'hard'];

                    difficulties.forEach((difficulty, idx) => {
                        const startIdx = idx * perDifficulty;
                        const endIdx = Math.min(startIdx + 500, allQuestions.length);
                        const difficultyQuestions = allQuestions.slice(startIdx, endIdx);

                        for (let i = 0; i < 50; i++) {
                            const sourceQuestion = difficultyQuestions[i % Math.max(1, difficultyQuestions.length)];
                            if (!sourceQuestion) continue;

                            const questionText = sourceQuestion.question || 'Question';
                            const normalizedQuestion = normalizeQuestionText(questionText);

                            questionsToInsert.push({
                                assessment: assessment._id,
                                type: sourceQuestion.type || 'mcq',
                                question: questionText,
                                options: sourceQuestion.options || [],
                                correctAnswer: sourceQuestion.correctAnswer !== undefined ? sourceQuestion.correctAnswer : 0,
                                explanation: sourceQuestion.explanation || '',
                                points: sourceQuestion.points || 1,
                                difficulty: difficulty,
                                tags: sourceQuestion.tags || [],
                                normalizedQuestion: normalizedQuestion,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }
                    });

                    if (questionsToInsert.length > 0) {
                        await questionCollection.insertMany(questionsToInsert, { ordered: false });
                    }
                }

                console.log(`  ✓ Fixed ${assessments.length} assessments\n`);

            } catch (err) {
                console.log(`  ❌ ${err.message}\n`);
            }
        }

        console.log('✓ Problematic categories fixed');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixProblematicCategories();
