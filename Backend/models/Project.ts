import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    techStack: string[];
    githubLink: string;
    liveLink: string;
    screenshots: string[]; // URLs
    rating: number | null; // 1-10 from admin
    feedback: string;
    status: 'submitted' | 'under_review' | 'reviewed';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        techStack: [{ type: String, trim: true }],
        githubLink: { type: String, required: true, trim: true },
        liveLink: { type: String, default: '', trim: true },
        screenshots: [{ type: String }],
        rating: { type: Number, min: 1, max: 10, default: null },
        feedback: { type: String, default: '' },
        status: {
            type: String,
            enum: ['submitted', 'under_review', 'reviewed'],
            default: 'submitted',
        },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
    },
    { timestamps: true }
);

ProjectSchema.index({ userId: 1 });
ProjectSchema.index({ status: 1 });

const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
