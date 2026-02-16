import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Assessment from '@/models/Assessment';

export async function GET() {
    try {
        await connectDB();
        const count = await Assessment.countDocuments({});
        const activeCount = await Assessment.countDocuments({ isActive: true });
        const samples = await Assessment.find({}).limit(2).populate('category', 'name');

        return NextResponse.json({
            success: true,
            total: count,
            active: activeCount,
            samples
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
