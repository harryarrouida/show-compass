'use client';

import { BarLoader} from "react-spinners";

interface LoadingProps {
  text?: string;
  size?: "small" | "medium" | "large";
}

export default function Loading({ text = "Loading...", size = "medium" }: LoadingProps) {
  const sizeMap = {
    small: 8,
    medium: 12,
    large: 16
  };

  const textClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center space-y-4">
      <BarLoader
        color="#a78bfa"
        height={4}
        width={100}
        speedMultiplier={0.8}
      />
      <p className={`${textClasses[size]} text-zinc-400 font-medium animate-pulse mt-6`}>
        {text}
      </p>
    </div>
  );
}
