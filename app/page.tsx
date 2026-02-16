'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CATEGORIES, PRICING } from '@/lib/constants';
import Navbar from '@/components/ui/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-grid selection:bg-indigo-100 selection:text-indigo-900">
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
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase">AI-Powered Proctoring Live</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 animate-fade-in-up">
              HIRE THE <span className="text-gradient">PERFECT</span>
              <br />
              CANDIDATE.
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              The world's most advanced AI-proctored assessment platform.
              Secure, scalable, and stunningly simple.
            </p>

            <div className="flex flex-wrap justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/signup">
                <Button variant="primary" size="lg" className="px-10 py-5 text-lg shadow-2xl shadow-indigo-200">
                  Begin Journey
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="px-10 py-5 text-lg glass border-slate-200">
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Platform Snapshot Mockup */}
            <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent z-10 h-full"></div>
              <div className="glass rounded-3xl p-4 shadow-premium border border-white/40 max-w-5xl mx-auto overflow-hidden rotate-[-1deg]">
                <div className="bg-slate-900 rounded-2xl w-full h-[400px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-20"></div>
                  <div className="z-10 text-center">
                    <div className="w-16 h-16 bg-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-indigo-500/50 shadow-xl">
                      <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Platform Demo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-32 px-6 bg-white/30">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-24 px-4">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 block">Unified Infrastructure</span>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter uppercase leading-[0.8]">
                EVERYTHING YOU NEED <br /><span className="text-gradient">TO SCALE EXCELLENCE.</span>
              </h2>
              <div className="w-24 h-2 bg-indigo-600 rounded-full"></div>
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
                    <p className="text-indigo-100 max-w-md font-medium text-lg leading-relaxed">Real-time behavior monitoring with face tracking and anomaly detection. 99.9% fraud prevention accuracy.</p>
                  </div>
                </Card>
              </div>

              {/* Feature 2: Small - Secure Env */}
              <div className="md:col-span-4 group">
                <Card className="h-full p-12 flex flex-col items-start justify-center bg-white border-slate-100 hover:border-indigo-200 transition-all group-hover:shadow-2xl group-hover:shadow-indigo-100/50 rounded-[2rem]">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight leading-none">Lockdown <br /> Mode</h3>
                  <p className="text-slate-500 font-medium text-base leading-relaxed">Full-screen enforcement and tab monitoring to ensure focus.</p>
                </Card>
              </div>

              {/* Feature 3: Small - Reports */}
              <div className="md:col-span-4 group">
                <Card className="h-full p-12 flex flex-col items-start justify-center glass border-white/50 bg-white/50 hover:bg-white transition-all group-hover:shadow-2xl group-hover:shadow-indigo-100/50 rounded-[2rem]">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight leading-none">Smart <br /> Analytics</h3>
                  <p className="text-slate-500 font-medium text-base leading-relaxed">Deep insights into candidate performance and behavioral metrics.</p>
                </Card>
              </div>

              {/* Feature 4: Large - Coding Assessments */}
              <div className="md:col-span-8 group">
                <Card className="h-full p-1 border-0 bg-transparent group overflow-visible relative">
                  <div className="absolute -inset-1 bg-slate-900/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="bg-slate-950 h-full rounded-[2rem] p-12 flex flex-col justify-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-10"></div>
                    <div className="relative z-10">
                      <div className="inline-block px-4 py-1.5 bg-white/5 rounded-lg border border-white/10 text-indigo-300 font-black text-[10px] tracking-[0.3em] uppercase mb-8">Protocol Alpha</div>
                      <h3 className="text-5xl font-black mb-6 uppercase tracking-tighter leading-none">CodeLabs <br /> Integration</h3>
                      <p className="text-slate-400 max-w-xl font-medium text-lg leading-relaxed">Evaluate technical prowess with a sophisticated IDE supporting 15+ languages. Live code execution and automated grading.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-32 px-6 relative bg-white overflow-hidden">
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12 px-4">
              <div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 block">Deployment Libraries</span>
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-[0.8]">Curated <br /><span className="text-gradient">Excellence.</span></h2>
                <p className="text-xl text-slate-500 font-medium mt-6">36+ Professional assessments across 6 core industries.</p>
              </div>
              <Link href="/assessments">
                <Button variant="outline" className="px-10 py-5 uppercase tracking-widest text-[10px] font-black border-slate-200 hover:bg-slate-50 transition-all">View All Tracks</Button>
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
                    <Card className="p-10 h-full bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all group rounded-[2.5rem] border-slate-100 py-12">
                      <div className="flex justify-between items-start mb-10">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-500 border border-slate-100 group-hover:border-indigo-600">
                          <CategoryIcon />
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase block mb-1">Stock</span>
                          <span className="text-[11px] font-black text-indigo-600 tracking-widest uppercase">{category.assessments.length} UNITS</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none">
                        {category.name}
                      </h3>
                      <p className="text-slate-500 text-base leading-relaxed font-medium">
                        {category.description}
                      </p>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="container mx-auto max-w-5xl">
            <Card className="p-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-center rounded-[3rem] shadow-premium relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter uppercase leading-none">Ready to transform <br /> your hiring?</h2>
                <p className="text-xl text-indigo-100 mb-12 max-w-xl mx-auto font-medium">Join 500+ teams evaluating candidates with HirePerfect. No credit card required to start.</p>
                <Link href="/signup">
                  <Button variant="primary" className="bg-white text-indigo-600 hover:bg-slate-50 px-12 py-6 text-xl shadow-2xl">Create Free Account</Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="pt-24 pb-12 px-6 bg-slate-950 text-white relative border-t border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-12 gap-12 mb-20">
            <div className="md:col-span-4">
              <Link href="/" className="flex items-center space-x-2 mb-8">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-xl">H</span>
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase">HirePerfect</span>
              </Link>
              <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
                Empowering teams to find the best talent through secure, AI-powered assessments.
              </p>
            </div>

            <div className="md:col-span-8 flex flex-wrap gap-x-24 gap-y-12 justify-end">
              <div>
                <h4 className="font-black uppercase tracking-widest text-indigo-400 text-xs mb-6">Product</h4>
                <ul className="space-y-4 text-slate-300 font-bold text-sm">
                  <li><Link href="/assessments" className="hover:text-indigo-400 transition-colors">Assessments</Link></li>
                  <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link></li>
                  <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-indigo-400 text-xs mb-6">Company</h4>
                <ul className="space-y-4 text-slate-300 font-bold text-sm">
                  <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                  <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
                  <li><Link href="/careers" className="hover:text-indigo-400 transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-indigo-400 text-xs mb-6">Legal</h4>
                <ul className="space-y-4 text-slate-300 font-bold text-sm">
                  <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-8">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
              © 2026 HirePerfect Platform. Built for Excellence.
            </p>
            <div className="flex gap-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer group">
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
