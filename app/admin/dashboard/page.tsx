'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [attempts, setAttempts] = useState<any[]>([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [statsRes, attemptsRes] = await Promise.all([
                fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/attempts', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const statsData = await statsRes.json();
            const attemptsData = await attemptsRes.json();

            if (statsData.success) setStats(statsData.stats);
            if (attemptsData.success) setAttempts(attemptsData.attempts);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Booting Admin Modules..." />;

    return (
        <div className="min-h-screen bg-slate-50 bg-grid selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container">
                {/* Header Context */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-12">
                    <div>
                        <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                            Platform Command Center
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">
                            ADMIN <br /><span className="text-gradient">TELEMETRY.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium mt-6 max-w-lg">
                            High-precision overview of global operative performance, revenue acquisition, and session integrity.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black">{String.fromCharCode(65 + i)}</div>
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">+12</div>
                        </div>
                        <Button variant="primary" className="px-8 py-4 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-indigo-100" onClick={loadData}>Refresh Link</Button>
                    </div>
                </div>

                {/* Analytical Bento */}
                <div className="grid md:grid-cols-4 gap-6 mb-16">
                    <StatCard title="Gross Extraction" value={`₹${stats?.totalRevenue || 0}`} trend="+12.4%" subtitle="Total cumulative revenue" icon="💰" color="indigo" />
                    <StatCard title="Active Deployments" value={stats?.totalAttempts || 0} trend="+8.2%" subtitle="Unique session starts" icon="⚡" color="purple" />
                    <StatCard title="Accuracy Mean" value={`${stats?.averageScore || 0}%`} trend="-1.1%" subtitle="Global performance" icon="🎯" color="emerald" />
                    <StatCard title="Protocol Breach" value={stats?.totalViolations || 0} trend="Nominal" subtitle="GuardEye alerts" icon="🛡️" color="rose" />
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Live Operations Feed */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                                Live Operations
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 rounded-full border border-rose-100">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Active</span>
                                </span>
                            </h2>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{attempts.length} Deployments</span>
                        </div>

                        <Card className="overflow-hidden border-slate-100 bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operative Identity</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deployment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {attempts.map((attempt) => (
                                            <tr key={attempt._id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100">
                                                            {attempt.user?.name?.[0].toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{attempt.user?.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{attempt.assessment?.title}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-6">
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Accuracy</p>
                                                            <p className={`text-sm font-black ${attempt.percentage >= 60 ? 'text-indigo-600' : 'text-rose-500'}`}>
                                                                {attempt.status === 'completed' ? `${Math.round(attempt.percentage)}%` : '--'}
                                                            </p>
                                                        </div>
                                                        <div className="h-6 w-px bg-slate-100"></div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Alerts</p>
                                                            <p className={`text-sm font-black ${attempt.violationCount > 3 ? 'text-rose-500' : 'text-slate-900'}`}>
                                                                {attempt.violationCount}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${attempt.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            attempt.status === 'terminated' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                        }`}>
                                                        {attempt.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Operational Intelligence */}
                    <div className="space-y-12">
                        <div className="space-y-8">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Ops Intelligence</h3>

                            <Card className="p-10 bg-white border-slate-100 group">
                                <h3 className="font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                                    Extraction Matrix
                                </h3>
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end border-b border-slate-50 pb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Delta</p>
                                            <p className="text-xl font-black text-slate-900 tracking-tighter">Individual Units</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-indigo-600 tracking-tighter leading-none mb-1">₹{Math.round((stats?.totalRevenue || 0) * 0.6)}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">60% Contribution</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-50 pb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bundle Delta</p>
                                            <p className="text-xl font-black text-slate-900 tracking-tighter">Category Packs</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-purple-600 tracking-tighter leading-none mb-1">₹{Math.round((stats?.totalRevenue || 0) * 0.3)}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">30% Contribution</p>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <p className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest">Track Distribution</p>
                                        <div className="space-y-6">
                                            <DistributionBar label="IT Core" percentage={42} color="#6366f1" />
                                            <DistributionBar label="Development" percentage={28} color="#8b5cf6" />
                                            <DistributionBar label="Enterprise" percentage={15} color="#ec4899" />
                                            <DistributionBar label="Humanitarian" percentage={15} color="#f43f5e" />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-10 bg-slate-950 text-white border-0 shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-grid opacity-10"></div>
                                <div className="relative z-10">
                                    <h3 className="font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                        <span className="w-2 h-6 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                        Node Monitor
                                    </h3>
                                    <div className="space-y-6">
                                        <SystemMetric label="Kernel Core" status="Optimized" color="emerald" />
                                        <SystemMetric label="Dataplumb" status="Synchronized" color="emerald" />
                                        <SystemMetric label="GuardEye AI" status="Active" color="indigo" pulse />
                                        <SystemMetric label="Telemetry" status="Stable" color="emerald" />
                                    </div>
                                    <Button variant="ghost" className="w-full mt-10 border-white/5 text-white/40 hover:text-white hover:bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest">Access Root Logs</Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, trend, subtitle, icon, color }: any) {
    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
    } as any;

    return (
        <Card className="p-8 group hover:scale-[1.02] transition-transform duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${colorClasses[color]}`}>{icon}</div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${colorClasses[color]}`}>{trend}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">{value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{subtitle}</p>
        </Card>
    );
}

function DistributionBar({ label, percentage, color }: any) {
    return (
        <div className="group">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-2">
                <span className="text-slate-500 group-hover:text-slate-900 transition-colors">{label}</span>
                <span className="text-slate-400">{percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 group-hover:shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function SystemMetric({ label, status, color, pulse }: any) {
    const dotColors = {
        emerald: 'bg-emerald-500',
        indigo: 'bg-indigo-500',
    } as any;

    return (
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{label}</span>
            <div className="flex items-center gap-2">
                {pulse && <div className={`w-1.5 h-1.5 rounded-full ${dotColors[color]} animate-ping`}></div>}
                <span className={`text-[9px] font-black uppercase tracking-widest border border-white/5 py-1 px-3 rounded-full ${color === 'emerald' ? 'text-emerald-400 bg-emerald-400/5' : 'text-indigo-400 bg-indigo-400/5'}`}>
                    {status}
                </span>
            </div>
        </div>
    );
}
