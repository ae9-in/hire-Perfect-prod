import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttempt extends Document {
    user: mongoose.Types.ObjectId;
    assessment: mongoose.Types.ObjectId;
    status: 'in_progress' | 'completed' | 'terminated';
    answers: Array<{
        question: mongoose.Types.ObjectId;
        answer: string | number;
        isCorrect?: boolean;
        points?: number;
    }>;
    score: number;
    percentage: number;
    totalQuestions: number;
    correctAnswers: number;
    startedAt: Date;
    completedAt?: Date;
    timeSpent: number; // in seconds
    violationCount: number;
    violations: mongoose.Types.ObjectId[];
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AttemptSchema = new Schema<IAttempt>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        assessment: {
            type: Schema.Types.ObjectId,
            ref: 'Assessment',
            required: [true, 'Assessment reference is required'],
        },
        status: {
            type: String,
            enum: ['in_progress', 'completed', 'terminated'],
            default: 'in_progress',
        },
        answers: [
            {
                question: {
                    type: Schema.Types.ObjectId,
                    ref: 'Question',
                },
                answer: Schema.Types.Mixed,
                isCorrect: Boolean,
                points: Number,
            },
        ],
        score: {
            type: Number,
            default: 0,
        },
        percentage: {
            type: Number,
            default: 0,
        },
        totalQuestions: {
            type: Number,
            default: 0,
        },
        correctAnswers: {
            type: Number,
            default: 0,
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
        },
        timeSpent: {
            type: Number,
            default: 0,
        },
        violationCount: {
            type: Number,
            default: 0,
        },
        violations: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Violation',
            },
        ],
        ipAddress: String,
        userAgent: String,
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
AttemptSchema.index({ user: 1, assessment: 1 });
AttemptSchema.index({ status: 1 });

const Attempt: Model<IAttempt> = mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);

export default Attempt;
