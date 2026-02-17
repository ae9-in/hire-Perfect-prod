// Test Prisma connection
import prisma from './lib/prisma';

async function testConnection() {
    try {
        console.log('Testing Prisma connection...');
        await prisma.$connect();
        console.log('✅ Successfully connected to database!');

        // Try a simple query
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Query test successful:', result);

        await prisma.$disconnect();
        console.log('✅ Disconnected successfully');
    } catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    }
}

testConnection();
