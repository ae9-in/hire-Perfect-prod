import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICodingChallenge extends Document {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    constraints: string;
    examples: { input: string; output: string; explanation?: string }[];
    starterCode: Record<string, string>; // { javascript: '...', python: '...' }
    tags: string[];
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CodingChallengeSchema = new Schema<ICodingChallenge>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
        constraints: { type: String, default: '' },
        examples: [
            {
                input: { type: String, required: true },
                output: { type: String, required: true },
                explanation: { type: String },
            },
        ],
        starterCode: { type: Schema.Types.Mixed, default: {} },
        tags: [{ type: String }],
        isActive: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

CodingChallengeSchema.index({ isActive: 1, difficulty: 1 });
CodingChallengeSchema.index({ createdBy: 1 });

const CodingChallenge: Model<ICodingChallenge> =
    mongoose.models.CodingChallenge ||
    mongoose.model<ICodingChallenge>('CodingChallenge', CodingChallengeSchema);

export default CodingChallenge;
