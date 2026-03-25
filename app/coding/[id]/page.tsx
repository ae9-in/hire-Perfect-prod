'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚙️' },
];

const DIFFICULTY_COLOR: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [challenge, setChallenge] = useState<any>(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [explanation, setExplanation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [existingSubmissions, setExistingSubmissions] = useState<any[]>([]);

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        fetchChallenge();
        fetchMySubmissions();
    }, [id]);

    const fetchChallenge = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/coding-challenges/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setChallenge(data.challenge);
                // Pre-fill starter code if available
                if (data.challenge.starterCode?.[language]) {
                    setCode(data.challenge.starterCode[language]);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMySubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/coding-submissions?challengeId=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setExistingSubmissions(data.submissions);
        } catch (e) { /* ignore */ }
    };

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        if (challenge?.starterCode?.[lang]) {
            setCode(challenge.starterCode[lang]);
        }
    };

    const handleSubmit = async () => {
        setError('');
        if (!code.trim()) return setError('Please write your code solution');
        if (!explanation.trim() || explanation.length < 10)
            return setError('Please explain your approach (min. 10 characters)');

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/coding-submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ challengeId: id, code, language, explanation }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                fetchMySubmissions();
            } else {
                setError(data.error || 'Submission failed');
            }
        } catch (e) {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Challenge..." />;
    if (!challenge) return (
        <div className="min-h-screen bg-[#020205] flex items-center justify-center">
            <p className="text-white">Challenge not found</p>
        </div>
    );

    const diffClass = DIFFICULTY_COLOR[challenge.difficulty] || DIFFICULTY_COLOR.medium;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
            </div>
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Challenge Description */}
                    <div className="space-y-6">
                        <div>
                            <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest border rounded-lg mb-4 ${diffClass}`}>
                                {challenge.difficulty}
                            </span>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight mb-4">
                                {challenge.title}
                            </h1>
                            {challenge.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {challenge.tags.map((t: string) => (
                                        <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Card className="p-8 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-4 bg-emerald-500 rounded-full" />
                                Problem Statement
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                                {challenge.description}
                            </p>
                        </Card>

                        {challenge.constraints && (
                            <Card className="p-8 bg-[#0a0a0f]/60 border-amber-500/10 backdrop-blur-xl">
                                <h2 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-4 bg-amber-500 rounded-full" />
                                    Constraints
                                </h2>
                                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-mono text-xs">
                                    {challenge.constraints}
                                </p>
                            </Card>
                        )}

                        {challenge.examples?.length > 0 && (
                            <Card className="p-8 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="w-2 h-4 bg-cyan-500 rounded-full" />
                                    Examples
                                </h2>
                                <div className="space-y-6">
                                    {challenge.examples.map((ex: any, i: number) => (
                                        <div key={i} className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Example {i + 1}</p>
                                            <div className="bg-[#020205] rounded-xl p-4 border border-white/5 font-mono text-sm">
                                                <p className="text-slate-400">Input: <span className="text-cyan-400">{ex.input}</span></p>
                                                <p className="text-slate-400 mt-1">Output: <span className="text-emerald-400">{ex.output}</span></p>
                                            </div>
                                            {ex.explanation && (
                                                <p className="text-xs text-slate-500 italic">{ex.explanation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Previous submissions */}
                        {existingSubmissions.length > 0 && (
                            <Card className="p-8 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">
                                    Your Submissions ({existingSubmissions.length})
                                </h2>
                                <div className="space-y-3">
                                    {existingSubmissions.map((s: any) => (
                                        <div key={s._id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                            <div>
                                                <span className="text-[9px] font-black text-white uppercase tracking-widest">{s.language}</span>
                                                <p className="text-[9px] text-slate-500 mt-0.5">{new Date(s.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {s.score !== null && (
                                                    <span className="text-sm font-black text-cyan-400">{s.score}/100</span>
                                                )}
                                                <StatusBadge status={s.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right: Code Submission */}
                    <div className="space-y-6">
                        {submitted ? (
                            <Card className="p-12 text-center bg-[#0a0a0f]/60 border-emerald-500/20 backdrop-blur-xl">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl mx-auto mb-6">
                                    ✅
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
                                    Solution Submitted!
                                </h2>
                                <p className="text-slate-400 mb-8">Your solution is being reviewed. You'll receive feedback soon.</p>
                                <div className="flex gap-4 justify-center">
                                    <Button variant="outline" className="border-white/10 text-white hover:border-emerald-500/40" onClick={() => setSubmitted(false)}>
                                        Submit Another
                                    </Button>
                                    <Button variant="primary" className="bg-emerald-500 hover:bg-emerald-400 border-none" onClick={() => router.push('/coding')}>
                                        More Challenges
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <>
                                {/* Language Selector */}
                                <Card className="p-6 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Select Language</p>
                                    <div className="flex flex-wrap gap-2">
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.value}
                                                onClick={() => handleLanguageChange(lang.value)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${language === lang.value
                                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                                    : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/20 hover:text-white'
                                                    }`}
                                            >
                                                {lang.icon} {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </Card>

                                {/* Code Editor */}
                                <Card className="bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                                                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                solution.{language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 uppercase">
                                            {code.split('\n').length} lines
                                        </span>
                                    </div>
                                    <textarea
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="// Write your solution here..."
                                        className="w-full bg-transparent text-slate-200 font-mono text-sm p-6 outline-none resize-none"
                                        style={{ minHeight: '320px', lineHeight: '1.7' }}
                                        spellCheck={false}
                                    />
                                </Card>

                                {/* Explanation */}
                                <Card className="bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                                        <span className="w-2 h-4 bg-purple-500 rounded-full" />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            Explain Your Approach <span className="text-rose-500">*</span>
                                        </p>
                                    </div>
                                    <textarea
                                        value={explanation}
                                        onChange={(e) => setExplanation(e.target.value)}
                                        placeholder="Describe your algorithm, time complexity, why you chose this approach..."
                                        className="w-full bg-transparent text-slate-300 text-sm p-6 outline-none resize-none"
                                        style={{ minHeight: '140px', lineHeight: '1.7' }}
                                    />
                                    <div className="px-6 pb-4">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${explanation.length < 10 ? 'text-slate-600' : 'text-emerald-500'}`}>
                                            {explanation.length} / min. 10 chars
                                        </p>
                                    </div>
                                </Card>

                                {error && (
                                    <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest">
                                        ⚠ {error}
                                    </div>
                                )}

                                <Button
                                    variant="primary"
                                    className="w-full py-5 text-sm font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 border-none shadow-xl shadow-emerald-500/20"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? '⏳ Submitting...' : '🚀 Submit Solution'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        under_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        needs_improvement: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
    return (
        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${map[status] || map.pending}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
