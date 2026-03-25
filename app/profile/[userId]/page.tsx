'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const SKILL_CAT_COLORS: Record<string, string> = {
    frontend: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    backend: 'text-green-400 bg-green-500/10 border-green-500/20',
    database: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    devops: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    dsa: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    other: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

const STATUS_COLORS: Record<string, string> = {
    'Not Attempted': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'In Progress': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Submitted': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Under Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Evaluated': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/profile/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setProfile(data.profile);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Profile..." />;
    if (!profile) return (
        <div className="min-h-screen bg-[#020205] flex items-center justify-center text-white">
            Profile not found
        </div>
    );

    const { user, mcq, coding, projects, skills, overallScore, candidateStatus } = profile;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
            </div>
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                {/* Hero Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-3xl font-black text-white">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{user.name}</h1>
                            <p className="text-slate-400 text-sm mt-1">{user.email}</p>
                            <div className="flex items-center gap-3 mt-3">
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${STATUS_COLORS[candidateStatus] || STATUS_COLORS['Not Attempted']}`}>
                                    {candidateStatus}
                                </span>
                                {user.role === 'admin' && (
                                    <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border bg-purple-500/10 text-purple-400 border-purple-500/20">
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Overall Score */}
                    <div className="text-center lg:text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Overall Score</p>
                        <div className="relative w-32 h-32 mx-auto lg:mx-0 lg:ml-auto">
                            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                                <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                                <circle
                                    cx="64" cy="64" r="54"
                                    stroke="url(#scoreGrad)"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(overallScore / 100) * 339.3} 339.3`}
                                />
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#00f2ff" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-white">{Math.round(overallScore)}</span>
                                <span className="text-[10px] font-black text-slate-500">/ 100</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
                            MCQ×0.3 + Code×0.4 + Projects×0.3
                        </p>
                    </div>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <ScoreCard
                        title="MCQ Score"
                        score={mcq.score}
                        subtitle={`${mcq.attemptCount} assessment${mcq.attemptCount !== 1 ? 's' : ''}`}
                        icon="🧠"
                        color="cyan"
                        weight="30%"
                    />
                    <ScoreCard
                        title="Coding Score"
                        score={coding.score}
                        subtitle={`${coding.submissionCount} reviewed`}
                        icon="</>"
                        color="emerald"
                        weight="40%"
                    />
                    <ScoreCard
                        title="Project Score"
                        score={Math.round(projects.score)}
                        subtitle={`${projects.ratedCount} of ${projects.count} rated`}
                        icon="🗂️"
                        color="purple"
                        weight="30%"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Skills Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-8 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-2 h-4 bg-cyan-500 rounded-full" />
                                Skills ({skills.length})
                            </h2>

                            {skills.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">No skills assigned yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {skills.map((us: any) => (
                                        <div key={us._id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className={`shrink-0 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border ${SKILL_CAT_COLORS[us.skillId?.category] || SKILL_CAT_COLORS.other}`}>
                                                    {us.skillId?.category?.slice(0, 3).toUpperCase()}
                                                </span>
                                                <span className="text-xs font-black text-white truncate">{us.skillId?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-3">
                                                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                                        style={{ width: `${us.rating * 10}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-white w-6 text-right">{us.rating}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right: Projects + Submissions */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Projects */}
                        <Card className="p-8 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-2 h-4 bg-purple-500 rounded-full" />
                                Projects ({projects.items.length})
                            </h2>

                            {projects.items.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">No projects submitted</p>
                            ) : (
                                <div className="space-y-4">
                                    {projects.items.map((p: any) => (
                                        <div key={p._id} className="flex items-start justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-black text-white uppercase tracking-tight">{p.title}</span>
                                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded border ${p.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                {p.techStack?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {p.techStack.slice(0, 4).map((t: string) => (
                                                            <span key={t} className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] text-slate-500">{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {p.feedback && (
                                                    <p className="text-xs text-emerald-400/80 mt-2 italic">{p.feedback}</p>
                                                )}
                                            </div>
                                            {p.rating !== null && (
                                                <div className="ml-4 text-right">
                                                    <span className="text-2xl font-black text-purple-400">{p.rating}</span>
                                                    <p className="text-[9px] text-slate-500">/10</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* Coding Submissions */}
                        <Card className="p-8 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-2 h-4 bg-emerald-500 rounded-full" />
                                Coding Submissions ({coding.submissionCount})
                            </h2>

                            {coding.submissions.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">No evaluated coding submissions</p>
                            ) : (
                                <div className="space-y-3">
                                    {coding.submissions.map((s: any) => (
                                        <div key={s._id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                            <div>
                                                <span className="text-sm font-black text-white uppercase tracking-tight">{(s.challengeId as any)?.title || 'Challenge'}</span>
                                                <p className="text-[10px] text-slate-500 uppercase mt-0.5">{s.language}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded border ${s.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : s.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                    {s.status}
                                                </span>
                                                {s.score !== null && (
                                                    <span className="text-lg font-black text-emerald-400">{s.score}<span className="text-xs text-slate-500">/100</span></span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ScoreCard({ title, score, subtitle, icon, color, weight }: {
    title: string; score: number; subtitle: string; icon: string; color: 'cyan' | 'emerald' | 'purple'; weight: string;
}) {
    const colorClasses = {
        cyan: { border: 'border-cyan-500/20', text: 'text-cyan-400', bg: 'bg-cyan-500/10', bar: 'from-cyan-500 to-cyan-400' },
        emerald: { border: 'border-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'from-emerald-500 to-emerald-400' },
        purple: { border: 'border-purple-500/20', text: 'text-purple-400', bg: 'bg-purple-500/10', bar: 'from-purple-500 to-purple-400' },
    };
    const c = colorClasses[color];

    return (
        <Card className={`p-6 bg-[#0a0a0f]/60 border-white/5 hover:${c.border} transition-all backdrop-blur-xl`}>
            <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-lg mb-4`}>
                {icon}
            </div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <p className={`text-3xl font-black ${c.text} mb-1`}>{score.toFixed(1)}</p>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full bg-gradient-to-r ${c.bar} transition-all duration-1000`} style={{ width: `${score}%` }} />
            </div>
            <div className="flex justify-between">
                <p className="text-[9px] font-bold text-slate-500 uppercase">{subtitle}</p>
                <p className="text-[9px] font-black text-slate-600 uppercase">Weight: {weight}</p>
            </div>
        </Card>
    );
}
