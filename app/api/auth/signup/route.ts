import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password, name, role, phone, adminSecret } = body;

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, password, and name are required' },
                { status: 400 }
            );
        }

        // Admin Security Check
        if (role === 'admin') {
            const systemAdminSecret = process.env.ADMIN_SIGNUP_SECRET;
            if (!systemAdminSecret || adminSecret !== systemAdminSecret) {
                return NextResponse.json(
                    { error: 'Unauthorized: Invalid Admin Secret' },
                    { status: 403 }
                );
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Create new user
        const user = await User.create({
            email: email.toLowerCase(),
            password,
            name,
            role: role || 'candidate',
            phone,
            provider: 'local',
        });

        // Generate token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
