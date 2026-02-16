'use client';

import React, { ReactNode } from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
    pulse?: boolean;
    outline?: boolean;
    icon?: ReactNode;
    className?: string;
}

export default function Badge({
    children,
    variant = 'neutral',
    size = 'md',
    dot = false,
    pulse = false,
    outline = false,
    icon,
    className = '',
}: BadgeProps) {
    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200';

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    const solidVariants = {
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
        secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400',
    };

    const outlineVariants = {
        success: 'border border-green-500 text-green-700 dark:text-green-400',
        warning: 'border border-yellow-500 text-yellow-700 dark:text-yellow-400',
        error: 'border border-red-500 text-red-700 dark:text-red-400',
        info: 'border border-blue-500 text-blue-700 dark:text-blue-400',
        neutral: 'border border-gray-500 text-gray-700 dark:text-gray-400',
        primary: 'border border-primary-500 text-primary-700 dark:text-primary-400',
        secondary: 'border border-secondary-500 text-secondary-700 dark:text-secondary-400',
    };

    const dotColors = {
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        neutral: 'bg-gray-500',
        primary: 'bg-primary-500',
        secondary: 'bg-secondary-500',
    };

    const variantStyles = outline ? outlineVariants[variant] : solidVariants[variant];
    const pulseClass = pulse ? 'animate-pulse' : '';

    return (
        <span className={`${baseStyles} ${sizes[size]} ${variantStyles} ${pulseClass} ${className}`}>
            {dot && (
                <span className={`w-2 h-2 rounded-full ${dotColors[variant]} ${pulse ? 'animate-pulse' : ''}`}></span>
            )}
            {icon && <span className="inline-flex">{icon}</span>}
            {children}
        </span>
    );
}
