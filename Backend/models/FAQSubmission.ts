import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFAQSubmission extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'reviewed' | 'resolved';
    createdAt: Date;
    updatedAt: Date;
}

const FAQSubmissionSchema = new Schema<IFAQSubmission>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            maxlength: [160, 'Email cannot exceed 160 characters'],
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
            maxlength: [150, 'Subject cannot exceed 150 characters'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            maxlength: [2000, 'Message cannot exceed 2000 characters'],
        },
        status: {
            type: String,
            enum: ['new', 'reviewed', 'resolved'],
            default: 'new',
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

FAQSubmissionSchema.index({ createdAt: -1 });
FAQSubmissionSchema.index({ email: 1 });

const FAQSubmission: Model<IFAQSubmission> =
    mongoose.models.FAQSubmission || mongoose.model<IFAQSubmission>('FAQSubmission', FAQSubmissionSchema);

export default FAQSubmission;
