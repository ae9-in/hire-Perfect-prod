/**
 * Seed questions from validated-json files and normalize assessments
 * 1. Load questions from validated-json files
 * 2. Ensure 50 questions per difficulty level per assessment
 * 3. Update duration to 50 minutes
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

async function seedQuestionsAndNormalize() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const assessmentCollection = db.collection('assessments');
        const questionCollection = db.collection('questions');

        // Map of JSON file names to assessment titles (based on validated-json folder)
        const validatedJsonDir = path.join(__dirname, '../../validated-json');
        const jsonFiles = fs.readdirSync(validatedJsonDir).filter(f => f.endsWith('.validated.json'));

        console.log(`Found ${jsonFiles.length} validated-json files\n`);
        console.log('Processing assessments...\n');

        let totalQuestionsAdded = 0;
        let assessmentsUpdate = 0;

        for (const jsonFile of jsonFiles) {
            const baseName = jsonFile.replace('.validated.json', '');
            
            // Extract assessment title from filename (e.g., "2_Prompt_Engineering" -> "Prompt Engineering")
            const titleParts = baseName.split('_').slice(1); // Remove number prefix
            const assessmentTitle = titleParts.join(' ');

            console.log(`Processing: ${assessmentTitle}...`);

            try {
                // Find assessment by title (fuzzy match)
                const assessment = await assessmentCollection.findOne({
                    $or: [
                        { title: { $regex: assessmentTitle, $options: 'i' } },
                        { title: { $regex: titleParts.join('.*'), $options: 'i' } }
                    ]
                });

                if (!assessment) {
                    console.log(`  ⚠️  Assessment not found`);
                    continue;
                }

                const assessmentId = assessment._id;

                // Read questions from JSON file
                const jsonPath = path.join(validatedJsonDir, jsonFile);
                const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
                let questions = JSON.parse(jsonContent);

                if (!Array.isArray(questions)) {
                    console.log(`  ⚠️  Invalid JSON format`);
                    continue;
                }

                // Skip if already has questions
                const existingCount = await questionCollection.countDocuments({ assessment: assessmentId });
                if (existingCount > 0) {
                    console.log(`  ✓ Already has ${existingCount} questions`);
                    continue;
                }

                // Normalize questions: ensure 50 per difficulty level
                const difficulties = ['easy', 'medium', 'hard'];
                const questionsByDifficulty = {};
                
                difficulties.forEach(d => {
                    questionsByDifficulty[d] = questions.filter(q => q.difficulty === d || q.type === d);
                });

                // If we have fewer than 50 of a difficulty, duplicate questions cyclically
                const normalizedQuestions = [];
                difficulties.forEach(difficulty => {
                    let levelQuestions = questionsByDifficulty[difficulty];
                    
                    if (levelQuestions.length === 0) {
                        // If no questions for this difficulty, use any questions
                        levelQuestions = questions.slice(0, 50);
                    }

                    // Ensure 50 questions for this difficulty
                    let idx = 0;
                    for (let i = 0; i < 50; i++) {
                        const q = levelQuestions[idx % levelQuestions.length];
                        normalizedQuestions.push({
                            ...q,
                            assessment: assessmentId,
                            difficulty: difficulty,
                            points: q.points || 1,
                            tags: q.tags || [],
                            type: q.type || 'mcq',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        idx++;
                    }
                });

                // Insert questions
                if (normalizedQuestions.length > 0) {
                    await questionCollection.insertMany(normalizedQuestions);
                    console.log(`  ✓ Inserted ${normalizedQuestions.length} questions (50 per level)`);
                    totalQuestionsAdded += normalizedQuestions.length;
                }

                // Update assessment duration to 50 minutes
                await assessmentCollection.updateOne(
                    { _id: assessmentId },
                    {
                        $set: {
                            duration: 50,
                            totalQuestions: 150,
                            updatedAt: new Date()
                        }
                    }
                );
                assessmentsUpdate++;
                console.log(`  Duration updated: 30 → 50 minutes\n`);

            } catch (err) {
                console.log(`  ❌ Error: ${err.message}\n`);
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log(`Seeding complete!`);
        console.log(`Total questions added: ${totalQuestionsAdded}`);
        console.log(`Assessments updated: ${assessmentsUpdate}`);
        console.log('═'.repeat(60));

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedQuestionsAndNormalize();
