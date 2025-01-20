export const generateDefaultPrompt = (
  mediaDetails: {
    title: string;
    overview: string;
    genres: Array<{ name: string }>;
    release_date: string;
    vote_average: number;
  },
  type: string,
  numRecommendations: number = 8
) => `
You are a strict recommendation engine. Generate EXACTLY ${numRecommendations} ${type} recommendations based on the input details. Your recommendations MUST span multiple genres, exist on major streaming platforms, and MUST include at least three titles from the last three years.

Input:
- Title: "${mediaDetails.title}"
- Overview: "${mediaDetails.overview}"
- Genres: ${mediaDetails.genres.map((g) => g.name).join(", ")}
- Release Year: ${new Date(mediaDetails.release_date).getFullYear()}
- Rating: ${mediaDetails.vote_average}

STRICT Requirements:
1. Focus ONLY on thematic, stylistic, or emotional connections.
2. Each recommendation MUST have exactly two concise sentences explaining the connection.
3. NEVER include plot summaries, ratings, or popularity metrics.
4. MUST include diverse genres - do not cluster recommendations in similar genres.
5. All recommendations MUST be readily available on major streaming platforms.

JSON Format:
{
  "recommendations": [
    { "title": "Title", "reason": "Two sentences explaining the connection." }
  ]
}

CRITICAL: Return ONLY valid JSON. Any additional text will result in failure.`;

export const generateCustomPrompt = (
  details: {
    title?: string;
    overview?: string;
    genres?: Array<{ name: string }>;
    release_date?: string;
    vote_average?: number;
  },
  type: string,
  prompt: string,
  numRecommendations: number = 8
) => `
You are a strict recommendation engine. Generate EXACTLY ${numRecommendations} ${type} recommendations that PRECISELY address the user's query.

Input:
- Title: "${details?.title || "N/A"}"
- Overview: "${details?.overview || "N/A"}"
- Genres: ${details?.genres?.map((g) => g.name).join(", ") || "N/A"}
- Release Year: ${
  details?.release_date ? new Date(details?.release_date).getFullYear() : "N/A"
}
- Rating: ${details?.vote_average || "N/A"}

User Query: "${prompt}"

STRICT Requirements:
1. Focus ONLY on thematic, stylistic, or emotional connections.
2. Each recommendation MUST have exactly two concise sentences addressing the user's query.
3. MUST include at least three titles from the last three years.
4. NEVER include plot summaries, ratings, or popularity metrics.
5. All recommendations MUST be readily available on major streaming platforms.
6. MUST include diverse genres - do not cluster recommendations in similar genres.

JSON Format:
{
  "recommendations": [
    { "title": "Title", "reason": "Two sentences explaining the connection." }
  ]
}

CRITICAL: Return ONLY valid JSON. Any additional text will result in failure.`;

//  trakt recommendations
export const generateTraktRecommendationsPrompt = (
  watchedTitles: Array<{ title: string; overview: string }>,
  favoriteGenres: string[],
  decadePreferences: any,
  ratingDistribution: any,
  seen: string[],
  type: string,
  numRecommendations: number,
  animeOnly: boolean
) => `
You are a STRICT recommendation engine. Your task is to generate EXACTLY ${numRecommendations} personalized ${
  type + (animeOnly ? " anime" : "")
} recommendations based on the user's watch history.

Input Analysis:
- Watched Titles and Overview (last 30): ${watchedTitles
  .slice(0, 30)
  .map((title) => title.title + " - " + title.overview)
  .join(", ")}
- Favorite Genres: ${favoriteGenres.join(", ")}
- Decade Preferences: ${JSON.stringify(decadePreferences)}
- Rating Distribution: ${JSON.stringify(ratingDistribution)}

CRITICAL: These titles are STRICTLY FORBIDDEN from recommendations:
${watchedTitles.map((title) => title.title).join(", ")}

MANDATORY Requirements:
1. Focus EXCLUSIVELY on thematic, stylistic, or emotional connections to watched content.
2. Each recommendation MUST have exactly two concise sentences.
3. NEVER include plot summaries, ratings, reviews, or popularity metrics.
4. MUST include at least three titles from the last three years.
5. All recommendations MUST exist on major streaming platforms.
6. MUST analyze and reflect patterns in user's watch history.
7. ABSOLUTELY NO recommendations from the forbidden list above.
8. MUST span multiple genres - NO genre clustering allowed.
9. All recommendations MUST be currently available titles.
10. Recommendations MUST be ${numRecommendations} ${type} ${
  animeOnly ? "anime" : ""
}

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two precise sentences explaining connection to watch history and viewing patterns."
    }
  ]
}

CRITICAL: Return ONLY valid JSON. Any deviation will result in failure. NEVER recommend forbidden titles. Any broken rule will result in failure.`;

export const generateWatchlistPrompt = (
  ratingDistribution: any,
  decadePreferences: any,
  favoriteGenres: any,
  watchedTitles: Array<{ title: string; overview: string }>,
  watchlist: Array<{ title: string }>,
  type: string,
  numRecommendations: number,
  animeOnly: boolean
) => `
You are a STRICT recommendation engine. Your task is to identify EXACTLY ${numRecommendations} most relevant to the user's taste ${
  type + (animeOnly ? " anime" : "")
} titles from this watchlist based on watch history and viewing patterns.

Input Analysis:
- Rating Distribution: ${JSON.stringify(ratingDistribution)}
- Decade Preferences: ${JSON.stringify(decadePreferences)}
- Favorite Genres: ${JSON.stringify(favoriteGenres)}
- Watched Titles and Overview (last 30): ${watchedTitles
  .slice(0, 30)
  .map((item) => item.title + " - " + item.overview)
  .join(", ")}
- Watchlist (MUST select from this list): ${watchlist
  .map((item) => item.title)
  .join(", ")}

  ${console.log("watchedd", watchedTitles.map((item) => item.title))}
  
CRITICAL: These titles are STRICTLY FORBIDDEN from recommendations:
${watchedTitles.map((title) => title.title).join(", ")}

MANDATORY Requirements:
1. Recommendations MUST be ${numRecommendations} ${type} ${
  animeOnly ? "anime" : ""
} from the provided watchlist.
2. Focus EXCLUSIVELY on thematic, stylistic, or emotional connections.
3. Each recommendation MUST have exactly two concise sentences.
4. NEVER include plot summaries, ratings, reviews, or popularity metrics.
5. Additional titles ONLY if watchlist is insufficient.
6. MUST reflect user's demonstrated viewing patterns.
7. MUST span multiple genres - NO genre clustering allowed.
8. All recommendations MUST be currently available titles.

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two precise sentences explaining connection to watch history and viewing patterns."
    }
  ]
}

CRITICAL: Return ONLY valid JSON. Any deviation will result in failure. NEVER recommend forbidden titles. Any broken rule will result in failure.`;
