// ─────────────────────────────────────────────────────────────────────────────
// SINGLE-MEDIA RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface HistoryChain {
  from: string;   // title the user was browsing
  saved: string;  // title they chose to save
}

export const generateDefaultPrompt = (
  mediaDetails: {
    title: string;
    overview: string;
    genres?: Array<{ name: string }>;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    runtime?: number;
    episode_run_time?: number[];
    number_of_seasons?: number;
    number_of_episodes?: number;
  },
  type: string,
  // New: full chain history — all saved items with where they came from
  historyChains: HistoryChain[] = [],
  numRecommendations: number = 8
) => {
  const year = mediaDetails.release_date
    ? new Date(mediaDetails.release_date).getFullYear()
    : mediaDetails.first_air_date
      ? new Date(mediaDetails.first_air_date).getFullYear()
      : "Unknown";

  // Runtime context
  const runtimeStr = mediaDetails.runtime
    ? `Runtime: ${Math.floor(mediaDetails.runtime / 60)}h ${mediaDetails.runtime % 60}m`
    : mediaDetails.episode_run_time?.[0]
      ? `Episode runtime: ~${mediaDetails.episode_run_time[0]} min`
      : "";

  const scaleStr = mediaDetails.number_of_seasons
    ? `Seasons: ${mediaDetails.number_of_seasons} | Episodes: ${mediaDetails.number_of_episodes}`
    : "";

  // Taste chain: "watched X → saved Y" — the strongest taste signal
  const historySection =
    historyChains.length > 0
      ? `\n\nUSER'S TASTE CHAINS (what they chose to save and from what context):
${historyChains
        .map((c, i) => `${i + 1}. While browsing "${c.from}" → saved "${c.saved}"`)
        .join("\n")}

These chains reveal the user's ACTUAL taste: what they find interesting enough to keep. Analyze the pattern:
- What MOODS do they consistently gravitate toward?
- What PACING do they find engaging?
- What THEMES keep appearing across their choices?
- Are they a "character-study" person or a "plot-momentum" person?

Incorporate these preference patterns into your recommendations.`
      : "";

  return `Analyze "${mediaDetails.title}" to find ${numRecommendations} ${type} recommendations that MATCH ITS EMOTIONAL ESSENCE.

CONTENT TO ANALYZE:
Title: "${mediaDetails.title}"
Overview: "${mediaDetails.overview}"
Year: ${year}
Rating: ${mediaDetails.vote_average}/10
${runtimeStr}
${scaleStr}

ATMOSPHERIC ANALYSIS — analyze these dimensions deeply:

1. EMOTIONAL TONE: What is the dominant mood? (melancholic, tense, hopeful, whimsical, cynical, bittersweet...)
   What feelings does it leave the viewer with?

2. PACING & STRUCTURE: Contemplative slow-burn or explosive momentum?
   Character-driven or plot-driven? Linear or non-linear storytelling?

3. ATMOSPHERE: What does it FEEL like? (gritty, dreamlike, intimate, epic, claustrophobic, cozy, unsettling)
   Scale: Small character study or grand narrative?

4. THEMATIC DEPTH: What ideas does it explore? (identity, belonging, loss, redemption, moral ambiguity, hope...)
   What emotional journey does the viewer undergo?

5. CHARACTER DYNAMICS: Ensemble or lone protagonist? What kind of relationships are central?
${historySection}

YOUR TASK: Find ${numRecommendations} ${type}s that share the same EMOTIONAL RESONANCE.

For each recommendation, explain:
- The MOOD and EMOTIONAL match
- The ATMOSPHERIC similarity  
- The PACING/narrative alignment
- The THEMATIC connection
- Why someone who loved "${mediaDetails.title}" would connect with this

RULES:
- Do NOT mention genres as the main reason
- FOCUS on emotional experience and atmosphere
- MATCH pacing — do not recommend frenetic content for a slow-burn viewer
- Recommendations should feel DIFFERENT from each other in some dimension

Return ONLY valid JSON:
{
  "recommendations": [
    { "title": "Exact Title", "reason": "Atmospheric/emotional explanation..." }
  ]
}`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const generateCustomPrompt = (
  details: {
    title?: string;
    overview?: string;
    genres?: Array<{ name: string }>;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    runtime?: number;
    episode_run_time?: number[];
    number_of_seasons?: number;
  },
  type: string,
  prompt: string,
  historyChains: HistoryChain[] = [],
  numRecommendations: number = 10
) => {
  const year = details.release_date
    ? new Date(details.release_date).getFullYear()
    : details.first_air_date
      ? new Date(details.first_air_date).getFullYear()
      : null;

  const runtimeStr = details.runtime
    ? `Runtime: ${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : details.episode_run_time?.[0]
      ? `Episode runtime: ~${details.episode_run_time[0]} min`
      : "";

  const historySection =
    historyChains.length > 0
      ? `\n\nUSER'S TASTE CHAINS:
${historyChains
        .map((c, i) => `${i + 1}. Browsing "${c.from}" → saved "${c.saved}"`)
        .join("\n")}

Use this to understand their baseline preferences — what they already enjoy.
Respect their taste unless they explicitly ask to explore something different.`
      : "";

  return `Help this user find ${numRecommendations} ${type} recommendations based on their specific request.

REFERENCE CONTENT:
${details.title ? `Title: "${details.title}"` : ""}
${details.overview ? `Overview: "${details.overview}"` : ""}
${year ? `Year: ${year}` : ""}
${details.vote_average ? `Rating: ${details.vote_average}/10` : ""}
${runtimeStr}

USER'S REQUEST: "${prompt}"
${historySection}

HOW TO INTERPRET THE REQUEST EMOTIONALLY:
- "sad" / "emotional" → cathartic, explores grief or loss, bittersweet endings
- "feel-good" → uplifting, warm, hopeful, emotionally restorative
- "intense" → tense, gripping, high-stakes, emotionally charged
- "weird" / "unique" → surreal, unconventional, dreamlike, experimental narrative
- "cozy" → comforting, intimate, low-stakes, warm atmosphere
- "dark" → morally heavy, unsettling, cynical worldview, complex themes
- "fast" → kinetic pacing, plot-driven, episode-on-episode momentum

TRANSLATE this request into:
1. What EMOTIONAL TONE matches?
2. What ATMOSPHERE would satisfy this?
3. What PACING would feel right?
4. What THEMATIC elements align?

Then factor in their taste chain — if they asked for "something uplifting" but their history shows they always gravitate to dark content, provide uplifting picks that still have some weight/depth.

For each recommendation explain:
- How it fulfills the emotional request
- The specific mood/atmosphere it delivers
- Any taste-profile alignment notes

RULES:
- Avoid generic genre reasoning
- Honor the specific emotional request first, taste profile second
- Provide variety — different tones within the same request space

Return ONLY valid JSON:
{
  "recommendations": [
    { "title": "Exact Title", "reason": "Explanation..." }
  ]
}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// TRAKT RECOMMENDATIONS — TIERED HISTORY
// ─────────────────────────────────────────────────────────────────────────────

export interface TieredHistory {
  /** Every title the user has ever watched — compact, no overviews */
  allTitles: string[];
  /** Top N titles selected for deep analysis — includes rating + overview */
  signatureTitles: Array<{
    title: string;
    rating: number;   // TMDB vote_average
    overview: string;
  }>;
}

export const generateTraktRecommendationsPrompt = (
  history: TieredHistory,
  favoriteGenres: string[],
  decadePreferences: Record<string, number>,
  ratingDistribution: Record<string, number>,
  type: string,
  numRecommendations: number,
  animeOnly: boolean,
  lengthPreference?: "short" | "medium" | "long",
  episodeCount?: { min?: number; max?: number },
  status?: "ongoing" | "completed" | "both",
  minimumRating?: number,
  pastRecommendations: string[] = []
) => {
  const timestamp = Date.now();

  // Format the compact full history — just titles, no overviews
  const allTitlesStr = history.allTitles.join(", ");

  // Format the deep-analysis signature titles
  const signatureStr = history.signatureTitles
    .map(
      (t, i) =>
        `${i + 1}. "${t.title}" (${t.rating.toFixed(1)}/10)\n   "${t.overview.slice(0, 200).trim()}..."`
    )
    .join("\n\n");

  return `Generate ${numRecommendations} highly personalized ${type}${animeOnly ? " anime" : ""} recommendations based on a holistic analysis of this user's COMPLETE viewing history.

GENERATION SEED: ${timestamp}

━━━ PREVIOUSLY RECOMMENDED (DO NOT RECOMMEND THESE) ━━━
${pastRecommendations.length > 0 ? pastRecommendations.join(", ") : "None yet."}
CRITICAL: You MUST NOT recommend any of the titles listed above. The user has already seen them in previous generations.

━━━ COMPLETE WATCH HISTORY (${history.allTitles.length} titles) ━━━
These are ALL the ${type} this user has watched. Use this for:
- Avoiding duplicates
- Understanding the BREADTH of their taste
- Identifying recurring patterns at scale

${allTitlesStr}

━━━ SIGNATURE TITLES (deep analysis — highest impact on taste profile) ━━━
These are specifically analyzed titles that best represent the user's preferences.
Weight these MORE in your analysis — they indicate what the user truly values.

${signatureStr}

━━━ VIEWING STATISTICS ━━━
- Quality preferences: ${JSON.stringify(ratingDistribution)}
- Era preferences: ${JSON.stringify(decadePreferences)}
${lengthPreference ? `- Length preference: ${lengthPreference}` : ""}
${episodeCount && Object.keys(episodeCount).length > 0 ? `- Episode range: ${JSON.stringify(episodeCount)}` : ""}
${status && status !== "both" ? `- Show status: ${status}` : ""}
${minimumRating && minimumRating > 0 ? `- Minimum rating: ${minimumRating}/10` : ""}

━━━ YOUR TASK ━━━
Deeply analyze the AGGREGATE EMOTIONAL AND ATMOSPHERIC PROFILE of this user to create a unified "Taste Profile".

From the signature titles (overviews + ratings), synthesize:
1. DOMINANT MOODS they gravitate toward (e.g., melancholic, tense, hopeful, dark, whimsical)
2. PACING PREFERENCE (e.g., slow-burn character studies vs plot-driven momentum)
3. ATMOSPHERIC TENDENCIES (e.g., intimate, epic, gritty, dreamlike, cozy, unsettling)
4. THEMATIC INTERESTS (e.g., identity, loss, moral ambiguity, redemption, human connection)

Find ${numRecommendations} ${type}s that match their TASTE PROFILE. Aim for variety — different shows that all fit the vibe.

EXPLANATION FORMAT for each recommendation:
- Synthesize why the recommendation fits their overarching Taste Profile (mood, atmosphere, pacing, themes).
- Explain the VIBE of the recommendation.

STRICT RULES (FAILURE TO FOLLOW WILL BREAK THE SYSTEM):
1. NO DUPLICATES: Do not recommend anything from the "COMPLETE WATCH HISTORY" or "PREVIOUSLY RECOMMENDED" sections.
2. NO TITLE DROPPING: You are STRICTLY FORBIDDEN from naming or referencing any title the user has watched in your explanation. 
   - BAD: "Because you liked The Last of Us, you will enjoy this survival story."
   - GOOD: "This matches your proven preference for gritty, high-stakes survival narratives with deep character focus."
3. NO GENRE LABELS: Do not use genres (e.g., "Because you like Sci-Fi") as the primary reason. Focus on mood and atmosphere.
4. Provide VARIETY — do not recommend 5 identical shows.

Return ONLY valid JSON:
{
  "recommendations": [
    { "title": "Exact Title", "reason": "Mood/atmospheric/thematic explanation..." }
  ]
}`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const generateWatchlistPrompt = (
  history: TieredHistory,
  ratingDistribution: Record<string, number>,
  decadePreferences: Record<string, number>,
  watchlist: Array<{ title: string }>,
  type: string,
  numRecommendations: number,
  animeOnly: boolean,
  lengthPreference?: "short" | "medium" | "long",
  episodeCount?: { min?: number; max?: number },
  status?: "ongoing" | "completed" | "both",
  minimumRating?: number,
  pastRecommendations: string[] = []
) => {
  const timestamp = Date.now();

  const signatureStr = history.signatureTitles
    .map(
      (t, i) =>
        `${i + 1}. "${t.title}" (${t.rating.toFixed(1)}/10) — "${t.overview.slice(0, 150).trim()}..."`
    )
    .join("\n");

  const watchlistStr = watchlist.map((w) => w.title).join(", ");

  return `Select ${numRecommendations} ${type}${animeOnly ? " anime" : ""} from this user's watchlist that best match their PROVEN taste profile.

GENERATION SEED: ${timestamp}

━━━ PREVIOUSLY RECOMMENDED (DO NOT RECOMMEND THESE) ━━━
${pastRecommendations.length > 0 ? pastRecommendations.join(", ") : "None yet."}
CRITICAL: You MUST NOT recommend any of the titles listed above. The user has already seen them in previous generations.

━━━ USER'S TASTE PROFILE ━━━
Signature titles (what they have actually watched and valued most):
${signatureStr}

Full watch history breadth: ${history.allTitles.length} titles
Quality preferences: ${JSON.stringify(ratingDistribution)}
Era preferences: ${JSON.stringify(decadePreferences)}
${lengthPreference ? `Length preference: ${lengthPreference}` : ""}
${status && status !== "both" ? `Show status: ${status}` : ""}
${minimumRating && minimumRating > 0 ? `Minimum rating: ${minimumRating}/10` : ""}

━━━ WATCHLIST TO CHOOSE FROM ━━━
${watchlistStr}

━━━ YOUR TASK ━━━
Based on the user's signature titles, synthesize a unified "Taste Profile" comprising their emotional and atmospheric preferences.
Then select the ${numRecommendations} watchlist items that BEST MATCH that holistic profile.

For each selection explain:
- Why this matches their overarching Taste Profile (EMOTIONAL TONE, ATMOSPHERE, THEMES)
- Avoid treating the recommendation as a 1-to-1 comparison with a past watched show.

STRICT RULES (FAILURE TO FOLLOW WILL BREAK THE SYSTEM):
1. NO DUPLICATES: Only pick from the watchlist above, and DO NOT pick anything from the "PREVIOUSLY RECOMMENDED" list.
2. NO TITLE DROPPING: You are STRICTLY FORBIDDEN from naming or referencing any title the user has watched in your explanation.
   - BAD: "Because you liked The Last of Us, you will enjoy this survival story."
   - GOOD: "This matches your proven preference for gritty, high-stakes survival narratives with deep character focus."
3. NO GENRE LABELS: Prioritize mood/atmosphere alignment over genre.
4. Provide VARIETY in your selections.

Return ONLY valid JSON:
{
  "recommendations": [
    { "title": "Title from watchlist", "reason": "Taste-match explanation..." }
  ]
}`;
};
