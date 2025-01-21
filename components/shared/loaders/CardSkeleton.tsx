export default function CardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="mt-10 mx-auto group relative w-[100px] md:w-[180px] lg:w-[180px] cursor-pointer"
    >
      <div className="mx-auto w-full flex flex-col rounded-lg">
        <div className="relative">
          {/* <div className="absolute -left-2 -top-4 md:-top-6 z-20">
            <div className="w-8 h-8 animate-pulse bg-zinc-800/50 rounded-full" />
          </div> */}

          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900/50">
            <div className="h-full w-full animate-pulse bg-zinc-800/50" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10" />
          </div>

          <div className="mt-2 space-y-1 flex justify-between items-center">
            <div className="h-4 w-24 animate-pulse bg-zinc-800/50 rounded" />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 animate-pulse bg-zinc-800/50 rounded-full" />
              <div className="h-4 w-8 animate-pulse bg-zinc-800/50 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
