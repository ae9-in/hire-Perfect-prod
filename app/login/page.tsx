'use client';

import { useState } from 'react';
import { storeLoginTimestamp } from '@/lib/sessionUtils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            storeLoginTimestamp();

            if (data.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#020205] selection:bg-cyan-500/30 selection:text-cyan-400">
            {/* Left Side: Cinematic Graphic */}
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
                    <div className="inline-block px-4 py-1.5 bg-white/5 rounded-lg border border-white/10 text-cyan-400 font-black text-[10px] tracking-[0.3em] uppercase mb-10">Secure Network Entry</div>
                    <h2 className="text-6xl md:text-7xl font-black text-white leading-[0.85] mb-10 tracking-tighter uppercase">
                        ENTRY TO THE <br /><span className="text-gradient">NEXT GENERATION.</span>
                    </h2>
                    <p className="text-slate-400 text-lg font-medium max-w-sm leading-relaxed">Access your secure portal and continue evaluating global excellence with GuardEye AI infrastructure.</p>
                </div>

                <div className="relative z-10 pt-16 border-t border-white/5 flex gap-12">
                    <div>
                        <p className="text-white font-black text-2xl mb-1 tracking-tight">36+</p>
                        <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.2em]">Active Units</p>
                    </div>
                    <div>
                        <p className="text-white font-black text-2xl mb-1 tracking-tight">500k+</p>
                        <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.2em]">Validations</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-gradient-to-b from-[#020205] to-[#050510] overflow-y-auto page-container">
                <Card className="w-full max-w-md p-1 border-white/5 shadow-2xl shadow-cyan-500/10">
                    <div className="bg-[#050510] rounded-[1.5rem] p-10 md:p-12 border border-white/5">
                        <div className="mb-10 lg:hidden text-center">
                            <Link href="/" className="flex items-center justify-center space-x-2 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform shadow-cyan-500/20">
                                    <span className="text-white font-black text-xl">H</span>
                                </div>
                                <span className="text-xl font-black tracking-tighter text-white">HIRE<span className="text-cyan-400">PERFECT</span></span>
                            </Link>
                        </div>

                        <div className="mb-10">
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase leading-none">Terminal <br /><span className="text-gradient">Login sequence.</span></h1>
                            <p className="text-slate-500 font-medium text-sm tracking-wide">Verify your credentials to synchronize.</p>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest mb-8 animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@domain.com"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                    </svg>
                                }
                            />

                            <Input
                                label="Password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                showPasswordToggle
                                placeholder="••••••••"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                }
                            />

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center flex-shrink-0 ${rememberMe ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/20 group-hover:border-cyan-500/50'}`}>
                                        {rememberMe && (
                                            <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${rememberMe ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>Remember Session</span>
                                </label>
                                <Link href="#" className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>

                            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} className="py-5 shadow-2xl shadow-cyan-900/20 uppercase tracking-[0.2em] text-[10px] font-black">
                                Access Portal
                            </Button>
                        </form>

                        <div className="mt-10 pt-10 border-t border-white/5 text-center">
                            <p className="text-slate-500 font-medium text-sm">
                                New operative?{' '}
                                <Link href="/signup" className="text-cyan-400 font-black uppercase tracking-widest hover:text-cyan-300 transition-colors ml-1">
                                    Join Network
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
