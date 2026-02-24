/** @jsxImportSource react */
'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react';
import { traktUser, traktToken, moviesWatched, showsWatched, traktHistory, traktWatched } from '@/services/trakt/traktServices';
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
  const isHandlingToken = useRef(false);

  const logout = () => {
    try {
      setIsAuthenticated(false);
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('traktToken');
      // Clear cached data
      localStorage.removeItem('watchedMoviesCache');
      localStorage.removeItem('watchedShowsCache');
      localStorage.removeItem('watchedMoviesCacheTimestamp');
      localStorage.removeItem('watchedShowsCacheTimestamp');
      setWatchedMoviesCache([]);
      setWatchedShowsCache([]);
      setWatchedMoviesDetails([]);
      setWatchedShowsDetails([]);
    } catch (error) {
      console.error('Error during logout:', error);
      // Attempt force clear even if error
      localStorage.clear();
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

    // Prevent React Strict Mode from double-calling this with the same single-use code
    if (isHandlingToken.current) return;
    isHandlingToken.current = true;

    try {
      const response = await fetch('/api/trakt/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorDetail = data.error_description || data.error || 'Failed to authenticate';
        throw new Error(errorDetail);
      }

      if (!data.access_token) {
        throw new Error('No access token received');
      }

      localStorage.setItem('traktToken', data.access_token);
      setAccessToken(data.access_token);
      setIsAuthenticated(true);

      // Clean up URL immediately before subsequent requests that might fail
      window.history.replaceState({}, document.title, window.location.pathname);

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
    } catch (error) {
      console.error('Authentication failed:', error);
      logout();
      throw error;
    } finally {
      isHandlingToken.current = false;
    }
  }

  const getUserWatchedMovies = async () => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      const cachedMovies = localStorage.getItem('watchedMoviesCache');
      const cacheTimestamp = localStorage.getItem('watchedMoviesCacheTimestamp');
      const CACHE_DURATION = 24 * 60 * 60 * 1000;

      if (cachedMovies && cacheTimestamp) {
        try {
          const parsedMovies = JSON.parse(cachedMovies);
          const timestamp = parseInt(cacheTimestamp);

          if (isNaN(timestamp)) {
            throw new Error('Invalid cache timestamp');
          }

          if (Date.now() - timestamp < CACHE_DURATION) {
            setWatchedMoviesCache(parsedMovies);
            return parsedMovies;
          }
        } catch (cacheError) {
          console.error('Cache error:', cacheError);
          localStorage.removeItem('watchedMoviesCache');
          localStorage.removeItem('watchedMoviesCacheTimestamp');
        }
      }

      const moviesWatchedData = await moviesWatched(accessToken);
      if (!Array.isArray(moviesWatchedData)) {
        throw new Error('Invalid movies data received');
      }

      setWatchedMoviesCache(moviesWatchedData);

      try {
        localStorage.setItem('watchedMoviesCache', JSON.stringify(moviesWatchedData));
        localStorage.setItem('watchedMoviesCacheTimestamp', Date.now().toString());
      } catch (storageError) {
        console.error('Failed to cache movies data:', storageError);
      }

      return moviesWatchedData;
    } catch (error) {
      console.error('Error fetching watched movies:', error);
      throw error;
    }
  }

  const getUserWatchedShows = async () => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      const cachedShows = localStorage.getItem('watchedShowsCache');
      const cacheTimestamp = localStorage.getItem('watchedShowsCacheTimestamp');
      const CACHE_DURATION = 24 * 60 * 60 * 1000;

      if (cachedShows && cacheTimestamp) {
        try {
          const parsedShows = JSON.parse(cachedShows);
          const timestamp = parseInt(cacheTimestamp);

          if (isNaN(timestamp)) {
            throw new Error('Invalid cache timestamp');
          }

          if (Date.now() - timestamp < CACHE_DURATION) {
            setWatchedShowsCache(parsedShows);
            return parsedShows;
          }
        } catch (cacheError) {
          console.error('Cache error:', cacheError);
          localStorage.removeItem('watchedShowsCache');
          localStorage.removeItem('watchedShowsCacheTimestamp');
        }
      }

      const showsWatchedData = await showsWatched(accessToken);
      if (!Array.isArray(showsWatchedData)) {
        throw new Error('Invalid shows data received');
      }

      setWatchedShowsCache(showsWatchedData);

      try {
        localStorage.setItem('watchedShowsCache', JSON.stringify(showsWatchedData));
        localStorage.setItem('watchedShowsCacheTimestamp', Date.now().toString());
      } catch (storageError) {
        console.error('Failed to cache shows data:', storageError);
      }

      return showsWatchedData;
    } catch (error) {
      console.error('Error fetching watched shows:', error);
      throw error;
    }
  }

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