'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from '../shared/ErrorBoundary';

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
    '2xl': 'max-w-8xl',
    'full': 'max-w-full'
};

export default function PageLayout({ 
    children, 
    className = '', 
    maxWidth = 'lg' 
}: PageLayoutProps) {
    return (
        <ErrorBoundary>
            <main className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 mx-auto ${maxWidthClasses[maxWidth]} ${className}`}>
                <div className="space-y-16">
                    {children}
                </div>
            </main>
        </ErrorBoundary>
    );
}