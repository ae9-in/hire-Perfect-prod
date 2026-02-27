'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [attempts, setAttempts] = useState<any[]>([]);

    const [logs, setLogs] = useState<any[]>([]);
    const [isLogsOpen, setIsLogsOpen] = useState(false);

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

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setLogs(data.logs);
            setIsLogsOpen(true);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Booting Admin Modules..." />;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid selection:bg-cyan-500/30 selection:text-cyan-400 relative overflow-hidden">
            {/* Cinematic Background Elements ... same as before ... */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-scan shadow-[0_0_15px_rgba(0,242,255,0.5)]"></div>
            </div>

            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                {/* Header Context */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-12">
                    <div>
                        <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4 glow-sm">
                            Platform Command Center
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            ADMIN <br /><span className="text-gradient">TELEMETRY.</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium mt-6 max-w-lg">
                            High-precision overview of global operative performance, revenue acquisition, and session integrity.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/admin/faq-submissions">
                            <Button variant="outline" className="px-8 py-4 uppercase tracking-widest text-[10px] font-black border-white/10 hover:border-cyan-500/40 text-white">
                                FAQ Inbox
                            </Button>
                        </Link>
                        <Button variant="primary" className="px-8 py-4 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-cyan-500/20 bg-cyan-500 hover:bg-cyan-400 border-none" onClick={loadData}>Refresh Link</Button>
                    </div>
                </div>

                {/* Analytical Bento */}
                <div className="grid md:grid-cols-4 gap-6 mb-16">
                    <StatCard title="Gross Extraction" value={`₹${stats?.totalRevenue || 0}`} trend="+12.4%" subtitle="Total cumulative revenue" icon="💰" color="cyan" />
                    <StatCard title="Active Deployments" value={stats?.totalAttempts || 0} trend="+8.2%" subtitle="Unique session starts" icon="⚡" color="purple" />
                    <StatCard title="Accuracy Mean" value={`${stats?.averageScore || 0}%`} trend="-1.1%" subtitle="Global performance" icon="🎯" color="emerald" />
                    <StatCard title="Protocol Breach" value={stats?.totalViolations || 0} trend="Nominal" subtitle="GuardEye alerts" icon="🛡️" color="rose" />
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Live Operations Feed */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                Live Operations
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/20">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Active</span>
                                </span>
                            </h2>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{attempts.length} Deployments</span>
                        </div>

                        <Card className="overflow-hidden border-white/5 bg-[#0a0a0f]/60 backdrop-blur-xl glass-cyan">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operative Identity</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Metric Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Deployment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02]">
                                        {attempts.map((attempt) => (
                                            <tr key={attempt._id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black text-xs border border-cyan-500/20 shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                                                            {attempt.user?.name?.[0].toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-white uppercase tracking-tight">{attempt.user?.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">{attempt.assessment?.title}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-6">
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Accuracy</p>
                                                            <p className={`text-sm font-black ${attempt.percentage >= 60 ? 'text-cyan-400' : 'text-rose-500'}`}>
                                                                {attempt.status === 'completed' ? `${Math.round(attempt.percentage)}%` : '--'}
                                                            </p>
                                                        </div>
                                                        <div className="h-6 w-px bg-white/5"></div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Alerts</p>
                                                            <p className={`text-sm font-black ${attempt.violationCount > 3 ? 'text-rose-500' : 'text-white'}`}>
                                                                {attempt.violationCount}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${attempt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        attempt.status === 'terminated' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                            'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
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
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Ops Intelligence</h3>

                            <Card className="p-10 bg-[#0a0a0f]/60 backdrop-blur-xl border-white/5 glass shadow-2xl">
                                <h3 className="font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                                    <span className="w-2 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)]"></span>
                                    Extraction Matrix
                                </h3>
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end border-b border-white/5 pb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Standard Delta</p>
                                            <p className="text-xl font-black text-white tracking-tighter">Individual Units</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-cyan-400 tracking-tighter leading-none mb-1">₹{Math.round((stats?.totalRevenue || 0) * 0.6)}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">60% Contribution</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-white/5 pb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bundle Delta</p>
                                            <p className="text-xl font-black text-white tracking-tighter">Category Packs</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-purple-500 tracking-tighter leading-none mb-1">₹{Math.round((stats?.totalRevenue || 0) * 0.3)}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">30% Contribution</p>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <p className="text-[10px] font-black text-slate-500 mb-6 uppercase tracking-widest">Track Distribution</p>
                                        <div className="space-y-6">
                                            <DistributionBar label="IT Core" percentage={42} color="#00f2ff" />
                                            <DistributionBar label="Development" percentage={28} color="#8b5cf6" />
                                            <DistributionBar label="Enterprise" percentage={15} color="#ec4899" />
                                            <DistributionBar label="Humanitarian" percentage={15} color="#f43f5e" />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-10 bg-[#020205] text-white border-white/5 shadow-2xl shadow-cyan-500/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-grid opacity-10"></div>
                                <div className="relative z-10">
                                    <h3 className="font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                        <span className="w-2 h-6 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                        Node Monitor
                                    </h3>
                                    <div className="space-y-6">
                                        <SystemMetric label="Kernel Core" status="Optimized" color="emerald" />
                                        <SystemMetric label="Dataplumb" status="Synchronized" color="emerald" />
                                        <SystemMetric label="GuardEye AI" status="Active" color="cyan" pulse />
                                        <SystemMetric label="Telemetry" status="Stable" color="emerald" />
                                    </div>
                                    <Button variant="ghost" className="w-full mt-10 border-white/5 text-slate-500 hover:text-white hover:bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest" onClick={fetchLogs}>Access Root Logs</Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Log Modal */}
                {isLogsOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020205]/80 backdrop-blur-sm">
                        <Card className="w-full max-w-4xl max-h-[80vh] bg-[#0a0a0f] border-emerald-500/20 shadow-2xl shadow-emerald-500/10 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-8 border-b border-white/5">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Root Log Registry
                                </h2>
                                <button onClick={() => setIsLogsOpen(false)} className="text-slate-500 hover:text-white transition-colors">✕ CLOSE_LINK</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-4 font-mono">
                                {logs.map((log, i) => (
                                    <div key={log._id || i} className={`p-4 rounded-xl border flex items-start gap-6 transition-all hover:bg-white/5 ${log.severity === 'critical' ? 'bg-rose-500/5 border-rose-500/20' :
                                            log.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                                                'bg-white/[0.02] border-white/5'
                                        }`}>
                                        <span className="text-[10px] font-black text-slate-500 shrink-0 mt-1">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${log.severity === 'critical' ? 'text-rose-500' :
                                                        log.severity === 'warning' ? 'text-amber-500' :
                                                            'text-emerald-500'
                                                    }`}>{log.action}</span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">BY {log.actor.name} ({log.actor.role})</span>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">{log.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ title, value, trend, subtitle, icon, color }: any) {
    const colorClasses = {
        cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(0,242,255,0.05)]',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    } as any;

    return (
        <Card className={`p-8 group hover:scale-[1.02] transition-all duration-500 bg-[#0a0a0f]/60 backdrop-blur-xl border-white/5 ${color === 'cyan' ? 'glass-cyan' : ''}`}>
            <div className="flex items-center justify-between mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${colorClasses[color]}`}>{icon}</div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${colorClasses[color]}`}>{trend}</span>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-4xl font-black text-white tracking-tighter leading-none mb-3">{value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{subtitle}</p>
        </Card>
    );
}

function DistributionBar({ label, percentage, color }: any) {
    return (
        <div className="group">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-2">
                <span className="text-slate-500 group-hover:text-white transition-colors">{label}</span>
                <span className="text-slate-500">{percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 group-hover:shadow-[0_0_10px_rgba(0,0,242,0.3)]"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function SystemMetric({ label, status, color, pulse }: any) {
    const dotColors = {
        emerald: 'bg-emerald-500',
        cyan: 'bg-cyan-400',
    } as any;

    return (
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <div className="flex items-center gap-2">
                {pulse && <div className={`w-1.5 h-1.5 rounded-full ${dotColors[color]} animate-ping`}></div>}
                <span className={`text-[9px] font-black uppercase tracking-widest border border-white/5 py-1 px-3 rounded-full ${color === 'emerald' ? 'text-emerald-400 bg-emerald-400/5' : 'text-cyan-400 bg-cyan-400/5'}`}>
                    {status}
                </span>
            </div>
        </div>
    );
}
