import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://shikhar5775_db_user:h3iOwnl8JJKEMtRj@backend-data.b2xwfqj.mongodb.net/hireperfect?retryWrites=true&w=majority&appName=backend-data';

async function createAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('hireperfectAdmin!2026', salt);

        // Raw MongoDB collection access to avoid TS model imports
        const db = mongoose.connection.db;
        const usersCol = db.collection('users');

        const newAdmin = {
            email: 'admin_sys@hireperfect.com',
            password: hashedPassword,
            name: 'System Administrator',
            role: 'admin',
            provider: 'local',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await usersCol.updateOne(
            { email: newAdmin.email },
            { $set: newAdmin },
            { upsert: true }
        );

        console.log('Admin user created successfully!', result);
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
}

createAdmin();
