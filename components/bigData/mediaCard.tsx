import Link from "next/link";
import { MappedMovie, MappedShow } from "@/types/types";
import { IoBookmarkOutline, IoStar } from "react-icons/io5";
import OptimizedImage from "../shared/handlers/optimizedImage";

interface MediaCardProps {
  item: MappedMovie | MappedShow;
  activeTab: string;
  showSaveToHistory?: boolean;
  onSave?: () => void;
  isModal?: boolean;
}

export default function MediaCard({
  item,
  activeTab,
  showSaveToHistory = false,
  onSave,
}: MediaCardProps) {
  const mediaType = activeTab === "movies" || (!activeTab && item.type === "movie") ? "movie" : "show";

  return (
    <div className="relative min-w-0">
      <Link
        href={`/recommendation/${item.id}/${mediaType}`}
        className="poster-control group"
      >
        <span className="poster-frame">
          <OptimizedImage
            src={item.poster_path || ""}
            alt=""
            className="object-cover transition-transform group-hover:scale-105"
            quality={75}
            sizes="(max-width: 380px) 50vw, (max-width: 768px) 33vw, 20vw"
          />
        </span>
        <span className="poster-title">{item.title}</span>
        {item.vote_average > 0 && (
          <span className="poster-rating">
            <IoStar aria-hidden="true" className="size-3 text-amber-400" />
            <span className="sr-only">Rating</span>
            {item.vote_average.toFixed(1)}
          </span>
        )}
      </Link>

      {showSaveToHistory && onSave && (
        <button
          type="button"
          onClick={onSave}
          aria-label={`Save ${item.title} to history`}
          className="icon-action absolute right-2 top-2"
        >
          <IoBookmarkOutline aria-hidden="true" className="size-5" />
        </button>
      )}
    </div>
  );
}
