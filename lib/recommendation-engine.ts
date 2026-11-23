import "server-only";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq";
import type { AIRecommendation } from "@/types/types";

export type MediaKind = "movie" | "show";
export type TasteItem = { id?: number; title: string; type?: MediaKind };
export type UserRating = { id: number; rating: number };
export type TasteFeedback = { id: number; type: MediaKind; sentiment: "interested" | "not_interested" };

export type RecommendationRequest = {
  mode: "similar" | "trakt";
  type: MediaKind;
  sourceId?: number;
  watched?: TasteItem[];
  saved?: TasteItem[];
  watchlist?: TasteItem[];
  ratings?: UserRating[];
  feedback?: TasteFeedback[];
  excludedIds?: number[];
  count?: number;
  prompt?: string;
  animeOnly?: boolean;
};

type TMDBTitle = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  original_language?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  adult?: boolean;
};

type Candidate = {
  id: number;
  title: string;
  overview: string;
  year: string;
  genres: number[];
  language: string;
  poster: string;
  backdrop: string;
  releaseDate: string;
  rating: number;
  votes: number;
  popularity: number;
  score: number;
};

const toTMDBType = (type: MediaKind) => type === "movie" ? "movie" : "tv";
const positiveId = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value > 0;
const textValue = (value: unknown, max = 120) => typeof value === "string" ? value.trim().slice(0, max) : "";
const normalized = (value: string) => value.normalize("NFKD").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

async function tmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY or NEXT_PUBLIC_TMDB_API_KEY is missing");
  const base = (process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3").replace(/\/$/, "");
  const url = new URL(`${base}${endpoint}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error(`TMDB request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

async function optionalList(endpoint: string, params: Record<string, string> = {}): Promise<TMDBTitle[]> {
  try {
    const response = await tmdb<{ results: TMDBTitle[] }>(endpoint, params);
    return Array.isArray(response.results) ? response.results : [];
  } catch (error) {
    console.warn("TMDB candidate source unavailable:", endpoint, error);
    return [];
  }
}

function toCandidate(raw: TMDBTitle, score: number): Candidate | null {
  const title = textValue(raw.title || raw.name);
  if (!positiveId(raw.id) || !title || !raw.poster_path || !raw.overview || raw.adult) return null;
  return {
    id: raw.id,
    title,
    overview: textValue(raw.overview, 350),
    year: (raw.release_date || raw.first_air_date || "").slice(0, 4),
    genres: (raw.genre_ids || raw.genres?.map(g => g.id) || []).filter(positiveId),
    language: raw.original_language || "",
    poster: raw.poster_path,
    backdrop: raw.backdrop_path || "",
    releaseDate: raw.release_date || raw.first_air_date || "",
    rating: Number(raw.vote_average) || 0,
    votes: Number(raw.vote_count) || 0,
    popularity: Number(raw.popularity) || 0,
    score,
  };
}

function formatMedia(candidate: Candidate, type: MediaKind) {
  return {
    id: candidate.id,
    title: candidate.title,
    type,
    release_date: candidate.releaseDate,
    poster_path: candidate.poster,
    backdrop_path: candidate.backdrop,
    vote_average: candidate.rating,
    popularity: candidate.popularity,
  };
}

async function fetchDetails(type: MediaKind, id: number): Promise<TMDBTitle | null> {
  try {
    return await tmdb<TMDBTitle>(`/${toTMDBType(type)}/${id}`);
  } catch (error) {
    console.warn("TMDB title unavailable:", id, error);
    return null;
  }
}

// The source pool is fetched from TMDB. The model can only rank these real IDs.
async function gatherCandidates(input: RecommendationRequest, positiveAnchors: number[]) {
  const prefix = `/${toTMDBType(input.type)}`;
  const tasks: Array<{ endpoint: string; params?: Record<string, string>; weight: number }> = [];

  if (input.mode === "similar" && positiveId(input.sourceId)) {
    tasks.push(
      { endpoint: `${prefix}/${input.sourceId}/recommendations`, weight: 30 },
      { endpoint: `${prefix}/${input.sourceId}/similar`, weight: 24 },
    );
  }

  if (input.mode === "trakt") {
    for (const id of positiveAnchors.slice(0, 4)) {
      tasks.push({ endpoint: `${prefix}/${id}/recommendations`, weight: 28 });
    }
  }

  tasks.push(
    { endpoint: `/trending/${toTMDBType(input.type)}/week`, weight: 10 },
    { endpoint: `/discover/${toTMDBType(input.type)}`, params: { sort_by: "vote_average.desc", "vote_count.gte": "150" }, weight: 8 },
  );

  const results = await Promise.all(tasks.map(async task => ({
    titles: await optionalList(task.endpoint, { include_adult: "false", ...task.params }),
    weight: task.weight,
  })));

  const pool = new Map<number, Candidate>();
  for (const { titles, weight } of results) {
    titles.forEach((raw, index) => {
      const candidate = toCandidate(raw, weight - index * 0.22);
      if (!candidate) return;
      const existing = pool.get(candidate.id);
      if (existing) existing.score += Math.max(1, candidate.score / 3);
      else pool.set(candidate.id, candidate);
    });
  }
  return [...pool.values()];
}

async function gatherWatchlist(type: MediaKind, entries: TasteItem[]) {
  // Fetch bounded batches to keep the request inexpensive on large watchlists.
  const ids = [...new Set(entries.map(item => item.id).filter(positiveId))].slice(0, 60);
  const pool: Candidate[] = [];
  for (let i = 0; i < ids.length; i += 8) {
    const batch = await Promise.all(ids.slice(i, i + 8).map(id => fetchDetails(type, id!)));
    batch.forEach((raw, j) => {
      if (!raw) return;
      const candidate = toCandidate(raw, 30 - (i + j) * 0.1);
      if (candidate) pool.push(candidate);
    });
  }
  return pool;
}

function sanitizeInput(raw: RecommendationRequest): RecommendationRequest {
  if (!raw || (raw.type !== "movie" && raw.type !== "show") || (raw.mode !== "similar" && raw.mode !== "trakt")) {
    throw new Error("Invalid recommendation request");
  }
  const items = (value: unknown): TasteItem[] =>
    Array.isArray(value) ? value.slice(0, 300).filter(v => v && typeof v === "object").map(v => ({
      id: positiveId(v.id) ? v.id : undefined,
      title: textValue(v.title),
      type: v.type === "movie" || v.type === "show" ? v.type : undefined,
    })).filter(v => v.id || v.title) : [];

  return {
    mode: raw.mode,
    type: raw.type,
    sourceId: positiveId(raw.sourceId) ? raw.sourceId : undefined,
    count: raw.count === 10 ? 10 : raw.count === 5 ? 5 : 8,
    watched: items(raw.watched),
    saved: items(raw.saved),
    watchlist: items(raw.watchlist),
    prompt: textValue(raw.prompt, 500),
    animeOnly: raw.animeOnly === true,
    excludedIds: Array.isArray(raw.excludedIds) ? raw.excludedIds.filter(positiveId).slice(0, 300) : [],
    ratings: Array.isArray(raw.ratings) ? raw.ratings.filter(r => positiveId(r?.id) && typeof r.rating === "number" && r.rating >= 1 && r.rating <= 10).slice(0, 300) : [],
    feedback: Array.isArray(raw.feedback) ? raw.feedback.filter(f => positiveId(f?.id) && f.type === raw.type && (f.sentiment === "interested" || f.sentiment === "not_interested")).slice(0, 300) : [],
  };
}

export async function generateVerifiedRecommendations(raw: RecommendationRequest): Promise<AIRecommendation[]> {
  const input = sanitizeInput(raw);
  const { type } = input;
  if (input.mode === "similar" && !input.sourceId) throw new Error("Choose a movie or show first");
  if (input.mode === "trakt" && !input.watched?.length) throw new Error("Connect Trakt and watch some titles first");

  const watched = (input.watched || []).filter(item => !item.type || item.type === type);
  const saved = (input.saved || []).filter(item => !item.type || item.type === type);
  const ratings = input.ratings || [];
  const feedback = input.feedback || [];
  const ratedGood = ratings.filter(r => r.rating >= 8).sort((a, b) => b.rating - a.rating);
  const ratedBad = ratings.filter(r => r.rating <= 4);
  const interested = feedback.filter(f => f.sentiment === "interested");
  const disliked = feedback.filter(f => f.sentiment === "not_interested");
  const positives = [...interested.map(f => f.id), ...ratedGood.map(r => r.id), ...saved.map(s => s.id), ...watched.map(w => w.id)]
    .filter(positiveId);
  const anchors = [...new Set(positives)].slice(0, 4);

  const source = input.sourceId ? await fetchDetails(type, input.sourceId) : null;
  if (input.mode === "similar" && !source) throw new Error("The selected title could not be found on TMDB");

  const pool = input.mode === "trakt" && input.watchlist?.length
    ? await gatherWatchlist(type, input.watchlist)
    : await gatherCandidates(input, anchors);

  const excludedIds = new Set<number>([
    ...watched.map(item => item.id).filter(positiveId),
    ...saved.map(item => item.id).filter(positiveId),
    ...disliked.map(item => item.id),
    ...ratedBad.map(item => item.id),
    ...(input.excludedIds || []),
    ...(input.sourceId ? [input.sourceId] : []),
  ]);
  const excludedTitles = new Set([...watched, ...saved].map(item => normalized(item.title)).filter(Boolean));
  const whitelist = input.mode === "trakt" && input.watchlist?.length
    ? new Set(input.watchlist.map(item => item.id).filter(positiveId))
    : null;

  const sourceGenres = source?.genres?.map(g => g.id) || [];
  const candidates = pool.filter(candidate => {
    if (excludedIds.has(candidate.id) || excludedTitles.has(normalized(candidate.title))) return false;
    if (whitelist && !whitelist.has(candidate.id)) return false;
    if (input.animeOnly && !(candidate.language === "ja" && candidate.genres.includes(16))) return false;
    return true;
  }).map(candidate => ({
    ...candidate,
    score: candidate.score
      + candidate.genres.filter(id => sourceGenres.includes(id)).length * 4
      + Math.min(9, Math.log10(Math.max(1, candidate.votes)) * 1.5),
  })).sort((a, b) => b.score - a.score).slice(0, 70);

  if (candidates.length === 0) {
    throw new Error("No eligible titles found. Try a broader search or turn off the anime filter.");
  }

  const preferred = [...new Set([...saved.map(x => x.title), ...interested.map(f => {
    const match = watched.find(w => w.id === f.id) || saved.find(w => w.id === f.id);
    return match?.title || "";
  })].filter(Boolean))].slice(0, 20);
  const positivelyRated = ratedGood.slice(0, 20).map(r => ({
    rating: r.rating,
    title: watched.find(w => w.id === r.id)?.title || `TMDB ${r.id}`,
  }));

  const instruction = [
    "You recommend movies and TV shows by emotional atmosphere, pacing, character dynamics and themes. Genres are supporting signals, not a substitute for taste.",
    "You MUST choose exclusively from the numbered TMDB candidate IDs below. Never invent IDs or titles.",
    "Differentiate nuanced matches and be candid about why each title fits; avoid claiming knowledge beyond supplied synopses.",
    "Provide variety, respect specific constraints, and output ONLY JSON with the shape {\"recommendations\":[{\"id\":123,\"reason\":\"Specific, concise explanation\"}]}.",
    "Do not include any other keys. Do not mention excluded or previously watched titles in reasons.",
  ].join("\n");

  const userContext = {
    task: input.mode === "similar" ? "Recommend related titles by emotional experience, not just franchise" : "Match personal viewing interests",
    type,
    requested: input.count,
    reference: source && { title: source.title || source.name, overview: source.overview?.slice(0, 400), genres: source.genres?.map(g => g.name) },
    request: input.prompt,
    likedOrSaved: preferred,
    highUserRatings: positivelyRated,
    watchedForBreadth: watched.slice(0, 80).map(x => x.title),
    note: "Watched does not necessarily mean liked. Public TMDB scores are not personal ratings.",
    candidates: candidates.map(c => ({
      id: c.id, title: c.title, year: c.year, overview: c.overview.slice(0, 240), genres: c.genres,
    })),
  };

  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "system", content: instruction }, { role: "user", content: JSON.stringify(userContext) }],
    temperature: 0.4,
    max_tokens: 2300,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("The recommendation model returned no output");
  let parsed: unknown;
  try { parsed = JSON.parse(content); }
  catch { throw new Error("The recommendation model returned invalid JSON"); }
  const chosen = parsed && typeof parsed === "object" && "recommendations" in parsed
    ? (parsed as { recommendations: unknown }).recommendations : null;
  if (!Array.isArray(chosen)) throw new Error("The recommendation model returned an invalid list");

  const allowed = new Map(candidates.map(c => [c.id, c]));
  const seen = new Set<number>();
  const output: AIRecommendation[] = [];

  for (const suggestion of chosen) {
    const id = Number(suggestion?.id);
    const candidate = allowed.get(id);
    const reason = textValue(suggestion?.reason, 460);
    if (!candidate || seen.has(id) || reason.length < 15) continue;
    seen.add(id);
    output.push({ title: candidate.title, reason, media: formatMedia(candidate, type) });
    if (output.length >= (input.count || 8)) break;
  }

  if (!output.length) throw new Error("No verified recommendations were returned. Please try again.");
  return output;
}
