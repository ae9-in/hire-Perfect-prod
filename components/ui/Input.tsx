'use client';

import React, { InputHTMLAttributes, useState, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    success?: boolean;
    helperText?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    success,
    helperText,
    icon,
    iconPosition = 'left',
    showPasswordToggle = false,
    type = 'text',
    className = '',
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle && type === 'password'
        ? (showPassword ? 'text' : 'password')
        : type;

    const baseStyles = 'w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 outline-none bg-white font-medium text-slate-900 placeholder:text-slate-300';

    const stateStyles = error
        ? 'border-rose-100 bg-rose-50/30 focus:border-rose-500 shadow-sm'
        : success
            ? 'border-green-100 bg-green-50/30 focus:border-green-500 shadow-sm'
            : isFocused
                ? 'border-indigo-500 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50'
                : 'border-slate-100 hover:border-slate-200 shadow-sm';

    const iconPaddingLeft = icon && iconPosition === 'left' ? 'pl-14' : '';
    const iconPaddingRight = (icon && iconPosition === 'right') || showPasswordToggle ? 'pr-14' : '';

    return (
        <div className="w-full group">
            {label && (
                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-colors duration-300 ${error ? 'text-rose-500' :
                        success ? 'text-green-600' :
                            isFocused ? 'text-indigo-600' :
                                'text-slate-400'
                    }`}>
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Left Icon */}
                {icon && iconPosition === 'left' && (
                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-indigo-500' : 'text-slate-300'}`}>
                        {icon}
                    </div>
                )}

                {/* Input Field */}
                <input
                    ref={ref}
                    type={inputType}
                    className={`${baseStyles} ${stateStyles} ${iconPaddingLeft} ${iconPaddingRight} ${className}`}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {/* Right Icon or Password Toggle */}
                {(showPasswordToggle && type === 'password') ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-indigo-500' : 'text-slate-300'} hover:text-slate-600`}
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
                ) : icon && iconPosition === 'right' && (
                    <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-indigo-500' : 'text-slate-300'}`}>
                        {icon}
                    </div>
                )}
            </div>

            {/* Helper Text or Error Message */}
            {(error || helperText) && (
                <p className={`mt-2 text-xs font-bold uppercase tracking-tight ${error ? 'text-rose-500' : 'text-slate-400'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
