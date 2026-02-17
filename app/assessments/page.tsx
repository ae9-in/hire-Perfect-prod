'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import { CATEGORIES } from '@/lib/constants';

export default function AssessmentsPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPurchases, setUserPurchases] = useState<string[]>([]);
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [assessmentsRes, purchasesRes] = await Promise.all([
                fetch('/api/assessments', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }),
                token ? fetch('/api/payment/purchases', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ json: () => ({ success: true, purchases: [] }) })
            ]);

            const assessmentsData = await assessmentsRes.json();
            const purchasesData = typeof purchasesRes.json === 'function' ? await (purchasesRes as Response).json() : await purchasesRes;

            if (assessmentsData.success) {
                setAssessments(assessmentsData.assessments || []);
            }
            if (purchasesData.success) {
                setUserPurchases(purchasesData.purchases?.map((p: any) => p.assessment?.toString() || p.category?.toString()) || []);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (assessmentId: string) => {
        router.push(`/exam/pre/${assessmentId}`);
    };

    const filteredAssessments = selectedCategory
        ? assessments.filter(a => {
            const categoryValue = a.category?.name || a.category;
            const categoryId = a.category?._id || a.category;
            return categoryValue === selectedCategory || categoryId === selectedCategory;
        })
        : assessments;

    if (loading) {
        return <Loading variant="spinner" fullScreen text="Preparing Assessments..." />;
    }

    return (
        <div className="min-h-screen bg-[#020205] text-white bg-grid selection:bg-cyan-500/30 selection:text-cyan-200">
            <Navbar />

            {/* Floating Gradient Orbs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full animate-float"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-2s' }}></div>
            </div>

            <div className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                <div className="text-center mb-20 animate-fade-in-up">
                    <div className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Explore Catalog</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.85]">
                        VALIDATE YOUR <br /><span className="text-gradient">LEGACY.</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Industry-standard assessments across 36 specialized domains.
                        AI-monitored. Global recognition.
                    </p>
                </div>

                {/* Modern Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-16 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${selectedCategory === null
                            ? 'bg-cyan-500 text-white shadow-2xl shadow-cyan-900/40 scale-105'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                            }`}
                    >
                        All Tracks
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${selectedCategory === cat.name
                                ? 'bg-cyan-500 text-white shadow-2xl shadow-cyan-900/40 scale-105'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Assessments Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {filteredAssessments.length > 0 ? (
                        filteredAssessments.map((assessment, idx) => (
                            <Card key={assessment._id} className="group p-1 border-white/5 bg-slate-900/40 backdrop-blur-md hover:border-cyan-500/30 transition-all duration-500">
                                <div className="bg-transparent rounded-[14px] p-8 h-full flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full translate-x-8 -translate-y-8 blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>

                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-1 opacity-80">
                                                {typeof assessment.category === 'string' ? assessment.category : assessment.category?.name}
                                            </span>
                                            <h3 className="text-2xl font-black text-white leading-tight group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                                {assessment.title}
                                            </h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all">
                                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <p className="text-slate-400 mb-10 flex-grow text-sm font-medium leading-relaxed line-clamp-3 relative z-10 font-inter">
                                        {assessment.description}
                                    </p>

                                    <div className="pt-8 border-t border-white/5 relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Standard Price</span>
                                                <div className="text-3xl font-black text-white leading-none">
                                                    ₹{assessment.price}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded border border-cyan-500/20">Verified MCQ</span>
                                                <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">{assessment.duration}m Duration</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-white/10 text-[10px] font-black uppercase tracking-widest py-4 group-hover:border-cyan-500/30 group-hover:text-cyan-400"
                                                onClick={() => {
                                                    setSelectedAssessment(assessment);
                                                    setShowPurchaseModal(true);
                                                }}
                                            >
                                                Details
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="flex-1 text-[10px] font-black uppercase tracking-widest py-4 shadow-2xl shadow-cyan-900/20"
                                                onClick={() => handleStartTest(assessment._id)}
                                            >
                                                Launch Exam
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center bg-slate-900/20 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-600">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">No Units Found</h3>
                            <p className="text-slate-500 font-medium mb-10 max-w-sm">The assessment database for this track is currently offline or empty.</p>
                            <Button
                                variant="primary"
                                size="lg"
                                className="shadow-2xl shadow-cyan-900/30 px-12 py-5 font-black uppercase tracking-widest"
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const res = await fetch('/api/maintenance/seed');
                                        const data = await res.json();
                                        if (data.success) {
                                            window.location.reload();
                                        }
                                    } catch (err: any) {
                                        console.error(err);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                Initialize Protocol
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Purchase Modal */}
            <Modal
                isOpen={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
                size="lg"
            >
                {selectedAssessment && (
                    <div className="space-y-10 p-4">
                        <div className="text-center">
                            <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-6">
                                {selectedAssessment.category?.name || selectedAssessment.category}
                            </div>
                            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter leading-none">{selectedAssessment.title}</h2>
                            <p className="text-slate-400 font-medium leading-relaxed max-w-md mx-auto font-inter">
                                {selectedAssessment.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Allocation</p>
                                <p className="text-xl font-bold text-white">{selectedAssessment.duration} Mins</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Inventory</p>
                                <p className="text-xl font-bold text-white">{selectedAssessment.totalQuestions} MCQ</p>
                            </div>
                        </div>

                        <div className="bg-[#050510] p-8 rounded-[2rem] border border-white/5 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-cyan-500/5 animate-pulse group-hover:bg-cyan-500/10 transition-colors"></div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-2 block">Premium Access</span>
                                <div className="text-6xl font-black text-white mb-2 leading-none">₹{selectedAssessment.price}</div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">One-time payment • Lifetime Reporting</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1 py-5 font-black uppercase tracking-widest border-white/10 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400" onClick={() => setShowPurchaseModal(false)}>Retract</Button>
                            <Button variant="primary" className="flex-1 py-5 font-black uppercase tracking-widest shadow-2xl shadow-cyan-900/30">Commit Order</Button>
                        </div>

                        <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] opacity-50">
                            Secure Terminal Transaction • 256-bit GuardEye Encryption
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
