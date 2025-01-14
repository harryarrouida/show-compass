interface LoadingSkeletonProps {
    count?: number;
    type?: 'card' | 'row';
}

export const LoadingSkeleton = ({ count = 4, type = 'card' }: LoadingSkeletonProps) => {
    if (type === 'card') {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {Array(count).fill(0).map((_, index) => (
                    <div key={index} className="animate-pulse space-y-4">
                        <div className="bg-zinc-800/50 h-[270px] rounded-lg" />
                        <div className="space-y-2">
                            <div className="h-4 bg-zinc-800/50 rounded w-3/4" />
                            <div className="h-3 bg-zinc-800/50 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {Array(count).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse flex space-x-4">
                    <div className="bg-zinc-800/50 h-24 w-24 rounded" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-zinc-800/50 rounded w-3/4" />
                        <div className="h-3 bg-zinc-800/50 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}; 