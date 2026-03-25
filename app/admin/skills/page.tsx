'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const CAT_COLORS: Record<string, string> = {
    frontend: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    backend: 'text-green-400 bg-green-500/10 border-green-500/20',
    database: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    devops: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    dsa: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    other: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

const CATEGORIES = ['frontend', 'backend', 'database', 'devops', 'dsa', 'other'];

export default function AdminSkillsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [skills, setSkills] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userSkills, setUserSkills] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [newSkill, setNewSkill] = useState({ name: '', category: 'other' });
    const [seeding, setSeeding] = useState(false);
    const [seedMsg, setSeedMsg] = useState('');
    const [assignForm, setAssignForm] = useState({ skillId: '', rating: '', notes: '' });
    const [assigning, setAssigning] = useState(false);
    const [assignMsg, setAssignMsg] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') { router.push('/dashboard'); return; }
        fetchSkills();
        fetchUsers();
    }, []);

    const fetchSkills = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/skills', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSkills(data.skills);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setUsers(data.users.filter((u: any) => u.role !== 'admin'));
        } catch (e) { console.error(e); }
    };

    const fetchUserSkills = async (userId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/user-skills?userId=${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setUserSkills(data.userSkills);
        } catch (e) { console.error(e); }
    };

    const handleSeedSkills = async () => {
        setSeeding(true);
        setSeedMsg('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/skills/seed', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setSeedMsg(data.message || 'Done');
            fetchSkills();
        } catch { setSeedMsg('Error'); }
        finally { setSeeding(false); }
    };

    const handleCreateSkill = async () => {
        if (!newSkill.name) return;
        const token = localStorage.getItem('token');
        const res = await fetch('/api/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(newSkill),
        });
        const data = await res.json();
        if (data.success) {
            setNewSkill({ name: '', category: 'other' });
            fetchSkills();
        }
    };

    const handleAssignSkill = async () => {
        if (!selectedUser || !assignForm.skillId || !assignForm.rating) {
            setAssignMsg('Please select skill and rating');
            return;
        }
        setAssigning(true);
        setAssignMsg('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/user-skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    skillId: assignForm.skillId,
                    rating: Number(assignForm.rating),
                    notes: assignForm.notes,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setAssignMsg('✓ Skill assigned');
                setAssignForm({ skillId: '', rating: '', notes: '' });
                fetchUserSkills(selectedUser._id);
            } else {
                setAssignMsg(data.error || 'Error');
            }
        } catch { setAssignMsg('Network error'); }
        finally { setAssigning(false); }
    };

    const handleRemoveSkill = async (skillId: string) => {
        if (!selectedUser) return;
        const token = localStorage.getItem('token');
        await fetch(`/api/user-skills?userId=${selectedUser._id}&skillId=${skillId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchUserSkills(selectedUser._id);
    };

    const selectUser = (user: any) => {
        setSelectedUser(user);
        fetchUserSkills(user._id);
        setAssignMsg('');
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Skills Panel..." />;

    const grouped = CATEGORIES.reduce((acc, cat) => {
        acc[cat] = skills.filter(s => s.category === cat);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="min-h-screen bg-[#020205] bg-grid relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] bg-cyan-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-purple-600/5 blur-[120px] rounded-full" />
            </div>
            <Navbar />

            <main className="container mx-auto px-6 py-24 lg:py-32 page-container relative z-10">
                <div className="mb-16">
                    <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-4">
                        Admin · Skill Matrix
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                        SKILLS <br /><span className="text-gradient">MANAGER.</span>
                    </h1>
                    <p className="text-slate-400 mt-4">Manage the skill catalog and assign ratings per candidate.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Skill Catalog */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Skill Catalog ({skills.length})</h2>

                            <div className="flex gap-2 mb-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 text-[9px] uppercase tracking-widest"
                                    onClick={handleSeedSkills}
                                    disabled={seeding}
                                >
                                    {seeding ? 'Seeding...' : '⚡ Seed Defaults'}
                                </Button>
                            </div>
                            {seedMsg && <p className="text-[10px] font-black text-emerald-400 uppercase mb-3">{seedMsg}</p>}

                            {/* Add Skill */}
                            <div className="space-y-2 mb-4 p-4 bg-[#020205] rounded-xl border border-white/5">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Add Custom Skill</p>
                                <input
                                    value={newSkill.name}
                                    onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleCreateSkill()}
                                    className="w-full bg-[#0a0a0f] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white focus:border-cyan-500/30 outline-none"
                                    placeholder="Skill name"
                                />
                                <select
                                    value={newSkill.category}
                                    onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                                    className="w-full bg-[#0a0a0f] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white focus:border-cyan-500/30 outline-none cursor-pointer"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button
                                    onClick={handleCreateSkill}
                                    className="w-full py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
                                >
                                    + Add Skill
                                </button>
                            </div>

                            {/* Skill list by category */}
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                                {CATEGORIES.map(cat => grouped[cat]?.length ? (
                                    <div key={cat}>
                                        <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${CAT_COLORS[cat].split(' ')[0]}`}>{cat}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {grouped[cat].map((s: any) => (
                                                <span key={s._id} className={`px-2 py-0.5 text-[9px] font-black uppercase rounded border ${CAT_COLORS[cat]}`}>
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null)}
                            </div>
                        </Card>
                    </div>

                    {/* Middle: User Selector */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Select Candidate</h2>
                            <div className="relative mb-4">
                                <input
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full bg-[#020205] border border-white/10 rounded-xl px-10 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                    placeholder="Search candidates..."
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                            </div>
                            <div className="divide-y divide-white/[0.03] max-h-96 overflow-y-auto">
                                {filteredUsers.map((u) => (
                                    <button
                                        key={u._id}
                                        onClick={() => selectUser(u)}
                                        className={`w-full text-left px-3 py-4 hover:bg-white/[0.02] transition-all rounded-xl ${selectedUser?._id === u._id ? 'bg-cyan-500/5 border border-cyan-500/20' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-black">
                                                {u.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase">{u.name}</p>
                                                <p className="text-[9px] text-slate-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <p className="text-center text-slate-500 text-sm py-8">No candidates found</p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right: Assign Skills */}
                    <div className="space-y-6">
                        {!selectedUser ? (
                            <Card className="p-16 text-center border-white/5 bg-[#0a0a0f]/60">
                                <div className="text-5xl mb-4">👈</div>
                                <p className="text-slate-500 text-sm uppercase font-black tracking-widest">Select a candidate</p>
                            </Card>
                        ) : (
                            <>
                                <Card className="p-6 bg-[#0a0a0f]/60 border-cyan-500/10 backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Assigning Skills To</p>
                                    <p className="text-lg font-black text-white uppercase">{selectedUser.name}</p>
                                    <p className="text-xs text-slate-500">{selectedUser.email}</p>

                                    <div className="mt-6 space-y-3">
                                        <select
                                            value={assignForm.skillId}
                                            onChange={e => setAssignForm({ ...assignForm, skillId: e.target.value })}
                                            className="w-full bg-[#020205] border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-cyan-500/50 outline-none cursor-pointer"
                                        >
                                            <option value="">Select Skill...</option>
                                            {CATEGORIES.map(cat => (
                                                grouped[cat]?.length ? (
                                                    <optgroup key={cat} label={cat.toUpperCase()}>
                                                        {grouped[cat].map((s: any) => (
                                                            <option key={s._id} value={s._id}>{s.name}</option>
                                                        ))}
                                                    </optgroup>
                                                ) : null
                                            ))}
                                        </select>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 block">Rating (1–10)</label>
                                                <input
                                                    type="number" min={1} max={10}
                                                    value={assignForm.rating}
                                                    onChange={e => setAssignForm({ ...assignForm, rating: e.target.value })}
                                                    className="w-full bg-[#020205] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                                    placeholder="1–10"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 block">Notes</label>
                                                <input
                                                    value={assignForm.notes}
                                                    onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })}
                                                    className="w-full bg-[#020205] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAssignSkill}
                                            disabled={assigning}
                                            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                                        >
                                            {assigning ? 'Assigning...' : '✓ Assign Skill'}
                                        </button>

                                        {assignMsg && (
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${assignMsg.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {assignMsg}
                                            </p>
                                        )}
                                    </div>
                                </Card>

                                {/* Current Skills */}
                                <Card className="p-6 bg-[#0a0a0f]/60 border-white/5 backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Current Skills ({userSkills.length})</p>
                                    {userSkills.length === 0 ? (
                                        <p className="text-xs text-slate-500 text-center py-4">No skills assigned yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {userSkills.map((us: any) => (
                                                <div key={us._id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5 group">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded border ${CAT_COLORS[us.skillId?.category] || CAT_COLORS.other}`}>
                                                            {us.skillId?.category?.slice(0, 3).toUpperCase()}
                                                        </span>
                                                        <span className="text-xs font-black text-white">{us.skillId?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" style={{ width: `${us.rating * 10}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-white">{us.rating}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveSkill(us.skillId._id)}
                                                            className="w-6 h-6 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
