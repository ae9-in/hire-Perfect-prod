'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CameraManager } from '@/lib/cameraManager';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

type CameraStatus = 'idle' | 'requesting' | 'ready' | 'error';

interface AssessmentStartData {
    title?: string;
    duration?: number;
    selectedLevel?: 'beginner' | 'intermediate' | 'advanced';
    attemptId: string;
}

export default function PreAssessmentPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const assessmentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const selectedLevel = searchParams.get('level');

    const isMountedRef = useRef(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState<AssessmentStartData | null>(null);
    const [consent, setConsent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
    const [cameraError, setCameraError] = useState<string | null>(null);

    const attachVideo = useCallback(async (stream: MediaStream) => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        try {
            await videoRef.current.play();
        } catch (playError) {
            const name = playError instanceof DOMException ? playError.name : '';
            if (name === 'AbortError') {
                await new Promise((resolve) => setTimeout(resolve, 80));
                if (isMountedRef.current && videoRef.current) {
                    await videoRef.current.play().catch(() => undefined);
                }
            } else {
                throw playError;
            }
        }
    }, []);

    const loadAssessment = useCallback(async () => {
        if (!assessmentId) {
            setError('Invalid assessment id.');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/assessments/${assessmentId}/start`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level: selectedLevel || undefined,
                }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Failed to initialize assessment.');
                return;
            }

            setAssessment({ ...data.assessment, attemptId: data.attempt.id });
        } catch (fetchError) {
            console.error('Pre-assessment load error:', fetchError);
            setError('System error while creating attempt.');
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, [assessmentId, selectedLevel]);

    const initCamera = useCallback(async () => {
        setCameraError(null);
        setCameraStatus('requesting');

        try {
            let stream = CameraManager.getStream();
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640, max: 960 },
                        height: { ideal: 480, max: 540 },
                        frameRate: { ideal: 15, max: 24 },
                    },
                    audio: false,
                });
                CameraManager.setStream(stream);
            }

            if (!isMountedRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }

            await attachVideo(stream);
            setCameraStatus('ready');
        } catch (cameraInitError) {
            console.error('Camera access error:', cameraInitError);
            setCameraError('Unable to access your camera. Please allow camera permission.');
            setCameraStatus('error');
        }
    }, [attachVideo]);

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        isMountedRef.current = true;
        void loadAssessment();

        return () => {
            isMountedRef.current = false;
        };
    }, [loadAssessment]);

    const handleStart = () => {
        if (!assessment?.attemptId) return;
        router.push(`/exam/${assessment.attemptId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020205] bg-grid text-cyan-50 grid place-items-center">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400/70">Preparing Pre-Assessment...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020205] bg-grid selection:bg-cyan-500/30 selection:text-white text-cyan-50/90 overflow-hidden relative">
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-1/4 right-[8%] w-[32%] h-[32%] bg-cyan-500/5 blur-[160px] rounded-full animate-float"></div>
                <div className="absolute bottom-1/4 left-[8%] w-[28%] h-[28%] bg-purple-600/5 blur-[160px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>
            </div>

            <main className="container mx-auto px-6 py-20 lg:py-28 page-container">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
                    <section className="glass rounded-[2rem] border-white/10 p-6 bg-black/60">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 mb-4">Camera Calibration</p>
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                            <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video object-cover" />
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-4 left-4 w-10 h-10 border-t border-l border-cyan-500/40"></div>
                                <div className="absolute top-4 right-4 w-10 h-10 border-t border-r border-cyan-500/40"></div>
                                <div className="absolute bottom-4 left-4 w-10 h-10 border-b border-l border-cyan-500/40"></div>
                                <div className="absolute bottom-4 right-4 w-10 h-10 border-b border-r border-cyan-500/40"></div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${cameraStatus === 'ready' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                Camera: {cameraStatus}
                            </span>
                            <button
                                onClick={() => void initCamera()}
                                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-black uppercase tracking-[0.2em]"
                            >
                                {cameraStatus === 'ready' ? 'Recheck Camera' : 'Enable Camera'}
                            </button>
                        </div>

                        {cameraError && <p className="mt-3 text-sm text-rose-300">{cameraError}</p>}
                    </section>

                    <section className="glass rounded-[2rem] border-white/10 p-8 bg-black/60">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 mb-5">Assessment Authorization</p>
                        <h1 className="text-4xl font-black tracking-tight uppercase text-white leading-tight mb-3">
                            {assessment?.title || 'Assessment Session'}
                        </h1>
                        <p className="text-sm text-slate-400 mb-8">
                            Duration: <span className="text-cyan-300 font-bold">{assessment?.duration || 0} minutes</span>
                        </p>
                        <p className="text-sm text-slate-400 mb-8">
                            Level: <span className="text-cyan-300 font-bold uppercase">{assessment?.selectedLevel || 'intermediate'}</span>
                        </p>

                        <div className="space-y-3 text-xs text-cyan-100/80 mb-8">
                            <p>1. Keep your face visible during the entire assessment.</p>
                            <p>2. Avoid tab switching and screen minimizing.</p>
                            <p>3. Multiple faces can auto-flag the session.</p>
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-6">
                            <input
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="mt-1 h-4 w-4 accent-cyan-500"
                            />
                            <span className="text-sm text-slate-300">
                                I agree to proceed with camera-enabled monitoring for this assessment.
                            </span>
                        </label>

                        {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}

                        <button
                            disabled={cameraStatus !== 'ready' || !consent || !!error}
                            onClick={handleStart}
                            className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black px-6 py-4 text-xs font-black uppercase tracking-[0.3em] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Start Assessment
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
}
