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
        <div className="min-h-screen bg-slate-50 bg-grid">
            <Navbar />

            <div className="container mx-auto px-6 py-24 lg:py-32 page-container">
                <div className="text-center mb-20">
                    <div className="inline-block px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Explore Catalog</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-none">
                        VALIDATE YOUR <span className="text-gradient">LEGACY.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Industry-standard assessments across 36 specialized domains.
                        AI-monitored. Global recognition.
                    </p>
                </div>

                {/* Modern Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-16 max-w-4xl mx-auto">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${selectedCategory === null
                                ? 'bg-slate-900 text-white shadow-xl scale-105'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        All Tracks
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${selectedCategory === cat.name
                                    ? 'bg-indigo-600 text-white shadow-xl scale-105 shadow-indigo-200'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Assessments Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {filteredAssessments.length > 0 ? (
                        filteredAssessments.map((assessment, idx) => (
                            <Card key={assessment._id} className="group p-1">
                                <div className="bg-white rounded-[14px] p-8 h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">
                                                {typeof assessment.category === 'string' ? assessment.category : assessment.category?.name}
                                            </span>
                                            <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                {assessment.title}
                                            </h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm group-hover:bg-indigo-50 transition-colors">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <p className="text-slate-500 mb-10 flex-grow text-sm font-medium leading-relaxed line-clamp-3">
                                        {assessment.description}
                                    </p>

                                    <div className="pt-8 border-t border-slate-50">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Standard Price</span>
                                                <div className="text-3xl font-black text-slate-900 leading-none">
                                                    ₹{assessment.price}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Verified MCQ</span>
                                                <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{assessment.duration}m Duration</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 glass border-slate-200 text-xs font-black uppercase tracking-widest py-4"
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
                                                className="flex-1 text-xs font-black uppercase tracking-widest py-4 shadow-lg shadow-indigo-100"
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
                        <div className="col-span-full py-32 text-center glass rounded-3xl border-2 border-dashed border-indigo-100 flex flex-col items-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">No Units Found</h3>
                            <p className="text-slate-500 font-medium mb-10 max-w-sm">The assessment database for this track is currently offline or empty.</p>
                            <Button
                                variant="primary"
                                size="lg"
                                className="shadow-2xl shadow-indigo-200 px-10"
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
                                Initialize Database
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Purchase Modal */}
            <Modal
                isOpen={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
            >
                {selectedAssessment && (
                    <div className="space-y-10 p-4">
                        <div className="text-center">
                            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-6">
                                {selectedAssessment.category?.name || selectedAssessment.category}
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{selectedAssessment.title}</h2>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                                {selectedAssessment.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Allocation</p>
                                <p className="text-xl font-bold text-slate-900">{selectedAssessment.duration} Mins</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Inventory</p>
                                <p className="text-xl font-bold text-slate-900">{selectedAssessment.totalQuestions} MCQ</p>
                            </div>
                        </div>

                        <div className="glass p-8 rounded-[2rem] border-white/50 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-600/5 animate-pulse"></div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 block">Premium Access</span>
                                <div className="text-5xl font-black text-slate-900 mb-2 leading-none">₹{selectedAssessment.price}</div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">One-time payment • Lifetime Reporting</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1 py-4 font-black uppercase tracking-widest border-slate-200" onClick={() => setShowPurchaseModal(false)}>Cancel</Button>
                            <Button variant="primary" className="flex-1 py-4 font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Complete Order</Button>
                        </div>

                        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-50">
                            Secure Transaction • 256-bit Encryption
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
