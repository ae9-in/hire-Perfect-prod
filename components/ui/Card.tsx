'use client';

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
    return (
        <div className={`bg-white rounded-2xl border border-slate-100 p-1 shadow-sm transition-all duration-300 ${hover ? 'card-hover' : ''} ${className}`}>
            <div className="h-full w-full rounded-[14px]">
                {children}
            </div>
        </div>
    );
};

export default Card;
