'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

export default function QuestionManagement({ params }: { params: any }) {
    const router = useRouter();
    const resolvedParams: any = use(params);
    const assessmentId = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState<any>({
        type: 'mcq',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        points: 1,
        difficulty: 'medium',
        tags: []
    });

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchData();
    }, [assessmentId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [assessRes, questRes] = await Promise.all([
                fetch(`/api/assessments/${assessmentId}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/admin/questions?assessmentId=${assessmentId}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const assessData = await assessRes.json();
            const questData = await questRes.json();

            if (assessData.success) setAssessment(assessData.assessment);
            if (questData.success) setQuestions(questData.questions);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const method = editingQuestion ? 'PATCH' : 'POST';
            const body = editingQuestion
                ? { ...formData, id: editingQuestion._id }
                : { ...formData, assessmentId };

            const res = await fetch('/api/admin/questions', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
                setIsModalOpen(false);
                setEditingQuestion(null);
                setFormData({
                    type: 'mcq', question: '', options: ['', '', '', ''],
                    correctAnswer: 0, explanation: '', points: 1,
                    difficulty: 'medium', tags: []
                });
            }
        } catch (error) {
            console.error('Failed to save question:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/questions?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setQuestions(questions.filter(q => q._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    };

    const openEditModal = (q: any) => {
        setEditingQuestion(q);
        setFormData({
            type: q.type,
            question: q.question,
            options: q.options || ['', '', '', ''],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            points: q.points,
            difficulty: q.difficulty,
            tags: q.tags || []
        });
        setIsModalOpen(true);
    };

    if (loading && questions.length === 0) return <Loading variant="spinner" fullScreen text="Booting Neural Link..." />;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid selection:bg-cyan-500/30 selection:text-cyan-400 relative overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-scan shadow-[0_0_15px_rgba(0,242,255,0.5)]"></div>
            </div>

            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-12">
                    <div>
                        <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4 glow-sm">
                            Session Content
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            QUESTION <br /><span className="text-gradient">DESIGN.</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium mt-6 max-w-lg">
                            Molding the extraction parameters for mission: <span className="text-cyan-400">{assessment?.title}</span>.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="ghost" className="text-slate-500 font-black tracking-widest text-[10px]" onClick={() => router.push('/admin/assessments')}>BACK TO CATALOG</Button>
                        <Button
                            variant="primary"
                            className="px-8 py-4 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-cyan-500/20 bg-cyan-500 border-none flex items-center gap-2"
                            onClick={() => { setEditingQuestion(null); setIsModalOpen(true); }}
                        >
                            <span>+</span> ADD QUESTION
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {questions.map((q, idx) => (
                        <Card key={q._id} className="p-8 border-white/5 bg-[#0a0a0f]/60 backdrop-blur-xl group hover:border-cyan-500/30 transition-all duration-500">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-cyan-500 font-black text-xs">Q{idx + 1}.</span>
                                        <Badge variant="primary" className="uppercase text-[8px] font-black tracking-widest px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">{q.type}</Badge>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{q.points} POINTS</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-6">{q.question}</h3>

                                    {q.type === 'mcq' && (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {q.options.map((opt: string, i: number) => (
                                                <div key={i} className={`p-4 rounded-xl border text-sm font-medium ${i === parseInt(q.correctAnswer) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                                                    <span className="text-[10px] font-black mr-3 text-slate-500">{String.fromCharCode(65 + i)}.</span>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity ml-6">
                                    <button onClick={() => openEditModal(q)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">📝</button>
                                    <button onClick={() => handleDelete(q._id)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-500/30 transition-all">✕</button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {questions.length === 0 && (
                        <div className="text-center py-24 bg-[#0a0a0f]/40 rounded-3xl border border-white/5 border-dashed">
                            <p className="text-slate-500 font-black tracking-widest text-xs">NO MISSION DATA DETECTED. INITIALIZE QUESTIONS TO PROCEED.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Question Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020205]/80 backdrop-blur-sm overflow-y-auto">
                    <Card className="w-full max-w-3xl p-10 bg-[#0a0a0f] border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                {editingQuestion ? 'UPDATE' : 'GENERATE'} QUESTION
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    >
                                        <option value="mcq" className="bg-[#0a0a0f]">MCQ</option>
                                        <option value="scenario" className="bg-[#0a0a0f]">SCENARIO</option>
                                        <option value="coding" className="bg-[#0a0a0f]">CODING</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Points</label>
                                    <input
                                        type="number"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    >
                                        <option value="easy" className="bg-[#0a0a0f]">EASY</option>
                                        <option value="medium" className="bg-[#0a0a0f]">MEDIUM</option>
                                        <option value="hard" className="bg-[#0a0a0f]">HARD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question Text</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none resize-none"
                                />
                            </div>

                            {formData.type === 'mcq' && (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Options</label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {formData.options.map((opt: string, i: number) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    checked={parseInt(formData.correctAnswer) === i}
                                                    onChange={() => setFormData({ ...formData, correctAnswer: i })}
                                                    className="accent-emerald-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                    onChange={(e) => {
                                                        const newOpts = [...formData.options];
                                                        newOpts[i] = e.target.value;
                                                        setFormData({ ...formData, options: newOpts });
                                                    }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Explanation (Optional)</label>
                                <textarea
                                    rows={2}
                                    value={formData.explanation}
                                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-8">
                                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="text-slate-500 font-black tracking-widest">DISCARD</Button>
                                <Button variant="primary" type="submit" className="px-10 py-3 bg-cyan-500 border-none font-black tracking-widest shadow-lg shadow-cyan-500/20">COMMIT DATA</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
