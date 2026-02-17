'use client';

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
    return (
        <div className={`bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-sm transition-all duration-300 text-white ${hover ? 'card-hover' : ''} ${className}`}>
            <div className="h-full w-full">
                {children}
            </div>
        </div>
    );
};

export default Card;
