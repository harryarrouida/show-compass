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
) => `Provide ${numRecommendations} ${type} recommendations similar to the input media, formatted as JSON.

Input Media:
{
  "title": "${mediaDetails.title}",
  "overview": "${mediaDetails.overview}",
  "genres": "${mediaDetails.genres.map((g) => g.name).join(", ")}",
  "release_year": ${new Date(mediaDetails.release_date).getFullYear()},
  "rating": ${mediaDetails.vote_average}
}

Output Format:
{
  "recommendations": [
    { "title": "Title", "reason": "Short Detailed explanation of why this recommendation matches the original media, including similar themes, tone, genre elements, and key aspects that viewers would appreciate." }
  ]
}

CRITICAL: Return only JSON; extra text will cause failure.`;

// ======================================
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
  numRecommendations: number = 10
) => `Generate ${numRecommendations} ${type} recommendations based on this media and user request.

Input Media:
- Title: "${details?.title || "N/A"}"
- Overview: "${details?.overview || "N/A"}"
- Genres: ${details?.genres?.map((g) => g.name).join(", ") || "N/A"}
- Release Year: ${
  details?.release_date ? new Date(details?.release_date).getFullYear() : "N/A"
}
- Rating: ${details?.vote_average || "N/A"}

User's Request: "${prompt}"

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Short and detailed explanation of why this recommendation matches the original media and user's prompt, including similar themes, tone, genre elements, and key aspects that viewers would appreciate."
    }
  ]
}

CRITICAL: Return only valid JSON.`;

// ======================================
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
) => `Generate ${numRecommendations} personalized ${type}${
  animeOnly ? " anime" : ""
} recommendations based on viewing patterns to match exactly what they would like to watch.

Recent Watch History:
${watchedTitles
  .slice(0, 30)
  .map((t) => t.title)
  .join(", ")}

User Preferences:
- Genres: ${favoriteGenres.join(", ")}
- Decades: ${JSON.stringify(decadePreferences)}
- Ratings: ${JSON.stringify(ratingDistribution)}
- No already watched content: ${watchedTitles.map((t) => t.title).join(", ")}

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Short and detailed explanation of why this recommendation matches the user's preferences, including similar themes, tone, genre elements, and key aspects that viewers would appreciate."
    }
  ]
}

Return ONLY valid JSON, any extra text will cause failure.`;

export const generateWatchlistPrompt = (
  ratingDistribution: any,
  decadePreferences: any,
  favoriteGenres: any,
  watchedTitles: Array<{ title: string; overview: string }>,
  watchlist: Array<{ title: string }>,
  type: string,
  numRecommendations: number,
  animeOnly: boolean
) => `Generate ${numRecommendations} personalized ${type}${
  animeOnly ? " anime" : ""
} recommendations from the user's watchlist based on their viewing patterns to match exactly what they would like to watch.

User Profile:
- Ratings: ${JSON.stringify(ratingDistribution)}
- Decades: ${JSON.stringify(decadePreferences)}
- Genres: ${JSON.stringify(favoriteGenres)}

Watch History:
${watchedTitles
  .slice(0, 30)
  .map((t) => t.title)
  .join(", ")}

Watchlist (to be selected from):
${watchlist.map((item) => item.title).join(", ")}

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Short and detailed explanation of why this recommendation matches the user's preferences, including similar themes, tone, genre elements, and key aspects that viewers would appreciate."
    }
  ]
}

Return ONLY valid JSON.`;
