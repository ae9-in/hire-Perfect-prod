const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let uri = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        if (line.trim().startsWith('MONGODB_URI=')) {
            const parts = line.trim().split('=');
            parts.shift(); // Remove key
            uri = parts.join('=');
            break;
        }
    }
} catch (err) {
    fs.writeFileSync('db_status.txt', `Error reading .env: ${err.message}`);
    process.exit(1);
}

if (!uri) {
    fs.writeFileSync('db_status.txt', 'Error: MONGODB_URI not found');
    process.exit(1);
}

// Ensure the URI has the database name
if (!uri.includes('/hireperfect?')) {
    // If it lacks DB name but has query params
    if (uri.includes('?')) {
        uri = uri.replace('?', '/hireperfect?');
    } else {
        uri = uri + '/hireperfect';
    }
}

async function check() {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 });

        const admin = mongoose.connection.db.admin();
        const dbName = mongoose.connection.db.databaseName;
        const dbs = await admin.listDatabases();

        let found = false;
        const dbList = dbs.databases.map(d => {
            if (d.name === dbName) found = true;
            return d.name;
        });

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        const colList = collections.map(c => c.name);

        const status = `
Database: ${dbName}
Exists in Cluster: ${found}
Cluster DBs: ${dbList.join(', ')}
Collections: ${colList.join(', ')}
Timestamp: ${new Date().toISOString()}
SUCCESS_FLAG
        `;

        fs.writeFileSync('db_status.txt', status);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('db_status.txt', `Connection Error: ${err.message}\nName: ${err.name}`);
        process.exit(1);
    }
}

check();
