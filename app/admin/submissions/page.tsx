'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    under_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    needs_improvement: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const LANG_ICONS: Record<string, string> = {
    javascript: '🟨',
    typescript: '🔷',
    python: '🐍',
    java: '☕',
    cpp: '⚙️',
};

export default function AdminSubmissionsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [filter, setFilter] = useState({ status: '', challengeId: '' });
    const [evalForm, setEvalForm] = useState({ score: '', feedback: '', status: 'approved' });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') { router.push('/dashboard'); return; }
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/coding-submissions', window.location.origin);
            if (filter.status) url.searchParams.set('status', filter.status);
            const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSubmissions(data.submissions);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!loading) fetchSubmissions();
    }, [filter.status]);

    const openSubmission = (s: any) => {
        setSelected(s);
        setEvalForm({
            score: s.score?.toString() || '',
            feedback: s.feedback || '',
            status: s.status === 'pending' ? 'under_review' : s.status,
        });
        setSaveMsg('');
    };

    const handleEvaluate = async () => {
        if (!selected) return;
        if (evalForm.score !== '' && (Number(evalForm.score) < 0 || Number(evalForm.score) > 100)) {
            setSaveMsg('Score must be 0–100');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/coding-submissions/${selected._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    score: evalForm.score !== '' ? Number(evalForm.score) : undefined,
                    feedback: evalForm.feedback,
                    status: evalForm.status,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSaveMsg('✓ Evaluation saved');
                setSelected(data.submission);
                setSubmissions(submissions.map(s => s._id === data.submission._id ? data.submission : s));
            } else {
                setSaveMsg(data.error || 'Save failed');
            }
        } catch { setSaveMsg('Network error'); }
        finally { setSaving(false); }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Submissions..." />;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
            </div>
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                            Admin · Code Review
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            CODE <br /><span className="text-gradient">SUBMISSIONS.</span>
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={filter.status}
                            onChange={e => setFilter({ ...filter, status: e.target.value })}
                            className="bg-[#0a0a0f]/60 border border-white/10 rounded-xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest focus:border-cyan-500/50 outline-none cursor-pointer"
                        >
                            <option value="">ALL STATUS</option>
                            <option value="pending">PENDING</option>
                            <option value="under_review">UNDER REVIEW</option>
                            <option value="approved">APPROVED</option>
                            <option value="rejected">REJECTED</option>
                            <option value="needs_improvement">NEEDS IMPROVEMENT</option>
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-4 mb-12">
                    {[
                        { label: 'Total', value: submissions.length },
                        { label: 'Pending', value: submissions.filter(s => s.status === 'pending').length },
                        { label: 'Approved', value: submissions.filter(s => s.status === 'approved').length },
                        { label: 'Rejected', value: submissions.filter(s => s.status === 'rejected').length },
                        { label: 'Avg Score', value: (() => {
                            const scored = submissions.filter(s => s.score !== null);
                            return scored.length ? Math.round(scored.reduce((a, s) => a + s.score, 0) / scored.length) : '--';
                        })() },
                    ].map(({ label, value }) => (
                        <Card key={label} className="p-5 bg-[#0a0a0f]/60 border-white/5 text-center">
                            <p className="text-2xl font-black text-white">{value}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Submissions List */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden border-white/5 bg-[#0a0a0f]/60 backdrop-blur-xl">
                            <div className="divide-y divide-white/[0.02]">
                                {submissions.map((s) => (
                                    <button
                                        key={s._id}
                                        onClick={() => openSubmission(s)}
                                        className={`w-full text-left px-6 py-5 hover:bg-white/[0.02] transition-all group ${selected?._id === s._id ? 'bg-cyan-500/5 border-l-2 border-cyan-500' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-black text-white uppercase truncate pr-2">
                                                {s.userId?.name || 'Unknown'}
                                            </span>
                                            <span className={`shrink-0 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border ${STATUS_STYLES[s.status] || STATUS_STYLES.pending}`}>
                                                {s.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 truncate">
                                            {s.challengeId?.title || 'Unknown Challenge'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] font-black text-slate-600 uppercase">
                                                {LANG_ICONS[s.language]} {s.language}
                                            </span>
                                            {s.score !== null && (
                                                <span className="text-[10px] font-black text-cyan-400">{s.score}/100</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                                {submissions.length === 0 && (
                                    <div className="p-12 text-center text-slate-500 text-sm">No submissions</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-3">
                        {!selected ? (
                            <Card className="p-24 text-center border-white/5 bg-[#0a0a0f]/60">
                                <div className="text-5xl mb-4">👈</div>
                                <p className="text-slate-500 text-sm uppercase font-black tracking-widest">Select a submission to review</p>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {/* Candidate & Challenge Info */}
                                <Card className="p-6 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Candidate</p>
                                            <p className="text-lg font-black text-white uppercase">{selected.userId?.name}</p>
                                            <p className="text-xs text-slate-500">{selected.userId?.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Challenge</p>
                                            <p className="text-sm font-black text-white uppercase">{selected.challengeId?.title}</p>
                                            <span className="text-[10px] font-black text-slate-500 uppercase">{selected.language} {LANG_ICONS[selected.language]}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-600">Submitted: {new Date(selected.createdAt).toLocaleString()}</p>
                                </Card>

                                {/* Code */}
                                <Card className="bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            {LANG_ICONS[selected.language]} {selected.language}
                                        </span>
                                    </div>
                                    <pre className="p-6 text-sm text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
                                        {selected.code}
                                    </pre>
                                </Card>

                                {/* Explanation */}
                                <Card className="p-6 bg-[#0a0a0f]/60 border-purple-500/10 backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-2 h-4 bg-purple-500 rounded-full" />
                                        Candidate's Explanation
                                    </p>
                                    <p className="text-sm text-slate-300 leading-relaxed">{selected.explanation}</p>
                                </Card>

                                {/* Evaluation Form */}
                                <Card className="p-6 bg-[#0a0a0f]/60 border-cyan-500/10 backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <span className="w-2 h-4 bg-cyan-500 rounded-full" />
                                        Evaluate Submission
                                    </p>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Score (0–100)</label>
                                                <input
                                                    type="number"
                                                    min={0} max={100}
                                                    value={evalForm.score}
                                                    onChange={e => setEvalForm({ ...evalForm, score: e.target.value })}
                                                    className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-cyan-500/50 outline-none"
                                                    placeholder="0–100"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                                                <select
                                                    value={evalForm.status}
                                                    onChange={e => setEvalForm({ ...evalForm, status: e.target.value })}
                                                    className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-cyan-500/50 outline-none cursor-pointer"
                                                >
                                                    <option value="under_review">Under Review</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="needs_improvement">Needs Improvement</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Feedback</label>
                                            <textarea
                                                value={evalForm.feedback}
                                                onChange={e => setEvalForm({ ...evalForm, feedback: e.target.value })}
                                                className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-cyan-500/50 outline-none resize-none"
                                                rows={3}
                                                placeholder="Provide constructive feedback on the solution..."
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="primary"
                                                className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 border-none shadow-xl shadow-cyan-500/20 text-[11px] font-black uppercase tracking-widest"
                                                onClick={handleEvaluate}
                                                disabled={saving}
                                            >
                                                {saving ? '⏳ Saving...' : '✓ Save Evaluation'}
                                            </Button>
                                            {saveMsg && (
                                                <span className={`text-xs font-black uppercase tracking-widest ${saveMsg.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {saveMsg}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
