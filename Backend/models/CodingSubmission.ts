import mongoose, { Schema, Document, Model } from 'mongoose';

export type SubmissionStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_improvement';

export interface ICodingSubmission extends Document {
    userId: mongoose.Types.ObjectId;
    challengeId: mongoose.Types.ObjectId;
    code: string;
    language: 'javascript' | 'python' | 'java' | 'cpp' | 'typescript';
    explanation: string;
    score: number | null;
    feedback: string;
    status: SubmissionStatus;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CodingSubmissionSchema = new Schema<ICodingSubmission>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        challengeId: { type: Schema.Types.ObjectId, ref: 'CodingChallenge', required: true },
        code: { type: String, required: true },
        language: {
            type: String,
            enum: ['javascript', 'python', 'java', 'cpp', 'typescript'],
            required: true,
        },
        explanation: { type: String, required: true, minlength: 10 },
        score: { type: Number, min: 0, max: 100, default: null },
        feedback: { type: String, default: '' },
        status: {
            type: String,
            enum: ['pending', 'under_review', 'approved', 'rejected', 'needs_improvement'],
            default: 'pending',
        },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
    },
    { timestamps: true }
);

CodingSubmissionSchema.index({ userId: 1, challengeId: 1 });
CodingSubmissionSchema.index({ status: 1 });
CodingSubmissionSchema.index({ challengeId: 1, status: 1 });

// Prevent duplicate active submission (one per user per challenge)
CodingSubmissionSchema.index(
    { userId: 1, challengeId: 1 },
    { unique: false } // allow re-submissions
);

const CodingSubmission: Model<ICodingSubmission> =
    mongoose.models.CodingSubmission ||
    mongoose.model<ICodingSubmission>('CodingSubmission', CodingSubmissionSchema);

export default CodingSubmission;
