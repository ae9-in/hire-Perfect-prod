'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CameraManager } from '@/lib/cameraManager';
import { EXAM_CONFIG, VIOLATION_TYPES } from '@/lib/constants';

interface ExamQuestion {
    _id: string;
    question: string;
    options: string[];
}

type CameraStatus = 'idle' | 'requesting' | 'ready' | 'error';

interface WarningState {
    show: boolean;
    message: string;
}

interface FaceLandmarkerInstance {
    detectForVideo: (video: HTMLVideoElement, timestampMs: number) => { faceLandmarks?: Array<Array<{ x: number; y: number }>> };
    close?: () => void;
}

export default function ExamPage() {
    const params = useParams<{ attemptId: string }>();
    const router = useRouter();
    const attemptId = Array.isArray(params?.attemptId) ? params.attemptId[0] : params?.attemptId;

    const isMountedRef = useRef(true);
    const originalConsoleErrorRef = useRef<typeof console.error | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const faceLandmarkerRef = useRef<FaceLandmarkerInstance | null>(null);
    const isProctoringActiveRef = useRef(false);
    const isInitializingProctoringRef = useRef(false);
    const animationRef = useRef<number | null>(null);
    const lastVideoTimeRef = useRef(-1);
    const violationCooldownRef = useRef<Record<string, number>>({});
    const previousNoseRef = useRef<{ x: number; y: number } | null>(null);
    const isDetectingRef = useRef(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [terminated, setTerminated] = useState(false);

    const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [proctoringReady, setProctoringReady] = useState(false);
    const [violationCount, setViolationCount] = useState(0);
    const [warning, setWarning] = useState<WarningState>({ show: false, message: '' });

    const activeQuestion = questions[currentQuestion];
    const progress = useMemo(() => (
        questions.length ? ((currentQuestion + 1) / questions.length) * 100 : 0
    ), [currentQuestion, questions.length]);

    const showWarning = useCallback((message: string) => {
        setWarning({ show: true, message });
        window.setTimeout(() => {
            if (isMountedRef.current) {
                setWarning({ show: false, message: '' });
            }
        }, 2500);
    }, []);

    const cleanupProctoring = useCallback(() => {
        isProctoringActiveRef.current = false;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        faceLandmarkerRef.current = null;
        setProctoringReady(false);
        previousNoseRef.current = null;
        isInitializingProctoringRef.current = false;
    }, []);

    const installConsoleFilter = useCallback(() => {
        if (originalConsoleErrorRef.current) return;

        originalConsoleErrorRef.current = console.error;
        console.error = (...args: unknown[]) => {
            const combined = args.map((arg) => String(arg)).join(' ');
            if (combined.includes('Created TensorFlow Lite XNNPACK delegate for CPU')) {
                return;
            }
            originalConsoleErrorRef.current?.(...args);
        };
    }, []);

    const removeConsoleFilter = useCallback(() => {
        if (!originalConsoleErrorRef.current) return;
        console.error = originalConsoleErrorRef.current;
        originalConsoleErrorRef.current = null;
    }, []);

    const logViolation = useCallback(async (
        type: string,
        description: string,
        severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
    ) => {
        const now = Date.now();
        const last = violationCooldownRef.current[type] || 0;
        if (now - last < 3500) return;
        violationCooldownRef.current[type] = now;

        const currentCount = violationCount + 1;
        setViolationCount(currentCount);
        showWarning(description);

        if (currentCount >= EXAM_CONFIG.MAX_VIOLATIONS) {
            setTerminated(true);
            cleanupProctoring();
            CameraManager.stop();
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/violations/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    attemptId,
                    type,
                    severity,
                    description,
                }),
            });
            const data = await res.json();

            if (typeof data.violationCount === 'number') {
                setViolationCount(data.violationCount);
            }

            if (data.terminated) {
                setTerminated(true);
                cleanupProctoring();
                CameraManager.stop();
            }
        } catch (logError) {
            console.error('Failed to log violation:', logError);
        }
    }, [attemptId, cleanupProctoring, showWarning, violationCount]);

    const detectFrame = useCallback(async () => {
        if (!isMountedRef.current || !isProctoringActiveRef.current || !faceLandmarkerRef.current || !videoRef.current) return;
        if (isDetectingRef.current) {
            animationRef.current = requestAnimationFrame(() => { void detectFrame(); });
            return;
        }

        isDetectingRef.current = true;
        try {
            const video = videoRef.current;
            if (video.readyState < 2) {
                animationRef.current = requestAnimationFrame(() => { void detectFrame(); });
                return;
            }
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                animationRef.current = requestAnimationFrame(() => { void detectFrame(); });
                return;
            }

            if (video.currentTime === lastVideoTimeRef.current) {
                animationRef.current = requestAnimationFrame(() => { void detectFrame(); });
                return;
            }
            lastVideoTimeRef.current = video.currentTime;

            const landmarker = faceLandmarkerRef.current;
            if (!landmarker) return;
            let result: { faceLandmarks?: Array<Array<{ x: number; y: number }>> } | null = null;

            try {
                result = landmarker.detectForVideo(video, performance.now());
            } catch (detectError) {
                const detectMessage = detectError instanceof Error ? detectError.message.toLowerCase() : String(detectError).toLowerCase();
                const transientDetectError =
                    detectMessage.includes('xnnpack') ||
                    detectMessage.includes('delegate') ||
                    detectMessage.includes('not ready');

                if (!transientDetectError) {
                    throw detectError;
                }
            }

            if (!result) {
                animationRef.current = requestAnimationFrame(() => { void detectFrame(); });
                return;
            }
            const faces = result.faceLandmarks || [];

            if (faces.length === 0) {
                await logViolation(VIOLATION_TYPES.FACE_NOT_DETECTED, 'Face not detected in camera frame.');
            } else if (faces.length > 1) {
                await logViolation(VIOLATION_TYPES.MULTIPLE_FACES, 'Multiple faces detected.');
            } else {
                const landmarks = faces[0];
                const nose = landmarks?.[1];
                const leftEye = landmarks?.[33];
                const rightEye = landmarks?.[263];

                if (nose && leftEye && rightEye) {
                    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
                    const eyeDistance = Math.max(Math.abs(rightEye.x - leftEye.x), 0.0001);
                    const yaw = (nose.x - eyeCenterX) / eyeDistance;

                    // Eye direction + head yaw approximation
                    if (Math.abs(yaw) > 0.35) {
                        await logViolation(
                            VIOLATION_TYPES.LOOKING_AWAY,
                            'Please look at the screen and keep your head centered.'
                        );
                    }

                    // Sudden head movement approximation via nose displacement
                    const previousNose = previousNoseRef.current;
                    if (previousNose) {
                        const dx = Math.abs(nose.x - previousNose.x);
                        const dy = Math.abs(nose.y - previousNose.y);
                        if (dx > 0.09 || dy > 0.09) {
                            await logViolation(
                                VIOLATION_TYPES.LOOKING_AWAY,
                                'Excessive head movement detected. Keep stable posture.'
                            );
                        }
                    }
                    previousNoseRef.current = { x: nose.x, y: nose.y };
                }
            }
        } catch (detectionError) {
            const message = detectionError instanceof Error ? detectionError.message : String(detectionError);
            const benignShutdown =
                message.toLowerCase().includes('closed') ||
                message.toLowerCase().includes('disposed') ||
                message.toLowerCase().includes('not initialized') ||
                message.toLowerCase().includes('xnnpack delegate') ||
                !isProctoringActiveRef.current;

            if (!benignShutdown) {
                console.warn('Detection loop warning:', detectionError);
            }
        } finally {
            isDetectingRef.current = false;
            if (isMountedRef.current && !terminated && isProctoringActiveRef.current) {
                animationRef.current = requestAnimationFrame(() => { void detectFrame(); });
            }
        }
    }, [logViolation, terminated]);

    const initializeProctoring = useCallback(async () => {
        if (isInitializingProctoringRef.current || faceLandmarkerRef.current) return;
        isInitializingProctoringRef.current = true;
        try {
            const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
            const resolver = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm'
            );
            const modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

            let landmarker: FaceLandmarkerInstance | null = null;
            try {
                landmarker = await FaceLandmarker.createFromOptions(resolver, {
                    baseOptions: {
                        modelAssetPath,
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 2,
                    outputFaceBlendshapes: false,
                });
            } catch (gpuError) {
                console.warn('GPU delegate unavailable, falling back to CPU delegate.', gpuError);
                landmarker = await FaceLandmarker.createFromOptions(resolver, {
                    baseOptions: {
                        modelAssetPath,
                        delegate: 'CPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 2,
                    outputFaceBlendshapes: false,
                });
            }

            if (!isMountedRef.current) {
                isInitializingProctoringRef.current = false;
                return;
            }

            faceLandmarkerRef.current = landmarker;
            isProctoringActiveRef.current = true;
            setProctoringReady(true);
            if (!animationRef.current) {
                animationRef.current = requestAnimationFrame(() => { void detectFrame(); });
            }
        } catch (setupError) {
            console.error('Failed to initialize MediaPipe:', setupError);
            setCameraError('Camera is active but face detection engine failed to load.');
        } finally {
            isInitializingProctoringRef.current = false;
        }
    }, [detectFrame]);

    const initCamera = useCallback(async () => {
        setCameraError(null);
        setCameraStatus('requesting');

        try {
            let stream = CameraManager.getStream();
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                    audio: false,
                });
                CameraManager.setStream(stream);
            }

            if (!isMountedRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                try {
                    await videoRef.current.play();
                } catch (playError) {
                    const name = playError instanceof DOMException ? playError.name : '';
                    if (name === 'AbortError') {
                        // Benign race during rapid mount/unmount transitions in dev.
                        await new Promise((resolve) => setTimeout(resolve, 80));
                        if (isMountedRef.current && videoRef.current) {
                            await videoRef.current.play().catch(() => undefined);
                        }
                    } else {
                        throw playError;
                    }
                }
            }

            setCameraStatus('ready');
            await initializeProctoring();
        } catch (cameraInitError) {
            console.error('Camera initialization failed:', cameraInitError);
            setCameraStatus('error');
            setCameraError('Unable to access your camera. Please allow permissions and retry.');
        }
    }, [initializeProctoring]);

    const loadExam = useCallback(async () => {
        if (!attemptId) {
            setError('Invalid assessment attempt id.');
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/attempts/${attemptId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Failed to load assessment attempt.');
                return;
            }

            if (data.attempt?.status !== 'in_progress') {
                setError('This assessment session is not active.');
                return;
            }

            setQuestions(data.questions || []);
            setTimeLeft(data.attempt?.timeLeft || 0);
            setViolationCount(data.attempt?.violationCount || 0);
        } catch (fetchError) {
            console.error('Failed to load exam:', fetchError);
            setError('Unable to load assessment. Please try again.');
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, [attemptId]);

    const submitAssessment = useCallback(async (autoSubmit = false) => {
        if (isSubmitting || !attemptId) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const answersArray = Object.entries(answers).map(([question, answer]) => ({
                question,
                answer,
            }));

            const res = await fetch(`/api/assessments/${attemptId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    attemptId,
                    answers: answersArray,
                    status: autoSubmit ? 'completed' : 'completed',
                }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Failed to submit assessment.');
                setIsSubmitting(false);
                return;
            }

            cleanupProctoring();
            CameraManager.stop();
            router.push(`/results/${attemptId}`);
        } catch (submitError) {
            console.error('Failed to submit assessment:', submitError);
            setError('Submission failed. Please retry.');
            setIsSubmitting(false);
        }
    }, [answers, attemptId, cleanupProctoring, isSubmitting, router]);

    const enterFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (fullscreenError) {
            console.warn('Fullscreen request failed:', fullscreenError);
            showWarning('Please allow fullscreen mode for this assessment.');
        }
    }, [showWarning]);

    useEffect(() => {
        isMountedRef.current = true;
        installConsoleFilter();
        void loadExam();
        void initCamera();
        void enterFullscreen();
        const videoElement = videoRef.current;

        const handleVisibility = () => {
            if (document.hidden) {
                void logViolation(VIOLATION_TYPES.TAB_SWITCH, 'Tab switch detected.', 'critical');
            }
        };

        const handleBlur = () => {
            void logViolation(VIOLATION_TYPES.TAB_SWITCH, 'Window focus lost.', 'critical');
        };

        const handleResize = () => {
            if (window.innerWidth < 1000 || window.innerHeight < 620) {
                void logViolation(VIOLATION_TYPES.SCREEN_MINIMIZE, 'Screen minimize or aggressive resize detected.');
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !loading) {
                showWarning('Fullscreen exit detected. Assessment terminated.');
                setTerminated(true);
                cleanupProctoring();
                CameraManager.stop();
                void logViolation(
                    VIOLATION_TYPES.FULLSCREEN_EXIT,
                    'Fullscreen mode exited during assessment.',
                    'critical'
                );
            }
        };

        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            showWarning('Right-click is disabled during assessment.');
        };

        const handleKeydown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            const isCopyPasteShortcut = (event.ctrlKey || event.metaKey) && (key === 'c' || key === 'v');
            if (!isCopyPasteShortcut) return;

            event.preventDefault();
            showWarning('Copy/Paste is not allowed during assessment.');
        };

        document.addEventListener('visibilitychange', handleVisibility);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeydown);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('resize', handleResize);

        return () => {
            isMountedRef.current = false;
            document.removeEventListener('visibilitychange', handleVisibility);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('resize', handleResize);

            cleanupProctoring();
            if (videoElement) {
                videoElement.pause();
                videoElement.srcObject = null;
            }
            CameraManager.stop();
            removeConsoleFilter();
        };
    }, [cleanupProctoring, enterFullscreen, initCamera, installConsoleFilter, loadExam, loading, logViolation, removeConsoleFilter, showWarning]);

    useEffect(() => {
        if (loading || terminated || isSubmitting) return;
        if (timeLeft <= 0) {
            void submitAssessment(true);
            return;
        }

        const interval = window.setInterval(() => {
            setTimeLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);
        return () => window.clearInterval(interval);
    }, [isSubmitting, loading, submitAssessment, terminated, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: string, answerIndex: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020205] bg-grid text-cyan-50 grid place-items-center">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-400/70">Initializing Assessment Grid...</p>
            </div>
        );
    }

    if (terminated) {
        return (
            <div className="min-h-screen bg-[#020205] bg-grid text-cyan-50 grid place-items-center p-6">
                <div className="glass max-w-2xl rounded-3xl border-rose-500/30 p-10 text-center bg-rose-950/30">
                    <p className="text-[11px] font-black uppercase tracking-[0.35em] text-rose-400 mb-4">Session Terminated</p>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-5">Violation Threshold Reached</h1>
                    <p className="text-sm text-rose-200/80 mb-8">
                        Your assessment was auto-terminated after {EXAM_CONFIG.MAX_VIOLATIONS} violations.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-[0.2em] text-xs"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (error || !activeQuestion) {
        return (
            <div className="min-h-screen bg-[#020205] bg-grid text-cyan-50 grid place-items-center p-6">
                <div className="glass max-w-2xl rounded-3xl p-10 text-center">
                    <p className="text-rose-400 text-sm font-bold uppercase tracking-[0.2em]">{error || 'No questions found for this attempt.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020205] bg-grid selection:bg-cyan-500/30 selection:text-white text-cyan-50/90">
            {warning.show && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] glass border-rose-500/30 bg-rose-950/60 px-6 py-3 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-300">{warning.message}</p>
                </div>
            )}

            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 bg-black/80">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/40">Assessment Mode</p>
                        <p className="text-xs font-black uppercase tracking-widest text-cyan-100">Question {currentQuestion + 1}/{questions.length}</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/40">Time Remaining</p>
                            <p className={`text-2xl font-black ${timeLeft < 300 ? 'text-rose-400 animate-pulse' : 'text-cyan-100'}`}>{formatTime(timeLeft)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/40">Violations</p>
                            <p className={`text-xl font-black ${violationCount >= 3 ? 'text-rose-400' : 'text-cyan-300'}`}>
                                {violationCount}/{EXAM_CONFIG.MAX_VIOLATIONS}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-24 px-6 page-container">
                <div className="container mx-auto grid lg:grid-cols-[1fr_320px] gap-8">
                    <section className="glass rounded-[2rem] border-white/10 p-8 md:p-10 bg-black/50">
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-10">
                            <div className="h-full bg-cyan-500 shadow-[0_0_16px_rgba(0,242,255,0.6)] transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-cyan-50 leading-tight tracking-tight mb-8 uppercase">
                            {activeQuestion.question}
                        </h1>

                        <div className="grid gap-4">
                            {(activeQuestion.options || []).map((option, idx) => {
                                const isSelected = answers[activeQuestion._id] === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerChange(activeQuestion._id, idx)}
                                        className={`text-left rounded-2xl p-5 border transition-all duration-300 ${isSelected
                                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-50 shadow-[0_0_30px_rgba(0,242,255,0.08)]'
                                            : 'bg-white/[0.02] border-white/[0.06] text-cyan-100/80 hover:border-cyan-500/30'
                                            }`}
                                    >
                                        <span className="font-black text-cyan-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-10 flex items-center justify-between">
                            <button
                                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                className="px-6 py-3 rounded-xl border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-cyan-200/70 hover:text-cyan-300 hover:border-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => void submitAssessment(false)}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black uppercase tracking-[0.2em] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                                <button
                                    onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                                    disabled={currentQuestion >= questions.length - 1}
                                    className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-black uppercase tracking-[0.2em] text-black disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="glass rounded-2xl border-white/10 p-4 bg-black/60">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Live Camera</p>
                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${cameraStatus === 'ready' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {cameraStatus}
                                </span>
                            </div>
                            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-[4/3] object-cover" />
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded border border-white/10">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-300">
                                        {proctoringReady ? 'AI Monitor On' : 'AI Monitor Loading'}
                                    </p>
                                </div>
                            </div>
                            {cameraError && (
                                <p className="mt-3 text-[11px] font-semibold text-rose-300">{cameraError}</p>
                            )}
                            {cameraStatus !== 'ready' && (
                                <button
                                    onClick={() => void initCamera()}
                                    className="mt-4 w-full px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-black uppercase tracking-[0.2em]"
                                >
                                    Retry Camera
                                </button>
                            )}
                        </div>

                        <div className="glass rounded-2xl border-white/10 p-4 bg-black/60">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-3">Monitoring Rules</p>
                            <ul className="text-xs text-cyan-100/70 space-y-2 leading-relaxed">
                                <li>Face must remain visible at all times.</li>
                                <li>Looking away and head movement are monitored.</li>
                                <li>Multiple faces trigger violations.</li>
                                <li>Tab switch and screen minimize are violations.</li>
                                <li>Auto-terminate at {EXAM_CONFIG.MAX_VIOLATIONS} violations.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
