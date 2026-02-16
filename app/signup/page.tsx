'use client';

import { useState } from 'react';
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
        role: 'candidate',
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
                    role: formData.role,
                    phone: formData.phone,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Signup failed');

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
            {/* Left Side: Signup Form */}
            <div className="flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-slate-50 overflow-y-auto page-container">
                <Card className="w-full max-w-lg p-1 border-0 shadow-2xl shadow-indigo-100/20">
                    <div className="bg-white rounded-[14px] p-10 md:p-12">
                        <div className="mb-10 lg:hidden">
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-black text-xl">H</span>
                                </div>
                                <span className="text-xl font-bold tracking-tighter uppercase">HirePerfect</span>
                            </Link>
                        </div>

                        <div className="mb-12">
                            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Join Network</h1>
                            <p className="text-slate-500 font-medium">Create your operative profile to begin.</p>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-500 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-tight mb-8 animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Identity"
                                    type="text"
                                    required
                                    placeholder="Operative Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <Input
                                    label="Track Type"
                                    type="select"
                                    required
                                    as="select"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="candidate">Candidate</option>
                                    <option value="admin">Administrator</option>
                                </Input>
                            </div>

                            <Input
                                label="Terminal ID (Email)"
                                type="email"
                                required
                                placeholder="name@domain.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />

                            <Input
                                label="Phone Liaison (Optional)"
                                type="tel"
                                placeholder="+91 000-000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Input
                                        label="Primary Key"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    {formData.password && (
                                        <div className="px-1">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{passwordStrength.label} Security</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                                                    style={{ width: `${passwordStrength.strength}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Input
                                    label="Re-Verify Key"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${acceptedTerms ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                                    {acceptedTerms && (
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-tight select-none">
                                    I authorize the processing of my credentials and agree to the <span className="text-indigo-600 font-black">Global Terms</span> and <span className="text-indigo-600 font-black">Privacy Protocol</span>.
                                </p>
                            </div>

                            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} className="py-5 shadow-xl shadow-indigo-100 uppercase tracking-[0.2em] text-xs font-black">
                                Establish Profile
                            </Button>
                        </form>

                        <div className="mt-10 pt-10 border-t border-slate-50 text-center">
                            <p className="text-slate-500 font-medium text-sm">
                                Already registered?{' '}
                                <Link href="/login" className="text-indigo-600 font-black uppercase tracking-widest hover:text-indigo-700 transition-colors ml-1">
                                    Login Terminal
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right Side: Cinematic Graphic */}
            <div className="hidden lg:flex flex-col justify-between p-20 relative bg-slate-900 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/20 via-slate-900 to-indigo-600/20 pointer-events-none"></div>

                <Link href="/" className="relative z-10 group flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                        <span className="text-white font-black text-2xl">H</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase">HirePerfect</span>
                </Link>

                <div className="relative z-10">
                    <div className="inline-block px-3 py-1 bg-white/10 rounded-lg text-purple-400 font-black text-xs tracking-widest uppercase mb-8">Operative Registration</div>
                    <h2 className="text-6xl font-black text-white leading-none mb-8 tracking-tighter uppercase">
                        UNCAGE YOUR <br /><span className="text-gradient">POTENTIAL.</span>
                    </h2>
                    <p className="text-slate-400 text-lg font-medium max-w-sm">Join the global network of excellence and validate your skills with the most secure AI platform.</p>
                </div>

                <div className="relative z-10 pt-12 border-t border-white/5 flex gap-12">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/50 flex items-center justify-center">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                        </div>
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Network Live</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
