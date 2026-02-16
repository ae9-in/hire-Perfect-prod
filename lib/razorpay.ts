import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export interface CreateOrderParams {
    amount: number; // in paise (₹500 = 50000 paise)
    currency?: string;
    receipt?: string;
    notes?: Record<string, any>;
}

// Create Razorpay order
export async function createOrder(params: CreateOrderParams) {
    try {
        const order = await razorpay.orders.create({
            amount: params.amount,
            currency: params.currency || 'INR',
            receipt: params.receipt || `receipt_${Date.now()}`,
            notes: params.notes || {},
        });

        return { success: true, order };
    } catch (error: any) {
        console.error('Razorpay order creation error:', error);
        return { success: false, error: error.message };
    }
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    try {
        const text = `${orderId}|${paymentId}`;
        const secret = process.env.RAZORPAY_KEY_SECRET || '';

        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(text)
            .digest('hex');

        return generatedSignature === signature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

// Fetch payment details
export async function getPaymentDetails(paymentId: string) {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return { success: true, payment };
    } catch (error: any) {
        console.error('Razorpay payment fetch error:', error);
        return { success: false, error: error.message };
    }
}

export default razorpay;
