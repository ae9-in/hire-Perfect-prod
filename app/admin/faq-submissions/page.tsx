'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

export default function FAQSubmissionsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/admin/faq-submissions', window.location.origin);
            if (statusFilter) url.searchParams.append('status', statusFilter);
            if (searchQuery.trim()) url.searchParams.append('query', searchQuery.trim());

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setSubmissions(data.submissions);
        } catch (error) {
            console.error('Failed to fetch FAQ submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (submissionId: string, status: 'new' | 'reviewed' | 'resolved') => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/faq-submissions', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ submissionId, status }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmissions((prev) =>
                    prev.map((item) => (item._id === submissionId ? { ...item, status } : item))
                );
            }
        } catch (error) {
            console.error('Failed to update FAQ submission status:', error);
        }
    };

    if (loading && submissions.length === 0) {
        return <Loading variant="spinner" fullScreen text="Loading FAQ submissions..." />;
    }

    return (
        <div className="min-h-screen bg-[#020205] bg-grid selection:bg-cyan-500/30 selection:text-cyan-400">
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div>
                        <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                            Communication Inbox
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                            FAQ <br /><span className="text-gradient">SUBMISSIONS.</span>
                        </h1>
                        <p className="text-slate-400 mt-5 max-w-xl font-medium">
                            Review and manage contact queries submitted through the homepage FAQ form.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search by name, email, subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchSubmissions()}
                            className="bg-[#0a0a0f]/70 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 outline-none w-full md:w-80"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#0a0a0f]/70 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <Button variant="primary" onClick={fetchSubmissions}>
                            Refresh
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden border-white/10 bg-[#0a0a0f]/70">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject & Message</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Submitted</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {submissions.map((submission) => (
                                    <tr key={submission._id} className="hover:bg-white/[0.02] transition-colors align-top">
                                        <td className="px-6 py-5">
                                            <p className="text-white font-black text-sm">{submission.name}</p>
                                            <p className="text-slate-400 text-xs mt-1">{submission.email}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-white font-bold text-sm mb-2">{submission.subject}</p>
                                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                {submission.message}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-slate-300 text-sm">
                                                {new Date(submission.createdAt).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <select
                                                value={submission.status}
                                                onChange={(e) =>
                                                    updateStatus(
                                                        submission._id,
                                                        e.target.value as 'new' | 'reviewed' | 'resolved'
                                                    )
                                                }
                                                className="bg-[#020205] border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase tracking-widest focus:border-cyan-500/50 outline-none"
                                            >
                                                <option value="new">New</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                            No submissions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </main>
        </div>
    );
}
