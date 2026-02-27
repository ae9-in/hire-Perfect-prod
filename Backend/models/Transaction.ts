import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    purchase: mongoose.Types.ObjectId;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number;
    currency: string;
    status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
    method?: string;
    email?: string;
    contact?: string;
    errorCode?: string;
    errorDescription?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        purchase: {
            type: Schema.Types.ObjectId,
            ref: 'Purchase',
            required: [true, 'Purchase reference is required'],
        },
        razorpayOrderId: {
            type: String,
            required: [true, 'Razorpay Order ID is required'],
            unique: true,
        },
        razorpayPaymentId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
        },
        currency: {
            type: String,
            default: 'INR',
        },
        status: {
            type: String,
            enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
            default: 'created',
        },
        method: {
            type: String,
        },
        email: {
            type: String,
        },
        contact: {
            type: String,
        },
        errorCode: {
            type: String,
        },
        errorDescription: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
TransactionSchema.index({ user: 1 });
TransactionSchema.index({ status: 1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;

