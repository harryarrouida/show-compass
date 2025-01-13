import { useState } from "react";
import MediaCard from "@/components/shared/mediaCard";

interface MediaCardContainerProps {
    mediaCards: any[];
    activeTab: string;
    itemsPerPage?: number;
}

export default function MediaCardContainer({ 
    mediaCards, 
    activeTab,
    itemsPerPage = 10 
}: MediaCardContainerProps) {
    const [visibleItems, setVisibleItems] = useState(itemsPerPage);

    const showLoadMore = visibleItems < mediaCards.length;

    const handleLoadMore = () => {
        setVisibleItems(prev => Math.min(prev + itemsPerPage, mediaCards.length));
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {mediaCards.slice(0, visibleItems).map((rec, index) => (
                    <MediaCard
                        key={index}
                        item={rec.media}
                        activeTab={activeTab}
                    />
                ))}
            </div>

            {showLoadMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/50 
                                 border border-zinc-700/50 rounded-full
                                 text-sm text-zinc-300 transition-all duration-300
                                 hover:border-zinc-600/50"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}   

