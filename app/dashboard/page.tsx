'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Navbar from '@/components/ui/Navbar';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userData));
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([loadAssessments(), loadAttempts()]);
        setLoading(false);
    };

    const loadAssessments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/assessments', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setAssessments(data.assessments || []);
            }
        } catch (error) {
            console.error('Failed to load assessments:', error);
        }
    };

    const loadAttempts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/attempts', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setAttempts(data.attempts || []);
            }
        } catch (error) {
            console.error('Failed to load attempts:', error);
        }
    };

    if (loading) {
        return <Loading variant="spinner" fullScreen text="Syncing Dashboard..." />;
    }

    const completedAttempts = attempts.filter(a => a.status === 'completed');
    const avgScore = completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / completedAttempts.length)
        : 0;

    return (
        <div className="min-h-screen bg-[#020205] text-white bg-grid selection:bg-cyan-500/30 selection:text-cyan-200">
            <Navbar />

            {/* Floating Gradient Orbs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full animate-float"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-2s' }}></div>
            </div>

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                            User Terminal
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                            Welcome, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium mt-2">
                            Overview of your performance and active tracks.
                        </p>
                    </div>
                    <Link href="/assessments">
                        <Button variant="primary" className="shadow-2xl shadow-cyan-900/20 px-8 py-4 uppercase tracking-widest text-xs font-black">New Assessment</Button>
                    </Link>
                </div>

                {/* Analytical Stats Bento */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <Card className="p-8 bg-slate-900/40 backdrop-blur-md border border-white/5 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Unlocked Tracks</p>
                            <div className="flex items-end space-x-2">
                                <span className="text-5xl font-black text-white leading-none">
                                    {assessments.filter(a => a.hasAccess).length}
                                </span>
                                <span className="text-sm font-bold text-slate-500 pb-1">Units</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 bg-slate-900/40 backdrop-blur-md border border-white/5 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Completed Units</p>
                            <div className="flex items-end space-x-2">
                                <span className="text-5xl font-black text-white leading-none">
                                    {completedAttempts.length}
                                </span>
                                <span className="text-sm font-bold text-slate-500 pb-1">Total</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 bg-gradient-to-br from-[#050510] to-[#0A0015] border-cyan-500/10 overflow-hidden relative group shadow-2xl shadow-cyan-900/10">
                        <div className="absolute inset-0 bg-grid opacity-10"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6">Global Average</p>
                            <div className="flex items-end space-x-2">
                                <span className="text-5xl font-black text-white leading-none">
                                    {completedAttempts.length > 0 ? `${avgScore}%` : '--'}
                                </span>
                                <span className="text-sm font-bold text-cyan-500/50 pb-1 uppercase tracking-tighter">Performance</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Activity Feed and Quick Actions */}
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Activity Feed</h2>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{attempts.length} Records</span>
                        </div>

                        <Card className="overflow-hidden border-white/5 bg-slate-900/20 backdrop-blur-sm">
                            {attempts.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-slate-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No activity log found.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/5">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Assessment Detail</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Metric</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {attempts.map((attempt) => (
                                                <tr key={attempt._id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{attempt.assessment?.title}</span>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">
                                                                {new Date(attempt.startedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        {attempt.status === 'completed' ? (
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex-1 bg-white/5 h-1.5 w-16 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${attempt.percentage >= 60 ? 'bg-cyan-500' : 'bg-rose-500'}`}
                                                                        style={{ width: `${attempt.percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className={`text-sm font-black ${attempt.percentage >= 60 ? 'text-cyan-400' : 'text-rose-500'}`}>
                                                                    {Math.round(attempt.percentage)}%
                                                                </span>
                                                            </div>
                                                        ) : attempt.status === 'terminated' ? (
                                                            <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-950/40 border border-rose-900/50 px-3 py-1.5 rounded shadow-[0_0_15px_rgba(225,29,72,0.1)]">Protocol Breach</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded">Disconnected</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {attempt.status === 'completed' ? (
                                                            <Link href={`/results/${attempt._id}`}>
                                                                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-black tracking-widest text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/5">Report</Button>
                                                            </Link>
                                                        ) : attempt.status === 'terminated' ? (
                                                            <Button variant="outline" size="sm" disabled className="text-[10px] uppercase font-black tracking-widest text-rose-900 border-rose-950 bg-transparent opacity-40 cursor-not-allowed">Terminated</Button>
                                                        ) : (
                                                            <Link href={`/exam/${attempt._id}`}>
                                                                <Button variant="outline" size="sm" className="text-[10px] uppercase font-black tracking-widest text-rose-500 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500 hover:text-rose-400 shadow-lg shadow-rose-900/10">Terminated</Button>
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Quick Access Sidebar */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Terminal Access</h2>

                        <Card className="p-8 bg-gradient-to-br from-cyan-600 to-purple-700 text-white relative overflow-hidden group border-0 shadow-2xl shadow-cyan-900/30">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12 animate-float"></div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4 relative z-10">Certification</h3>
                            <p className="text-cyan-100/80 text-sm font-medium mb-8 relative z-10 leading-relaxed font-inter">View and share your verified achievement certificates.</p>
                            <Link href="/dashboard" className="relative z-10">
                                <Button className="bg-white text-cyan-900 hover:bg-cyan-50 w-full py-4 text-xs uppercase tracking-[0.2em] font-black shadow-xl">Archive Access</Button>
                            </Link>
                        </Card>

                        <Card className="p-8 bg-slate-900/40 border-white/5 hover:border-cyan-500/30 transition-all group">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Support Ops</h3>
                            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed font-inter">Need assistance with an assessment or your results?</p>
                            <Button variant="outline" className="w-full py-4 text-xs uppercase tracking-widest font-black border-white/10 group-hover:border-cyan-500/50 group-hover:text-cyan-400">Open Ticket</Button>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
