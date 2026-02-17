'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';

export default function AssessmentManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        category: '',
        duration: 30,
        price: 500,
        totalQuestions: 20,
        passingScore: 60,
        difficulty: 'medium',
        isActive: true
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [assessRes, catRes] = await Promise.all([
                fetch('/api/admin/assessments', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const assessData = await assessRes.json();
            const catData = await catRes.json();

            if (assessData.success) setAssessments(assessData.assessments);
            if (catData.success) setCategories(catData.categories);
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
            const method = editingAssessment ? 'PATCH' : 'POST';
            const body = editingAssessment ? { ...formData, id: editingAssessment._id } : formData;

            const res = await fetch('/api/admin/assessments', {
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
                setEditingAssessment(null);
                setFormData({
                    title: '', slug: '', description: '', category: '',
                    duration: 30, price: 500, totalQuestions: 20,
                    passingScore: 60, difficulty: 'medium', isActive: true
                });
            }
        } catch (error) {
            console.error('Failed to save assessment:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this assessment?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/assessments?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAssessments(assessments.filter(a => a._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete assessment:', error);
        }
    };

    const openEditModal = (assessment: any) => {
        setEditingAssessment(assessment);
        setFormData({
            title: assessment.title,
            slug: assessment.slug,
            description: assessment.description,
            category: assessment.category?._id || assessment.category,
            duration: assessment.duration,
            price: assessment.price,
            totalQuestions: assessment.totalQuestions,
            passingScore: assessment.passingScore,
            difficulty: assessment.difficulty,
            isActive: assessment.isActive
        });
        setIsModalOpen(true);
    };

    if (loading && assessments.length === 0) return <Loading variant="spinner" fullScreen text="Loading Mission Parameters..." />;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid selection:bg-cyan-500/30 selection:text-cyan-400 relative overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-scan shadow-[0_0_15px_rgba(0,242,255,0.5)]"></div>
            </div>

            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-12">
                    <div>
                        <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4 glow-sm">
                            Mission Parameters
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            ASSESSMENT <br /><span className="text-gradient">CATALOG.</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium mt-6 max-w-lg">
                            Configure, deploy, and manage evaluation matrices for candidate extraction.
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        className="px-8 py-4 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-cyan-500/20 bg-cyan-500 border-none flex items-center gap-2"
                        onClick={() => { setEditingAssessment(null); setIsModalOpen(true); }}
                    >
                        <span>+</span> INITIALIZE NEW MISSION
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {assessments.map((a) => (
                        <Card key={a._id} className="p-8 border-white/5 bg-[#0a0a0f]/60 backdrop-blur-xl group hover:border-cyan-500/30 transition-all duration-500 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <Badge variant={a.difficulty === 'easy' ? 'success' : a.difficulty === 'medium' ? 'primary' : 'error'} className="uppercase text-[9px] font-black tracking-widest px-3 py-1 bg-opacity-10 border-opacity-20">
                                        {a.difficulty}
                                    </Badge>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(a)} className="text-slate-500 hover:text-cyan-400">📝</button>
                                        <button onClick={() => handleDelete(a._id)} className="text-slate-500 hover:text-rose-500">✕</button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-cyan-400 transition-colors">{a.title}</h3>
                                <p className="text-sm text-slate-500 mb-6 line-clamp-2">{a.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Limit</p>
                                        <p className="text-xs font-black text-white">{a.duration} MINS</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Fee</p>
                                        <p className="text-xs font-black text-cyan-400">₹{a.price}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${a.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{a.isActive ? 'ACTIVE' : 'OFFLINE'}</span>
                                </div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{a.category?.name || 'Uncategorized'}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>

            {/* Modal - Could be a separate component but for speed putting here */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020205]/80 backdrop-blur-sm overflow-y-auto">
                    <Card className="w-full max-w-2xl p-10 bg-[#0a0a0f] border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                {editingAssessment ? 'MODIFY' : 'INITIALIZE'} MISSION
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Slug (URL)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    >
                                        <option value="" className="bg-[#0a0a0f]">SELECT</option>
                                        {categories.map(c => <option key={c._id} value={c._id} className="bg-[#0a0a0f]">{c.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    >
                                        <option value="easy" className="bg-[#0a0a0f]">EASY</option>
                                        <option value="medium" className="bg-[#0a0a0f]">MEDIUM</option>
                                        <option value="hard" className="bg-[#0a0a0f]">HARD</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-8">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        id="isActive"
                                        className="w-4 h-4 bg-white/5 border-white/10 rounded outline-none accent-cyan-500"
                                    />
                                    <label htmlFor="isActive" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer">Live Deployment</label>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="text-slate-500 font-black tracking-widest">ABORT</Button>
                                    <Button variant="primary" type="submit" className="px-8 py-3 bg-cyan-500 border-none font-black tracking-widest shadow-lg shadow-cyan-500/20">CONFIRM PARAMETERS</Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
