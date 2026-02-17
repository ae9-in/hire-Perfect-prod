'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import CertificateModal from '@/components/ui/CertificateModal';

export default function ResultsPage({ params: paramsPromise }: { params: Promise<{ attemptId: string }> }) {
    const params = React.use(paramsPromise);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState<any>(null);
    const [violations, setViolations] = useState<any[]>([]);
    const [showCertificate, setShowCertificate] = useState(false);

    useEffect(() => {
        loadResult();
    }, []);

    const loadResult = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/attempts/${params.attemptId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setAttempt(data.attempt);
                if (data.attempt.violations) {
                    setViolations(data.attempt.violations);
                }
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Failed to load results:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Synthesizing Report..." />;
    if (!attempt) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Record Not Found</div>;

    const percentage = attempt.percentage || 0;
    const isPassing = percentage >= 60;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid selection:bg-cyan-500/30 selection:text-white overflow-x-hidden text-cyan-50/80 font-sans">
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative">
                {/* Floating Orbs */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Achievement Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-12 relative z-10">
                    <div>
                        <div className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4 border border-cyan-500/20">
                            Assessment Terminal Complete
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            VALIDATION <br /><span className="text-cyan-500">SUMMARY.</span>
                        </h1>
                        <p className="text-lg text-cyan-500/50 font-medium mt-6 max-w-lg">
                            Performance synthesis for <span className="text-cyan-50 font-bold">{attempt.assessment?.title}</span>. Detailed analytics and proctoring metrics below.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline" className="px-8 py-4 uppercase tracking-widest text-[10px] font-black bg-transparent border-white/10 text-white hover:border-cyan-500/30">Terminal Exit</Button>
                        </Link>
                        <Button variant="primary" className="px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-black shadow-[0_0_30px_rgba(0,242,255,0.2)]" onClick={() => window.print()}>Export PDF</Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12 relative z-10">
                    {/* Performance Core */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Status Card */}
                        <Card className="p-1 border-white/5 bg-slate-900/40 backdrop-blur-md shadow-2xl overflow-visible relative group">
                            <div className={`absolute -inset-1 blur-2xl opacity-10 transition-opacity group-hover:opacity-20 ${isPassing ? 'bg-cyan-500' : 'bg-rose-500'}`}></div>
                            <div className="bg-transparent rounded-[14px] p-12 text-center relative z-10 overflow-hidden">
                                {/* Decorative Background Elements */}
                                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full translate-x-24 -translate-y-24 opacity-[0.03] ${isPassing ? 'bg-cyan-500' : 'bg-rose-500'}`}></div>

                                <div className="relative z-20 mb-10 flex flex-col items-center">
                                    <div className={`w-36 h-36 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-3 shadow-2xl border ${isPassing ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_40px_rgba(0,242,255,0.3)]' : 'bg-rose-500 border-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.3)]'}`}>
                                        <span className="text-black text-5xl font-black">{Math.round(percentage)}%</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
                                        {isPassing ? 'PROTOCOL ACHIEVED' : 'PROTOCOL SUBSTANDARD'}
                                    </h2>
                                    <p className="text-cyan-500/50 font-medium max-w-sm mx-auto leading-relaxed">
                                        {isPassing
                                            ? 'The operative has successfully cleared the validation threshold and is now eligible for certification.'
                                            : 'The internal validation threshold was not met. Re-training and subsequent evaluation is recommended.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-1 pt-12 border-t border-white/5">
                                    <div className="p-6 text-center">
                                        <p className="text-[10px] font-black text-cyan-500/40 uppercase tracking-widest mb-1">Accuracy</p>
                                        <p className="text-2xl font-black text-white">{attempt.correctAnswers}/{attempt.totalQuestions}</p>
                                    </div>
                                    <div className="p-6 border-x border-white/5 text-center">
                                        <p className="text-[10px] font-black text-cyan-500/40 uppercase tracking-widest mb-1">Duration</p>
                                        <p className="text-2xl font-black text-white">{Math.floor(attempt.timeSpent / 60)}m</p>
                                    </div>
                                    <div className="p-6 text-center">
                                        <p className="text-[10px] font-black text-cyan-500/40 uppercase tracking-widest mb-1">Rank</p>
                                        <p className="text-2xl font-black text-cyan-400">Elite</p>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full py-6 uppercase tracking-[0.3em] font-black text-xs shadow-[0_0_40px_rgba(0,242,255,0.2)]"
                                        onClick={() => setShowCertificate(true)}
                                        disabled={!isPassing}
                                    >
                                        Establish Certification
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Proctoring Matrix */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Proctoring Matrix</h3>
                            <Card className="p-10 bg-slate-900/40 backdrop-blur-md border-white/5">
                                {attempt.violationCount === 0 ? (
                                    <div className="flex items-center gap-10">
                                        <div className="w-24 h-24 bg-cyan-500/10 text-cyan-500 rounded-3xl flex items-center justify-center flex-shrink-0 animate-pulse border border-cyan-500/20 shadow-[0_0_30px_rgba(0,242,255,0.15)]">
                                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="inline-block px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded mb-2 border border-cyan-500/20">GuardEye™ Verified</div>
                                            <h4 className="text-xl font-black text-white uppercase tracking-tight">Pristine Session integrity</h4>
                                            <p className="text-cyan-500/40 text-sm font-medium mt-1 leading-relaxed">No behavioral anomalies or protocol breaches were logged by the AI monitoring subsystem.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between p-8 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-rose-500 uppercase tracking-widest leading-none">Anomalies Detected</p>
                                                    <p className="text-rose-500/40 font-bold text-xs uppercase mt-1">Breach Count: 0{attempt.violationCount}</p>
                                                </div>
                                            </div>
                                            <span className="text-4xl font-black text-rose-500 tracking-tighter">{attempt.violationCount}</span>
                                        </div>

                                        <div className="grid gap-3">
                                            {attempt.violations?.map((v: any, idx: number) => (
                                                <div key={v._id || idx} className="p-6 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/[0.03] transition-colors group">
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-xs font-black text-cyan-500/30 tabular-nums">/{idx + 1}</span>
                                                        <div className="h-10 w-px bg-white/5"></div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="text-[10px] font-black text-white uppercase tracking-tighter">{v.type?.replace(/_/g, ' ')}</span>
                                                                <span className="text-[10px] text-cyan-500/30 font-bold tabular-nums">[{new Date(v.timestamp).toLocaleTimeString()}]</span>
                                                            </div>
                                                            <p className="text-xs text-cyan-500/60 font-medium group-hover:text-cyan-200/80 transition-colors">{v.description}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-rose-500/10">High Severity</span>
                                                </div>
                                            ))}
                                        </div>

                                        {attempt.status === 'terminated' && (
                                            <div className="p-6 bg-slate-900/60 rounded-2xl border-l-4 border-rose-600 text-white flex items-center gap-4">
                                                <div className="w-10 h-10 bg-rose-600/20 text-rose-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black uppercase tracking-widest text-rose-500 mb-0.5">Instance Terminated</p>
                                                    <p className="text-cyan-500/40 text-xs font-medium">Auto-shutdown triggered by terminal protocol violation threshold.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>

                    {/* Sidebar Ops */}
                    <div className="space-y-8 relative z-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Ops Center</h3>

                        <Card className="p-8 bg-slate-900/60 text-white border-white/5 shadow-2xl group overflow-hidden relative">
                            <div className="absolute inset-0 bg-grid opacity-10"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-cyan-400">Elite Upskilling</h4>
                                <p className="text-cyan-500/50 text-sm font-medium mb-10 leading-relaxed max-w-[200px]">Operative performance indicates prime eligibility for the <span className="text-white">Gold Bundle</span> track extension.</p>
                                <Link href="/assessments">
                                    <Button variant="primary" className="bg-white text-black hover:bg-cyan-100 w-full py-4 text-xs font-black uppercase tracking-widest border-0 shadow-[0_0_30px_rgba(255,255,255,0.2)]">Explore tracks</Button>
                                </Link>
                            </div>
                        </Card>

                        <Card className="p-8 bg-slate-900/40 backdrop-blur-md border-white/5 group">
                            <h4 className="text-lg font-black text-white uppercase tracking-tight mb-4 group-hover:text-cyan-400 transition-colors">Career Analytics</h4>
                            <p className="text-cyan-500/40 text-xs font-medium mb-8 leading-relaxed">Our AI partners analyzed your response patterns. View your talent-market alignment report.</p>
                            <Button variant="outline" className="w-full py-4 text-[10px] font-black uppercase tracking-widest border-white/10 text-cyan-500/40 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-all">Request Analytics</Button>
                        </Card>
                    </div>
                </div>
            </main>

            {attempt && (
                <CertificateModal
                    isOpen={showCertificate}
                    onClose={() => setShowCertificate(false)}
                    candidateName={attempt.user?.name || 'Candidate'}
                    assessmentTitle={attempt.assessment?.title || 'Professional Assessment'}
                    completionDate={new Date(attempt.completedAt || Date.now()).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                    certificateId={params.attemptId.slice(-8).toUpperCase()}
                />
            )}
        </div>
    );
}
