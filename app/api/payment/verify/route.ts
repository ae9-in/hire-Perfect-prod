import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { authMiddleware } from '@/middleware/auth';
import Purchase from '@/models/Purchase';
import Transaction from '@/models/Transaction';

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || !authResult.user) {
            return authResult.response!;
        }

        await connectDB();

        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment verification parameters' },
                { status: 400 }
            );
        }

        // Verify signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Update transaction
        const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });
        if (transaction) {
            transaction.razorpayPaymentId = razorpay_payment_id;
            transaction.razorpaySignature = razorpay_signature;
            transaction.status = 'captured';
            await transaction.save();
        }

        // Update purchase
        const purchase = await Purchase.findOne({ orderId: razorpay_order_id });
        if (purchase) {
            purchase.paymentId = razorpay_payment_id;
            purchase.status = 'completed';
            purchase.purchasedAt = new Date();
            await purchase.save();
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            purchase: {
                id: purchase?._id,
                type: purchase?.purchaseType,
                amount: purchase?.amount,
            },
        });
    } catch (error: any) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
