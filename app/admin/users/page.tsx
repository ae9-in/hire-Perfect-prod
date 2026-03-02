'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

export default function UserManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/admin/users', window.location.origin);
            if (searchQuery) url.searchParams.append('query', searchQuery);
            if (roleFilter) url.searchParams.append('role', roleFilter);

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId: string, updateData: any) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId, ...updateData })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, ...data.user } : u));
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to terminate this operative? This action is irreversible.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.filter(u => u._id !== userId));
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    if (loading && users.length === 0) return <Loading variant="spinner" fullScreen text="Accessing Operative Database..." />;

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
                            Database Management
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                            OPERATIVE <br /><span className="text-gradient">REGISTRY.</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium mt-6 max-w-lg">
                            Manage access, roles, and status for all operatives within the HirePerfect ecosystem.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="SEARCH OPERATIVE..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                                className="bg-[#0a0a0f]/60 border border-white/10 rounded-xl px-12 py-4 text-xs font-black text-white uppercase tracking-widest focus:border-cyan-500/50 outline-none transition-all w-full md:w-80 group-hover:border-white/20"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-cyan-400 transition-colors">🔍</span>
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setTimeout(fetchUsers, 0); }}
                            className="bg-[#0a0a0f]/60 border border-white/10 rounded-xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest focus:border-cyan-500/50 outline-none transition-all cursor-pointer"
                        >
                            <option value="">ALL ROLES</option>
                            <option value="candidate">CANDIDATE</option>
                            <option value="admin">ADMIN</option>
                        </select>
                        <Button variant="primary" className="px-8 py-4 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-cyan-500/20 bg-cyan-500 border-none" onClick={fetchUsers}>Execute Search</Button>
                    </div>
                </div>

                <Card className="overflow-hidden border-white/5 bg-[#0a0a0f]/60 backdrop-blur-xl glass-cyan">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operative</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Connectivity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role Alignment</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Countermeasures</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {users.map((u) => (
                                    <tr key={u._id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-black text-xs border border-purple-500/20">
                                                    {u.name?.[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white uppercase tracking-tight">{u.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 lowercase tracking-tighter mt-0.5">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Synchronized</span>
                                                </div>
                                                <span className="text-[9px] text-slate-500 uppercase tracking-tighter mt-1">Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleUpdateUser(u._id, { role: e.target.value })}
                                                className={`bg-transparent text-[9px] font-black uppercase tracking-widest border py-1 px-3 rounded-lg outline-none cursor-pointer transition-all ${u.role === 'admin'
                                                    ? 'text-purple-400 border-purple-500/30 bg-purple-500/5'
                                                    : 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5'
                                                    }`}
                                            >
                                                <option value="candidate" className="bg-[#020205]">CANDIDATE</option>
                                                <option value="admin" className="bg-[#020205]">ADMIN</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/20"
                                                    title="TERMINATE OPERATIVE"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </main>
        </div>
    );
}
