import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { createOrder } from '@/lib/razorpay';
import { authMiddleware } from '@/middleware/auth';
import Purchase from '@/models/Purchase';
import Transaction from '@/models/Transaction';
import Category from '@/models/Category';
import Assessment from '@/models/Assessment';
import { PRICING } from '@/lib/constants';

type SelectedCategory = {
    _id: { toString(): string };
    name: string;
    slug?: string;
};

type SelectedAssessment = {
    _id: { toString(): string };
    title: string;
    slug?: string;
    category?: SelectedCategory | null;
};

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
        let selectedCategory: SelectedCategory | null = null;
        let selectedAssessment: SelectedAssessment | null = null;

        if (!resolvedCategoryId && categorySlug) {
            const cat = await Category.findOne({ slug: categorySlug }).select('_id name slug');
            if (!cat) {
                return NextResponse.json({ error: `Category '${categorySlug}' not found` }, { status: 400 });
            }
            resolvedCategoryId = cat._id;
            selectedCategory = cat;
        }

        if (purchaseType === 'individual') {
            if (!assessmentId) {
                return NextResponse.json({ error: 'Assessment is required for an individual purchase' }, { status: 400 });
            }

            selectedAssessment = await Assessment.findById(assessmentId)
                .populate('category', 'name slug')
                .select('_id title slug category');

            if (!selectedAssessment) {
                return NextResponse.json({ error: 'Selected assessment was not found' }, { status: 404 });
            }
        }

        if (purchaseType === 'category') {
            if (!resolvedCategoryId) {
                return NextResponse.json({ error: 'Category is required for a category purchase' }, { status: 400 });
            }

            if (!selectedCategory) {
                selectedCategory = await Category.findById(resolvedCategoryId).select('_id name slug');
            }

            if (!selectedCategory) {
                return NextResponse.json({ error: 'Selected category was not found' }, { status: 404 });
            }
        }

        // Create purchase record
        const purchase = await Purchase.create({
            user: authResult.user.userId,
            purchaseType,
            assessment: selectedAssessment?._id || undefined,
            category: resolvedCategoryId || undefined,
            assessmentSnapshot: selectedAssessment
                ? {
                    title: selectedAssessment.title,
                    slug: selectedAssessment.slug,
                    categoryName: selectedAssessment.category?.name,
                    categorySlug: selectedAssessment.category?.slug,
                }
                : undefined,
            categorySnapshot: selectedCategory
                ? {
                    name: selectedCategory.name,
                    slug: selectedCategory.slug,
                }
                : undefined,
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
