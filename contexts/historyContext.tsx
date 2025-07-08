'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MappedMovie, MappedShow, MovieDetails, ShowDetails } from '@/types/types';
import { useToast } from '@/contexts/toastContext';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore';
import { app, db, auth } from '@/config/Firebase';

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
    const { showToast } = useToast();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [alert, setAlert] = useState<string | null>(null);


    // Fetch history from Firestore on mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;
                const userHistoryRef = collection(db, 'users', user.uid, 'history');
                const q = query(userHistoryRef, orderBy('timestamp', 'desc'));
                const querySnapshot = await getDocs(q);
                const items: HistoryItem[] = [];
                querySnapshot.forEach((docSnap) => {
                    items.push(docSnap.data() as HistoryItem);
                });
                setHistory(items);
            } catch (error) {
                console.error('Error fetching history from Firestore:', error);
            }
        };
        fetchHistory();
    }, []);

    const saveToHistory = async (
        media: MappedMovie | MappedShow,
        mediaType: 'movie' | 'show',
        reason: string,
        from: MovieDetails | ShowDetails | string
    ) => {
        console.log('[saveToHistory] called with:', { media, mediaType, reason, from });
        try {
            const user = auth.currentUser;
            console.log('[saveToHistory] currentUser:', user);
            if (!user) {
                showToast("You must be logged in to save history", "error");
                return;
            }
            // Check if this media already exists in Firestore for this user
            const userHistoryRef = collection(db, 'users', user.uid, 'history');
            const q = query(userHistoryRef, orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            let alreadyExists = false;
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data() as HistoryItem;
                if (data.id === media.id && data.mediaType === mediaType) {
                    alreadyExists = true;
                }
            });
            if (alreadyExists) {
                showToast("Already in history", "info");
                return;
            }

            const timestamp = Date.now();
            const newItem: HistoryItem = {
                id: media.id,
                mediaType,
                timestamp,
                data: media,
                reason,
                from
            };
            console.log('[saveToHistory] newItem:', newItem);

            const itemDocRef = doc(userHistoryRef, String(timestamp));
            console.log('[saveToHistory] itemDocRef:', itemDocRef);
            await setDoc(itemDocRef, newItem);
            console.log('[saveToHistory] setDoc success');

            setHistory(prevHistory => [newItem, ...prevHistory]);
            showToast("Saved to history", "success");
        } catch (error) {
            console.error('[saveToHistory] Error saving to Firestore:', error);
            showToast("Failed to save to history", "error");
        }
    };

    // Firestore deleteDoc import

    const deleteFromHistory = async (timestamp: number) => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const userHistoryRef = collection(db, 'users', user.uid, 'history');
            const itemDocRef = doc(userHistoryRef, String(timestamp));
            await deleteDoc(itemDocRef);
            setHistory(prevHistory => prevHistory.filter(item => item.timestamp !== timestamp));
        } catch (error) {
            console.error('Error deleting from Firestore:', error);
        }
    }

    const clearHistory = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const userHistoryRef = collection(db, 'users', user.uid, 'history');
            const q = query(userHistoryRef);
            const querySnapshot = await getDocs(q);
            const batchDeletes: Promise<any>[] = [];
            for (const docSnap of querySnapshot.docs) {
                batchDeletes.push(deleteDoc(docSnap.ref));
            }
            await Promise.all(batchDeletes);
            setHistory([]);
            showToast("History cleared", "success");
        } catch (error) {
            console.error('Error clearing Firestore history:', error);
        }
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
