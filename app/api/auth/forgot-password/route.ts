import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateResetToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists or not for security
            return NextResponse.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent',
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // TODO: Send email with reset link
        // For now, we'll return the token (in production, send via email)
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

        console.log('Password reset link:', resetLink);

        return NextResponse.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent',
            // Remove this in production - only for development
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
        });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
