'use client';

import { IoRefreshCircleOutline } from "react-icons/io5";

interface LoadingProps {
  text?: string;
  size?: "small" | "medium" | "large";
}

export default function Loading({ text = "Loading...", size = "medium" }: LoadingProps) {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8", 
    large: "h-12 w-12"
  };

  const textClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className="relative">
        <IoRefreshCircleOutline 
          className={`${sizeClasses[size]} text-violet-400/20`}
        />
        <IoRefreshCircleOutline 
          className={`${sizeClasses[size]} text-violet-400 animate-spin absolute inset-0`}
        />
      </div>
      <p className={`${textClasses[size]} text-zinc-400 font-medium animate-pulse`}>
        {text}
      </p>
    </div>
  );
}
