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
You are a strict recommendation engine. Your task is to generate ${numRecommendations} recommendations for this ${type} based on the input details. Follow these rules for each recommendation:

1. Focus exclusively on thematic, stylistic, or emotional connections.
2. Provide concise, two-sentence reasons for each recommendation.
3. Avoid plot summaries, ratings, reviews, or popularity metrics.
4. Include at least two titles released in the last three years.
5. Ensure all recommendations span multiple genres and exist on major streaming platforms.

Input Details:
- Title: "${mediaDetails.title}"
- Overview: "${mediaDetails.overview}"
- Genres: ${mediaDetails.genres.map((g) => g.name).join(", ")}
- Release Year: ${new Date(mediaDetails.release_date).getFullYear()}
- Average Rating: ${mediaDetails.vote_average}

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two precise sentences explaining the connection."
    }
  ]
}

Example Recommendation:
{
  "title": "Inception",
  "reason": "This movie explores similar philosophical questions about reality and perception, coupled with an intricate narrative structure."
}

CRITICAL: Return only a valid JSON object. Additional text is forbidden.`;

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
You are a strict recommendation engine. Your task is to answer this user question about a ${type} with ${numRecommendations} recommendations.

Input Details:
- Title: "${details?.title}"
- Overview: "${details?.overview}"
- Genres: ${details?.genres?.map((g) => g.name).join(", ")}
- Release Year: ${new Date(details?.release_date || "").getFullYear()}
- Rating: ${details?.vote_average}

User Question: "${prompt}"

Key Requirements:
1. Focus on thematic, stylistic, or emotional connections.
2. Provide concise, two-sentence reasons addressing the user's question.
3. Avoid plot summaries, ratings, reviews, or popularity metrics.
4. Include at least two titles from the last three years.
5. Ensure recommendations span multiple genres and exist on major platforms.

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two precise sentences connecting to both the ${type} and user's request."
    }
  ]
}

CRITICAL: Return only a valid JSON object. Additional text is forbidden.`;

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
You are a strict recommendation engine. Your task is to generate ${numRecommendations} personalized ${
  type + (animeOnly ? " anime" : "")
} recommendations based on the user's watch history.

Input Analysis:
- Watched Titles and Overview: ${watchedTitles
  .map((title) => title.title + " - " + title.overview)
  .join(", ")}
- Favorite Genres: ${favoriteGenres.join(", ")}
- Decade Preferences: ${JSON.stringify(decadePreferences)}
- Rating Distribution: ${JSON.stringify(ratingDistribution)}

IMPORTANT: Do NOT recommend any of these already watched titles:
${watchedTitles.map((title) => title.title).join(", ")}

Key Requirements:
1. Focus on thematic, stylistic, or emotional connections to watched content.
2. Provide concise, two-sentence reasons for each recommendation.
3. Avoid plot summaries, ratings, reviews, or popularity metrics.
4. Include at least two titles from the last three years.
5. Ensure recommendations span multiple genres and exist on major platforms.
6. Analyze patterns in the user's watch history to inform recommendations.
7. NEVER recommend any titles from the already watched list above.
8. genres should be varied and not just the same main genre

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two precise sentences explaining connection to watch history and viewing patterns."
    }
  ]
}

CRITICAL: Return only a valid JSON object. Additional text is forbidden. Do not recommend any titles that appear in the already watched list.`;

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
You are a strict recommendation engine. Your task is to identify the ${numRecommendations} most relevant ${
  type + (animeOnly ? " anime" : "")
} titles from this watchlist based on watch history and viewing patterns.

Input Analysis:
- Rating Distribution: ${JSON.stringify(ratingDistribution)}
- Decade Preferences: ${JSON.stringify(decadePreferences)}
- Favorite Genres: ${JSON.stringify(favoriteGenres)}
- Watched Titles and Overview: ${watchedTitles
  .map((item) => item.title + " - " + item.overview)
  .join(", ")}
- Excluded Titles: ${watchedTitles.map((item) => item.title).join(", ")}
- Watchlist: ${watchlist.map((item) => item.title).join(", ")}

Key Requirements:
1. Select recommendations primarily from the watchlist.
2. Focus on thematic, stylistic, or emotional connections to watched content.
3. Provide concise, two-sentence reasons for each recommendation.
4. Avoid plot summaries, ratings, reviews, or popularity metrics.
5. If watchlist content is insufficient, recommend additional relevant titles.
6. Consider patterns and preferences shown in watch history.
7. genres should be varied and not just the same main genre

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two precise sentences explaining connection to watch history and viewing patterns."
    }
  ]
}

CRITICAL: Return only a valid JSON object. Additional text is forbidden.`;
