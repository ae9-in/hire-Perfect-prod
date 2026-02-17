import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssessment extends Document {
    title: string;
    slug: string;
    description: string;
    category: mongoose.Types.ObjectId;
    duration: number; // in minutes
    price: number;
    totalQuestions: number;
    passingScore: number;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
    {
        title: {
            type: String,
            required: [true, 'Assessment title is required'],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, 'Assessment slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Assessment description is required'],
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        duration: {
            type: Number,
            default: 30, // 30 minutes
        },
        price: {
            type: Number,
            default: 500,
        },
        totalQuestions: {
            type: Number,
            default: 20,
        },
        passingScore: {
            type: Number,
            default: 60, // 60%
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        tags: [String],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
AssessmentSchema.index({ category: 1, isActive: 1 });
AssessmentSchema.index({ slug: 1 });

const Assessment: Model<IAssessment> = mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);

export default Assessment;
