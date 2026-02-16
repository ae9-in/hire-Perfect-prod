import React, { ReactNode } from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    style?: React.CSSProperties;
}

export default function Card({
    children,
    className = '',
    hover = false,
    style,
}: CardProps) {
    const baseStyles = 'bg-white rounded-lg border border-gray-200 transition-all duration-200';
    const hoverStyles = hover ? 'hover:shadow-md hover:border-gray-300' : '';

    return (
        <div className={`${baseStyles} ${hoverStyles} ${className}`} style={style}>
            {children}
        </div>
    );
}
