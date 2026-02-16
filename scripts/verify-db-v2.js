const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

async function run() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        dotenv.config({ path: envPath });

        if (!process.env.MONGODB_URI) {
            console.log('Error: MONGODB_URI not found in .env.local');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', new mongoose.Schema({ isActive: Boolean }));
        const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({ isActive: Boolean }));
        const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({}));

        const aCount = await Assessment.countDocuments({});
        const aActive = await Assessment.countDocuments({ isActive: true });
        const cCount = await Category.countDocuments({});
        const qCount = await Question.countDocuments({});

        console.log('--- DB SUMMARY ---');
        console.log('Total Assessments:', aCount);
        console.log('Active Assessments:', aActive);
        console.log('Total Categories:', cCount);
        console.log('Total Questions:', qCount);

        if (aCount > 0) {
            const sample = await mongoose.connection.db.collection('assessments').findOne({});
            console.log('Sample Assessment:', JSON.stringify(sample, null, 2));
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
