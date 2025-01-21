"use client";

import PageLayout from "@/components/layout/PageLayout";
import SearchComponent from "@/components/bigData/searchComponent";
import DataGrid from "@/components/bigData/dataGrid";
import { useState, useEffect } from "react";
import { getTrendingShows } from "@/services/content/showServices";
import { getTrendingMovies } from "@/services/content/movieServices";
import { MappedShow, MappedMovie } from "@/types/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState("shows");
  const [shows, setShows] = useState<MappedShow[]>([]);
  const [movies, setMovies] = useState<MappedMovie[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showDonationPopup, setShowDonationPopup] = useState(false);

  useEffect(() => {
    // Check if the popup has been shown before
    const hasSeenPopup = localStorage.getItem("hasSeenDonationPopup");
    if (!hasSeenPopup) {
      setShowDonationPopup(true);
    }
  }, []);

  const handleClosePopup = () => {
    setShowDonationPopup(false);
    localStorage.setItem("hasSeenDonationPopup", "true");
  };

  useEffect(() => {
    if (activeTab === "movies") {
      fetchMovies(page);
    } else {
      fetchShows(page);
    }
  }, [activeTab, page]);

  const fetchShows = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const data = await getTrendingShows(pageNum);
      if (pageNum === 1) {
        setShows(data);
      } else {
        setShows((prevShows) => [...prevShows, ...data]);
      }
    } catch (error) {
      console.error("Error fetching shows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovies = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const data = await getTrendingMovies(pageNum);
      if (pageNum === 1) {
        setMovies(data);
      } else {
        setMovies((prevMovies) => [...prevMovies, ...data]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      {showDonationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-8 max-w-2xl w-full shadow-xl mx-4 sm:mx-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">👋 Hello there!</h2>
            <p className="mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">
              I'm a solo developer maintaining this project in my spare time. If
              you're enjoying the app, consider supporting its development with
              a small donation. Even $1 helps keep the app running!
              <span className="block mt-4 border-t border-border py-4">
                Any suggestions for new features are welcome!
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleClosePopup}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 text-base bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Maybe later
              </button>
              <a
                href={process.env.NEXT_PUBLIC_DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 sm:px-6 py-3 text-base bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
                onClick={handleClosePopup}
              >
                Support via PayPal
              </a>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-16">
        <div>
          <SearchComponent />
        </div>

        <DataGrid
          isWithSearch={false}
          activeTab={activeTab as "shows" | "movies"}
          setActiveTab={setActiveTab}
          shows={shows}
          setShows={setShows}
          movies={movies}
          setMovies={setMovies}
          page={page}
          setPage={setPage}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>
    </PageLayout>
  );
}
