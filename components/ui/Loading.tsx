'use client';

import React from 'react';

interface LoadingProps {
    variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
    text?: string;
    className?: string;
}

export default function Loading({
    variant = 'spinner',
    size = 'md',
    fullScreen = false,
    text,
    className = '',
}: LoadingProps) {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    const Spinner = () => (
        <div className="flex flex-col items-center justify-center gap-4">
            <svg className={`animate-spin ${sizes[size]} text-primary-500`} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {text && <p className="text-gray-600 dark:text-gray-400 font-medium">{text}</p>}
        </div>
    );

    const Dots = () => (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex gap-2">
                <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} bg-primary-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} bg-primary-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} bg-primary-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
            </div>
            {text && <p className="text-gray-600 dark:text-gray-400 font-medium">{text}</p>}
        </div>
    );

    const Pulse = () => (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`${sizes[size]} bg-primary-500 rounded-full animate-pulse`}></div>
            {text && <p className="text-gray-600 dark:text-gray-400 font-medium">{text}</p>}
        </div>
    );

    const Skeleton = () => (
        <div className="w-full space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton w-5/6"></div>
        </div>
    );

    const renderLoading = () => {
        switch (variant) {
            case 'dots':
                return <Dots />;
            case 'pulse':
                return <Pulse />;
            case 'skeleton':
                return <Skeleton />;
            default:
                return <Spinner />;
        }
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
                {renderLoading()}
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            {renderLoading()}
        </div>
    );
}

// Skeleton components for specific use cases
export function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded skeleton w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton w-5/6"></div>
        </div>
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton"
                    style={{ width: i === lines - 1 ? '80%' : '100%' }}
                ></div>
            ))}
        </div>
    );
}
