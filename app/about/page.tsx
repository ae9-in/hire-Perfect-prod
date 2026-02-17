'use client';

import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#020205] text-white bg-grid selection:bg-cyan-500/30 selection:text-cyan-200">
            <Navbar />

            <main className="page-container pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-20 animate-fade-in">
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-4 block">Our Mission</span>
                        <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-8">
                            REDEFINING <br />
                            <span className="text-gradient">ASSESSMENT INTEGRITY.</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                            At HirePerfect, we believe that talent deserves a fair stage.
                            Our AI-powered platform ensures that every assessment is secure,
                            transparent, and truly reflective of a candidate's potential.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-32">
                        <Card className="p-10 bg-[#050510] border-white/5 hover:border-cyan-500/30 transition-all rounded-[2.5rem]">
                            <div className="w-12 h-12 bg-cyan-950/30 text-cyan-400 rounded-xl flex items-center justify-center mb-6 border border-cyan-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Radical Transparency</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                We provide candidates and companies with clear insights into assessment conditions,
                                eliminating guesswork and building trust from the very first interaction.
                            </p>
                        </Card>

                        <Card className="p-10 bg-[#050510] border-white/5 hover:border-purple-500/30 transition-all rounded-[2.5rem]">
                            <div className="w-12 h-12 bg-purple-950/30 text-purple-400 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">AI Excellence</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Our proprietary GuardEye AI monitoring system uses state-of-the-art vision models
                                to detect anomalies without compromising candidate comfort or privacy.
                            </p>
                        </Card>
                    </div>

                    <section className="text-center bg-[#050510] border border-white/10 p-16 rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">Ready to build the future?</h2>
                            <p className="text-slate-400 mb-10 max-w-lg mx-auto font-medium">
                                Join the thousands of teams already using HirePerfect to scale their hiring infrastructure.
                            </p>
                            <Link href="/signup">
                                <Button variant="primary" className="px-10 py-5 uppercase tracking-widest text-xs font-black">Begin Journey</Button>
                            </Link>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-12 border-t border-white/5 text-center px-6">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                    © 2026 HirePerfect Platform. Built for Excellence.
                </p>
            </footer>
        </div>
    );
}
