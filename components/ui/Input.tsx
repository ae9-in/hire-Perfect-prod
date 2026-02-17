'use client';

import React, { InputHTMLAttributes, useState, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
    label?: string;
    error?: string;
    success?: boolean;
    helperText?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    showPasswordToggle?: boolean;
    as?: 'input' | 'select';
}

const Input = forwardRef<any, InputProps>(({
    label,
    error,
    success,
    helperText,
    icon,
    iconPosition = 'left',
    showPasswordToggle = false,
    type = 'text',
    className = '',
    as = 'input',
    children,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle && type === 'password'
        ? (showPassword ? 'text' : 'password')
        : type;

    const baseStyles = 'w-full px-5 py-4 rounded-xl border border-white/10 transition-all duration-300 outline-none bg-slate-900/50 backdrop-blur-md font-medium text-white placeholder:text-slate-500 appearance-none';

    const stateStyles = error
        ? 'border-rose-500/50 bg-rose-500/5 focus:border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
        : success
            ? 'border-emerald-500/50 bg-emerald-500/5 focus:border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            : isFocused
                ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                : 'hover:border-white/20';

    const iconPaddingLeft = icon && iconPosition === 'left' ? 'pl-14' : '';
    const iconPaddingRight = (icon && iconPosition === 'right') || showPasswordToggle ? 'pr-14' : '';

    const commonProps = {
        ref,
        className: `${baseStyles} ${stateStyles} ${iconPaddingLeft} ${iconPaddingRight} ${className}`,
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        ...props
    };

    return (
        <div className="w-full group">
            {label && (
                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-colors duration-300 ${error ? 'text-rose-500' :
                    success ? 'text-emerald-400' :
                        isFocused ? 'text-cyan-400' :
                            'text-slate-500'
                    }`}>
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Left Icon */}
                {icon && iconPosition === 'left' && (
                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${isFocused ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {icon}
                    </div>
                )}

                {/* Input Field */}
                {as === 'select' ? (
                    <select {...commonProps as any} type={undefined}>
                        {children}
                    </select>
                ) : (
                    <input
                        {...commonProps as any}
                        type={inputType}
                    />
                )}

                {/* Right Icon or Password Toggle */}
                {(showPasswordToggle && type === 'password') ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${isFocused ? 'text-cyan-400' : 'text-slate-500'} hover:text-white`}
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                ) : icon && iconPosition === 'right' ? (
                    <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${isFocused ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {icon}
                    </div>
                ) : as === 'select' && (
                    <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 pointer-events-none ${isFocused ? 'text-cyan-400' : 'text-slate-500'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Helper Text or Error Message */}
            {(error || helperText) && (
                <p className={`mt-2 text-[10px] font-black uppercase tracking-tight ${error ? 'text-rose-500' : 'text-slate-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
