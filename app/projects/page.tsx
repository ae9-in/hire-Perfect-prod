'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const TECH_OPTIONS = [
    '.NET', 'AWS', 'Angular', 'Azure', 'Bootstrap', 'C#', 'C++', 'CI/CD', 'Cassandra', 'Django', 
    'Docker', 'Elasticsearch', 'Express.js', 'FastAPI', 'Firebase', 'Flask', 'Go', 'Google Cloud', 
    'GraphQL', 'HTML/CSS', 'Java', 'JavaScript', 'Kotlin', 'Kubernetes', 'Laravel', 'Material UI', 
    'Microservices', 'MongoDB', 'Mongoose', 'MySQL', 'Next.js', 'Node.js', 'Oracle', 'PHP', 
    'PostgreSQL', 'Prisma', 'Python', 'REST API', 'React', 'Redis', 'Ruby', 'Ruby on Rails', 
    'Rust', 'SQLite', 'Sass/SCSS', 'Sequelize', 'Spring Boot', 'Supabase', 'Svelte', 'Swift', 
    'Tailwind CSS', 'Terraform', 'TypeScript', 'Vue.js', 'WebSockets'
];

const STATUS_MAP: Record<string, string> = {
    submitted: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    under_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    reviewed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function ProjectsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        techStack: [] as string[],
        githubLink: '',
        liveLink: '',
    });
    const [techInput, setTechInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/projects', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setProjects(data.projects);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const addTech = (tech: string) => {
        if (!form.techStack.includes(tech)) {
            setForm({ ...form, techStack: [...form.techStack, tech] });
        }
    };

    const removeTech = (tech: string) => {
        setForm({ ...form, techStack: form.techStack.filter((t) => t !== tech) });
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.title.trim()) return setError('Project title is required');
        if (!form.description.trim()) return setError('Description is required');
        if (!form.githubLink.trim()) return setError('GitHub link is required');

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setShowForm(false);
                setForm({ title: '', description: '', techStack: [], githubLink: '', liveLink: '' });
                fetchProjects();
            } else {
                setError(data.error || 'Submission failed');
            }
        } catch {
            setError('Network error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm('Delete this project?')) return;
        const token = localStorage.getItem('token');
        await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchProjects();
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Projects..." />;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
            </div>
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                            Portfolio
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            YOUR <br /><span className="text-gradient">PROJECTS.</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium mt-6 max-w-lg">
                            Showcase your work. Submit real projects for expert review and rating.
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        className="px-10 py-5 uppercase tracking-widest text-[10px] font-black bg-purple-500 hover:bg-purple-400 border-none shadow-xl shadow-purple-500/20"
                        onClick={() => setShowForm(true)}
                    >
                        + Submit Project
                    </Button>
                </div>

                {/* Submit Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center p-6 bg-[#020205]/80 backdrop-blur-sm overflow-y-auto">
                        <Card className="w-full max-w-2xl my-8 bg-[#0a0a0f] border-purple-500/20 shadow-2xl shadow-purple-500/10">
                            <div className="flex justify-between items-center p-8 border-b border-white/5">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Submit New Project</h2>
                                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors text-lg">✕</button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Project Title *</label>
                                    <input
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500/50 outline-none"
                                        placeholder="My Awesome Project"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Description *</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500/50 outline-none resize-none"
                                        rows={4}
                                        placeholder="Describe what this project does, your role, challenges solved..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tech Stack</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {form.techStack.map((t) => (
                                            <span key={t} className="flex items-center gap-1 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] font-black text-purple-400 uppercase tracking-widest">
                                                {t}
                                                <button onClick={() => removeTech(t)} className="text-purple-400/50 hover:text-rose-400 ml-1">×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500/50 outline-none appearance-none cursor-pointer"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    addTech(e.target.value);
                                                    e.target.value = "";
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select a technology...</option>
                                            {TECH_OPTIONS.filter((t) => !form.techStack.includes(t)).map((t) => (
                                                <option key={t} value={t} className="bg-[#020205] text-white py-2">
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">GitHub Link *</label>
                                        <input
                                            value={form.githubLink}
                                            onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                                            className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500/50 outline-none"
                                            placeholder="https://github.com/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Live Link</label>
                                        <input
                                            value={form.liveLink}
                                            onChange={(e) => setForm({ ...form, liveLink: e.target.value })}
                                            className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500/50 outline-none"
                                            placeholder="https://myapp.vercel.app"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest">
                                        ⚠ {error}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 border-white/10 text-white" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button variant="primary" className="flex-1 bg-purple-500 hover:bg-purple-400 border-none shadow-xl shadow-purple-500/20" onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? 'Submitting...' : '🚀 Submit Project'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Projects list */}
                {projects.length === 0 ? (
                    <Card className="p-24 text-center border-white/5 bg-[#0a0a0f]/60">
                        <div className="text-6xl mb-6">🗂️</div>
                        <p className="text-xl font-black text-white uppercase tracking-tight">No Projects Yet</p>
                        <p className="text-sm text-slate-500 mt-2 mb-8">Submit your first project and get it reviewed by experts</p>
                        <Button variant="primary" className="bg-purple-500 border-none" onClick={() => setShowForm(true)}>Submit Your First Project</Button>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {projects.map((project) => (
                            <Card key={project._id} className="p-8 bg-[#0a0a0f]/60 border-white/5 hover:border-purple-500/20 transition-all backdrop-blur-xl group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">{project.title}</h3>
                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${STATUS_MAP[project.status] || STATUS_MAP.submitted}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {project.rating !== null && (
                                        <div className="text-right ml-4">
                                            <p className="text-3xl font-black text-purple-400">{project.rating}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase">/ 10</p>
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">{project.description}</p>

                                {project.techStack?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.techStack.map((t: string) => (
                                            <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {project.feedback && (
                                    <div className="mb-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Admin Feedback</p>
                                        <p className="text-xs text-slate-300">{project.feedback}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    {project.githubLink && (
                                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                                            className="text-[10px] font-black text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                                            GitHub →
                                        </a>
                                    )}
                                    {project.liveLink && (
                                        <a href={project.liveLink} target="_blank" rel="noopener noreferrer"
                                            className="text-[10px] font-black text-slate-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                                            Live Demo →
                                        </a>
                                    )}
                                    <button onClick={() => handleDelete(project._id)}
                                        className="ml-auto text-[10px] font-black text-rose-500/40 hover:text-rose-400 uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100">
                                        Delete
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
