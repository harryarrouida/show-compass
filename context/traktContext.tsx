/** @jsxImportSource react */
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
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

  const logout = () => {
    setIsAuthenticated(false);
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('traktToken');
    // Clear cached data
    localStorage.removeItem('watchedMoviesCache');
    localStorage.removeItem('watchedShowsCache');
    localStorage.removeItem('watchedMoviesCacheTimestamp');
    localStorage.removeItem('watchedShowsCacheTimestamp');
  };

  const login = async () => {
    try {
      // Get authorization URL and redirect user
      const authResponse = await axios.get('/api/trakt/authorize');
      window.location.href = authResponse.data.url;
    } catch (error) {
      console.error('Failed to initiate login:', error);
    }
  };

  const handleToken = async (code: string) => {
    if (code) {
      try {
        // Exchange code for token
        const tokenResponse = await traktToken(code);
        if (tokenResponse.access_token) {
          const token = tokenResponse.access_token;
          localStorage.setItem('traktToken', token);
          setAccessToken(token);
          setIsAuthenticated(true);

          // Fetch user data
          const userResponse = await traktUser(token);
          setUser(userResponse);
        }

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Authentication failed:', error);
      }
    }
  }

  const getUserWatchedMovies = async () => {
    if (accessToken) {
      try {
        const cachedMovies = localStorage.getItem('watchedMoviesCache');
        const cacheTimestamp = localStorage.getItem('watchedMoviesCacheTimestamp');
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (cachedMovies && cacheTimestamp) {
          try {
            const parsedMovies = JSON.parse(cachedMovies);
            if (Date.now() - parseInt(cacheTimestamp) < CACHE_DURATION) {
              setWatchedMoviesCache(parsedMovies);
              return parsedMovies;
            }
          } catch (e) {
            // Handle corrupt cache
            localStorage.removeItem('watchedMoviesCache');
            localStorage.removeItem('watchedMoviesCacheTimestamp');
          }
        }

        // If no cache or expired, fetch new data
        const moviesWatchedData = await moviesWatched(accessToken);
        setWatchedMoviesCache(moviesWatchedData);
        
        // Update cache
        localStorage.setItem('watchedMoviesCache', JSON.stringify(moviesWatchedData));
        localStorage.setItem('watchedMoviesCacheTimestamp', Date.now().toString());
        
        return moviesWatchedData;
      } catch (error) {
        console.error('Error fetching watched movies:', error);
        throw error;
      }
    }
  }

  const getUserWatchedShows = async () => {
    if (accessToken) {
      // Check localStorage first
      const cachedShows = localStorage.getItem('watchedShowsCache');
      const cacheTimestamp = localStorage.getItem('watchedShowsCacheTimestamp');
      const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // If cache exists and is less than 24 hours old, use it
      if (cachedShows && cacheTimestamp && 
          Date.now() - parseInt(cacheTimestamp) < CACHE_DURATION) {
        const parsedShows = JSON.parse(cachedShows);
        setWatchedShowsCache(parsedShows);
        return parsedShows;
      }

      // If no cache or expired, fetch new data
      const showsWatchedData = await showsWatched(accessToken);
      setWatchedShowsCache(showsWatchedData);
      
      // Update cache
      localStorage.setItem('watchedShowsCache', JSON.stringify(showsWatchedData));
      localStorage.setItem('watchedShowsCacheTimestamp', Date.now().toString());
      
      return showsWatchedData;
    }
  }

  const invalidateCache = () => {
    localStorage.removeItem('watchedMoviesCache');
    localStorage.removeItem('watchedShowsCache');
    localStorage.removeItem('watchedMoviesCacheTimestamp');
    localStorage.removeItem('watchedShowsCacheTimestamp');
    setWatchedMoviesCache([]);
    setWatchedShowsCache([]);
  };

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('traktToken');
    if (storedToken) {
      setAccessToken(storedToken);
      setIsAuthenticated(true);

      // Fetch user data when token exists
      const fetchUser = async () => {
        try {
          const userResponse = await traktUser(storedToken);
          setUser(userResponse);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // If token is invalid, logout user
          logout();
        }
      };

      fetchUser();
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