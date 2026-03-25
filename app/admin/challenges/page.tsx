'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const DIFFICULTY_MAP: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const STARTER: Record<string, string> = {
    javascript: '// JavaScript starter\nfunction solution(input) {\n  // your code here\n}',
    python: '# Python starter\ndef solution(input):\n    pass',
    java: '// Java starter\npublic class Solution {\n    public static void main(String[] args) {\n        // your code here\n    }\n}',
    cpp: '// C++ starter\n#include<bits/stdc++.h>\nusing namespace std;\nint main() {\n    // your code here\n    return 0;\n}',
    typescript: '// TypeScript starter\nfunction solution(input: string): string {\n    return "";\n}',
};

export default function AdminChallengesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        difficulty: 'medium',
        constraints: '',
        tags: [] as string[],
        examples: [{ input: '', output: '', explanation: '' }],
        starterCode: { ...STARTER },
    });
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') { router.push('/dashboard'); return; }
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/coding-challenges', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setChallenges(data.challenges);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({
            title: '',
            description: '',
            difficulty: 'medium',
            constraints: '',
            tags: [],
            examples: [{ input: '', output: '', explanation: '' }],
            starterCode: { ...STARTER },
        });
        setShowForm(true);
        setError('');
    };

    const addTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const addExample = () => {
        setForm({ ...form, examples: [...form.examples, { input: '', output: '', explanation: '' }] });
    };

    const updateExample = (i: number, field: string, val: string) => {
        const exs = [...form.examples];
        exs[i] = { ...exs[i], [field]: val };
        setForm({ ...form, examples: exs });
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.title.trim()) return setError('Title is required');
        if (!form.description.trim()) return setError('Description is required');

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/coding-challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setShowForm(false);
                fetchChallenges();
            } else {
                setError(data.error || 'Failed to create');
            }
        } catch { setError('Network error'); }
        finally { setSubmitting(false); }
    };

    const handleArchive = async (id: string) => {
        if (!confirm('Archive this challenge?')) return;
        const token = localStorage.getItem('token');
        await fetch(`/api/coding-challenges/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchChallenges();
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Challenges..." />;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
            </div>
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                            Admin · Challenge Control
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            CODING <br /><span className="text-gradient">ARSENAL.</span>
                        </h1>
                    </div>
                    <Button
                        variant="primary"
                        className="px-10 py-5 uppercase tracking-widest text-[10px] font-black bg-emerald-500 hover:bg-emerald-400 border-none shadow-xl shadow-emerald-500/20"
                        onClick={openCreate}
                    >
                        + New Challenge
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                    {[
                        { label: 'Total', value: challenges.length, icon: '⚡' },
                        { label: 'Easy', value: challenges.filter(c => c.difficulty === 'easy').length, icon: '🟢' },
                        { label: 'Hard', value: challenges.filter(c => c.difficulty === 'hard').length, icon: '🔴' },
                    ].map(({ label, value, icon }) => (
                        <Card key={label} className="p-6 bg-[#0a0a0f]/60 border-white/5 text-center">
                            <div className="text-2xl mb-2">{icon}</div>
                            <p className="text-3xl font-black text-white">{value}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                {/* Challenges Table */}
                <Card className="overflow-hidden border-white/5 bg-[#0a0a0f]/60 backdrop-blur-xl glass-cyan">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Challenge</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Difficulty</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tags</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {challenges.map((c) => (
                                <tr key={c._id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-white uppercase">{c.title}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${DIFFICULTY_MAP[c.difficulty]}`}>
                                            {c.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1">
                                            {c.tags?.slice(0, 3).map((t: string) => (
                                                <span key={t} className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] text-slate-500 uppercase">{t}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleArchive(c._id)}
                                                className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                                Archive
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {challenges.length === 0 && (
                        <div className="p-24 text-center">
                            <p className="text-slate-500 text-sm">No challenges created yet</p>
                        </div>
                    )}
                </Card>
            </main>

            {/* Create Challenge Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-6 bg-[#020205]/90 backdrop-blur-sm overflow-y-auto">
                    <Card className="w-full max-w-3xl my-8 bg-[#0a0a0f] border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                        <div className="flex justify-between items-center p-8 border-b border-white/5">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Create Challenge</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Title *</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-emerald-500/50 outline-none"
                                        placeholder="Two Sum, Binary Search..." />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Difficulty</label>
                                    <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                                        className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-emerald-500/50 outline-none cursor-pointer">
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tags</label>
                                    <div className="flex gap-2">
                                        <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
                                            className="flex-1 bg-[#020205] border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:border-emerald-500/50 outline-none"
                                            placeholder="Array, DP..." />
                                        <button onClick={addTag} className="px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-black hover:bg-emerald-500/20">+</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {form.tags.map(t => (
                                            <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-400">
                                                {t} <button onClick={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })} className="text-emerald-400/50 hover:text-rose-400">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Description *</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-emerald-500/50 outline-none resize-none"
                                    rows={4} placeholder="Describe the problem clearly..." />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Constraints</label>
                                <textarea value={form.constraints} onChange={e => setForm({ ...form, constraints: e.target.value })}
                                    className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white font-mono focus:border-emerald-500/50 outline-none resize-none"
                                    rows={3} placeholder="1 <= n <= 10^5&#10;-10^9 <= nums[i] <= 10^9" />
                            </div>

                            {/* Examples */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Examples</label>
                                    <button onClick={addExample} className="text-[10px] font-black text-emerald-400 uppercase hover:text-emerald-300">+ Add Example</button>
                                </div>
                                <div className="space-y-4">
                                    {form.examples.map((ex, i) => (
                                        <div key={i} className="p-4 bg-[#020205] rounded-xl border border-white/5 space-y-3">
                                            <p className="text-[9px] font-black text-slate-600 uppercase">Example {i + 1}</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input value={ex.input} onChange={e => updateExample(i, 'input', e.target.value)}
                                                    className="bg-[#0a0a0f] border border-white/5 rounded-lg px-4 py-3 text-sm text-white font-mono focus:border-emerald-500/30 outline-none"
                                                    placeholder="Input: [1,2,3]" />
                                                <input value={ex.output} onChange={e => updateExample(i, 'output', e.target.value)}
                                                    className="bg-[#0a0a0f] border border-white/5 rounded-lg px-4 py-3 text-sm text-white font-mono focus:border-emerald-500/30 outline-none"
                                                    placeholder="Output: 6" />
                                            </div>
                                            <input value={ex.explanation} onChange={e => updateExample(i, 'explanation', e.target.value)}
                                                className="w-full bg-[#0a0a0f] border border-white/5 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500/30 outline-none"
                                                placeholder="Explanation (optional)" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase">⚠ {error}</div>
                            )}

                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 border-white/10 text-white" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button variant="primary" className="flex-1 bg-emerald-500 hover:bg-emerald-400 border-none shadow-xl shadow-emerald-500/20" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? 'Creating...' : '⚡ Create Challenge'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
