import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    action: string;
    description: string;
    actor: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    metadata?: any;
    severity: 'info' | 'warning' | 'critical';
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        action: {
            type: String,
            required: [true, 'Action is required'],
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        actor: {
            id: { type: String, required: true },
            name: { type: String, required: true },
            email: { type: String, required: true },
            role: { type: String, required: true },
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        severity: {
            type: String,
            enum: ['info', 'warning', 'critical'],
            default: 'info',
            index: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// TTL index to automatically remove logs older than 30 days
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
