const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const db = mongoose.connection.db;
        const assessments = await db.collection('assessments').countDocuments();
        const categories = await db.collection('categories').countDocuments();
        const questions = await db.collection('questions').countDocuments();

        console.log('--- STATS ---');
        console.log('Assessments:', assessments);
        console.log('Categories:', categories);
        console.log('Questions:', questions);

        if (assessments > 0) {
            const sample = await db.collection('assessments').findOne({});
            console.log('Sample Assessment Title:', sample.title);
            console.log('Sample Assessment isActive:', sample.isActive);
        }

        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
}

check();
