'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userData));
        loadAssessments();
    }, []);

    const loadAssessments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/assessments', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setAssessments(data.assessments || []);
            }
        } catch (error) {
            console.error('Failed to load assessments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Loading variant="spinner" size="lg" fullScreen text="Loading your dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">H</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">HirePerfect</span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Track your progress and continue your learning journey
                    </p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Purchased</p>
                                <p className="text-4xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                                <p className="text-4xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                                <p className="text-4xl font-bold text-gray-900">--</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Available Assessments */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Available Assessments</h2>
                        <Link href="/">
                            <Button variant="outline" size="sm">Browse All</Button>
                        </Link>
                    </div>

                    {assessments.length === 0 ? (
                        <Card className="text-center py-16 px-6">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Assessments Yet</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Purchase an assessment to get started with your learning journey
                            </p>
                            <Link href="/">
                                <Button variant="primary">Browse Assessments</Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assessments.slice(0, 6).map((assessment) => (
                                <Card key={assessment._id} hover className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="text-sm font-semibold text-primary-500">{assessment.category}</span>
                                        <span className="text-sm text-gray-500">{assessment.duration} min</span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-900">{assessment.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {assessment.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-gray-900">₹{assessment.price}</span>
                                        {assessment.hasAccess ? (
                                            <Button variant="primary" size="sm">Start Exam</Button>
                                        ) : (
                                            <Button variant="outline" size="sm">Purchase</Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Link href="/">
                            <Card hover className="p-6 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1 text-gray-900">Browse Assessments</h3>
                                        <p className="text-sm text-gray-600">
                                            Explore all available assessments
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>

                        <Card hover className="p-6 cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1 text-gray-900">View Results</h3>
                                    <p className="text-sm text-gray-600">
                                        Check your past performance
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
