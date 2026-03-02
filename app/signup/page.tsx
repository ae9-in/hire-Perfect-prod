'use client';

import { useState } from 'react';
import { storeLoginTimestamp } from '@/lib/sessionUtils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 2) return { strength: 33, label: 'Standard', color: 'bg-rose-500' };
        if (strength <= 3) return { strength: 66, label: 'Elevated', color: 'bg-amber-500' };
        return { strength: 100, label: 'Fortress', color: 'bg-emerald-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Terminals require matching keys.');
            setLoading(false);
            return;
        }

        if (!acceptedTerms) {
            setError('Legal authorization required.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Signup failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            storeLoginTimestamp();

            if (data.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Signup failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#020205] selection:bg-cyan-500/30 selection:text-cyan-400">
            {/* Left Side: Signup Form */}
            <div className="flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-gradient-to-b from-[#020205] to-[#050510] overflow-y-auto page-container">
                <Card className="w-full max-w-lg p-1 border-white/5 shadow-2xl shadow-cyan-500/10">
                    <div className="bg-[#050510] rounded-[1.5rem] p-10 md:p-12 border border-white/5">
                        <div className="mb-10 lg:hidden text-center">
                            <Link href="/" className="flex items-center justify-center space-x-2 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform shadow-cyan-500/20">
                                    <span className="text-white font-black text-xl">H</span>
                                </div>
                                <span className="text-xl font-black tracking-tighter text-white">HIRE<span className="text-cyan-400">PERFECT</span></span>
                            </Link>
                        </div>

                        <div className="mb-12">
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase leading-none">Establishing <br /> <span className="text-gradient">Operative Identity.</span></h1>
                            <p className="text-slate-500 font-medium text-sm tracking-wide">Enter the grid to begin your certification sequence.</p>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest mb-8 animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    type="text"
                                    required
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                        Track Type
                                    </label>
                                    <div className="h-14 rounded-xl border border-white/10 bg-white/[0.02] px-4 flex items-center text-sm font-bold text-cyan-300">
                                        Candidate
                                    </div>
                                </div>
                            </div>

                            <Input
                                label="Email"
                                type="email"
                                required
                                placeholder="name@domain.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                    </svg>
                                }
                            />

                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="+91 00000-00000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                }
                            />

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Input
                                        label="Password"
                                        type="password"
                                        required
                                        showPasswordToggle
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    {formData.password && (
                                        <div className="px-1">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{passwordStrength.label} Security</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                                                    style={{ width: `${passwordStrength.strength}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Input
                                    label="Re-confirm Password"
                                    type="password"
                                    required
                                    showPasswordToggle
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group cursor-pointer transition-colors hover:bg-white/10" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${acceptedTerms ? 'bg-cyan-600 border-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-white/20'}`}>
                                    {acceptedTerms && (
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-loose select-none">
                                    I authorize credentials processing and agree to <span className="text-cyan-400 font-black cursor-pointer hover:underline">Terms of Service</span> and <span className="text-cyan-400 font-black cursor-pointer hover:underline">Privacy Protocol</span>.
                                </p>
                            </div>

                            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} className="py-5 shadow-2xl shadow-cyan-900/20 uppercase tracking-[0.2em] text-[10px] font-black">
                                Establish Profile
                            </Button>
                        </form>

                        <div className="mt-10 pt-10 border-t border-white/5 text-center">
                            <p className="text-slate-500 font-medium text-sm">
                                Already registered?{' '}
                                <Link href="/login" className="text-cyan-400 font-black uppercase tracking-widest hover:text-cyan-300 transition-colors ml-1">
                                    Login Terminal
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right Side: Cinematic Graphic */}
            <div className="hidden lg:flex flex-col justify-between p-24 relative bg-slate-950 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-600/10 via-transparent to-purple-600/10 pointer-events-none"></div>

                <Link href="/" className="relative z-10 group flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform shadow-cyan-500/20">
                        <span className="text-white font-black text-2xl">H</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white">HIRE<span className="text-cyan-400">PERFECT</span></span>
                </Link>

                <div className="relative z-10">
                    <div className="inline-block px-4 py-1.5 bg-white/5 rounded-lg border border-white/10 text-cyan-400 font-black text-[10px] tracking-[0.3em] uppercase mb-10">Operative Protocol Alpha-9</div>
                    <h2 className="text-6xl md:text-7xl font-black text-white leading-[0.85] mb-10 tracking-tighter uppercase">
                        UNCAGE YOUR <br /><span className="text-gradient">POTENTIAL.</span>
                    </h2>
                    <p className="text-slate-400 text-lg font-medium max-w-sm leading-relaxed">Join the global network of excellence and validate your technical prowess with the most secure proctoring grid.</p>
                </div>

                <div className="relative z-10 pt-16 border-t border-white/5 flex gap-12">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-500/5">
                            <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black text-[10px] uppercase tracking-widest">Network Status</span>
                            <span className="text-cyan-400 font-bold text-[9px] uppercase tracking-[0.2em]">Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
