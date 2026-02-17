'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 btn-interact disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] focus:ring-cyan-500',
        secondary: 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] focus:ring-purple-500',
        outline: 'border-2 border-white/10 text-white hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/5',
        ghost: 'text-slate-400 hover:bg-white/5 hover:text-cyan-400',
        danger: 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] focus:ring-rose-500',
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : null}
            {children}
        </button>
    );
};

export default Button;
