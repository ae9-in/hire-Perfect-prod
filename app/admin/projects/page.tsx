'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const STATUS_STYLES: Record<string, string> = {
    submitted: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    under_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    reviewed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function AdminProjectsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [evalForm, setEvalForm] = useState({ rating: '', feedback: '', status: 'under_review' });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') { router.push('/dashboard'); return; }
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/projects', window.location.origin);
            if (statusFilter) url.searchParams.set('status', statusFilter);
            const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setProjects(data.projects);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (!loading) fetchProjects(); }, [statusFilter]);

    const openProject = (p: any) => {
        setSelected(p);
        setEvalForm({
            rating: p.rating?.toString() || '',
            feedback: p.feedback || '',
            status: p.status === 'submitted' ? 'under_review' : p.status,
        });
        setSaveMsg('');
    };

    const handleEvaluate = async () => {
        if (!selected) return;
        if (evalForm.rating !== '' && (Number(evalForm.rating) < 1 || Number(evalForm.rating) > 10)) {
            setSaveMsg('Rating must be 1–10');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/projects/${selected._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    rating: evalForm.rating !== '' ? Number(evalForm.rating) : undefined,
                    feedback: evalForm.feedback,
                    status: evalForm.status,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSaveMsg('✓ Evaluation saved');
                setSelected(data.project);
                setProjects(projects.map(p => p._id === data.project._id ? data.project : p));
            } else {
                setSaveMsg(data.error || 'Save failed');
            }
        } catch { setSaveMsg('Network error'); }
        finally { setSaving(false); }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Projects..." />;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
            </div>
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                            Admin · Portfolio Review
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            PROJECT <br /><span className="text-gradient">REVIEW.</span>
                        </h1>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-[#0a0a0f]/60 border border-white/10 rounded-xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest focus:border-purple-500/50 outline-none cursor-pointer"
                    >
                        <option value="">ALL STATUS</option>
                        <option value="submitted">SUBMITTED</option>
                        <option value="under_review">UNDER REVIEW</option>
                        <option value="reviewed">REVIEWED</option>
                    </select>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-12">
                    {[
                        { label: 'Total', value: projects.length },
                        { label: 'Pending', value: projects.filter(p => p.status === 'submitted').length },
                        { label: 'Reviewed', value: projects.filter(p => p.status === 'reviewed').length },
                    ].map(({ label, value }) => (
                        <Card key={label} className="p-6 bg-[#0a0a0f]/60 border-white/5 text-center">
                            <p className="text-3xl font-black text-white">{value}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Project List */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden border-white/5 bg-[#0a0a0f]/60 backdrop-blur-xl">
                            <div className="divide-y divide-white/[0.02]">
                                {projects.map((p) => (
                                    <button
                                        key={p._id}
                                        onClick={() => openProject(p)}
                                        className={`w-full text-left px-6 py-5 hover:bg-white/[0.02] transition-all ${selected?._id === p._id ? 'bg-purple-500/5 border-l-2 border-purple-500' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-black text-white uppercase truncate pr-2">{p.title}</span>
                                            <span className={`shrink-0 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border ${STATUS_STYLES[p.status] || STATUS_STYLES.submitted}`}>
                                                {p.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500">{p.userId?.name} · {p.userId?.email}</p>
                                        {p.rating !== null && (
                                            <p className="text-[10px] font-black text-purple-400 mt-1">Rating: {p.rating}/10</p>
                                        )}
                                    </button>
                                ))}
                                {projects.length === 0 && (
                                    <div className="p-12 text-center text-slate-500 text-sm">No projects</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-3">
                        {!selected ? (
                            <Card className="p-24 text-center border-white/5 bg-[#0a0a0f]/60">
                                <div className="text-5xl mb-4">🗂️</div>
                                <p className="text-slate-500 text-sm uppercase font-black tracking-widest">Select a project to review</p>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                <Card className="p-6 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                                    <h2 className="text-xl font-black text-white uppercase mb-2">{selected.title}</h2>
                                    <div className="flex items-center gap-3 mb-4">
                                        <p className="text-sm text-slate-400">{selected.userId?.name}</p>
                                        <span className="text-slate-600">·</span>
                                        <p className="text-sm text-slate-500">{selected.userId?.email}</p>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-4">{selected.description}</p>
                                    {selected.techStack?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {selected.techStack.map((t: string) => (
                                                <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[9px] font-black text-slate-400 uppercase">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
                                        {selected.githubLink && (
                                            <a href={selected.githubLink} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors">
                                                <span>⬡</span> GitHub
                                            </a>
                                        )}
                                        {selected.liveLink && (
                                            <a href={selected.liveLink} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[10px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors">
                                                <span>→</span> Live Demo
                                            </a>
                                        )}
                                    </div>
                                </Card>

                                {/* Evaluation Form */}
                                <Card className="p-6 bg-[#0a0a0f]/60 border-purple-500/10 backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <span className="w-2 h-4 bg-purple-500 rounded-full" />
                                        Rate This Project
                                    </p>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Rating (1–10)</label>
                                                <input
                                                    type="number" min={1} max={10}
                                                    value={evalForm.rating}
                                                    onChange={e => setEvalForm({ ...evalForm, rating: e.target.value })}
                                                    className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500/50 outline-none"
                                                    placeholder="1–10"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                                                <select
                                                    value={evalForm.status}
                                                    onChange={e => setEvalForm({ ...evalForm, status: e.target.value })}
                                                    className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500/50 outline-none cursor-pointer"
                                                >
                                                    <option value="under_review">Under Review</option>
                                                    <option value="reviewed">Reviewed</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Feedback</label>
                                            <textarea
                                                value={evalForm.feedback}
                                                onChange={e => setEvalForm({ ...evalForm, feedback: e.target.value })}
                                                className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500/50 outline-none resize-none"
                                                rows={3}
                                                placeholder="Share your thoughts on the project quality, architecture, and code..."
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="primary"
                                                className="flex-1 py-4 bg-purple-500 hover:bg-purple-400 border-none shadow-xl shadow-purple-500/20 text-[11px] font-black uppercase tracking-widest"
                                                onClick={handleEvaluate}
                                                disabled={saving}
                                            >
                                                {saving ? '⏳ Saving...' : '⭐ Save Rating'}
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
