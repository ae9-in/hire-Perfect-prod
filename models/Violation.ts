import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IViolation extends Document {
    _id: string;
    attempt: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    type: 'face_not_detected' | 'multiple_faces' | 'looking_away' | 'tab_switch' | 'screen_minimize' | 'fullscreen_exit';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
}

const ViolationSchema = new Schema<IViolation>(
    {
        attempt: {
            type: Schema.Types.ObjectId,
            ref: 'Attempt',
            required: [true, 'Attempt reference is required'],
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        type: {
            type: String,
            enum: ['face_not_detected', 'multiple_faces', 'looking_away', 'tab_switch', 'screen_minimize', 'fullscreen_exit'],
            required: [true, 'Violation type is required'],
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        description: {
            type: String,
            required: [true, 'Violation description is required'],
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
ViolationSchema.index({ attempt: 1, timestamp: 1 });
ViolationSchema.index({ user: 1 });
ViolationSchema.index({ type: 1, severity: 1 });

const Violation: Model<IViolation> = mongoose.models.Violation || mongoose.model<IViolation>('Violation', ViolationSchema);

export default Violation;
