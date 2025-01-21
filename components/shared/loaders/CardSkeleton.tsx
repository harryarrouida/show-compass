export default function CardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="relative w-[100px] md:w-[150px] lg:w-[180px] mb-10 cursor-pointer group"
      key={index}
    >
      <div className="mx-auto w-full md:w-full lg:w-full group flex flex-col rounded-lg">
        <div className="group relative">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
            <div className="h-full w-full animate-pulse bg-zinc-800/50" />
          </div>

          <div className="mt-2 space-y-0.5 sm:space-y-1 flex justify-between items-center">
            <div className="h-4 w-24 animate-pulse bg-zinc-800/50 rounded" />
            <div className="flex items-center">
              <div className="w-4 h-4 mx-1 animate-pulse bg-zinc-800/50 rounded-full" />
              <div className="h-4 w-8 animate-pulse bg-zinc-800/50 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
