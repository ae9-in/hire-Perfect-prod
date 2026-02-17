'use client';

import React from 'react';

interface CriticalErrorProps {
    title?: string;
    message?: string;
    nodeName?: string;
}

export default function CriticalError({
    title = "CRITICAL ERROR",
    message = "PROTOCOL VIOLATION: ASSESSMENT SESSION FOR THIS IDENTITY IS ALREADY COMPLETED. ACCESS PERMANENTLY REVOKED.",
    nodeName = "NODE_S_ALPHA"
}: CriticalErrorProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020205] p-4">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>

            <div className="relative w-full max-w-2xl aspect-[1.4/1] md:aspect-[1.5/1]">
                {/* Main Card */}
                <div className="absolute inset-0 bg-[#3a030f]/90 backdrop-blur-3xl rounded-[3rem] border border-rose-900/40 shadow-[0_0_100px_rgba(58,3,15,0.8)] overflow-hidden">
                    {/* Top Status Badges */}
                    <div className="absolute top-10 left-10 flex items-center space-x-6">
                        <div className="flex items-center space-x-3 px-4 py-2 bg-black/40 rounded-full border border-rose-500/20">
                            <div className="w-2.5 h-2.5 bg-rose-600 rounded-full shadow-[0_0_8px_#e11d48]"></div>
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Active Sensor</span>
                        </div>
                    </div>

                    <div className="absolute top-10 left-1/2 -translate-x-1/2">
                        <div className="px-6 py-2 bg-[#0d1c24]/80 rounded-full border border-cyan-500/30 shadow-[0_0_20px_rgba(0,242,255,0.1)]">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">{nodeName}</span>
                        </div>
                    </div>

                    {/* Warning Icon Cluster */}
                    <div className="mt-24 flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 bg-rose-500/5 rounded-3xl border border-rose-500/20 rotate-45 flex items-center justify-center overflow-hidden">
                                <div className="-rotate-45 relative z-10">
                                    <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent"></div>
                            </div>
                            <div className="absolute -inset-4 bg-rose-500/10 blur-2xl rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="mt-12 px-12 text-center space-y-6">
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none">
                            {title}
                        </h1>
                        <p className="text-rose-500 font-bold text-base md:text-lg uppercase tracking-widest leading-relaxed max-w-md mx-auto">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Telemetry Footer Layout */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] grid grid-cols-3 gap-1 px-1">
                    <div className="bg-[#050508] border border-white/5 rounded-l-2xl p-6 flex flex-col items-start gap-2 shadow-2xl">
                        <span className="text-[8px] font-black uppercase text-cyan-500/30 tracking-[0.3em]">Video Flux</span>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Offline</span>
                    </div>
                    <div className="bg-[#050508] border-y border-white/5 p-6 flex flex-col items-start gap-2 shadow-2xl">
                        <span className="text-[8px] font-black uppercase text-cyan-500/30 tracking-[0.3em]">Security</span>
                        <span className="text-xs font-black text-cyan-400 uppercase tracking-widest animate-pulse">Maximum</span>
                    </div>
                    <div className="bg-[#050508] border border-white/5 rounded-r-2xl p-6 flex flex-col items-start gap-2 shadow-2xl">
                        <span className="text-[8px] font-black uppercase text-cyan-500/30 tracking-[0.3em]">Vitals</span>
                        <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Nominal</span>
                    </div>
                </div>
            </div>

            {/* Aesthetic Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
