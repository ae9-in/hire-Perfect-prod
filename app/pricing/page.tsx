'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import PaymentModal from '@/components/ui/PaymentModal';
import { PRICING, CATEGORIES } from '@/lib/constants';
import type { PurchaseType } from '@/components/ui/PaymentModal';

// ─── Plan Data ───────────────────────────────────────────────────────────────

const PLANS = [
    {
        id: 'individual' as PurchaseType,
        label: 'Individual Test',
        price: PRICING.INDIVIDUAL_ASSESSMENT,
        unit: 'per assessment',
        tagline: 'Try before you commit.',
        description: 'Access a single assessment of your choice with full AI proctoring, instant scoring, and a lifetime result report.',
        features: [
            'One assessment — any topic',
            'AI proctoring (face + gaze tracking)',
            'Instant MCQ scoring engine',
            'Lifetime result access',
            'Downloadable result certificate',
        ],
        cta: 'Get Started',
        featured: false,
        accentColor: 'cyan',
        badge: null,
    },
    {
        id: 'category' as PurchaseType,
        label: 'Category Combo',
        price: PRICING.CATEGORY_COMBO,
        unit: 'per category',
        tagline: 'Master an entire domain.',
        description: 'Unlock all 12 assessments within a single category. Best for recruiters evaluating a specific skill domain.',
        features: [
            '12 assessments in one category',
            'All levels — beginner to expert',
            'Team shareable result dashboard',
            'Category performance analytics',
            'Priority result processing',
            'Category completion certificate',
        ],
        cta: 'Choose Category',
        featured: true,
        accentColor: 'purple',
        badge: 'Most Popular',
    },
    {
        id: 'bundle' as PurchaseType,
        label: 'Full Bundle',
        price: PRICING.FULL_BUNDLE,
        unit: 'all 240 assessments',
        tagline: 'The complete hiring suite.',
        description: 'Unlimited access to all 240 assessments across all 20 categories. Built for teams running large-scale hiring.',
        features: [
            'All 240 assessments unlocked',
            '20 categories — full coverage',
            'Admin dashboard access',
            'Bulk candidate evaluation',
            'API access for integrations',
            'Dedicated support channel',
            'Annual analytics reports',
        ],
        cta: 'Get Full Access',
        featured: false,
        accentColor: 'emerald',
        badge: 'Best Value',
    },
] as const;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PricingPage() {
    const router = useRouter();
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PurchaseType>('individual');
    const [billingCycle] = useState<'one-time'>('one-time');

    const handleSelectPlan = (planId: PurchaseType) => {
        setSelectedPlan(planId);
        setPaymentOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#020205] text-white bg-grid selection:bg-cyan-500/30 selection:text-cyan-200">
            <Navbar />

            {/* Background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-cyan-500/8 blur-[140px] rounded-full" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-purple-500/8 blur-[120px] rounded-full" />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] bg-indigo-500/5 blur-[100px] rounded-full" />
            </div>

            <main className="page-container px-6 pt-32 pb-24">

                {/* ─── Hero ─────────────────────────────────────────────────── */}
                <section className="text-center mb-24 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/25 mb-8 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-black text-cyan-400 tracking-[0.32em] uppercase">Transparent Pricing</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-6 uppercase">
                        SIMPLE.<br />
                        <span className="text-gradient">POWERFUL.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        One-time access — no subscriptions, no hidden fees.
                        Unlock the exact assessments your hiring pipeline demands.
                    </p>
                </section>

                {/* ─── Stats strip ──────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20">
                    {[
                        { value: '240+', label: 'Assessments' },
                        { value: '20', label: 'Categories' },
                        { value: '0', label: 'Hidden Fees' },
                        { value: '1×', label: 'Pay Once' },
                    ].map((s) => (
                        <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-center">
                            <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em]">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ─── Pricing Cards ────────────────────────────────────────── */}
                <section className="max-w-6xl mx-auto mb-24">
                    <div className="grid md:grid-cols-3 gap-6 items-start">
                        {PLANS.map((plan) => {
                            const isCyan = plan.accentColor === 'cyan';
                            const isPurple = plan.accentColor === 'purple';
                            const isEmerald = plan.accentColor === 'emerald';

                            const borderClass = plan.featured
                                ? 'border-purple-500/30'
                                : isCyan
                                    ? 'border-cyan-500/15'
                                    : 'border-emerald-500/15';

                            const accentTextClass = isCyan
                                ? 'text-cyan-400'
                                : isPurple
                                    ? 'text-purple-400'
                                    : 'text-emerald-400';

                            const accentBgClass = isCyan
                                ? 'bg-cyan-500/10'
                                : isPurple
                                    ? 'bg-purple-500/10'
                                    : 'bg-emerald-500/10';

                            const buttonClass = plan.featured
                                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-2xl shadow-purple-500/20 hover:from-purple-500 hover:to-cyan-500'
                                : isCyan
                                    ? 'bg-cyan-600 text-black hover:bg-cyan-500 shadow-cyan-500/20'
                                    : 'bg-emerald-600 text-black hover:bg-emerald-500 shadow-emerald-500/20';

                            return (
                                <div key={plan.id} className={`relative group ${plan.featured ? 'md:-mt-4 md:mb-4' : ''}`}>
                                    {/* Glow on featured */}
                                    {plan.featured && (
                                        <div className="absolute -inset-px rounded-[2.4rem] bg-gradient-to-b from-purple-500/30 to-cyan-500/20 blur-sm" />
                                    )}

                                    <div className={`relative h-full bg-[#07070f] border ${borderClass} rounded-[2.2rem] p-8 flex flex-col group-hover:border-opacity-60 transition-all duration-500`}>
                                        {/* Badge */}
                                        {plan.badge && (
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${plan.featured
                                                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-purple-500/20'
                                                    : 'bg-emerald-600 text-black shadow-emerald-500/20'
                                                    }`}>
                                                    {plan.badge}
                                                </span>
                                            </div>
                                        )}

                                        {/* Header */}
                                        <div className="mb-6">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.28em] mb-3 block ${accentTextClass}`}>
                                                {plan.tagline}
                                            </span>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">
                                                {plan.label}
                                            </h3>
                                            <p className="text-slate-500 text-sm font-medium leading-relaxed mt-2">
                                                {plan.description}
                                            </p>
                                        </div>

                                        {/* Price */}
                                        <div className={`${accentBgClass} rounded-2xl px-6 py-5 mb-7`}>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-black text-white leading-none">
                                                    ₹{plan.price.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{plan.unit}</p>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-3 mb-8 flex-grow">
                                            {plan.features.map((feat) => (
                                                <li key={feat} className="flex items-start gap-3">
                                                    <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${accentTextClass}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-slate-300 text-sm font-medium leading-snug">{feat}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA */}
                                        <button
                                            onClick={() => handleSelectPlan(plan.id)}
                                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-lg ${buttonClass}`}
                                        >
                                            {plan.cta}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ─── Trust Strip ──────────────────────────────────────────── */}
                <section className="max-w-4xl mx-auto mb-20">
                    <div className="rounded-[2rem] border border-white/8 bg-white/[0.02] p-8 grid md:grid-cols-3 gap-6 text-center">
                        {[
                            { icon: '🔒', title: '256-bit SSL Encryption', desc: 'All transactions secured with bank-grade encryption.' },
                            { icon: '⚡', title: 'Powered by Razorpay', desc: 'India\'s most trusted payment gateway, PCI DSS Level 1.' },
                            { icon: '🛡️', title: 'Zero-fraud Guarantee', desc: 'HMAC signature verification on every transaction.' },
                        ].map((trust) => (
                            <div key={trust.title}>
                                <div className="text-3xl mb-3">{trust.icon}</div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{trust.title}</h4>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">{trust.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── FAQ ──────────────────────────────────────────────────── */}
                <section className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter text-center mb-10">
                        Common <span className="text-gradient">Questions</span>
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: 'Is this a recurring subscription?',
                                a: 'No. All plans are one-time payments. You pay once and get access forever — no monthly charges.',
                            },
                            {
                                q: 'What payment methods are accepted?',
                                a: 'We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI, net banking, and popular wallets via Razorpay.',
                            },
                            {
                                q: 'Can I get a refund?',
                                a: 'If you haven\'t taken the assessment yet, reach out within 24 hours of purchase for a full refund.',
                            },
                            {
                                q: 'Is my data safe?',
                                a: 'All payments are processed by Razorpay (PCI DSS Level 1). We never store your card details.',
                            },
                            {
                                q: 'Can I buy access for my whole team?',
                                a: 'The Full Bundle is best for teams. Contact us for enterprise bulk pricing.',
                            },
                        ].map((faq) => (
                            <div key={faq.q} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
                                <h4 className="font-black text-white text-sm uppercase tracking-tight mb-2">{faq.q}</h4>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── Bottom CTA ───────────────────────────────────────────── */}
                <section className="text-center mt-24">
                    <div className="inline-block rounded-[2.5rem] border border-white/8 bg-white/[0.02] px-12 py-10">
                        <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.35em] mb-3">Still unsure?</p>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Try a free assessment first</h3>
                        <p className="text-slate-400 font-medium mb-6 max-w-sm mx-auto">Sign up and access our sample track before committing to a paid plan.</p>
                        <Link href="/assessments">
                            <button className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-black uppercase tracking-widest text-sm shadow-2xl shadow-cyan-500/20 hover:from-cyan-500 hover:to-cyan-400 transition-all">
                                Browse Assessments
                            </button>
                        </Link>
                    </div>
                </section>

            </main>

            {/* Razorpay Payment Modal */}
            <PaymentModal
                isOpen={paymentOpen}
                onClose={() => setPaymentOpen(false)}
                defaultPlan={selectedPlan}
                onSuccess={() => {
                    setPaymentOpen(false);
                    router.push('/my-assessments');
                }}
            />
        </div>
    );
}
