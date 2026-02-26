import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchase extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    purchaseType: 'individual' | 'category' | 'bundle';
    assessment?: mongoose.Types.ObjectId; // For individual purchase
    category?: mongoose.Types.ObjectId; // For category combo
    amount: number;
    currency: string;
    paymentId: string;
    orderId: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    purchasedAt: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        purchaseType: {
            type: String,
            enum: ['individual', 'category', 'bundle'],
            required: [true, 'Purchase type is required'],
        },
        assessment: {
            type: Schema.Types.ObjectId,
            ref: 'Assessment',
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
        },
        currency: {
            type: String,
            default: 'INR',
        },
        paymentId: {
            type: String,
            required: [true, 'Payment ID is required'],
        },
        orderId: {
            type: String,
            required: [true, 'Order ID is required'],
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        purchasedAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
PurchaseSchema.index({ user: 1, status: 1 });
PurchaseSchema.index({ assessment: 1 });
PurchaseSchema.index({ category: 1 });

const Purchase: Model<IPurchase> = mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);

export default Purchase;

