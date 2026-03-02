'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';

type LevelKey = 'beginner' | 'intermediate' | 'advanced';

type LevelInfo = {
    level: LevelKey;
    questionDifficulty: 'easy' | 'medium' | 'hard';
    questionCount: number;
    isAvailable: boolean;
};

type AssessmentDetails = {
    _id: string;
    title: string;
    description: string;
    duration: number;
    price: number;
    category?: {
        name?: string;
    };
};

export default function AssessmentDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const assessmentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
    const [levels, setLevels] = useState<LevelInfo[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<LevelKey>('intermediate');
    const [userPurchases, setUserPurchases] = useState<string[]>([]);

    useEffect(() => {
        const loadPageData = async () => {
            if (!assessmentId) {
                setError('Invalid assessment id.');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');

                // Fetch assessment details and user purchases in parallel
                const fetchAssessment = fetch(`/api/assessments/${assessmentId}`);
                const fetchPurchases = token
                    ? fetch('/api/payment/purchases', { headers: { Authorization: `Bearer ${token}` } })
                    : Promise.resolve(null);

                const [assessmentRes, purchasesRes] = await Promise.all([fetchAssessment, fetchPurchases]);

                const assessmentData = await assessmentRes.json();
                if (!assessmentData.success) {
                    setError(assessmentData.error || 'Failed to load assessment.');
                    return;
                }

                setAssessment(assessmentData.assessment);
                setLevels(assessmentData.levels || []);

                const firstAvailable = (assessmentData.levels || []).find((level: LevelInfo) => level.isAvailable);
                if (firstAvailable?.level) {
                    setSelectedLevel(firstAvailable.level);
                }

                if (purchasesRes) {
                    const purchasesData = await purchasesRes.json();
                    if (purchasesData.success) {
                        const ids = (purchasesData.purchases || []).map((p: any) => {
                            if (p.purchaseType === 'individual') return p.assessment?._id || p.assessment;
                            if (p.purchaseType === 'category') return p.category?._id || p.category;
                            if (p.purchaseType === 'bundle') return 'FULL_BUNDLE';
                            return null;
                        }).filter(Boolean);
                        setUserPurchases(ids);
                    }
                }
            } catch (fetchError) {
                console.error('Assessment detail load error:', fetchError);
                setError('Unable to load assessment details.');
            } finally {
                setLoading(false);
            }
        };

        void loadPageData();
    }, [assessmentId]);

    const isPurchased = (assessment: any): boolean => {
        if (!assessment) return false;
        if (userPurchases.includes('FULL_BUNDLE')) return true;

        const id = assessment._id?.toString();
        const catId = assessment.category?._id?.toString() || assessment.category?.toString();
        return userPurchases.some((p) => p === id || p === catId);
    };

    const selectedLevelInfo = useMemo(
        () => levels.find((level) => level.level === selectedLevel),
        [levels, selectedLevel]
    );

    const handleContinue = () => {
        if (!assessmentId) return;
        router.push(`/exam/pre/${assessmentId}?level=${selectedLevel}`);
    };

    if (loading) {
        return <Loading variant="spinner" fullScreen text="Loading Assessment..." />;
    }

    if (error || !assessment) {
        return (
            <div className="min-h-screen bg-[#020205] text-white">
                <Navbar />
                <div className="container mx-auto px-6 py-28 text-center">
                    <p className="text-rose-300 mb-6">{error || 'Assessment not found.'}</p>
                    <Button variant="outline" onClick={() => router.push('/assessments')}>
                        Back to Assessments
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020205] text-white bg-grid">
            <Navbar />

            <main className="container mx-auto px-6 py-24 page-container">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
                            {assessment.category?.name || 'Assessment'}
                        </p>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tight mt-3">
                            {assessment.title}
                        </h1>
                        <p className="text-slate-400 mt-6 max-w-2xl">{assessment.description}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5 mb-10">
                        {levels.map((level) => (
                            <button
                                key={level.level}
                                type="button"
                                disabled={!level.isAvailable}
                                onClick={() => setSelectedLevel(level.level)}
                                className={`text-left rounded-2xl border p-5 transition-all ${selectedLevel === level.level
                                        ? 'border-cyan-500/60 bg-cyan-500/10'
                                        : 'border-white/10 bg-white/5'
                                    } ${!level.isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
                                    {level.level}
                                </p>
                                <p className="text-white font-semibold mt-2 capitalize">{level.questionDifficulty}</p>
                                <p className="text-slate-400 text-sm mt-2">{level.questionCount} questions available</p>
                            </button>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <p className="text-slate-300 text-sm">
                                Duration: <span className="text-cyan-300 font-semibold">{assessment.duration} minutes</span>
                            </p>
                            {isPurchased(assessment) ? (
                                <p className="mt-2 flex items-center gap-2">
                                    <span className="text-slate-300 text-sm italic">Price:</span>
                                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        ✓ Access Unlocked
                                    </span>
                                </p>
                            ) : (
                                <p className="text-slate-300 text-sm mt-2">
                                    Price: <span className="text-cyan-300 font-semibold">Rs. {assessment.price}</span>
                                </p>
                            )}
                            <p className="text-slate-400 text-sm mt-2">
                                Selected level: <span className="text-white font-semibold uppercase">{selectedLevel}</span>
                                {selectedLevelInfo ? ` (${selectedLevelInfo.questionCount} questions)` : ''}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => router.push('/assessments')}>
                                Back
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleContinue}
                                disabled={!selectedLevelInfo?.isAvailable}
                            >
                                Continue to Pre-Assessment
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
