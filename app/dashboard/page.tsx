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
        <div className="min-h-screen bg-slate-50 bg-grid">
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                            User Terminal
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                            Welcome, <span className="text-indigo-600">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium mt-2">
                            Overview of your performance and active tracks.
                        </p>
                    </div>
                    <Link href="/assessments">
                        <Button variant="primary" className="shadow-lg shadow-indigo-100 px-8 py-4 uppercase tracking-widest text-xs">New Assessment</Button>
                    </Link>
                </div>

                {/* Analytical Stats Bento */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <Card className="p-8 bg-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Unlocked Tracks</p>
                            <div className="flex items-end space-x-2">
                                <span className="text-5xl font-black text-slate-900 leading-none">
                                    {assessments.filter(a => a.hasAccess).length}
                                </span>
                                <span className="text-sm font-bold text-slate-400 pb-1">Units</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 bg-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Completed Units</p>
                            <div className="flex items-end space-x-2">
                                <span className="text-5xl font-black text-slate-900 leading-none">
                                    {completedAttempts.length}
                                </span>
                                <span className="text-sm font-bold text-slate-400 pb-1">Total</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 bg-slate-900 text-white overflow-hidden relative group border-0">
                        <div className="absolute inset-0 bg-grid opacity-10"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Global Average</p>
                            <div className="flex items-end space-x-2">
                                <span className="text-5xl font-black text-white leading-none">
                                    {completedAttempts.length > 0 ? `${avgScore}%` : '--'}
                                </span>
                                <span className="text-sm font-bold text-indigo-400 pb-1 uppercase tracking-tighter">Performance</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Activity Feed and Quick Actions */}
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Activity Feed</h2>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{attempts.length} Records</span>
                        </div>

                        <Card className="overflow-hidden border-slate-100 bg-white">
                            {attempts.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-300">
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
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Detail</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {attempts.map((attempt) => (
                                                <tr key={attempt._id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{attempt.assessment?.title}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                                                {new Date(attempt.startedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        {attempt.status === 'completed' ? (
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex-1 bg-slate-100 h-1.5 w-16 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${attempt.percentage >= 60 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                                                                        style={{ width: `${attempt.percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className={`text-sm font-black ${attempt.percentage >= 60 ? 'text-indigo-600' : 'text-rose-600'}`}>
                                                                    {Math.round(attempt.percentage)}%
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-1 rounded">In Progress</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {attempt.status === 'completed' ? (
                                                            <Link href={`/results/${attempt._id}`}>
                                                                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-black tracking-widest text-indigo-600 hover:bg-indigo-50">Report</Button>
                                                            </Link>
                                                        ) : (
                                                            <Link href={`/exam/${attempt._id}`}>
                                                                <Button variant="primary" size="sm" className="text-[10px] uppercase font-black tracking-widest shadow-lg shadow-indigo-100">Resume</Button>
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
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Terminal Access</h2>

                        <Card className="p-8 bg-indigo-600 text-white relative overflow-hidden group border-0 shadow-2xl shadow-indigo-200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4 relative z-10">Certification</h3>
                            <p className="text-indigo-100 text-sm font-medium mb-8 relative z-10 leading-relaxed">View and share your verified achievement certificates.</p>
                            <Link href="/dashboard" className="relative z-10">
                                <Button variant="primary" className="bg-white text-indigo-600 hover:bg-slate-100 w-full py-4 text-xs uppercase tracking-widest font-black">Archive Access</Button>
                            </Link>
                        </Card>

                        <Card className="p-8 bg-white border-slate-100 hover:border-indigo-200 group">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Support Ops</h3>
                            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">Need assistance with an assessment or your results?</p>
                            <Button variant="outline" className="w-full py-4 text-xs uppercase tracking-widest font-black border-slate-200 group-hover:border-indigo-600 group-hover:text-indigo-600">Open Ticket</Button>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
