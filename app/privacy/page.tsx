'use client';

import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#020205] text-white bg-grid">
            <Navbar />

            <main className="page-container pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-16">
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-4 block">Legal Infrastructure</span>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-4">Privacy Policy</h1>
                        <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Last Updated: February 17, 2026</p>
                    </div>

                    <Card className="p-12 bg-[#050510] border-white/5 rounded-[2.5rem] prose prose-invert max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">1. Information We Collect</h2>
                            <p className="text-slate-400 mb-4 font-medium leading-relaxed">
                                HirePerfect collects information to provide better services to all our users. This includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium">
                                <li>Personal identifiers (Name, Email, Account credentials)</li>
                                <li>Assessment data (Responses, timing, performance metrics)</li>
                                <li>AI Monitoring data (Camera feed analysis, browser activity, behavior logs)</li>
                                <li>Device information (IP address, operating system, browser type)</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">2. AI Monitoring & Proctoring</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                To ensure assessment integrity, our platform utilizes AI-driven proctoring. During an assessment, we may monitor:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium">
                                <li>Video and audio feed to detect unauthorized assistance or presence</li>
                                <li>Screen activity to prevent prohibited tab switching or software usage</li>
                                <li>Input patterns to ensure the registered candidate is completing the task</li>
                            </ul>
                            <p className="text-slate-400 mt-4 font-medium leading-relaxed italic">
                                Video feeds are processed in real-time. Storage of raw video data is subject to your organization's specific retention policy.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">3. Data Usage</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                We use the collected data to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium">
                                <li>Deliver assessment results to the relevant hiring organization</li>
                                <li>Improve our AI proctoring models and platform security</li>
                                <li>Prevent fraudulent activities and maintain platform integrity</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">4. Data Security</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                We implement robust security measures to protect your data, including end-to-end encryption for video feeds
                                and secure, siloed database architectures.
                            </p>
                        </section>
                    </Card>
                </div>
            </main>

            <footer className="py-12 border-t border-white/5 text-center px-6">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                    © 2026 HirePerfect Platform. Security is our Priority.
                </p>
            </footer>
        </div>
    );
}
