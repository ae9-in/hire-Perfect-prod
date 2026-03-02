'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CATEGORIES, PRICING } from '@/lib/constants';
import Navbar from '@/components/ui/Navbar';

export default function HomePage() {
  const [faqForm, setFaqForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [faqSubmitting, setFaqSubmitting] = useState(false);
  const [faqFeedback, setFaqFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFAQSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFaqFeedback(null);
    setFaqSubmitting(true);

    try {
      const res = await fetch('/api/faq-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setFaqFeedback({ type: 'error', message: data.error || 'Failed to submit your query.' });
        return;
      }

      setFaqFeedback({ type: 'success', message: 'Thanks. Your query has been submitted successfully.' });
      setFaqForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setFaqFeedback({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setFaqSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white bg-grid selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="page-container">
        {/* Floating Gradient Orbs */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-float"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-2s' }}></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="container mx-auto text-center max-w-5xl relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 mb-8 animate-fade-in shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-black text-cyan-400 tracking-widest uppercase">AI-Powered Proctoring Live</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 animate-fade-in-up">
              HIRE THE <span className="text-gradient">PERFECT</span>
              <br />
              CANDIDATE.
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              The world's most advanced AI-proctored assessment platform.
              Secure, scalable, and stunningly simple.
            </p>

            <div className="flex flex-wrap justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/signup">
                <Button variant="primary" size="lg" className="px-10 py-5 text-lg shadow-2xl shadow-cyan-500/20">
                  Begin Journey
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="px-10 py-5 text-lg glass border-white/10 hover:border-cyan-500/50 text-white">
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Hero Snapshot Section */}
            <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative glass rounded-[2.5rem] p-2 shadow-2xl shadow-cyan-500/10 border border-white/10 max-w-6xl mx-auto overflow-hidden">
                <div className="relative rounded-[2rem] bg-[#050510] border border-white/10 p-8 md:p-10 overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-20"></div>
                  <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full"></div>
                  <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full"></div>

                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                      <div className="glass-cyan px-4 py-2 rounded-xl border border-cyan-500/30">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Monitoring Active</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Live Platform Snapshot</span>
                    </div>

                    <div className="grid md:grid-cols-12 gap-6">
                      <div className="md:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6">
                        <p className="text-[10px] font-black text-cyan-400 tracking-[0.25em] uppercase mb-4">Session Control</p>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm font-semibold">Face Detection</span>
                            <span className="text-emerald-400 text-xs font-black tracking-widest uppercase">Stable</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm font-semibold">Environment Lock</span>
                            <span className="text-emerald-400 text-xs font-black tracking-widest uppercase">Enabled</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm font-semibold">Anomaly Alerts</span>
                            <span className="text-cyan-400 text-xs font-black tracking-widest uppercase">Real-Time</span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6">
                        <p className="text-[10px] font-black text-purple-400 tracking-[0.25em] uppercase mb-4">Assessment Workflow</p>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <p className="text-cyan-300 text-[10px] font-black uppercase tracking-widest mb-2">Step 01</p>
                            <p className="text-white text-sm font-bold leading-snug">Candidate Verification</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <p className="text-cyan-300 text-[10px] font-black uppercase tracking-widest mb-2">Step 02</p>
                            <p className="text-white text-sm font-bold leading-snug">Secure Exam Session</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <p className="text-cyan-300 text-[10px] font-black uppercase tracking-widest mb-2">Step 03</p>
                            <p className="text-white text-sm font-bold leading-snug">Result Intelligence</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {[
                        { label: 'Monitored Attempts', value: '12K+' },
                        { label: 'Active Recruiters', value: '180+' },
                        { label: 'Assessment Tracks', value: '36+' },
                        { label: 'Uptime Target', value: '99.9%' },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl bg-white/5 border border-white/10 p-4 text-left">
                          <p className="text-lg md:text-xl font-black text-white">{item.value}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-32 px-6 bg-[#030308]/80 border-t border-white/5 relative z-10">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-24 px-4">
              <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-4 block">Unified Infrastructure</span>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.8]">
                EVERYTHING YOU NEED <br /><span className="text-gradient">TO SCALE EXCELLENCE.</span>
              </h2>
              <div className="w-24 h-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-12 gap-10 auto-rows-[280px]">
              {/* Feature 1: Large - AI Proctoring */}
              <div className="md:col-span-8 group">
                <Card className="h-full p-1 border-0 bg-transparent group overflow-visible relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 h-full rounded-[2rem] p-12 flex flex-col justify-end text-white relative overflow-hidden">
                    <div className="absolute top-12 right-12 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
                      <svg className="w-56 h-56" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter leading-none">GuardEye AI <br /> Proctoring</h3>
                    <p className="text-slate-300 max-w-md font-medium text-lg leading-relaxed">Real-time behavior monitoring with face tracking and anomaly detection. 99.9% fraud prevention accuracy.</p>
                  </div>
                </Card>
              </div>

              {/* Feature 2: Small - Secure Env */}
              <div className="md:col-span-4 group">
                <Card className="h-full p-12 flex flex-col items-start justify-center hover:border-cyan-500/30 transition-all group-hover:shadow-2xl group-hover:shadow-cyan-500/10 rounded-[2rem]">
                  <div className="w-16 h-16 bg-cyan-950/30 text-cyan-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-500 border border-cyan-500/20">
                    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight leading-none">Lockdown <br /> Mode</h3>
                  <p className="text-slate-400 font-medium text-base leading-relaxed">Full-screen enforcement and tab monitoring to ensure focus.</p>
                </Card>
              </div>

              {/* Feature 3: Small - Reports */}
              <div className="md:col-span-4 group">
                <Card className="h-full p-12 flex flex-col items-start justify-center hover:border-purple-500/30 transition-all group-hover:shadow-2xl group-hover:shadow-purple-500/10 rounded-[2rem]">
                  <div className="w-16 h-16 bg-purple-950/30 text-purple-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors duration-500 border border-purple-500/20">
                    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight leading-none">Smart <br /> Analytics</h3>
                  <p className="text-slate-400 font-medium text-base leading-relaxed">Deep insights into candidate performance and behavioral metrics.</p>
                </Card>
              </div>

              {/* Feature 4: Large - MCQ Assessments */}
              <div className="md:col-span-8 group">
                <Card className="h-full p-1 border-0 bg-transparent group overflow-visible relative">
                  <div className="absolute -inset-1 bg-cyan-900/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="bg-[#050510] h-full rounded-[2rem] p-8 md:p-10 flex flex-col justify-between text-white relative overflow-hidden border border-white/5">
                    <div className="absolute inset-0 bg-grid opacity-10"></div>
                    <div className="relative z-10">
                      <div className="inline-block px-4 py-1.5 bg-white/5 rounded-lg border border-white/10 text-cyan-300 font-black text-[10px] tracking-[0.22em] uppercase mb-6">
                        Assessment Core
                      </div>
                      <h3 className="text-4xl md:text-5xl font-black mb-5 uppercase tracking-tight leading-[0.95]">
                        Structured MCQ
                        <br />
                        Evaluation
                      </h3>
                      <p className="text-slate-400 max-w-2xl font-medium text-base md:text-lg leading-relaxed">
                        Deliver high-quality multiple-choice assessments with category-based coverage, clear scoring logic,
                        and consistent evaluation standards.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-28 px-6 bg-[#020205] border-t border-white/5">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-16 px-4 text-center">
              <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.35em] mb-4 block">How It Works</span>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.85]">
                FROM REGISTRATION <br /><span className="text-gradient">TO VERIFIED RESULTS.</span>
              </h2>
              <p className="text-lg text-slate-400 font-medium max-w-3xl mx-auto">
                A structured workflow built to maintain fairness, consistency, and confidence in every assessment session.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 px-4">
              {[
                {
                  step: '01',
                  title: 'Candidate Onboarding',
                  text: 'Users register, authenticate, and access role-based assessment journeys.',
                },
                {
                  step: '02',
                  title: 'Assessment Start',
                  text: 'Candidates begin category-focused MCQ assessments with exam controls enabled.',
                },
                {
                  step: '03',
                  title: 'Live Monitoring',
                  text: 'Session activity is monitored for anomalies to preserve exam integrity in real time.',
                },
                {
                  step: '04',
                  title: 'Scoring & Review',
                  text: 'Attempts are evaluated and surfaced with result visibility and admin audit support.',
                },
              ].map((item) => (
                <Card key={item.step} className="p-8 bg-[#050510] rounded-[2rem] border-white/10 hover:border-cyan-500/30 transition-all">
                  <div className="text-cyan-400 text-xs font-black tracking-[0.25em] uppercase mb-4">{item.step}</div>
                  <h3 className="text-2xl font-black text-white mb-3 uppercase leading-tight">{item.title}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">{item.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Standards Section */}
        <section className="py-28 px-6 bg-[#030308]/70 border-t border-white/5">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-10 px-4">
              <div className="lg:col-span-7">
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.35em] mb-4 block">Trust Layer</span>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.85]">
                  BUILT FOR <span className="text-gradient">SECURITY AND ACCOUNTABILITY.</span>
                </h2>
                <p className="text-lg text-slate-400 font-medium max-w-2xl mb-10 leading-relaxed">
                  HirePerfect is designed for professional assessment operations with controlled sessions, transparent review
                  signals, and centralized administrative oversight.
                </p>
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    'Full-screen and tab-focus controls during exams',
                    'AI-assisted monitoring and violation logging',
                    'Structured admin views for attempts and users',
                    'Role-aware access boundaries across the platform',
                  ].map((point) => (
                    <div key={point} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-300 font-semibold leading-relaxed">
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <Card className="h-full p-10 rounded-[2rem] border-white/10 bg-[#050510] relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-tight">Platform Outcomes</h3>
                    <div className="space-y-5">
                      {[
                        { label: 'Assessment Reliability', value: 'High' },
                        { label: 'Admin Visibility', value: 'Comprehensive' },
                        { label: 'Evaluation Consistency', value: 'Standardized' },
                        { label: 'Remote Readiness', value: 'Production-Ready' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-3">
                          <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{item.label}</span>
                          <span className="text-cyan-300 font-black text-sm uppercase tracking-widest">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Why HirePerfect Section */}
        <section className="py-28 px-6 bg-[#020205] border-t border-white/5">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.35em] mb-4 block">Why Teams Choose Us</span>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.85]">
                A COMPLETE SYSTEM <br /><span className="text-gradient">FOR MODERN ASSESSMENTS.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-10 rounded-[2rem] bg-[#050510] border-white/10 hover:border-cyan-500/30 transition-all">
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Professional Delivery</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Structured exam workflows, polished UX, and clear evaluation flow for reliable execution across teams.
                </p>
              </Card>
              <Card className="p-10 rounded-[2rem] bg-[#050510] border-white/10 hover:border-purple-500/30 transition-all">
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Operational Clarity</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  From onboarding to results, every stage is visible to admins through centralized controls and logs.
                </p>
              </Card>
              <Card className="p-10 rounded-[2rem] bg-[#050510] border-white/10 hover:border-emerald-500/30 transition-all">
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Scalable Foundation</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Category-based MCQ architecture supports growth across hiring cohorts, academic programs, and training tracks.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-32 px-6 relative bg-[#020205] overflow-hidden">
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12 px-4">
              <div>
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-4 block">Deployment Libraries</span>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.8]">Curated <br /><span className="text-gradient">Excellence.</span></h2>
                <p className="text-xl text-slate-400 font-medium mt-6">240+ Professional assessments across 20 core categories.</p>
              </div>
              <Link href="/assessments">
                <Button variant="outline" className="px-10 py-5 uppercase tracking-widest text-[10px] font-black border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-white">View All Tracks</Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {CATEGORIES.map((category: any, index) => {
                const CategoryIcon = () => {
                  switch (category.slug) {
                    case 'soft-skills': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
                    case 'programming-fundamentals': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
                    case 'it-specializations': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
                    case 'mba-core': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
                    case 'data-analytics': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>;
                    case 'corporate-readiness': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
                    default: return <span className="text-indigo-600 font-black text-xl">{category.name.charAt(0)}</span>;
                  }
                };

                return (
                  <Link href={`/assessments?category=${category.slug}`} key={index}>
                    <Card className="p-10 h-full bg-[#050510] hover:bg-[#0a0a1a] transition-all group rounded-[2.5rem] border-white/5 hover:border-cyan-500/30 py-12">
                      <div className="flex justify-between items-start mb-10">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl shadow-sm flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white group-hover:scale-110 transition-all duration-500 border border-white/10 group-hover:border-cyan-600">
                          <CategoryIcon />
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase block mb-1">Stock</span>
                          <span className="text-[11px] font-black text-cyan-500 tracking-widest uppercase">{(category.subjects || category.assessments || []).length} SUBJECTS</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-4 group-hover:text-cyan-400 transition-colors uppercase tracking-tight leading-none">
                        {category.name}
                      </h3>
                      <p className="text-slate-400 text-base leading-relaxed font-medium">
                        {category.description}
                      </p>
                      <ul className="mt-5 space-y-1.5">
                        {(category.subjects || category.assessments || []).slice(0, 4).map((subject: string) => (
                          <li key={subject} className="text-xs text-slate-500 font-bold tracking-wide truncate">• {subject}</li>
                        ))}
                      </ul>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-[#030308]/50 relative z-10 border-t border-white/5">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-24 px-4">
              <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-4 block">Simple, Transparent Pricing</span>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.8]">
                CHOOSE YOUR <br /><span className="text-gradient">ENGINE FOR GROWTH.</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">No hidden fees. Start for free. Scale as you evolve.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 px-4">
              {/* Individual Tier */}
              <Card className="p-12 bg-[#050510] border-white/5 hover:border-cyan-500/30 transition-all rounded-[2.5rem] flex flex-col items-center text-center">
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Individual</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-black text-white">₹{PRICING.INDIVIDUAL_ASSESSMENT}</span>
                  <span className="text-slate-500 ml-2 font-bold uppercase text-xs tracking-widest">/test</span>
                </div>
                <p className="text-slate-400 font-medium mb-12 text-sm leading-relaxed">Perfect for trying out single assessments with full proctoring.</p>
                <div className="mt-auto w-full">
                  <Link href="/signup">
                    <Button variant="outline" className="w-full py-5 rounded-2xl glass border-white/10 hover:border-cyan-500/50 text-white font-black uppercase tracking-widest text-[10px]">Choose Plan</Button>
                  </Link>
                </div>
              </Card>

              {/* Category Combo - Featured */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-[2.6rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative p-12 bg-[#050510] border-purple-500/30 transition-all rounded-[2.5rem] flex flex-col items-center text-center h-full">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-xl">Most Popular</div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Category Combo</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-black text-white">₹{PRICING.CATEGORY_COMBO}</span>
                    <span className="text-slate-500 ml-2 font-bold uppercase text-xs tracking-widest">/cat</span>
                  </div>
                  <p className="text-slate-400 font-medium mb-12 text-sm leading-relaxed">12 assessments in one category. Best for targeted team evaluation.</p>
                  <div className="mt-auto w-full">
                    <Link href="/signup">
                      <Button variant="primary" className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 border-0 shadow-2xl shadow-purple-500/20 text-white font-black uppercase tracking-widest text-[10px]">Get Started</Button>
                    </Link>
                  </div>
                </Card>
              </div>

              {/* Full Bundle Tier */}
              <Card className="p-12 bg-[#050510] border-white/5 hover:border-purple-500/30 transition-all rounded-[2.5rem] flex flex-col items-center text-center">
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Full Bundle</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-black text-white">₹{PRICING.FULL_BUNDLE}</span>
                  <span className="text-slate-500 ml-2 font-bold uppercase text-xs tracking-widest">/all</span>
                </div>
                <p className="text-slate-400 font-medium mb-12 text-sm leading-relaxed">All 240 assessments across 20 categories. The complete hiring infrastructure.</p>
                <div className="mt-auto w-full">
                  <Link href="/signup">
                    <Button variant="outline" className="w-full py-5 rounded-2xl glass border-white/10 hover:border-purple-500/50 text-white font-black uppercase tracking-widest text-[10px]">Choose Plan</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Submission Section */}
        <section id="faq-submission-form" className="py-28 px-6 bg-[#020205] border-t border-white/5">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.35em] mb-4 block">FAQ Submission</span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-4">
                CONTACT US
              </h2>
              <p className="text-slate-400 font-medium max-w-2xl mx-auto">
                Have a query about assessments, billing, or platform usage? Submit your message and our team will respond.
              </p>
            </div>

            <Card className="p-8 md:p-10 rounded-[2rem] bg-[#050510] border-white/10">
              <form onSubmit={handleFAQSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={faqForm.name}
                  onChange={(e) => setFaqForm({ ...faqForm, name: e.target.value })}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={faqForm.email}
                  onChange={(e) => setFaqForm({ ...faqForm, email: e.target.value })}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                  required
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={faqForm.subject}
                  onChange={(e) => setFaqForm({ ...faqForm, subject: e.target.value })}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                  required
                />
                <textarea
                  placeholder="Write your query..."
                  rows={5}
                  value={faqForm.message}
                  onChange={(e) => setFaqForm({ ...faqForm, message: e.target.value })}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 resize-none"
                  required
                />
                <Button type="submit" variant="primary" className="w-full py-4" loading={faqSubmitting}>
                  Submit Query
                </Button>
                {faqFeedback && (
                  <p className={`text-sm font-bold ${faqFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {faqFeedback.message}
                  </p>
                )}
              </form>
            </Card>
          </div>
        </section>
      </main>      {/* Modern Footer */}
      <footer className="pt-20 pb-10 px-6 bg-slate-950 text-white relative border-t border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-12 gap-10 mb-14">
            <div className="md:col-span-4">
              <Link href="/" className="flex items-center space-x-2 mb-8 group">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/10 transition-transform group-hover:rotate-6">
                  <span className="text-white font-black text-xl">H</span>
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase text-white">Hire<span className="text-cyan-400">Perfect</span></span>
              </Link>
              <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                Empowering teams to find the best talent through secure, AI-powered assessments.
              </p>
            </div>

            <div className="md:col-span-3">
              <h4 className="font-black uppercase tracking-widest text-cyan-400 text-xs mb-6">FAQ Submission</h4>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 max-w-sm">
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4 max-w-[28ch]">
                  Need help or have a question? Reach out through our FAQ submission form.
                </p>
                <Link
                  href="#faq-submission-form"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-500/30 text-cyan-300 font-black text-[11px] uppercase tracking-[0.18em] hover:bg-cyan-500/10 hover:text-cyan-200 transition-colors"
                >
                  Contact Us
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-6">
                <div>
                  <h4 className="font-black uppercase tracking-widest text-cyan-400 text-xs mb-6">Product</h4>
                  <ul className="space-y-4 text-slate-300 font-bold text-sm">
                    <li><Link href="/assessments" className="hover:text-cyan-400 transition-colors">Assessments</Link></li>
                    <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link></li>
                    <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-cyan-400 text-xs mb-6">Company</h4>
                  <ul className="space-y-4 text-slate-300 font-bold text-sm">
                    <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-cyan-400 text-xs mb-6">Legal</h4>
                  <ul className="space-y-4 text-slate-300 font-bold text-sm">
                    <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-6">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
              (C) 2026 HirePerfect Platform. Built for Excellence.
            </p>
            <div className="flex gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center hover:bg-cyan-600 transition-colors cursor-pointer group hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <div className="w-4 h-4 bg-slate-500 group-hover:bg-white transition-colors rounded-sm"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}




