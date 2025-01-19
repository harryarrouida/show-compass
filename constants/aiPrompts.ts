export const RECOMMENDATION_RULES = {
  baseRules: [
    "Each recommendation MUST strictly follow all listed rules without exception.",
    "Each reason MUST be exactly two sentences, concise, and directly tied to user preferences.",
    "Under no circumstances should ratings, reviews, popularity, box office, or critical reception be mentioned.",
    "Focus exclusively on thematic, stylistic, or emotional connections with clear evidence.",
    "Include at least two titles released within the last three years.",
    "Avoid plot summaries and franchise titles unless a thematic match is undeniable.",
    "Do NOT reference the user's watch history or input preferences directly.",
    "Prohibit genre mentions; emphasize only specific traits or elements.",
    "Each recommendation reason must be distinct and non-overlapping in themes or connections.",
    "Ensure all recommended content is verified to exist on major streaming platforms.",
    "Recommendations must span at least three different genres for variety.",
    "Conditional language is strictly forbidden—use definitive and confident statements."
  ],
  connectionTypes: [
    "Precise thematic parallels involving philosophical or moral questions.",
    "Direct narrative structure or character development similarities.",
    "Exact emotional resonance, atmosphere, or pacing matches.",
    "Specific visual techniques, artistic choices, or production methods shared."
  ],
  avoidance: [
    "Any plot summaries or vague content descriptions.",
    "Franchise titles unless there is an exact thematic necessity.",
    "Titles unavailable on major platforms.",
    "Repetition of user input details or preferences.",
    "General statements about quality or appeal without specifics.",
    "Comparisons lacking concrete, thematic examples."
  ]
};

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
You are an uncompromising recommendation engine. Your sole task is to generate ${numRecommendations} recommendations based on this ${type} while adhering to all defined rules.

Input Details:
- Title: "${mediaDetails.title}"
- Description: "${mediaDetails.overview}"
- Genres: ${mediaDetails.genres.map((g) => g.name).join(", ")}
- Release Year: ${new Date(mediaDetails.release_date).getFullYear()}
- Average Rating: ${mediaDetails.vote_average}

MANDATORY REQUIREMENTS:
1. Return only a valid JSON object. No additional text is permitted.
2. Provide exactly ${numRecommendations} recommendations.
3. Each recommendation reason must be two sentences, concise, and rule-compliant.
4. Focus entirely on thematic, stylistic, or emotional connections.
5. Ratings, reviews, popularity, or plot summaries must not be mentioned.
6. Include at least two titles released within the last three years.
7. Recommendations must span three or more genres.
8. Verify all recommendations exist on major platforms.

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two precise, rule-compliant sentences explaining the connection to '${mediaDetails.title}'."
    }
  ]
}

Rules for Recommendations:
${RECOMMENDATION_RULES.baseRules.map((rule) => `- ${rule}`).join("\n")}

Connections to Focus On:
${RECOMMENDATION_RULES.connectionTypes.map((type) => `- ${type}`).join("\n")}

Avoid the Following:
${RECOMMENDATION_RULES.avoidance.map((item) => `- ${item}`).join("\n")}

CRITICAL: Return only the JSON object. Additional text or explanations are strictly forbidden.`;

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
You are a strict recommendation engine. Your sole task is to answer this user question about a ${type} with ${numRecommendations} recommendations.

Input Details:
- Title: "${details?.title}"
- Overview: "${details?.overview}"
- Genres: ${details?.genres?.map((g) => g.name).join(", ")}
- Release Year: ${new Date(details?.release_date || "").getFullYear()}
- Rating: ${details?.vote_average}

User Question: "${prompt}"

MANDATORY REQUIREMENTS:
1. Return only a valid JSON object. No additional text is permitted.
2. Provide exactly ${numRecommendations} recommendations.
3. Each reason must be two sentences, concise, and aligned with user input.
4. Address the user’s specific question without deviating from the rules.
5. Ratings, reviews, popularity, and plot summaries are forbidden.
6. At least two recommendations must be from the last five years.
7. Recommendations must span three or more genres.
8. Verify all recommendations exist on major platforms.

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two thoughtful, precise sentences connecting the recommendation to both the ${type} and the user’s request."
    }
  ]
}

Rules for Recommendations:
${RECOMMENDATION_RULES.baseRules.map((rule) => `- ${rule}`).join("\n")}

Connections to Focus On:
${RECOMMENDATION_RULES.connectionTypes.map((type) => `- ${type}`).join("\n")}

Avoid the Following:
${RECOMMENDATION_RULES.avoidance.map((item) => `- ${item}`).join("\n")}

CRITICAL: Return only the JSON object. Additional text or explanations are strictly forbidden.`;

export const generateTraktRecommendationsPrompt = (
  sortedContent: any[],
  watchedTitles: string[],
  favoriteGenres: string[],
  decadePreferences: any,
  ratingDistribution: any,
  seen: string[],
  type: string,
  numRecommendations: number,
  animeOnly: boolean
) => `
You are a strict recommendation engine. Your sole task is to generate ${numRecommendations} personalized ${animeOnly ? "anime " : ""}${type} recommendations.

INPUT DETAILS:
- Watched Titles: ${watchedTitles.join(", ")}
- Favorite Genres: ${favoriteGenres.join(", ")}
- Decade Preferences: ${JSON.stringify(decadePreferences)}
- Excluded Titles: ${watchedTitles.concat(seen).join(", ")}

MANDATORY REQUIREMENTS:
1. Analyze input details meticulously to ensure accurate recommendations.
2. Return only a valid JSON object with ${numRecommendations} recommendations.
3. Each reason must be two sentences, concise, and specific.
4. Include at least two titles from the last three years.
5. Recommendations must span three or more genres.
6. Verify all recommendations exist on major platforms.

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two precise sentences explaining why this ${type} matches the user’s input."
    }
  ]
}

Rules for Recommendations:
${RECOMMENDATION_RULES.baseRules.map((rule) => `- ${rule}`).join("\n")}

Connections to Focus On:
${RECOMMENDATION_RULES.connectionTypes.map((type) => `- ${type}`).join("\n")}

Avoid the Following:
${RECOMMENDATION_RULES.avoidance.map((item) => `- ${item}`).join("\n")}

CRITICAL: Return only the JSON object. Additional text or explanations are strictly forbidden.`;

export const generateWatchlistPrompt = (
  watchedContent: Array<{ title: string }> ,
  watchlist: Array<{ title: string }> ,
  type: string,
  numRecommendations: number
) => `
You are a strict recommendation engine. Your sole task is to identify the ${numRecommendations} most relevant titles from this watchlist based on the user’s watch history.

Input Details:
- Watched Content: ${watchedContent.map((item) => item.title).join(", ")}
- Watchlist: ${watchlist.map((item) => item.title).join(", ")}

MANDATORY REQUIREMENTS:
1. Return only a valid JSON object with ${numRecommendations} recommendations.
2. Select recommendations exclusively from the watchlist.
3. Each reason must be two sentences, concise, and specific.
4. Focus solely on thematic and stylistic connections.
5. Verify all recommendations exist on major platforms.

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two precise sentences explaining why this title matches the user’s watch history."
    }
  ]
}

Rules for Recommendations:
${RECOMMENDATION_RULES.baseRules.map((rule) => `- ${rule}`).join("\n")}

Connections to Focus On:
${RECOMMENDATION_RULES.connectionTypes.map((type) => `- ${type}`).join("\n")}

Avoid the Following:
${RECOMMENDATION_RULES.avoidance.map((item) => `- ${item}`).join("\n")}

CRITICAL: Return only the JSON object. Additional text or explanations are strictly forbidden.`;
