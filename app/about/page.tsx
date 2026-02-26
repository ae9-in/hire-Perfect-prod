'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const pillars = [
    {
        title: 'Integrity By Design',
        description:
            'Every assessment flow is built to reduce ambiguity and protect fairness through consistent session controls and transparent review signals.',
    },
    {
        title: 'Operational Excellence',
        description:
            'Administrators can manage assessments, monitor attempts, and review outcomes through one streamlined platform experience.',
    },
    {
        title: 'Candidate-First Experience',
        description:
            'The interface is structured to be clear and predictable, helping serious candidates focus on performance rather than platform friction.',
    },
];

const capabilities = [
    'Assessment authoring and category-level organization for scalable test design.',
    'AI-assisted proctoring workflows to detect suspicious patterns in real time.',
    'Violation and attempt tracking for audit visibility and policy enforcement.',
    'Role-based admin and candidate views with secure authentication.',
    'Reporting-ready output for hiring teams and training organizations.',
    'API-backed architecture for maintenance, analytics, and future integrations.',
];

const processSteps = [
    {
        step: '01',
        title: 'Onboarding and Access',
        detail: 'Users authenticate, roles are validated, and access is scoped to candidate or admin workflows.',
    },
    {
        step: '02',
        title: 'Assessment Preparation',
        detail: 'Candidates select assessments and complete pre-exam readiness checks before the session begins.',
    },
    {
        step: '03',
        title: 'Monitored Exam Session',
        detail: 'The exam runs with environment controls and behavior monitoring to preserve integrity.',
    },
    {
        step: '04',
        title: 'Submission and Evaluation',
        detail: 'Attempts are submitted, scored, and compiled into clear result views for informed decisions.',
    },
];

const outcomes = [
    {
        title: 'For Hiring Teams',
        description:
            'Standardize candidate evaluations, reduce manual screening effort, and improve confidence in shortlisting decisions.',
    },
    {
        title: 'For Academic and Training Programs',
        description:
            'Conduct remote assessments with stronger exam governance and measurable process consistency.',
    },
    {
        title: 'For Candidates',
        description:
            'Participate in structured assessments where outcomes reflect preparation, skill, and performance quality.',
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#020205] text-white bg-grid selection:bg-cyan-500/30 selection:text-cyan-200">
            <Navbar />

            <main className="page-container pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <section className="text-center mb-20 animate-fade-in">
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.35em] mb-4 block">
                            About HirePerfect
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.92] mb-8">
                            PROFESSIONAL AI-ASSESSMENT
                            <br />
                            <span className="text-gradient">INFRASTRUCTURE FOR MODERN TEAMS</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-4xl mx-auto font-medium leading-relaxed">
                            HirePerfect is a secure assessment platform for organizations that require fairness, visibility,
                            and consistency in hiring and skill evaluation workflows. The platform combines monitored delivery,
                            operational controls, and structured reporting to support high-stakes decisions with confidence.
                        </p>
                    </section>

                    <section className="grid md:grid-cols-3 gap-6 mb-20">
                        {pillars.map((pillar, index) => (
                            <Card
                                key={pillar.title}
                                className={`p-8 bg-[#050510] border-white/10 transition-all rounded-3xl ${
                                    index === 1 ? 'hover:border-purple-500/40' : 'hover:border-cyan-500/40'
                                }`}
                            >
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Core Principle</span>
                                <h2 className="text-xl font-black tracking-tight mt-3 mb-4">{pillar.title}</h2>
                                <p className="text-slate-300 leading-relaxed font-medium">{pillar.description}</p>
                            </Card>
                        ))}
                    </section>

                    <section className="mb-20">
                        <Card className="p-10 md:p-12 bg-[#050510] border-white/10 rounded-3xl">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-8">What The Platform Includes</h2>
                            <div className="grid md:grid-cols-2 gap-5">
                                {capabilities.map((capability) => (
                                    <div
                                        key={capability}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-300 font-medium leading-relaxed"
                                    >
                                        {capability}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>

                    <section className="mb-20">
                        <div className="grid lg:grid-cols-12 gap-8">
                            <Card className="lg:col-span-5 p-10 bg-[#050510] border-white/10 rounded-3xl">
                                <h2 className="text-3xl font-black tracking-tight mb-6">Why Organizations Choose HirePerfect</h2>
                                <p className="text-slate-300 font-medium leading-relaxed mb-5">
                                    Remote evaluations can lose reliability when controls are weak or inconsistent. HirePerfect
                                    addresses this by combining monitored sessions, structured workflows, and review-ready logs.
                                </p>
                                <p className="text-slate-300 font-medium leading-relaxed mb-5">
                                    The result is a system that helps teams maintain process quality at scale without adding
                                    heavy operational overhead.
                                </p>
                                <p className="text-slate-300 font-medium leading-relaxed">
                                    From test creation to final decision support, the platform is designed for professional
                                    evaluation standards in real-world deployments.
                                </p>
                            </Card>

                            <Card className="lg:col-span-7 p-10 bg-[#050510] border-white/10 rounded-3xl">
                                <h2 className="text-3xl font-black tracking-tight mb-6">How It Works</h2>
                                <div className="space-y-5">
                                    {processSteps.map((item) => (
                                        <div
                                            key={item.step}
                                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex gap-4 items-start"
                                        >
                                            <span className="text-cyan-300 font-black text-sm tracking-[0.2em]">{item.step}</span>
                                            <div>
                                                <p className="text-white font-black tracking-tight mb-1">{item.title}</p>
                                                <p className="text-slate-300 font-medium leading-relaxed">{item.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </section>

                    <section className="mb-20">
                        <Card className="p-10 md:p-12 bg-[#050510] border-white/10 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Security, Privacy, and Professional Standards</h2>
                                <div className="grid md:grid-cols-2 gap-8 text-slate-300 font-medium leading-relaxed">
                                    <p>
                                        HirePerfect emphasizes controlled assessment environments, structured access policies,
                                        and traceable events to support responsible exam governance. Monitoring signals are
                                        handled as operational quality controls for integrity-sensitive workflows.
                                    </p>
                                    <p>
                                        The architecture supports reviewability and accountability, helping institutions and
                                        hiring teams align their process with policy requirements and internal compliance
                                        expectations.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </section>

                    <section className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-10">Who Benefits</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {outcomes.map((item, index) => (
                                <Card
                                    key={item.title}
                                    className={`p-8 bg-[#050510] border-white/10 transition-all rounded-3xl ${
                                        index === 2 ? 'hover:border-emerald-500/40' : 'hover:border-purple-500/40'
                                    }`}
                                >
                                    <h3 className="text-xl font-black tracking-tight mb-4">{item.title}</h3>
                                    <p className="text-slate-300 font-medium leading-relaxed">{item.description}</p>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section className="text-center bg-[#050510] border border-white/10 p-14 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight">Build Assessment Trust at Scale</h2>
                            <p className="text-slate-300 font-medium leading-relaxed mb-8">
                                Explore assessment tracks, onboard teams, and operate a consistent evaluation framework with
                                professional-grade confidence.
                            </p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <Link href="/assessments">
                                    <Button variant="primary" className="px-8 py-4 uppercase tracking-wider text-xs font-black">
                                        Explore Assessments
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button variant="ghost" className="px-8 py-4 uppercase tracking-wider text-xs font-black">
                                        Create Account
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-12 border-t border-white/5 text-center px-6">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                    (C) 2026 HirePerfect Platform. Built for professional assessment standards.
                </p>
            </footer>
        </div>
    );
}
