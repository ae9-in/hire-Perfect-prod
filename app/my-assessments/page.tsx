'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AssessmentInfo {
    _id: string;
    title: string;
    description?: string;
    duration?: number;
    totalQuestions?: number;
    difficulty?: string;
    price?: number;
    category?: { _id: string; name: string; slug: string };
}

interface CategoryInfo {
    _id: string;
    name: string;
    slug: string;
}

interface Purchase {
    _id: string;
    purchaseType: 'individual' | 'category' | 'bundle';
    purchasedAt: string;
    amount: number;
    assessment?: AssessmentInfo;
    category?: CategoryInfo;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MyAssessmentsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [categorySubjects, setCategorySubjects] = useState<Record<string, any[]>>({});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [loadingSubjects, setLoadingSubjects] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        loadPurchases();
    }, []);

    const loadPurchases = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { router.push('/login'); return; }

            const res = await fetch('/api/payment/purchases', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to load purchases');
            setPurchases(data.purchases || []);
        } catch (e: any) {
            setError(e.message || 'Could not load your assessments.');
        } finally {
            setLoading(false);
        }
    };

    // Lazy-load subjects for a category when its accordion is opened
    const toggleCategory = async (purchaseId: string, catSlug: string, catId?: string) => {
        const nowExpanded = !expanded[purchaseId];
        setExpanded((prev) => ({ ...prev, [purchaseId]: nowExpanded }));

        if (nowExpanded && !categorySubjects[purchaseId]) {
            if (!catSlug && !catId) {
                // Corrupt/old purchase with no category ref -> don't fetch anything
                setCategorySubjects((prev) => ({ ...prev, [purchaseId]: [] }));
                return;
            }

            setLoadingSubjects((prev) => ({ ...prev, [purchaseId]: true }));
            try {
                const token = localStorage.getItem('token');
                const url = catId
                    ? `/api/assessments?category=${catId}`
                    : `/api/assessments?categorySlug=${catSlug}`;

                const res = await fetch(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await res.json();
                // Try different response shapes
                const subjects =
                    (data.categories || []).flatMap((c: any) => c.subjects || []) ||
                    data.assessments ||
                    [];
                setCategorySubjects((prev) => ({ ...prev, [purchaseId]: subjects }));
            } catch { /* leave empty */ } finally {
                setLoadingSubjects((prev) => ({ ...prev, [purchaseId]: false }));
            }
        }
    };

    const startTest = (assessmentId: string) => router.push(`/assessments/${assessmentId}`);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return <Loading variant="spinner" fullScreen text="Loading Your Library..." />;

    const hasPurchases = purchases.length > 0;

    return (
        <div className="min-h-screen bg-[#020205] text-white bg-grid selection:bg-cyan-500/30 selection:text-cyan-200">
            <Navbar />

            {/* BG orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/4 blur-[130px] rounded-full" />
                <div className="absolute bottom-0 right-[-5%] w-[30%] h-[30%] bg-purple-500/4 blur-[100px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 py-28 lg:py-36 page-container relative z-10 max-w-4xl">

                {/* ── Header ── */}
                <div className="mb-14 animate-fade-in-up">
                    <div className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-5">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">My Library</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter uppercase leading-[0.9]">
                        My <span className="text-gradient">Assessments</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-lg">
                        Assessments you've purchased. Start any time — AI proctored, lifetime results.
                    </p>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-8 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                {/* ── Empty state ── */}
                {!hasPurchases && !error && (
                    <div className="py-28 text-center border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-5 text-slate-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">No Assessments Purchased</h3>
                        <p className="text-slate-500 font-medium mb-8 max-w-xs text-sm">
                            Browse the catalog, pick a plan, and your assessments will appear here.
                        </p>
                        <button
                            onClick={() => router.push('/assessments')}
                            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-black uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/20 hover:from-cyan-500 hover:to-cyan-400 transition-all"
                        >
                            Browse Assessments
                        </button>
                    </div>
                )}

                {/* ── Purchase cards ── */}
                <div className="space-y-5 animate-fade-in-up">
                    {purchases.map((p) => {

                        /* ────── Individual ────── */
                        if (p.purchaseType === 'individual') {
                            const a = p.assessment;
                            if (!a) return (
                                <div key={p._id} className="p-6 rounded-2xl border border-white/8 bg-slate-900/40 text-slate-500 text-sm font-medium text-center">
                                    Assessment data not available.
                                </div>
                            );
                            return (
                                <div key={p._id} className="group rounded-[1.6rem] border border-white/8 bg-slate-900/40 backdrop-blur-md p-6 hover:border-cyan-500/20 transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em]">Individual</span>
                                                {a.category?.name && (
                                                    <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] text-slate-400 font-black uppercase tracking-widest">{a.category.name}</span>
                                                )}
                                                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-black uppercase">✓ Purchased</span>
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-cyan-400 transition-colors">
                                                {a.title}
                                            </h3>
                                            {a.description && (
                                                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{a.description}</p>
                                            )}
                                            <div className="flex gap-5 mt-2.5">
                                                {a.duration && <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{a.duration}m</span>}
                                                {a.totalQuestions && <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{a.totalQuestions} Qs</span>}
                                                {a.difficulty && <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{a.difficulty}</span>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => startTest(a._id)}
                                            className="flex-shrink-0 px-7 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/15 hover:from-cyan-500 hover:to-cyan-400 transition-all"
                                        >
                                            Start Test →
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        /* ────── Category Combo ────── */
                        if (p.purchaseType === 'category') {
                            const cat = p.category;
                            const catName = cat?.name || 'Category';
                            const catSlug = cat?.slug || '';
                            const catId = cat?._id || '';
                            const isOpen = !!expanded[p._id];
                            const subjects: any[] = categorySubjects[p._id] || [];
                            const isLoading = !!loadingSubjects[p._id];

                            return (
                                <div key={p._id} className="rounded-[1.6rem] border border-purple-500/15 bg-slate-900/40 backdrop-blur-md overflow-hidden">
                                    {/* Header row */}
                                    <button
                                        onClick={() => toggleCategory(p._id, catSlug, catId)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.3em]">Category Combo</span>
                                                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-black uppercase">✓ Purchased</span>
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">{catName}</h3>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                                                {isOpen ? 'Click to collapse' : 'Click to view assessments'}
                                            </p>
                                        </div>
                                        <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Dropdown subjects */}
                                    {isOpen && (
                                        <div className="border-t border-white/5">
                                            {isLoading ? (
                                                <div className="py-8 flex justify-center">
                                                    <svg className="animate-spin w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                </div>
                                            ) : subjects.length === 0 ? (
                                                <p className="px-6 py-5 text-slate-500 text-sm font-medium text-center">No assessments found in this category.</p>
                                            ) : (
                                                <div className="divide-y divide-white/5">
                                                    {subjects.map((s: any) => (
                                                        <div key={s._id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                                                            <div>
                                                                <p className="font-black text-white text-sm uppercase tracking-tight">{s.title}</p>
                                                                <div className="flex gap-4 mt-1">
                                                                    {s.duration && <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{s.duration}m</span>}
                                                                    {s.totalQuestions && <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{s.totalQuestions} Qs</span>}
                                                                    {s.difficulty && <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{s.difficulty}</span>}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => startTest(s._id)}
                                                                className="flex-shrink-0 px-5 py-2 rounded-xl bg-cyan-600 text-black font-black uppercase tracking-widest text-[9px] hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-500/10"
                                                            >
                                                                Start →
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        /* ────── Full Bundle ────── */
                        if (p.purchaseType === 'bundle') {
                            return (
                                <div key={p._id} className="rounded-[1.6rem] border border-emerald-500/20 bg-emerald-500/5 p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">Full Bundle</span>
                                                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-black uppercase">✓ All Access</span>
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Complete Assessment Suite</h3>
                                            <p className="text-slate-400 text-sm mt-1">All 240 assessments across all 20 categories are unlocked for you.</p>
                                        </div>
                                        <button
                                            onClick={() => router.push('/assessments')}
                                            className="flex-shrink-0 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-black font-black uppercase tracking-widest text-xs hover:from-emerald-500 hover:to-emerald-400 transition-all"
                                        >
                                            Browse All →
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>

                {/* Footer CTA */}
                {hasPurchases && (
                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-sm font-medium mb-4">Want more assessments?</p>
                        <button
                            onClick={() => router.push('/assessments')}
                            className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                        >
                            Browse Catalog →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
