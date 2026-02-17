'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';
import { EXAM_CONFIG, VIOLATION_TYPES } from '@/lib/constants';
import { CameraManager } from '@/lib/cameraManager';
import CriticalError from '@/components/ui/CriticalError';

interface ExamPageProps {
    params: Promise<{ attemptId: string }>;
}

export default function ExamPage({ params: paramsPromise }: ExamPageProps) {
    const params = React.use(paramsPromise);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [violations, setViolations] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isMounted = useRef(true);
    const [proctoringActive, setProctoringActive] = useState(false);
    const [isHalted, setIsHalted] = useState(false);
    const [haltReason, setHaltReason] = useState('');

    const [faceLandmarker, setFaceLandmarker] = useState<any>(null);
    const faceLandmarkerRef = useRef<any>(null);
    const lastVideoTimeRef = useRef(-1);
    const requestRef = useRef<number | null>(null);
    const lastViolationLogRef = useRef<Record<string, number>>({});
    const isInitializing = useRef(false);
    const loadingRef = useRef(loading);
    const violationsRef = useRef(violations);
    const lastNosePosRef = useRef<{ x: number, y: number } | null>(null);
    const lastMovementLoggedRef = useRef<number>(0);

    // Sync refs with state
    useEffect(() => { loadingRef.current = loading; }, [loading]);
    useEffect(() => { violationsRef.current = violations; }, [violations]);

    const throttlingLogViolation = async (type: string, description: string, severity = 'high') => {
        const now = Date.now();
        const lastLog = lastViolationLogRef.current[type] || 0;

        // Cooldown: 3 seconds (tuned for responsiveness)
        if (now - lastLog < 3000 && (type === VIOLATION_TYPES.LOOKING_AWAY || type === VIOLATION_TYPES.FACE_NOT_DETECTED || type === VIOLATION_TYPES.MULTIPLE_FACES)) {
            return;
        }

        lastViolationLogRef.current[type] = now;
        await logViolation(type, description, severity);
    };

    useEffect(() => {
        isMounted.current = true;
        enterFullscreen();
        loadExam();

        const handleBlur = () => {
            logViolation(VIOLATION_TYPES.TAB_SWITCH, 'Session focus blurred (Possible window switch).', 'critical');
            setHaltReason('FOCUS LOST: UNAUTHORIZED WINDOW SWITCHING DETECTED. SESSION TERMINATED.');
            setIsHalted(true);
            stopProctoring();
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const token = localStorage.getItem('token');
            const url = '/api/violations/log';
            const data = JSON.stringify({
                attemptId: params.attemptId,
                type: VIOLATION_TYPES.SESSION_EXIT,
                severity: 'critical',
                description: 'User attempted to navigate away or close the terminal.'
            });

            if (token) {
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !loadingRef.current) {
                logViolation(VIOLATION_TYPES.FULLSCREEN_EXIT, 'Strict Fullscreen Protocol Breach. Session Terminated.', 'critical');
                setHaltReason('STRICT FULLSCREEN PROTOCOL BREACH. SESSION TERMINATED. HARDWARE ACCESS REVOKED.');
                setIsHalted(true);
                stopProctoring();
            }
        };

        const handleResize = () => {
            if (!loading && (window.innerWidth < 1000 || window.innerHeight < 600)) {
                throttlingLogViolation(VIOLATION_TYPES.SCREEN_MINIMIZE, 'Terminal dimensions below operational threshold. Possible window resize/minimize breach.');
            }
        };

        const handleSecurityViolation = (e: ClipboardEvent) => {
            e.preventDefault();
            const type = e.type === 'cut' ? VIOLATION_TYPES.CONTENT_CUT : VIOLATION_TYPES.COPY_PASTE;
            logViolation(type, `Unauthorized ${e.type} operation detected.`, 'high');
            showWarningModal(`Security Breach: Unauthorized ${e.type} detected.`);
        };

        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('keydown', preventKeyboardShortcuts);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('copy', handleSecurityViolation);
        document.addEventListener('paste', handleSecurityViolation);
        document.addEventListener('cut', handleSecurityViolation);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('resize', handleResize);

        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('keydown', preventKeyboardShortcuts);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('copy', handleSecurityViolation);
            document.removeEventListener('paste', handleSecurityViolation);
            document.removeEventListener('cut', handleSecurityViolation);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('resize', handleResize);
            isMounted.current = false;
            stopProctoring();
            if (faceLandmarkerRef.current) {
                faceLandmarkerRef.current.close();
                faceLandmarkerRef.current = null;
            }
        };
    }, []);

    // Initialize proctoring only after exam is loaded and videoRef is available
    useEffect(() => {
        if (!loading && isMounted.current) {
            initProctoring();
        }
    }, [loading]);

    useEffect(() => {
        if (timeLeft <= 0 && !loading) {
            handleSubmit(true);
            return;
        }
        const timer = setInterval(() => {
            if (!loading && !isHalted) setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading, isHalted]);

    const loadExam = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/attempts/${params.attemptId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setQuestions(data.questions);
                setTimeLeft(data.attempt.timeLeft);
                if (data.attempt.status !== 'in_progress') {
                    setHaltReason('PROTOCOL VIOLATION: ASSESSMENT SESSION FOR THIS IDENTITY IS ALREADY COMPLETED. ACCESS PERMANENTLY REVOKED.');
                    setIsHalted(true);
                    setLoading(false);
                    return;
                }
            } else {
                router.push('/dashboard');
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to load exam:', error);
            setLoading(false);
        }
    };

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => { });
        }
    };

    const initProctoring = async () => {
        if (isInitializing.current || streamRef.current) return;
        isInitializing.current = true;

        try {
            const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 2
            });

            if (!isMounted.current) {
                landmarker.close();
                return;
            }
            faceLandmarkerRef.current = landmarker;
            setFaceLandmarker(landmarker);

            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });

            if (!isMounted.current) {
                stream.getTracks().forEach(track => track.stop());
                landmarker.close();
                return;
            }

            streamRef.current = stream;
            CameraManager.register(stream, landmarker);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.error("Video secondary play error:", e));
                videoRef.current.onloadedmetadata = () => {
                    if (isMounted.current) {
                        setProctoringActive(true);
                        requestRef.current = requestAnimationFrame(detectFrame);
                    }
                };
            }
        } catch (error) {
            console.error('Proctoring init error:', error);
        } finally {
            isInitializing.current = false;
        }
    };

    const detectFrame = async () => {
        if (!videoRef.current || !faceLandmarker || !proctoringActive) return;

        if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = videoRef.current.currentTime;
            const result = faceLandmarker.detectForVideo(videoRef.current, performance.now());

            if (result.faceLandmarks) {
                if (result.faceLandmarks.length > 1) {
                    throttlingLogViolation(VIOLATION_TYPES.MULTIPLE_FACES, 'Multiple operative presence detected.');
                }
                if (result.faceLandmarks.length === 0) {
                    setHaltReason('Optical sensor data lost. Please ensure your face is clearly visible.');
                    setIsHalted(true);
                    throttlingLogViolation(VIOLATION_TYPES.FACE_NOT_DETECTED, 'Operative facial scan lost.');
                } else {
                    if (result.faceLandmarks[0]) {
                        const nose = result.faceLandmarks[0][1];
                        if (lastNosePosRef.current && nose) {
                            const dist = Math.sqrt(
                                Math.pow(nose.x - lastNosePosRef.current.x, 2) +
                                Math.pow(nose.y - lastNosePosRef.current.y, 2)
                            );

                            // Sudden movement threshold: 0.15 (empirical tuning)
                            const now = Date.now();
                            if (dist > 0.15 && now - lastMovementLoggedRef.current > 5000) {
                                throttlingLogViolation(VIOLATION_TYPES.SUDDEN_MOVEMENT as any, 'Uncontrolled sudden movement detected.');
                                showWarningModal('Protocol Alert: Sudden movement detected. Maintain focus.');
                                lastMovementLoggedRef.current = now;
                            }
                        }
                        if (nose) lastNosePosRef.current = { x: nose.x, y: nose.y };

                        const headRotation = calculateHeadRotation(result.faceLandmarks[0]);
                        if (Math.abs(headRotation.y) > 0.35) {
                            throttlingLogViolation(VIOLATION_TYPES.LOOKING_AWAY, 'Gaze deviation detected.');
                        }
                    }
                }
            }
        }

        if (proctoringActive) {
            requestRef.current = requestAnimationFrame(detectFrame);
        }
    };

    const calculateHeadRotation = (landmarks: any) => {
        const nose = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        if (!nose || !leftEye || !rightEye) return { x: 0, y: 0 };
        const centerX = (leftEye.x + rightEye.x) / 2;
        const headYaw = (nose.x - centerX) / (rightEye.x - leftEye.x);
        return { y: headYaw, x: 0 };
    };

    const stopProctoring = () => {
        CameraManager.stopAll();
        setProctoringActive(false);
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
                track.stop();
                track.enabled = false;
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
            videoRef.current.load(); // Force clearing the buffer
        }
    };

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleVisibilityChange = () => {
        if (document.hidden) {
            logViolation(VIOLATION_TYPES.TAB_SWITCH, 'Session focus lost (Tab switch detected).', 'critical');
            setHaltReason('TAB SWITCH: UNAUTHORIZED BACKGROUND NAVIGATION. SESSION TERMINATED.');
            setIsHalted(true);
            stopProctoring();
        }
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (key === 'f12' || (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'c' || key === 'j')) || (e.ctrlKey && key === 'u')) {
            e.preventDefault();
            logViolation(VIOLATION_TYPES.TAB_SWITCH, 'Attempted terminal inspection (DevTools).');
        }
        if (e.ctrlKey && (key === 'c' || key === 'v' || key === 'x')) {
            e.preventDefault();
            const type = key === 'x' ? VIOLATION_TYPES.CONTENT_CUT : VIOLATION_TYPES.COPY_PASTE;
            logViolation(type, `Keyboard shortcut Ctrl+${key.toUpperCase()} blocked.`, 'high');
            showWarningModal(`Security Breach: Unauthorized Ctrl+${key.toUpperCase()} detected.`);
        }
    };

    const logViolation = async (type: string, description: string, severity = 'high') => {
        // Atomic UI update and Ref sync
        const newViolCount = violationsRef.current + 1;
        setViolations(prev => prev + 1);
        violationsRef.current = newViolCount;

        if (newViolCount >= EXAM_CONFIG.MAX_VIOLATIONS) {
            setHaltReason(`CRITICAL PROTOCOL LIMIT REACHED (${newViolCount}/${EXAM_CONFIG.MAX_VIOLATIONS} VIOLATIONS). ACCESS REVOKED.`);
            setIsHalted(true);
            stopProctoring();
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/violations/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ attemptId: params.attemptId, type, description, severity }),
            });

            const data = await res.json();
            if (data.success) {
                setViolations(data.violationCount || 0);
            }

            if (data.terminated) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Failed to log violation:', error);
        }
    };

    const showWarningModal = (message: string) => {
        setWarningMessage(message);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
    };

    const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers({ ...answers, [questionId]: answer });
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const answersArray = Object.entries(answers).map(([question, answer]) => ({ question, answer }));
            const res = await fetch(`/api/assessments/${params.attemptId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ attemptId: params.attemptId, answers: answersArray, status: 'completed' }),
            });
            const data = await res.json();
            if (data.success) {
                stopProctoring();
                router.push(`/results/${params.attemptId}`);
            }
        } catch (error) {
            console.error('Failed to submit exam:', error);
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Initializing Terminal Sessions..." />;

    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    if (isHalted) {
        return <CriticalError message={haltReason} />;
    }

    return (
        <div className="min-h-screen bg-[#020205] bg-grid selection:bg-cyan-500/30 selection:text-white overflow-hidden text-cyan-50/80 font-sans cursor-default no-select">
            {/* Warning Overlay */}
            <Modal isOpen={showWarning} onClose={() => setShowWarning(false)}>
                <div className="text-center p-8">
                    <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
                        <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-black text-cyan-50 uppercase tracking-tighter mb-2">Protocol Violation</h3>
                    <p className="text-rose-400 font-bold text-sm uppercase tracking-widest mb-6">{warningMessage}</p>
                    <div className="flex justify-center space-x-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-1.5 w-8 rounded-full ${i < violations ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-900'}`}></div>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Terminal Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 bg-black/90">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)]">
                            <span className="text-black font-black">H</span>
                        </div>
                        <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                        <div className="hidden md:block">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/30 mb-0.5">Deployment Tracking</p>
                            <p className="text-xs font-bold text-cyan-50 uppercase tracking-widest">Sector: {questions[0]?.category?.name || 'General'}</p>
                        </div>
                    </div>

                    <div className="flex items-center md:space-x-12">
                        <div className="flex flex-col items-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/30 mb-1">Time Remaining</p>
                            <span className={`text-2xl font-black tabular-nums transition-colors ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-cyan-50'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                        <div className="hidden md:flex flex-col items-end">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/30 mb-1">Progress Metric</p>
                            <div className="flex items-center space-x-3">
                                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 transition-all duration-500 shadow-[0_0_15px_#00f2ff]" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="text-xs font-black text-cyan-400">{currentQuestion + 1}/{questions.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* AI Proctor HUD */}
            <aside className="fixed top-24 right-8 z-40 w-64 flex flex-col gap-4">
                <div className="glass rounded-2xl border-white/[0.05] p-1 overflow-hidden relative group bg-black shadow-2xl">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-[4/3] object-cover rounded-[14px] opacity-100 transition-opacity" />
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 flex items-center space-x-1.5">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>
                            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/20">Active Trace</span>
                        </div>
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-cyan-500/30 m-4"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-cyan-500/30 m-4"></div>
                    </div>
                </div>

                <div className="glass rounded-2xl border-white/[0.05] p-5 space-y-4 bg-black/60">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-cyan-500/40 tracking-[0.2em]">Neural Flux</span>
                        <span className="text-[9px] font-black uppercase text-cyan-400 tracking-widest">Stable_</span>
                    </div>
                    <div className="h-10 w-full flex items-end gap-1 px-1">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="flex-1 bg-cyan-500/20 rounded-t-[1px] group-hover:bg-cyan-500/40 transition-all duration-700" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-white/[0.05]">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase text-cyan-500/40 tracking-[0.2em]">Integrity Check</span>
                            <span className={`text-[9px] font-black uppercase ${violations >= 3 ? 'text-rose-500' : 'text-cyan-400'}`}>{violations}/5 Faults</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Question Terminal */}
            <main className="pt-24 pb-20 px-6 flex justify-center items-center min-h-[calc(100vh-160px)] page-container">
                <div className="w-full max-w-4xl relative">
                    <div className="relative group overflow-visible">
                        {/* Decorative background glow */}
                        <div className="absolute -inset-10 bg-cyan-500/[0.07] blur-[100px] rounded-[3rem] pointer-events-none group-hover:bg-cyan-500/[0.12] transition-all duration-1000"></div>

                        <div className="bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/[0.08] p-10 md:p-12 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                            {/* Inner Accent Line */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>

                            <div className="mb-14 relative z-10">
                                <div className="flex items-center space-x-4 mb-8">
                                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">Objective {currentQuestion + 1}</span>
                                    <div className="h-px w-12 bg-cyan-500/20"></div>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-black text-cyan-50 leading-[1.1] tracking-tighter uppercase mb-6">
                                    {currentQ?.question}
                                </h2>
                                {currentQ?.description && (
                                    <div className="relative group/desc">
                                        <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500/50 via-cyan-500/10 to-transparent"></div>
                                        <p className="text-cyan-200/60 font-medium leading-relaxed max-w-2xl pl-2 mb-6 text-base">
                                            {currentQ?.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Options Lattice */}
                            <div className="grid gap-4 relative z-10">
                                {currentQ?.options?.map((option: string, idx: number) => {
                                    const isSelected = answers[currentQ._id] === idx;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerChange(currentQ._id, idx)}
                                            className={`relative group/opt flex items-center text-left p-6 rounded-2xl border transition-all duration-500 ${isSelected ? 'bg-cyan-500/5 border-cyan-500/40 shadow-[0_0_30px_rgba(0,242,255,0.1)]' : 'bg-white/[0.02] border-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all duration-700 ${isSelected ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.4)]' : 'border-white/10 group-hover/opt:border-white/30'}`}>
                                                <span className={`text-[10px] font-black ${isSelected ? 'text-black' : 'text-white/40'}`}>{String.fromCharCode(65 + idx)}</span>
                                            </div>
                                            <span className={`ml-6 text-base font-bold tracking-tight transition-colors duration-500 ${isSelected ? 'text-cyan-50' : 'text-cyan-900/60 group-hover/opt:text-cyan-200/80'}`}>{option}</span>

                                            {isSelected && (
                                                <div className="absolute right-8">
                                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_#00f2ff]"></div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Command Footer */}
            <footer className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 bg-black/90">
                <div className="container mx-auto px-6 h-24 flex items-center justify-between">
                    <Button
                        variant="outline"
                        className="border-white/5 text-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 px-8 py-4 text-[10px] uppercase font-black tracking-[0.3em] transition-all disabled:opacity-0 bg-transparent"
                        disabled={currentQuestion === 0}
                        onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                    >
                        / Backtrack
                    </Button>

                    <div className="flex items-center space-x-6">
                        <div className="hidden sm:flex space-x-1.5">
                            {questions.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1 h-3 rounded-full transition-all duration-500 ${i === currentQuestion ? 'bg-cyan-400 h-8 shadow-[0_0_10px_#00f2ff]' : answers[questions[i]?._id] !== undefined ? 'bg-cyan-900' : 'bg-white/5'}`}
                                ></div>
                            ))}
                        </div>
                        <Button
                            variant="danger"
                            className="bg-rose-600/10 text-rose-500 border border-rose-500/30 hover:bg-rose-600 hover:text-white px-8 py-4 text-[10px] uppercase font-black tracking-[0.2em] shadow-xl shadow-rose-950/20"
                            onClick={() => handleSubmit(false)}
                            loading={isSubmitting}
                        >
                            Finalize Session
                        </Button>
                    </div>

                    <Button
                        variant="primary"
                        className="bg-cyan-600 hover:bg-cyan-500 text-black px-12 py-4 text-[10px] uppercase font-black tracking-[0.3em] shadow-[0_0_40px_rgba(0,242,255,0.2)] disabled:opacity-0 rounded-xl"
                        disabled={currentQuestion === questions.length - 1}
                        onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                    >
                        Proceed Next /
                    </Button>
                </div>
            </footer>
        </div>
    );
}
