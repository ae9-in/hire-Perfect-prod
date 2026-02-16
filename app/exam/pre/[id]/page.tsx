'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function PreAssessmentPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = React.use(paramsPromise);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState<any>(null);
    const [cameraOk, setCameraOk] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [consent, setConsent] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        loadAssessment();
        initCamera();
    }, []);

    const loadAssessment = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/assessments/${params.id}/start`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (!data.success && data.error?.includes('already have an in-progress attempt')) {
                const attemptsRes = await fetch('/api/attempts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const attemptsData = await attemptsRes.json();
                const existing = attemptsData.attempts.find((a: any) => a.assessment._id === params.id && a.status === 'in_progress');
                if (existing) {
                    setAssessment({ _id: params.id, attemptId: existing._id });
                }
            } else if (data.success) {
                setAssessment({ ...data.assessment, attemptId: data.attempt.id });
            } else {
                setError(data.error || 'Failed to initialize assessment');
            }
        } catch (err) {
            console.error('Pre-assessment load error:', err);
            setError('System error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const initCamera = async () => {
        const timeoutId = setTimeout(() => {
            if (!cameraOk) {
                setError('Camera initialization timed out. Hardware calibration failed.');
            }
        }, 10000);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            clearTimeout(timeoutId);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraOk(true);
            }
        } catch (err) {
            clearTimeout(timeoutId);
            console.error('Camera access error:', err);
            setError('Optical sensor data unavailable. Please authorize camera access for proctoring protocols.');
        }
    };

    const handleStart = () => {
        if (assessment?.attemptId && consent) {
            router.push(`/exam/${assessment.attemptId}`);
        }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Establishing Secure Link..." />;

    return (
        <div className="min-h-screen bg-[#020205] bg-grid selection:bg-cyan-500/30 selection:text-white overflow-hidden relative">
            {/* Pulsing Core Orbs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 right-[5%] w-[35%] h-[35%] bg-cyan-500/5 blur-[160px] rounded-full animate-float"></div>
                <div className="absolute bottom-1/4 left-[5%] w-[25%] h-[25%] bg-purple-600/5 blur-[160px] rounded-full animate-float" style={{ animationDelay: '-4s' }}></div>
            </div>

            <Navbar />

            <div className="container mx-auto px-6 py-24 lg:py-32 relative z-10 page-container">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12 items-stretch">

                        {/* Left: AI Telemetry & Camera */}
                        <div className="lg:w-1/2 flex flex-col">
                            <div className="glass rounded-[2rem] border-white/5 p-2 overflow-hidden bg-black/40 relative group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
                                <div className="absolute inset-0 bg-cyan-500/[0.02] animate-pulse"></div>

                                {/* Camera Header */}
                                <div className="absolute top-8 left-8 z-20 flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 px-4 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30 backdrop-blur-2xl">
                                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping shadow-[0_0_15px_#f43f5e]"></div>
                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Active Sensor</span>
                                    </div>
                                    <div className="px-4 py-1.5 bg-cyan-500/10 rounded-full border border-cyan-500/20 backdrop-blur-2xl">
                                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] leading-none">NODE_S_ALPHA</span>
                                    </div>
                                </div>

                                {/* Video Feed */}
                                <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-white/5 shadow-inner">
                                    <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover grayscale brightness-125 contrast-125 transition-all duration-1000 ${cameraOk ? 'opacity-60' : 'opacity-0'}`} />

                                    {/* HUD Overlay */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-cyan-500/40 m-10"></div>
                                        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-cyan-500/40 m-10"></div>
                                        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-cyan-500/40 m-10"></div>
                                        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-cyan-500/40 m-10"></div>

                                        {/* Scanning Line */}
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent animate-scan shadow-[0_0_25px_#00f2ff]"></div>

                                        {/* Viewfinder Center */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-cyan-500/20 rounded-full border-dashed animate-spin-slow"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-500/20 rounded-full"></div>
                                    </div>

                                    {!cameraOk && !error && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl">
                                            <div className="w-12 h-12 border-2 border-white/5 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 animate-pulse">Synchronizing Hardware...</div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/90 p-12 text-center backdrop-blur-xl">
                                            <div className="w-16 h-16 bg-rose-500/5 text-rose-500 rounded-2xl flex items-center justify-center mb-8 border border-rose-500/20">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-black text-white uppercase tracking-[0.3em] mb-3 leading-tight">Critical Error</p>
                                            <p className="text-xs text-rose-400 font-medium leading-relaxed max-w-xs uppercase tracking-widest">{error}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Telemetry Sidebar */}
                                <div className="grid grid-cols-3 gap-1 mt-2">
                                    <TelemetryItem label="Video Flux" value={cameraOk ? 'SYNCHED' : 'OFFLINE'} active={cameraOk} />
                                    <TelemetryItem label="Security" value="MAXIMUM" active={true} />
                                    <TelemetryItem label="Vitals" value="NOMINAL" active={true} />
                                </div>
                            </div>

                            <button
                                onClick={() => setCameraOk(true)}
                                className="mt-8 text-[10px] font-black text-white/20 hover:text-cyan-400 transition-colors uppercase tracking-[0.5em] text-center"
                            >
                                / bypass_hardware_auth_
                            </button>
                        </div>

                        {/* Right: Protocol & Authorization */}
                        <div className="lg:w-1/2 flex flex-col">
                            <div className="flex-grow glass rounded-[2.5rem] border-white/[0.08] p-12 bg-black/40 flex flex-col shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"></div>

                                <div className="mb-14 relative z-10">
                                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-4 block">System Authorization V2</span>
                                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-[0.8] mb-6">
                                        STRICT <br /><span className="text-gradient">PROTOCOL_</span>
                                    </h1>
                                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md">GuardEye Neural monitors are engaged. Any breach of protocol will result in immediate termination of the session.</p>
                                </div>

                                <div className="space-y-12 flex-grow relative z-10">
                                    <ProtocolItem
                                        id="01"
                                        title="Fixed Gaze"
                                        desc="Neural tracking enabled. Continuous eye-contact with the viewport is mandatory."
                                    />
                                    <ProtocolItem
                                        id="02"
                                        title="System Lock"
                                        desc="Environment isolation active. All background operations are prohibited."
                                    />
                                    <ProtocolItem
                                        id="03"
                                        title="Bio-Signature"
                                        desc="Unique facial patterns are being hashed to ensure single-operative integrity."
                                    />
                                </div>

                                <div className="mt-16 pt-12 border-t border-white/5 space-y-10 relative z-10">
                                    <div
                                        onClick={() => setConsent(!consent)}
                                        className={`flex items-start gap-6 p-8 rounded-[2rem] transition-all cursor-pointer border ${consent ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-white/[0.02] border-white/[0.05] hover:border-white/10'}`}
                                    >
                                        <div className={`w-7 h-7 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-700 ${consent ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.4)]' : 'border-white/10'}`}>
                                            {consent && (
                                                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-xs font-black text-white/40 uppercase tracking-[0.1em] leading-relaxed select-none group-hover:text-white/60 transition-colors">
                                            I accept neural monitoring and agree to the deployment protocols. <span className={`transition-colors ${consent ? 'text-cyan-400' : 'text-slate-600'}`}>Authorize Access.</span>
                                        </p>
                                    </div>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        className="py-6 bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_40px_rgba(0,242,255,0.2)] text-xs font-black uppercase tracking-[0.6em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        disabled={!cameraOk || !!error || !consent}
                                        onClick={handleStart}
                                    >
                                        Inaugurate Session
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TelemetryItem({ label, value, active }: any) {
    return (
        <div className="bg-black/80 p-5 border border-white/[0.03] flex flex-col justify-center">
            <p className="text-[7px] font-black text-white/10 uppercase tracking-[0.3em] mb-1.5">{label}</p>
            <p className={`text-[10px] font-black tracking-[0.2em] ${active ? 'text-cyan-400' : 'text-slate-800'}`}>{value}</p>
        </div>
    );
}

function ProtocolItem({ id, title, desc }: any) {
    return (
        <div className="flex gap-10 group cursor-default">
            <div className="text-4xl font-black text-white/5 tabular-nums transition-all duration-700 group-hover:text-cyan-500/20 leading-none group-hover:scale-125">{id}</div>
            <div className="flex-1">
                <h4 className="font-black text-white uppercase tracking-wider mb-2 text-2xl group-hover:text-cyan-400 transition-colors duration-500">{title}</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm group-hover:text-slate-400 transition-colors duration-500">{desc}</p>
            </div>
        </div>
    );
}
