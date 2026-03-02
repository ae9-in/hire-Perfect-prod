import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { createOrder } from '@/lib/razorpay';
import { authMiddleware } from '@/middleware/auth';
import Purchase from '@/models/Purchase';
import Transaction from '@/models/Transaction';
import Category from '@/models/Category';
import Assessment from '@/models/Assessment';
import { PRICING } from '@/lib/constants';

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const authResult = await authMiddleware(request);
        if (!authResult.authorized || !authResult.user) {
            return authResult.response!;
        }

        await connectDB();

        const body = await request.json();
        const { purchaseType, assessmentId, categoryId, categorySlug } = body;

        // Determine amount based on purchase type
        let amount = 0;
        if (purchaseType === 'individual') {
            amount = PRICING.INDIVIDUAL_ASSESSMENT;
        } else if (purchaseType === 'category') {
            amount = PRICING.CATEGORY_COMBO;
        } else if (purchaseType === 'bundle') {
            amount = PRICING.FULL_BUNDLE;
        } else {
            return NextResponse.json(
                { error: 'Invalid purchase type' },
                { status: 400 }
            );
        }

        // Resolve category: accept either an ObjectId or a slug
        let resolvedCategoryId = categoryId;
        if (!resolvedCategoryId && categorySlug) {
            const cat = await Category.findOne({ slug: categorySlug }).select('_id');
            if (!cat) {
                return NextResponse.json({ error: `Category '${categorySlug}' not found` }, { status: 400 });
            }
            resolvedCategoryId = cat._id;
        }

        // Create purchase record
        const purchase = await Purchase.create({
            user: authResult.user.userId,
            purchaseType,
            assessment: assessmentId || undefined,
            category: resolvedCategoryId || undefined,
            amount,
            currency: 'INR',
            paymentId: 'pending',
            orderId: 'pending',
            status: 'pending',
        });

        // Create Razorpay order
        const orderResult = await createOrder({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `purchase_${purchase._id}`,
            notes: {
                purchaseId: purchase._id.toString(),
                userId: authResult.user.userId,
                purchaseType,
            },
        });

        if (!orderResult.success || !orderResult.order) {
            return NextResponse.json(
                { error: 'Failed to create payment order' },
                { status: 500 }
            );
        }

        // Update purchase with order ID
        purchase.orderId = orderResult.order.id;
        await purchase.save();

        // Create transaction record
        await Transaction.create({
            user: authResult.user.userId,
            purchase: purchase._id,
            razorpayOrderId: orderResult.order.id,
            amount,
            currency: 'INR',
            status: 'created',
        });

        return NextResponse.json({
            success: true,
            orderId: orderResult.order.id,
            amount,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error: any) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
