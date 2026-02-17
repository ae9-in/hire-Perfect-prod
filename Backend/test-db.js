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
            uri = parts.join('='); // Rejoin value parts
            break;
        }
    }
} catch (err) {
    console.error("❌ Error reading .env.local:", err.message);
    process.exit(1);
}

if (!uri) {
    console.error("❌ Error: MONGODB_URI not found in .env.local");
    process.exit(1);
}

// Mask password for logging
const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
console.log(`\nTesting connection to: ${maskedUri}\n`);

async function testConnection() {
    try {
        console.log("⏳ Attempting to connect...");
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4 // Force IPv4
        });
        console.log("✅ SUCCESS! Connected to MongoDB successfully.");
        process.exit(0);
    } catch (err) {
        console.error("\n❌ CONNECTION FAILED");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);

        if (err.message.includes('bad auth')) {
            console.log("\n💡 TIP: Check your username and password.");
        } else if (err.message.includes('whitelisted')) {
            console.log("\n💡 TIP: Double check your IP Whitelist in MongoDB Atlas.");
        } else if (err.message.includes('ECONNREFUSED')) {
            console.log("\n💡 TIP: Your network might be blocking port 27017.");
        }

        process.exit(1);
    }
}

testConnection();
