'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MappedMovie, MappedShow, MovieDetails, ShowDetails } from '@/types/types';

interface HistoryItem {
    id: number;
    mediaType: 'movie' | 'show';
    timestamp: number;
    data: MappedMovie | MappedShow;
    reason: string;
    from: MovieDetails | ShowDetails | string;
}

interface HistoryContextType {
    history: HistoryItem[];
    saveToHistory: (item: MappedMovie | MappedShow, mediaType: 'movie' | 'show', reason: string, from: MovieDetails | ShowDetails | string) => void;
    clearHistory: () => void;
    alert: string | null;
    setAlert: (alert: string | null) => void;
    deleteFromHistory: (id: number) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [alert, setAlert] = useState<string | null>(null);

    useEffect(() => {
        const savedHistory = localStorage.getItem('viewHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory).sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('viewHistory', JSON.stringify(history));
    }, [history]);

    const saveToHistory = (
        media: MappedMovie | MappedShow,
        mediaType: 'movie' | 'show',
        reason: string,
        from: MovieDetails | ShowDetails | string
    ) => {
        const newItem: HistoryItem = {
            id: media.id,
            mediaType,
            timestamp: Date.now(),
            data: media,
            reason,
            from
        };

        setHistory(prevHistory => {
            // Check if item already exists
            if (prevHistory.some(historyItem => historyItem.id === media.id)) {
                setAlert("Already in history");
                setTimeout(() => setAlert(null), 3000);
                return prevHistory;
            }

            // Add new item
            setAlert("Saved to history");
            setTimeout(() => setAlert(null), 3000);
            return [...prevHistory, newItem];
        });
    };

    const deleteFromHistory = (id: number) => {
        setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
    }

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('viewHistory');
    };

    return (
        <HistoryContext.Provider value={{ history, saveToHistory, deleteFromHistory, clearHistory, alert, setAlert }}>
            {children}
        </HistoryContext.Provider>
    );
}

export function useHistory() {
    const context = useContext(HistoryContext);
    if (context === undefined) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
}
