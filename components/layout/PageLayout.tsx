'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from '../shared/handlers/ErrorBoundary';

interface PageLayoutProps {
    children: ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-7xl',
    'full': 'max-w-full'
};

export default function PageLayout({ 
    children, 
    className = '', 
    maxWidth = 'lg' 
}: PageLayoutProps) {
    return (
        <ErrorBoundary>
            <div className={`page-shell min-h-[70vh] ${maxWidthClasses[maxWidth]} ${className}`}>
                <div className="space-y-10 sm:space-y-12">
                    {children}
                </div>
            </div>
        </ErrorBoundary>
    );
}