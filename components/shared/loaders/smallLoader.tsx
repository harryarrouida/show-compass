"use client";

export default function SmallLoader({ text }: { text: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      <p className="text-zinc-400 mt-4">{text}</p>
    </div>
  );
}
