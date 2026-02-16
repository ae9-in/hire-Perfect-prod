'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { EXAM_CONFIG, VIOLATION_TYPES } from '@/lib/constants';

interface ExamPageProps {
    params: { attemptId: string };
}

export default function ExamPage({ params }: ExamPageProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
    const [violations, setViolations] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [proctoringActive, setProctoringActive] = useState(false);

    useEffect(() => {
        // Request fullscreen
        enterFullscreen();

        // Start proctoring
        initProctoring();

        // Load exam data
        loadExam();

        // Prevent right-click
        document.addEventListener('contextmenu', preventContextMenu);

        // Detect tab switch
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Prevent keyboard shortcuts
        document.addEventListener('keydown', preventKeyboardShortcuts);

        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('keydown', preventKeyboardShortcuts);
            stopProctoring();
        };
    }, []);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0) {
            handleSubmit(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const loadExam = async () => {
        try {
            const token = localStorage.getItem('token');
            // In a real implementation, fetch exam data from API
            setLoading(false);
        } catch (error) {
            console.error('Failed to load exam:', error);
        }
    };

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {
                logViolation(VIOLATION_TYPES.FULLSCREEN_EXIT, 'Failed to enter fullscreen');
            });
        }
        setIsFullscreen(true);
    };

    const initProctoring = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setProctoringActive(true);
            }
        } catch (error) {
            showWarningModal('Camera access required for proctoring');
        }
    };

    const stopProctoring = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
        }
    };

    const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    };

    const handleVisibilityChange = () => {
        if (document.hidden) {
            logViolation(VIOLATION_TYPES.TAB_SWITCH, 'Tab switched or window minimized');
            showWarningModal('⚠️ Tab switching detected! This is a violation.');
        }
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
        // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+C, etc.
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'u')
        ) {
            e.preventDefault();
            logViolation(VIOLATION_TYPES.TAB_SWITCH, 'Attempted to open developer tools');
        }
    };

    const logViolation = async (type: string, description: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/violations/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    attemptId: params.attemptId,
                    type,
                    description,
                    severity: 'high',
                }),
            });

            const data = await res.json();
            setViolations(data.violationCount || 0);

            if (data.terminated) {
                alert('Exam terminated due to excessive violations');
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
        try {
            const token = localStorage.getItem('token');
            const answersArray = Object.entries(answers).map(([question, answer]) => ({
                question,
                answer,
            }));

            const res = await fetch(`/api/assessments/${params.attemptId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    attemptId: params.attemptId,
                    answers: answersArray,
                    status: autoSubmit ? 'completed' : 'completed',
                }),
            });

            const data = await res.json();

            if (data.success) {
                stopProctoring();
                router.push(`/results/${params.attemptId}`);
            }
        } catch (error) {
            console.error('Failed to submit exam:', error);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p>Loading exam...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 no-select">
            {/* Warning Modal */}
            <Modal isOpen={showWarning} onClose={() => setShowWarning(false)} size="sm">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-lg font-semibold text-red-600">{warningMessage}</p>
                    <p className="text-sm text-gray-600 mt-2">
                        Violations: {violations}/{EXAM_CONFIG.MAX_VIOLATIONS}
                    </p>
                </div>
            </Modal>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-30 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">H</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Assessment in Progress</h1>
                            <p className="text-sm text-gray-500">
                                Question {currentQuestion + 1} of {questions.length || 15}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Timer */}
                        <div className="flex items-center space-x-2">
                            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className={`text-xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>

                        {/* Violations */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Violations:</span>
                            <span className={`font-bold ${violations >= 3 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                {violations}/{EXAM_CONFIG.MAX_VIOLATIONS}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Proctoring Video */}
            <div className="fixed top-20 right-6 z-40">
                <div className="relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-48 h-36 rounded-lg border-4 border-primary-500 shadow-lg"
                    />
                    <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        ● LIVE
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-28 pb-24 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold mb-6">
                            Sample Question {currentQuestion + 1}
                        </h2>
                        <p className="text-lg mb-6">
                            This is a sample question for the exam interface. In the actual implementation, questions would be loaded from the API.
                        </p>

                        {/* Sample MCQ Options */}
                        <div className="space-y-3">
                            {['Option A', 'Option B', 'Option C', 'Option D'].map((option, idx) => (
                                <label
                                    key={idx}
                                    className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition"
                                >
                                    <input
                                        type="radio"
                                        name="answer"
                                        className="w-5 h-5 text-primary-600"
                                        onChange={() => handleAnswerChange('sample', idx)}
                                    />
                                    <span className="ml-3">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-30 px-6 py-4">
                <div className="container mx-auto max-w-4xl flex justify-between">
                    <Button
                        variant="outline"
                        disabled={currentQuestion === 0}
                        onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                    >
                        Previous
                    </Button>

                    <Button variant="danger" onClick={() => handleSubmit(false)}>
                        Submit Exam
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => setCurrentQuestion((prev) => Math.min(14, prev + 1))}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
