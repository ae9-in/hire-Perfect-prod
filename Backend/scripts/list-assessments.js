/**
 * List all assessment titles in the database
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
}

async function listAssessments() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const assessmentCollection = db.collection('assessments');

        const assessments = await assessmentCollection
            .find({ isActive: true })
            .sort({ title: 1 })
            .toArray();

        console.log(`Found ${assessments.length} active assessments:\n`);

        for (const assessment of assessments.slice(0, 30)) {
            console.log(`- "${assessment.title}"`);
        }

        if (assessments.length > 30) {
            console.log(`\n... and ${assessments.length - 30} more`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listAssessments();
