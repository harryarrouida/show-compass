"use client";
interface LoadingProps {
  text?: string;
}

export default function Loading({ text = "Loading..." }: LoadingProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center space-y-4">
      <div className="col-span-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full" />
        <p className="text-zinc-400 mt-4">{text}</p>
      </div>
    </div>
  );
}
