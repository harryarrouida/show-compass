export const RECOMMENDATION_RULES = {
  baseRules: [
    "Each reason must be exactly two sentences and emphasize a direct connection to the user's taste.",
    "Avoid mentioning ratings, reviews, or popularity.",
    "Focus on thematic, stylistic, or emotional connections that align with user preferences.", 
    "Include at least one title released in the last 5 years.",
    "Avoid plot summaries and franchise titles unless the connection is exceptionally strong.",
    "Avoid mentioning the user's watch history.",
    "Avoid mentioning the user's favorite genres.", 
    "each reason must be unique and not repeat the same reason for different titles, with 2 sentences max"
  ],
  connectionTypes: [
    "Shared themes or philosophical questions.",
    "Comparable narrative structure or character arcs.",
    "Matching emotional tone, atmosphere, or pacing.",
    "Similar visual style, technical craftsmanship, or artistic approach."
  ],
  avoidance: [
    "Direct plot recaps or generic descriptions.",
    "Titles from the same franchise unless uniquely relevant.",
    "Obscure or inaccessible titles unless clearly justified.",
    "Repetition of details from the user's input."
  ],
};

export const generateDefaultPrompt = (
  mediaDetails: {
    title: string;
    overview: string;
    genres: Array<{name: string}>;
    release_date: string;
    vote_average: number;
  },
  type: string,
  numRecommendations: number = 6
) => `
Based on this ${type}:
Title: "${mediaDetails.title}"
Description: "${mediaDetails.overview}"
Genres: ${mediaDetails.genres.map((g) => g.name).join(", ")}
Release Year: ${new Date(mediaDetails.release_date).getFullYear()}
Average Rating: ${mediaDetails.vote_average}

Generate exactly ${numRecommendations} recommendations that deeply resonate with the user's preferences based on this ${type}.
Respond with ONLY a clean JSON object in this exact format:
{
    "recommendations": [
        {
            "title": "Title",
            "reason": "Two sharp, concise sentences that highlight specific thematic, stylistic, or emotional connections to '${mediaDetails.title}'. Use evocative language to capture the essence of the match."
        }
    ]
}

Rules for recommendations:
${RECOMMENDATION_RULES.baseRules.map((rule) => `- ${rule}`).join("\n")}

Focus on connections like:
${RECOMMENDATION_RULES.connectionTypes.map((type) => `- ${type}`).join("\n")}

Avoid:
${RECOMMENDATION_RULES.avoidance.map((item) => `- ${item}`).join("\n")}

Remember: Return ONLY the JSON object with no additional text or explanation.`;

export const generateCustomPrompt = (
  details: {
    title?: string;
    overview?: string;
    genres?: Array<{name: string}>;
    release_date?: string;
    vote_average?: number;
  },
  type: string,
  prompt: string,
  numRecommendations: number = 6
) => `
Based on this ${type}:
Title: "${details?.title}"
Overview: "${details?.overview}"
Genres: ${details?.genres?.map((g) => g.name).join(", ")}
Release Year: ${new Date(details?.release_date || "").getFullYear()}
Rating: ${details?.vote_average}

User Question: "${prompt}"

Generate exactly ${numRecommendations} recommendations that address the user's question and align with their preferences.
Respond with ONLY a clean JSON object in this exact format:
{
    "recommendations": [
        {
            "title": "Title",
            "reason": "Two precise, thoughtful sentences that connect this recommendation to both the original ${type} and the user's request. Focus on themes, style, and relevant artistic or emotional elements."
        }
    ]
}

Rules for recommendations:
${RECOMMENDATION_RULES.baseRules.map((rule) => `- ${rule}`).join("\n")}

Remember: Return ONLY the JSON object with no additional text or explanation.`;

export const generateTraktRecommendationsPrompt = (
  sortedContent: any[],
  watchedTitles: string[],
  favoriteGenres: string[],
  decadePreferences: any,
  ratingDistribution: any,
  seen: string[],
  type: string,
  numRecommendations: number
) => `
Based on the user's watch history, generate ${numRecommendations} highly personalized ${type} recommendations.
Consider their favorite genres (${favoriteGenres.join(
    ", "
  )}), decade preferences, and rating patterns.
Exclude these titles: ${watchedTitles.join(", ")} and ${seen.join(", ")}.

Respond with ONLY valid JSON in this format:
{
    "recommendations": [
        {
            "title": "Title",
            "reason": "Two highly personalized sentences that explain why this ${type} perfectly matches the user's taste. Highlight thematic, stylistic, or emotional connections while avoiding generic language."
        }
    ]
}`;

export const generateWatchlistPrompt = (
  watchedContent: Array<{title: string}>,
  watchlist: Array<{title: string}>,
  type: string,
  numRecommendations: number
) => `
Based on the user's watched content (${watchedContent
    .map((item) => item.title)
    .join(", ")}), identify the ${numRecommendations} most relevant titles from their watchlist (${watchlist
    .map((item) => item.title)
    .join(", ")}).

Rules for recommendations:
${RECOMMENDATION_RULES.baseRules.map((rule) => `- ${rule}`).join("\n")}

Focus on connections like:
${RECOMMENDATION_RULES.connectionTypes.map((type) => `- ${type}`).join("\n")}

Avoid:
${RECOMMENDATION_RULES.avoidance.map((item) => `- ${item}`).join("\n")}

Respond with valid JSON in this format:
{
    "recommendations": [
        {
            "title": "Title",
            "reason": "Two personalized sentences explaining why this title aligns with the user's watch history and tastes."
        }
    ]
}`;
