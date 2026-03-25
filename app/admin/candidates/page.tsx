'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const STATUS_COLORS: Record<string, string> = {
    'Not Attempted': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'In Progress': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Submitted': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Under Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Evaluated': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function AdminCandidatesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingProfiles, setLoadingProfiles] = useState(false);

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') { router.push('/dashboard'); return; }
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/users?role=candidate', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                const candidateList = data.users.filter((u: any) => u.role === 'candidate');
                setCandidates(candidateList);
                // Load first 10 profiles
                loadProfiles(candidateList.slice(0, 10), token as string);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const loadProfiles = async (users: any[], token: string) => {
        setLoadingProfiles(true);
        const results: Record<string, any> = {};
        await Promise.allSettled(
            users.map(async (u) => {
                try {
                    const res = await fetch(`/api/profile/${u._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    if (data.success) results[u._id] = data.profile;
                } catch { /* ignore */ }
            })
        );
        setProfiles(prev => ({ ...prev, ...results }));
        setLoadingProfiles(false);
    };

    const filtered = candidates.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Candidates..." />;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
            </div>
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                            Admin · Evaluation Hub
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            CANDIDATE <br /><span className="text-gradient">PROFILES.</span>
                        </h1>
                        <p className="text-slate-400 mt-4 max-w-lg">View unified candidate profiles with MCQ, coding, and project scores.</p>
                    </div>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="SEARCH CANDIDATES..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-[#0a0a0f]/60 border border-white/10 rounded-xl px-12 py-4 text-xs font-black text-white uppercase tracking-widest focus:border-cyan-500/50 outline-none transition-all w-full md:w-80"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-12">
                    <Card className="p-6 bg-[#0a0a0f]/60 border-white/5 text-center">
                        <p className="text-3xl font-black text-white">{candidates.length}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Candidates</p>
                    </Card>
                    {['Evaluated', 'Under Review', 'Not Attempted'].map(status => (
                        <Card key={status} className="p-6 bg-[#0a0a0f]/60 border-white/5 text-center">
                            <p className="text-3xl font-black text-white">
                                {Object.values(profiles).filter((p: any) => p.candidateStatus === status).length}
                            </p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{status}</p>
                        </Card>
                    ))}
                </div>

                {/* Candidate Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((candidate) => {
                        const profile = profiles[candidate._id];
                        return (
                            <Link key={candidate._id} href={`/profile/${candidate._id}`}>
                                <Card className="p-8 group hover:scale-[1.01] transition-all duration-300 bg-[#0a0a0f]/60 border-white/5 hover:border-cyan-500/20 cursor-pointer h-full flex flex-col backdrop-blur-xl">
                                    {/* Header */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-xl font-black text-white">
                                            {candidate.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-white uppercase tracking-tight truncate">{candidate.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{candidate.email}</p>
                                        </div>
                                    </div>

                                    {profile ? (
                                        <>
                                            {/* Status */}
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg border ${STATUS_COLORS[profile.candidateStatus] || STATUS_COLORS['Not Attempted']}`}>
                                                    {profile.candidateStatus}
                                                </span>
                                                <div className="text-right">
                                                    <span className="text-2xl font-black text-white">{Math.round(profile.overallScore)}</span>
                                                    <span className="text-[10px] text-slate-500 ml-1">/100</span>
                                                </div>
                                            </div>

                                            {/* Score bars */}
                                            <div className="space-y-2 mb-4">
                                                {[
                                                    { label: 'MCQ', value: profile.mcq.score, color: 'bg-cyan-500' },
                                                    { label: 'Code', value: profile.coding.score, color: 'bg-emerald-500' },
                                                    { label: 'Projects', value: profile.projects.score, color: 'bg-purple-500' },
                                                ].map(({ label, value, color }) => (
                                                    <div key={label}>
                                                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 mb-1">
                                                            <span>{label}</span>
                                                            <span>{value.toFixed(0)}</span>
                                                        </div>
                                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Skills preview */}
                                            {profile.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {profile.skills.slice(0, 4).map((us: any) => (
                                                        <span key={us._id} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] font-black text-slate-400 uppercase">
                                                            {us.skillId?.name} {us.rating}/10
                                                        </span>
                                                    ))}
                                                    {profile.skills.length > 4 && (
                                                        <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] text-slate-500">+{profile.skills.length - 4}</span>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                {loadingProfiles ? 'Loading...' : 'No data yet'}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">View Full Profile</span>
                                        <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-[10px] group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                            →
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <Card className="p-24 text-center border-white/5 bg-[#0a0a0f]/60">
                        <div className="text-5xl mb-4">👥</div>
                        <p className="text-slate-500 text-sm uppercase font-black tracking-widest">No candidates found</p>
                    </Card>
                )}
            </main>
        </div>
    );
}
