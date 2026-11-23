import { IoTvOutline, IoFilmOutline, IoTimeOutline, IoLogOutOutline } from "react-icons/io5";
import { SiTrakt } from "react-icons/si";
import { useTraktContext } from "@/contexts/traktContext";
import { useRouter } from "next/navigation";

interface WatchHistoryOverviewProps {
  watchedMovies: any[];
  watchedShows: any[];
  watchedMoviesDetails: any[];
  watchedShowsDetails: any[];
}

function formatDuration(minutes: number) {
  const hours = Math.floor(Math.max(0, minutes) / 60);
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days}d ${hours % 24}h` : `${hours}h`;
}

export default function WatchHistoryOverview({
  watchedMovies, watchedShows, watchedMoviesDetails, watchedShowsDetails,
}: WatchHistoryOverviewProps) {
  const { user, logout } = useTraktContext();
  const router = useRouter();
  const movieMinutes = watchedMoviesDetails.reduce((acc, movie) => acc + (movie?.runtime || 0), 0);
  const showMinutes = watchedShowsDetails.reduce((acc, show) => {
    const runtime = show?.episode_run_time?.[0] || 0;
    const episodes = show?.number_of_episodes || 0;
    return acc + runtime * episodes;
  }, 0);
  const metrics = [
    { label: "TV shows", value: watchedShows.length, note: "titles watched", Icon: IoTvOutline },
    { label: "Movies", value: watchedMovies.length, note: "titles watched", Icon: IoFilmOutline },
    { label: "Estimated watch time", value: formatDuration(movieMinutes + showMinutes), note: "based on title runtimes", Icon: IoTimeOutline },
  ];

  return (
    <section className="surface-panel p-5 sm:p-8" aria-labelledby="trakt-overview-heading">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border-primary pb-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-hover">
            <SiTrakt aria-hidden="true" /> Connected account
          </div>
          <h2 id="trakt-overview-heading" className="section-heading">{user?.username || "Trakt overview"}</h2>
          <p className="mt-1 text-sm text-text-secondary">Your viewing activity at a glance.</p>
        </div>
        <button type="button" onClick={() => { logout(); router.push("/"); }} className="secondary-action">
          <IoLogOutOutline aria-hidden="true" /> Disconnect
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map(({ label, value, note, Icon }) => (
          <div key={label} className="rounded-xl border border-border-primary bg-background-primary p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-text-secondary"><Icon aria-hidden="true" className="size-4 text-accent-primary" />{label}</div>
            <p className="text-3xl font-bold tracking-tight text-text-primary">{value}</p>
            <p className="mt-2 text-xs text-text-tertiary">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
