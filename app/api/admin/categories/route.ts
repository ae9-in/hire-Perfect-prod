import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Category from '@/models/Category';
import { USER_ROLES } from '@/lib/constants';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const categories = await Category.find({}).sort({ order: 1 });

        return NextResponse.json({
            success: true,
            categories
        });
    } catch (error: any) {
        console.error('Admin categories fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const body = await request.json();
        const subjects = body.subjects || body.assessments || [];
        const category = await Category.create({
            ...body,
            subjects,
        });

        return NextResponse.json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error: any) {
        console.error('Admin category creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
