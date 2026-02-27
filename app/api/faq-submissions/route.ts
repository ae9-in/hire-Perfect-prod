import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FAQSubmission from '@/models/FAQSubmission';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const name = String(body?.name || '').trim();
        const email = String(body?.email || '').trim().toLowerCase();
        const subject = String(body?.subject || '').trim();
        const message = String(body?.message || '').trim();

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
        }

        if (message.length < 10) {
            return NextResponse.json({ error: 'Message should be at least 10 characters long' }, { status: 400 });
        }

        await connectDB();

        const submission = await FAQSubmission.create({
            name,
            email,
            subject,
            message,
            status: 'new',
        });

        return NextResponse.json({
            success: true,
            message: 'Your query has been submitted successfully',
            submissionId: submission._id,
        });
    } catch (error: any) {
        console.error('FAQ submission error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
