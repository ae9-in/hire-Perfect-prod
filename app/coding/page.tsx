'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import Link from 'next/link';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const DIFFICULTY_MAP = {
    easy: { label: 'EASY', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    medium: { label: 'MEDIUM', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    hard: { label: 'HARD', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

export default function CodingChallengesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/coding-challenges', window.location.origin);
            if (difficultyFilter) url.searchParams.set('difficulty', difficultyFilter);

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setChallenges(data.challenges);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) fetchChallenges();
    }, [difficultyFilter]);

    const filtered = challenges.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Challenges..." />;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid selection:bg-cyan-500/30 selection:text-cyan-400 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-scan" />
            </div>

            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                            Code Arena
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            CODING <br /><span className="text-gradient">CHALLENGES.</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium mt-6 max-w-lg">
                            Prove your coding skills. Pick a challenge, write your solution, explain your approach.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="SEARCH CHALLENGES..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#0a0a0f]/60 border border-white/10 rounded-xl px-12 py-4 text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all w-full sm:w-72"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                        </div>
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value)}
                            className="bg-[#0a0a0f]/60 border border-white/10 rounded-xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none cursor-pointer"
                        >
                            <option value="">ALL LEVELS</option>
                            <option value="easy">EASY</option>
                            <option value="medium">MEDIUM</option>
                            <option value="hard">HARD</option>
                        </select>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                    {[
                        { label: 'Total Challenges', value: challenges.length, icon: '⚡' },
                        { label: 'Easy', value: challenges.filter(c => c.difficulty === 'easy').length, icon: '🟢' },
                        { label: 'Hard', value: challenges.filter(c => c.difficulty === 'hard').length, icon: '🔴' },
                    ].map(({ label, value, icon }) => (
                        <Card key={label} className="p-6 bg-[#0a0a0f]/60 border-white/5 text-center backdrop-blur-xl">
                            <div className="text-2xl mb-2">{icon}</div>
                            <p className="text-2xl font-black text-white">{value}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                {/* Challenges Grid */}
                {filtered.length === 0 ? (
                    <Card className="p-24 text-center border-white/5 bg-[#0a0a0f]/60">
                        <div className="text-6xl mb-6">🧩</div>
                        <p className="text-xl font-black text-white uppercase tracking-tight">No Challenges Found</p>
                        <p className="text-sm text-slate-500 mt-2">Check back later or adjust your filters</p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((challenge) => {
                            const diff = DIFFICULTY_MAP[challenge.difficulty as keyof typeof DIFFICULTY_MAP] || DIFFICULTY_MAP.medium;
                            return (
                                <Link key={challenge._id} href={`/coding/${challenge._id}`}>
                                    <Card className="p-8 group hover:scale-[1.02] transition-all duration-300 bg-[#0a0a0f]/60 border-white/5 hover:border-emerald-500/30 cursor-pointer h-full flex flex-col backdrop-blur-xl">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex-1">
                                                <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${diff.color} mb-3`}>
                                                    {diff.label}
                                                </span>
                                                <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors line-clamp-2">
                                                    {challenge.title}
                                                </h3>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 ml-4 shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                                {'</>'}
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-400 leading-relaxed flex-1 line-clamp-3 mb-6">
                                            {challenge.description}
                                        </p>

                                        {/* Tags */}
                                        {challenge.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {challenge.tags.slice(0, 3).map((tag: string) => (
                                                    <span key={tag} className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded bg-white/5 text-slate-400 border border-white/5">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                Solve Challenge →
                                            </span>
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                →
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
