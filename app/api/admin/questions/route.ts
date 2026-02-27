import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Question from '@/models/Question';
import Assessment from '@/models/Assessment';
import { USER_ROLES } from '@/lib/constants';
import { isValidObjectId, validateQuestionPayload } from '@/lib/questionValidation';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const assessmentId = searchParams.get('assessmentId');

        if (!assessmentId) {
            return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
        }

        if (!isValidObjectId(assessmentId)) {
            return NextResponse.json({ error: 'Invalid assessment ID' }, { status: 400 });
        }

        const questions = await Question.find({ assessment: assessmentId }).sort({ createdAt: 1 });

        return NextResponse.json({
            success: true,
            questions
        });
    } catch (error: any) {
        console.error('Admin questions fetch error:', error);
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
        const { assessmentId, ...questionData } = body;

        if (!assessmentId) {
            return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
        }

        if (!isValidObjectId(assessmentId)) {
            return NextResponse.json({ error: 'Invalid assessment ID' }, { status: 400 });
        }

        const assessment = await Assessment.findById(assessmentId).select('_id');
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        const { value, errors } = validateQuestionPayload({
            ...questionData,
            assessmentId,
        });
        if (errors.length > 0 || !value) {
            return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
        }

        const duplicate = await Question.findOne({
            assessment: assessmentId,
            normalizedQuestion: value.normalizedQuestion,
        }).select('_id');

        if (duplicate) {
            return NextResponse.json({ error: 'Duplicate question exists for this assessment' }, { status: 409 });
        }

        const question = await Question.create({
            ...value,
            assessment: assessmentId,
        });

        // Update totalQuestions in Assessment
        await Assessment.findByIdAndUpdate(assessmentId, { $inc: { totalQuestions: 1 } });

        return NextResponse.json({
            success: true,
            message: 'Question added successfully',
            question
        });
    } catch (error: any) {
        console.error('Admin question creation error:', error);
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
            return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
        }

        if (!isValidObjectId(id)) {
            return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
        }

        const existingQuestion = await Question.findById(id).select('assessment type');
        if (!existingQuestion) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        const { value, errors } = validateQuestionPayload({
            ...existingQuestion.toObject(),
            ...updateData,
            assessmentId: existingQuestion.assessment.toString(),
        });
        if (errors.length > 0 || !value) {
            return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
        }

        const duplicate = await Question.findOne({
            assessment: existingQuestion.assessment,
            normalizedQuestion: value.normalizedQuestion,
            _id: { $ne: id },
        }).select('_id');
        if (duplicate) {
            return NextResponse.json({ error: 'Duplicate question exists for this assessment' }, { status: 409 });
        }

        const question = await Question.findByIdAndUpdate(
            id,
            {
                ...value,
                assessment: existingQuestion.assessment,
            },
            { new: true, runValidators: true, context: 'query' }
        );

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Question updated successfully',
            question
        });
    } catch (error: any) {
        console.error('Admin question update error:', error);
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
            return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
        }

        const question = await Question.findByIdAndDelete(id);

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        // Decrement totalQuestions in Assessment
        await Assessment.findByIdAndUpdate(question.assessment, { $inc: { totalQuestions: -1 } });

        return NextResponse.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error: any) {
        console.error('Admin question delete error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
