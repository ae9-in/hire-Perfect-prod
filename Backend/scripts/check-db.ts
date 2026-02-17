// @ts-ignore
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

async function checkDb() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        // Mask password in logs
        console.log('📍 URI:', MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));

        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected successfully!');

        const admin = mongoose.connection.db?.admin();
        const dbName = mongoose.connection.db?.databaseName;

        console.log(`\n📂 Current Database: ${dbName}`);

        if (!admin) {
            console.log('❌ Could not get admin interface');
            return;
        }

        // List all databases
        const dbs = await admin.listDatabases();
        console.log('\n🗄️  Available Databases in Cluster:');
        dbs.databases.forEach((db: any) => {
            console.log(`   - ${db.name} ${db.name === dbName ? '(Current)' : ''}`);
        });

        // List collections in current DB
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log(`\nCcc  Collections in '${dbName}':`);
        if (collections && collections.length > 0) {
            collections.forEach((col) => {
                console.log(`   - ${col.name}`);
            });
        } else {
            console.log('   (No collections found - DB might not exist effectively yet)');
        }

        console.log('\n✨ Check complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking DB:', error);
        process.exit(1);
    }
}

checkDb();
