'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
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
        <div className="min-h-screen grid lg:grid-cols-2 bg-white selection:bg-indigo-100 selection:text-indigo-900">
            {/* Left Side: Cinematic Graphic */}
            <div className="hidden lg:flex flex-col justify-between p-20 relative bg-slate-900 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 via-slate-900 to-purple-600/20 pointer-events-none"></div>

                <Link href="/" className="relative z-10 group flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                        <span className="text-white font-black text-2xl">H</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase">HirePerfect</span>
                </Link>

                <div className="relative z-10">
                    <div className="inline-block px-3 py-1 bg-white/10 rounded-lg text-indigo-400 font-black text-xs tracking-widest uppercase mb-8">Secure Access</div>
                    <h2 className="text-6xl font-black text-white leading-none mb-8 tracking-tighter uppercase">
                        ENTRY TO THE <br /><span className="text-indigo-400">NEXT GENERABLE.</span>
                    </h2>
                    <p className="text-slate-400 text-lg font-medium max-w-sm">Access your secure portal and continue evaluating global excellence with GuardEye AI.</p>
                </div>

                <div className="relative z-10 pt-12 border-t border-white/5 flex gap-12">
                    <div>
                        <p className="text-white font-bold text-lg mb-1 tracking-tight">36+</p>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Active Units</p>
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg mb-1 tracking-tight">500k+</p>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Validations</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-slate-50 overflow-y-auto page-container">
                <Card className="w-full max-w-md p-1 border-0 shadow-2xl shadow-indigo-100/20">
                    <div className="bg-white rounded-[14px] p-10 md:p-12">
                        <div className="mb-10 lg:hidden">
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-black text-xl">H</span>
                                </div>
                                <span className="text-xl font-bold tracking-tighter uppercase">HirePerfect</span>
                            </Link>
                        </div>

                        <div className="mb-10">
                            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Terminal Login</h1>
                            <p className="text-slate-500 font-medium">Verify your credentials to continue.</p>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-500 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-tight mb-8 animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Terminal ID (Email)"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@domain.com"
                            />

                            <Input
                                label="Access Key (Password)"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                showPasswordToggle
                                placeholder="••••••••"
                            />

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter group-hover:text-slate-900 transition-colors">Remember Session</span>
                                </label>
                                <Link href="#" className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                                    Forgot Key?
                                </Link>
                            </div>

                            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} className="py-5 shadow-xl shadow-indigo-100 uppercase tracking-[0.2em] text-xs font-black">
                                Access Portal
                            </Button>
                        </form>

                        <div className="mt-10 pt-10 border-t border-slate-50 text-center">
                            <p className="text-slate-500 font-medium text-sm">
                                New operative?{' '}
                                <Link href="/signup" className="text-indigo-600 font-black uppercase tracking-widest hover:text-indigo-700 transition-colors ml-1">
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
