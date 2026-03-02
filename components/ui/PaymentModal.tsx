'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING, CATEGORIES } from '@/lib/constants';

// ─── Types ───────────────────────────────────────────────────────────────────
export type PurchaseType = 'individual' | 'category' | 'bundle';

interface AssessmentOption {
    _id: string;
    title: string;
    price: number;
    duration?: number;
    totalQuestions?: number;
    category?: { _id: string; name: string } | string;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Pre-selected assessment (skips selection step for individual) */
    assessment?: AssessmentOption;
    /** Default plan to pre-select */
    defaultPlan?: PurchaseType;
    onSuccess?: () => void;
}

// ─── Razorpay loader ─────────────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if ((window as any).Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

// ─── Plan config ─────────────────────────────────────────────────────────────
const PLANS = [
    {
        id: 'individual' as PurchaseType,
        label: 'Individual',
        price: PRICING.INDIVIDUAL_ASSESSMENT,
        unit: '/test',
        desc: 'One assessment of your choice, full proctoring, lifetime report.',
        color: 'cyan',
        badge: null,
        needsSelection: true,
        selectionLabel: 'Choose an Assessment',
    },
    {
        id: 'category' as PurchaseType,
        label: 'Category Combo',
        price: PRICING.CATEGORY_COMBO,
        unit: '/cat',
        desc: 'All 12 assessments in one category. Best for targeted hiring.',
        color: 'purple',
        badge: 'Most Popular',
        needsSelection: true,
        selectionLabel: 'Choose a Category',
    },
    {
        id: 'bundle' as PurchaseType,
        label: 'Full Bundle',
        price: PRICING.FULL_BUNDLE,
        unit: '/all',
        desc: 'All 240 assessments across all 20 categories.',
        color: 'emerald',
        badge: 'Best Value',
        needsSelection: false,
        selectionLabel: '',
    },
] as const;

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PaymentModal({
    isOpen,
    onClose,
    assessment,
    defaultPlan = 'individual',
    onSuccess,
}: PaymentModalProps) {
    const router = useRouter();

    // ── state ─────────────────────────────────────────────────────────────────
    const [step, setStep] = useState<1 | 2>(1);          // 1 = select item, 2 = pay
    const [selectedPlan, setSelectedPlan] = useState<PurchaseType>(defaultPlan);
    const [assessmentOptions, setAssessmentOptions] = useState<AssessmentOption[]>([]);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const activePlan = PLANS.find((p) => p.id === selectedPlan)!;

    // ── reset on open ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        setSelectedPlan(defaultPlan);
        setStatus('idle');
        setErrorMsg('');
        setSelectedAssessmentId(assessment?._id || '');
        setSelectedCategorySlug('');

        // If an assessment is pre-provided for Individual, skip to step 2
        if (defaultPlan === 'individual' && assessment) {
            setStep(2);
        } else if (defaultPlan === 'bundle') {
            setStep(2);
        } else {
            setStep(1);
        }
    }, [isOpen, defaultPlan, assessment]);

    // ── fetch assessments for individual selection ────────────────────────────
    useEffect(() => {
        if (!isOpen || selectedPlan !== 'individual' || assessment) return;
        setLoadingOptions(true);
        const token = localStorage.getItem('token');
        fetch('/api/assessments', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    const all: AssessmentOption[] = (data.categories || []).flatMap(
                        (cat: any) => cat.subjects || []
                    );
                    setAssessmentOptions(all.length ? all : data.assessments || []);
                }
            })
            .catch(() => { })
            .finally(() => setLoadingOptions(false));
    }, [isOpen, selectedPlan, assessment]);

    if (!isOpen) return null;

    // ── can we proceed from step 1? ───────────────────────────────────────────
    const step1Valid =
        selectedPlan === 'bundle' ||
        (selectedPlan === 'individual' && (selectedAssessmentId || assessment?._id)) ||
        (selectedPlan === 'category' && selectedCategorySlug);

    // ── summary helpers ───────────────────────────────────────────────────────
    const selectionSummary = () => {
        if (selectedPlan === 'bundle') return 'All 240 assessments · 20 categories';
        if (selectedPlan === 'individual') {
            const a = assessment || assessmentOptions.find((x) => x._id === selectedAssessmentId);
            return a ? a.title : '—';
        }
        if (selectedPlan === 'category') {
            const cat = CATEGORIES.find((c) => c.slug === selectedCategorySlug);
            return cat ? cat.name : '—';
        }
        return '—';
    };

    // ── colour helpers ────────────────────────────────────────────────────────
    const planBorder = (id: PurchaseType) => {
        if (selectedPlan !== id) return 'border-white/10 bg-white/[0.02]';
        const c = PLANS.find((p) => p.id === id)!.color;
        return c === 'cyan'
            ? 'border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
            : c === 'purple'
                ? 'border-purple-500/50 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                : 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
    };
    const accent = (color: string) =>
        color === 'cyan' ? 'text-cyan-400' : color === 'purple' ? 'text-purple-400' : 'text-emerald-400';

    // ── payment handler ───────────────────────────────────────────────────────
    const handlePay = async () => {
        setStatus('loading');
        setErrorMsg('');

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        const loaded = await loadRazorpayScript();
        if (!loaded) {
            setStatus('error');
            setErrorMsg('Failed to load Razorpay. Check your internet connection.');
            return;
        }

        try {
            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    purchaseType: selectedPlan,
                    assessmentId:
                        selectedPlan === 'individual'
                            ? assessment?._id || selectedAssessmentId
                            : undefined,
                    categorySlug:
                        selectedPlan === 'category' ? selectedCategorySlug : undefined,
                }),
            });

            const orderData = await orderRes.json();
            if (!orderData.success) throw new Error(orderData.error || 'Failed to create order');

            const options = {
                key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount * 100,
                currency: 'INR',
                name: 'HirePerfect',
                description: `${activePlan.label} — ${selectionSummary()}`,
                order_id: orderData.orderId,
                prefill: { name: user.name || '', email: user.email || '' },
                theme: { color: '#06b6d4' },
                modal: {
                    ondismiss: () => { if (status === 'loading') setStatus('idle'); },
                },
                handler: async (resp: any) => {
                    try {
                        const vRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(resp),
                        });
                        const vData = await vRes.json();
                        if (vData.success) {
                            setStatus('success');
                            onSuccess?.();
                        } else {
                            throw new Error(vData.error || 'Verification failed');
                        }
                    } catch (e: any) {
                        setStatus('error');
                        setErrorMsg(e.message || 'Payment verification failed');
                    }
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (r: any) => {
                setStatus('error');
                setErrorMsg(r.error?.description || 'Payment failed. Please try again.');
            });
            rzp.open();
            setStatus('idle');
        } catch (e: any) {
            setStatus('error');
            setErrorMsg(e.message || 'Something went wrong. Please try again.');
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#020205]/85 backdrop-blur-sm"
                onClick={status === 'loading' ? undefined : onClose}
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-lg bg-[#08080f] border border-white/10 rounded-[2rem] shadow-2xl shadow-black/60 overflow-hidden animate-fade-in-up">
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent" />

                {/* Close */}
                {status !== 'loading' && status !== 'success' && (
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 transition-all z-10"
                    >
                        ✕
                    </button>
                )}

                {/* ── SUCCESS ──────────────────────────────────────────────── */}
                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center py-16 px-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 animate-bounce">
                            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Payment Confirmed</h2>
                        <p className="text-slate-400 font-medium mb-8 max-w-xs">Your access has been activated. You can now start your assessment.</p>
                        <button
                            onClick={() => { onClose(); router.push('/my-assessments'); }}
                            className="px-10 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* ── ERROR ────────────────────────────────────────────────── */}
                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center py-14 px-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5">
                            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Payment Failed</h2>
                        <p className="text-slate-400 font-medium mb-7 max-w-xs text-sm">{errorMsg}</p>
                        <div className="flex gap-3 w-full max-w-xs">
                            <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-colors">Cancel</button>
                            <button onClick={() => setStatus('idle')} className="flex-1 py-3 bg-cyan-600 text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-cyan-500 transition-colors">Retry</button>
                        </div>
                    </div>
                )}

                {/* ── STEP 1: Select Assessment / Category ─────────────────── */}
                {status !== 'success' && status !== 'error' && step === 1 && (
                    <div className="p-7 md:p-8">
                        {/* Header */}
                        <div className="mb-6">
                            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.35em] mb-1">Step 1 of 2</p>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Choose Your Plan</h2>
                        </div>

                        {/* Plan tabs */}
                        <div className="grid gap-2.5 mb-6">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => {
                                        setSelectedPlan(plan.id);
                                        setSelectedAssessmentId('');
                                        setSelectedCategorySlug('');
                                    }}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-250 ${planBorder(plan.id)}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedPlan === plan.id ? 'border-cyan-400' : 'border-slate-600'}`}>
                                                {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-black text-sm uppercase tracking-widest ${selectedPlan === plan.id ? accent(plan.color) : 'text-white'}`}>{plan.label}</span>
                                                    {plan.badge && (
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${plan.color === 'purple' ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'}`}>
                                                            {plan.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 text-xs mt-0.5">{plan.desc}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className={`text-xl font-black ${selectedPlan === plan.id ? accent(plan.color) : 'text-white'}`}>₹{plan.price.toLocaleString('en-IN')}</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase">{plan.unit}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Selection input for Individual */}
                        {selectedPlan === 'individual' && (
                            <div className="mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2 block">
                                    Select Assessment
                                </label>
                                {loadingOptions ? (
                                    <div className="h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <svg className="animate-spin w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedAssessmentId}
                                        onChange={(e) => setSelectedAssessmentId(e.target.value)}
                                        className="w-full h-12 rounded-2xl bg-[#080b14] border border-white/15 px-4 text-sm font-semibold text-slate-200 outline-none focus:border-cyan-500/60 transition-all appearance-none"
                                    >
                                        <option value="">— Pick an assessment —</option>
                                        {assessmentOptions.map((a) => (
                                            <option key={a._id} value={a._id}>
                                                {a.title}
                                                {a.category && typeof a.category === 'object'
                                                    ? ` (${a.category.name})`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {/* Selection input for Category */}
                        {selectedPlan === 'category' && (
                            <div className="mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2 block">
                                    Select Category
                                </label>
                                <select
                                    value={selectedCategorySlug}
                                    onChange={(e) => setSelectedCategorySlug(e.target.value)}
                                    className="w-full h-12 rounded-2xl bg-[#080b14] border border-white/15 px-4 text-sm font-semibold text-slate-200 outline-none focus:border-cyan-500/60 transition-all appearance-none"
                                >
                                    <option value="">— Pick a category —</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.slug} value={cat.slug}>
                                            {cat.name} ({cat.subjects.length} assessments)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Bundle info */}
                        {selectedPlan === 'bundle' && (
                            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">Full Access Unlocked</p>
                                <p className="text-slate-400 text-sm">All 240 assessments across 20 categories — no selection needed.</p>
                            </div>
                        )}

                        <button
                            onClick={() => setStep(2)}
                            disabled={!step1Valid}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-black uppercase tracking-widest text-sm shadow-xl shadow-cyan-500/20 hover:from-cyan-500 hover:to-cyan-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Continue to Payment →
                        </button>
                    </div>
                )}

                {/* ── STEP 2: Confirm & Pay ─────────────────────────────────── */}
                {status !== 'success' && status !== 'error' && step === 2 && (
                    <div className="p-7 md:p-8">
                        {/* Back button */}
                        {!(defaultPlan === 'individual' && assessment) && defaultPlan !== 'bundle' && (
                            <button
                                onClick={() => setStep(1)}
                                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-black uppercase tracking-widest mb-5 transition-colors"
                            >
                                ← Back
                            </button>
                        )}

                        <div className="mb-5">
                            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.35em] mb-1">
                                {!(defaultPlan === 'individual' && assessment) && defaultPlan !== 'bundle' ? 'Step 2 of 2' : 'Secure Checkout'}
                            </p>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Review & Pay</h2>
                        </div>

                        {/* Order summary card */}
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 mb-6 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Plan</p>
                                    <p className="font-black text-white text-sm uppercase">{activePlan.label}</p>
                                </div>
                                <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${activePlan.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400'
                                    : activePlan.color === 'purple' ? 'bg-purple-500/10 text-purple-400'
                                        : 'bg-emerald-500/10 text-emerald-400'
                                    }`}>{activePlan.badge || activePlan.unit}</span>
                            </div>
                            <div className="pt-3 border-t border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                    {selectedPlan === 'individual' ? 'Assessment' : selectedPlan === 'category' ? 'Category' : 'Coverage'}
                                </p>
                                <p className="text-slate-200 text-sm font-semibold leading-snug">{selectionSummary()}</p>
                            </div>
                            <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                <span className="text-slate-400 font-bold text-sm">Total</span>
                                <span className={`text-2xl font-black ${accent(activePlan.color)}`}>
                                    ₹{activePlan.price.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        {/* Pay button */}
                        <button
                            onClick={handlePay}
                            disabled={status === 'loading'}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-black uppercase tracking-widest text-sm shadow-2xl shadow-cyan-500/20 hover:from-cyan-500 hover:to-cyan-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-3"
                        >
                            {status === 'loading' ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Processing…
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Pay ₹{activePlan.price.toLocaleString('en-IN')} via Razorpay
                                </>
                            )}
                        </button>

                        {/* Trust bar */}
                        <div className="flex items-center justify-center gap-5 mt-4">
                            {['256-bit SSL', 'Razorpay Secured', 'PCI DSS'].map((t) => (
                                <span key={t} className="text-[9px] font-black uppercase tracking-widest text-slate-600">{t}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
        </div>
    );
}
