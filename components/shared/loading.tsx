'use client';

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <svg 
          className={`${sizeClasses[size]} text-violet-400/20`}
          viewBox="0 0 24 24"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <svg
          className={`${sizeClasses[size]} text-violet-400 animate-spin absolute inset-0`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className={`${textClasses[size]} text-zinc-400 font-medium animate-pulse`}>
        {text}
      </p>
    </div>
  );
}
