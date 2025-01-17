
export default function CardSkeleton({ index }: { index: number }) {
    return (
        <div key={index} className="animate-pulse bg-zinc-900/50 rounded-lg aspect-[2/3] w-[180px] mb-10">
            <div className="h-full bg-zinc-800/50 rounded-lg"></div>
        </div>
    )
}
