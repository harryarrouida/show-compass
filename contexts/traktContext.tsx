/** @jsxImportSource react */
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { traktUser, traktToken, moviesWatched, showsWatched, traktHistory, traktWatched } from '@/services/trakt/traktServices';
import { getCachedData, clearCache, clearAllCache } from '@/utils/cache';
import axios from 'axios';

interface TraktUser {
  username: string;
  name: string;
  vip: boolean;
  vip_ep: boolean;
  ids: {
    slug: string;
    uuid: string;
  };
}

interface TraktContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: TraktUser | null;
  logout: () => void;
  login: () => Promise<void>;
  handleToken: (code: string) => Promise<void>;
  getUserWatchedMovies: () => Promise<any>;
  getUserWatchedShows: () => Promise<any>;
  watchedMoviesCache: any[];
  watchedShowsCache: any[];
  watchedMoviesDetails: any[];
  watchedShowsDetails: any[];
}

export const TraktContext = createContext<TraktContextType | undefined>(undefined);

export function TraktProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<TraktUser | null>(null);
  const [watchedMoviesCache, setWatchedMoviesCache] = useState<any[]>([]);
  const [watchedShowsCache, setWatchedShowsCache] = useState<any[]>([]);
  const [watchedMoviesDetails, setWatchedMoviesDetails] = useState<any[]>([]);
  const [watchedShowsDetails, setWatchedShowsDetails] = useState<any[]>([]);

  const logout = () => {
    try {
      setIsAuthenticated(false);
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('traktToken');
      
      // Clear all Trakt-related cache
      clearAllCache(/^(movies-watched|shows-watched|trakt)/);
      
      // Reset state
      setWatchedMoviesCache([]);
      setWatchedShowsCache([]);
      setWatchedMoviesDetails([]);
      setWatchedShowsDetails([]);
    } catch (error) {
      console.error('Error during logout:', error);
      // Attempt force clear even if error
      clearAllCache();
    }
  };

  const login = async () => {
    try {
      if (isAuthenticated) {
        console.warn('User is already authenticated');
        return;
      }
      
      const authResponse = await axios.get('/api/trakt/authorize');
      if (!authResponse?.data?.url) {
        throw new Error('Invalid authorization response');
      }
      window.location.href = authResponse.data.url;
    } catch (error) {
      console.error('Failed to initiate login:', error);
      throw new Error('Login failed - please try again later');
    }
  };

  const handleToken = async (code: string) => {
    if (!code) {
      throw new Error('No authorization code provided');
    }

    try {
      // Check if we've already tried to use this code
      const lastUsedCode = localStorage.getItem('lastUsedTraktCode');
      if (lastUsedCode === code) {
        console.warn('This authorization code has already been used');
        throw new Error('This login link has expired. Please try logging in again.');
      }
      
      // Store the code we're about to use
      localStorage.setItem('lastUsedTraktCode', code);
      
      const response = await fetch('/api/trakt/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Trakt token exchange error:', data);
        
        // Handle specific error cases
        if (data.error === 'invalid_grant') {
          throw new Error('Authentication code expired. Please try logging in again.');
        }
        
        throw new Error(data.error_description || data.error || 'Failed to authenticate');
      }

      if (!data.access_token) {
        throw new Error('No access token received');
      }

      // Clear the last used code on success
      localStorage.removeItem('lastUsedTraktCode');
      
      // Store the token and update state
      localStorage.setItem('traktToken', data.access_token);
      setAccessToken(data.access_token);
      setIsAuthenticated(true);

      try {
        const userResponse = await traktUser(data.access_token);
        if (!userResponse) {
          throw new Error('Failed to fetch user data');
        }
        setUser(userResponse);
      } catch (userError) {
        console.error('Error fetching user data:', userError);
        logout();
        throw new Error('Failed to fetch user data after authentication');
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Authentication failed:', error);
      logout();
      throw error;
    }
  }

  const getUserWatchedMovies = async () => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      const cacheKey = `movies-watched-${accessToken}`;
      const moviesData = await getCachedData<any[]>(cacheKey, async () => {
        const moviesWatchedData = await moviesWatched(accessToken);
        if (!Array.isArray(moviesWatchedData)) {
          throw new Error('Invalid movies data received');
        }
        return moviesWatchedData;
      });
      
      setWatchedMoviesCache(moviesData);
      return moviesData;
    } catch (error) {
      console.error('Error fetching watched movies:', error);
      throw error;
    }
  };

  const getUserWatchedShows = async () => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      const cacheKey = `shows-watched-${accessToken}`;
      const showsData = await getCachedData<any[]>(cacheKey, async () => {
        const showsWatchedData = await showsWatched(accessToken);
        if (!Array.isArray(showsWatchedData)) {
          throw new Error('Invalid shows data received');
        }
        return showsWatchedData;
      });
      
      setWatchedShowsCache(showsData);
      return showsData;
    } catch (error) {
      console.error('Error fetching watched shows:', error);
      throw error;
    }
  };

  const invalidateCache = () => {
    clearAllCache(/^(movies-watched|shows-watched|trakt)/);
    setWatchedMoviesCache([]);
    setWatchedShowsCache([]);
  };

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('traktToken');
      if (!storedToken) {
        return;
      }

      setAccessToken(storedToken);
      setIsAuthenticated(true);

      const fetchUser = async () => {
        try {
          const userResponse = await traktUser(storedToken);
          if (!userResponse) {
            throw new Error('No user data received');
          }
          setUser(userResponse);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          logout();
        }
      };

      fetchUser();
    } catch (error) {
      console.error('Error in initialization:', error);
      logout();
    }
  }, []);

  return (
    <TraktContext.Provider value={{
      isAuthenticated,
      accessToken,
      user,
      logout,
      login,
      handleToken,
      getUserWatchedMovies,
      getUserWatchedShows,
      watchedMoviesCache,
      watchedShowsCache,
      watchedMoviesDetails,
      watchedShowsDetails,
    }}>
      {children}
    </TraktContext.Provider>
  );
}

export function useTraktContext() {
  const context = useContext(TraktContext);
  if (context === undefined) {
    throw new Error('useTraktContext must be used within a TraktProvider');
  }
  return context;
}