"use client";

import PageLayout from "@/components/layout/PageLayout";
import SearchComponent from "@/components/searchComponent";
import DataGrid from "@/components/dataGrid";
import Loading from "@/components/shared/loading";
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