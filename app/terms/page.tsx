'use client';

import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#020205] text-white bg-grid">
            <Navbar />

            <main className="page-container pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-16">
                        <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-4 block">Regulatory Frame</span>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-4">Terms of Service</h1>
                        <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Last Updated: February 17, 2026</p>
                    </div>

                    <Card className="p-12 bg-[#050510] border-white/5 rounded-[2.5rem] prose prose-invert max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">1. Acceptance of Terms</h2>
                            <p className="text-slate-400 mb-4 font-medium leading-relaxed">
                                By accessing or using HirePerfect, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                                If you do not agree with any of these terms, you are prohibited from using the platform.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">2. Use License</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                HirePerfect grants you a personal, non-exclusive, non-transferable license to use the platform for the purpose of
                                completing or administering assessments. You may not:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium">
                                <li>Modify or copy the platform materials or AI proctoring logic</li>
                                <li>Attempt to decompile or reverse engineer any software on the platform</li>
                                <li>Remove any copyright or other proprietary notations</li>
                                <li>Circumvent or attempt to circumvent AI monitoring protocols</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">3. Integrity & Conduct</h2>
                            <p className="text-slate-400 font-medium leading-relaxed mb-4">
                                Users agree to complete assessments with complete honesty. Prohibited conduct includes but is not limited to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium">
                                <li>Using unauthorized external resources (hardware or software)</li>
                                <li>Communicating with third parties during an assessment</li>
                                <li>Impersonating another individual</li>
                                <li>Capturing or sharing assessment content</li>
                            </ul>
                            <p className="text-slate-400 mt-4 font-medium leading-relaxed">
                                Violation of these rules may lead to immediate termination of your session and invalidation of results.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">4. Disclaimer</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                The platform is provided "as is". HirePerfect makes no warranties, expressed or implied,
                                and hereby disclaims all other warranties including, without limitation, implied warranties or conditions of
                                merchantability or fitness for a particular purpose.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">5. Limitations</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                In no event shall HirePerfect be liable for any damages arising out of the use or inability to use the platform,
                                even if HirePerfect has been notified of the possibility of such damage.
                            </p>
                        </section>
                    </Card>
                </div>
            </main>

            <footer className="py-12 border-t border-white/5 text-center px-6">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                    © 2026 HirePerfect Platform. Built on Integrity.
                </p>
            </footer>
        </div>
    );
}
