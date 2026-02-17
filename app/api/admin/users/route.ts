import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import User from '@/models/User';
import { USER_ROLES } from '@/lib/constants';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('query') || '';
        const role = searchParams.get('role');

        let filter: any = {};
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }
        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            users
        });
    } catch (error: any) {
        console.error('Admin users fetch error:', error);
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
        const { userId, role, status } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (role) updateData.role = role;
        if (status) updateData.status = status;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error: any) {
        console.error('Admin user update error:', error);
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
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Prevent admin from deleting themselves
        if (userId === authResult.user.userId) {
            return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error: any) {
        console.error('Admin user delete error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
