import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Assessment from '@/models/Assessment';
import { USER_ROLES } from '@/lib/constants';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const assessments = await Assessment.find({}).populate('category', 'name').sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            assessments
        });
    } catch (error: any) {
        console.error('Admin assessments fetch error:', error);
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
        const assessment = await Assessment.create(body);

        return NextResponse.json({
            success: true,
            message: 'Assessment created successfully',
            assessment
        });
    } catch (error: any) {
        console.error('Admin assessment creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
        }

        const assessment = await Assessment.findByIdAndUpdate(id, updateData, { new: true });

        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Assessment updated successfully',
            assessment
        });
    } catch (error: any) {
        console.error('Admin assessment update error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
        }

        const assessment = await Assessment.findByIdAndDelete(id);

        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Assessment deleted successfully'
        });
    } catch (error: any) {
        console.error('Admin assessment delete error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
