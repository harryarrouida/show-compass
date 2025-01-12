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
  getUserWatched: () => Promise<any>;
  getUserHistory: () => Promise<any>;
  getUserWatchedMovies: () => Promise<any>;
  getUserWatchedShows: () => Promise<any>;
}

export const TraktContext = createContext<TraktContextType | undefined>(undefined);

export function TraktProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<TraktUser | null>(null);

  const logout = () => {
    setIsAuthenticated(false);
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('traktToken');
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
          console.log(userResponse);
          setUser(userResponse);
        }

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Authentication failed:', error);
      }
    }
  }

  const getUserWatched = async () => {
    if (accessToken) {
      const watched = await traktWatched(accessToken);
      console.log("watched", watched);
      return watched;
    }
  }

  const getUserHistory = async () => {
    if (accessToken) {
      const history = await traktHistory(accessToken);
      console.log("history", history);
      return history;
    }
  }

  const getUserWatchedMovies = async () => {
    if (accessToken) {
      const moviesWatchedData = await moviesWatched(accessToken);
      console.log("moviesWatched from context", moviesWatchedData);
      return moviesWatchedData;
    }
  }

  const getUserWatchedShows = async () => {
    if (accessToken) {
      const showsWatchedData = await showsWatched(accessToken);
      console.log("showsWatched from context", showsWatchedData);
      return showsWatchedData;
    }
  }


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
      getUserWatched,
      getUserHistory,
      getUserWatchedMovies,
      getUserWatchedShows
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