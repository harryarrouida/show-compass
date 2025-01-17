export const RECOMMENDATION_RULES = {
  baseRules: [
    "Each reason must be exactly two sentences",
    "Do not mention ratings, reviews, or popularity",
    "Focus on specific thematic or stylistic connections",
    "Include at least one title from the last 5 years",
    "Avoid direct plot summaries and franchise titles",
  ],
  connectionTypes: [
    "Similar themes or philosophical questions",
    "Comparable narrative structure",
    "Matching emotional tone or atmosphere",
    "Similar visual style or technical approach",
  ],
  avoidance: [
    "Direct plot summaries",
    "Similar titles from the same franchise",
    "Obscure titles unless particularly relevant",
    "Generic descriptions",
  ],
};

export const generateDefaultPrompt = (
  mediaDetails: any,
  type: string,
  numRecommendations: number = 6
) => `
Based on this ${type}:
Title: "${mediaDetails.title}"
Description: "${mediaDetails.overview}"
Genres: ${mediaDetails.genres.map((g: any) => g.name).join(", ")}
Release Year: ${new Date(mediaDetails.release_date).getFullYear()}
Average Rating: ${mediaDetails.vote_average}

Generate exactly ${numRecommendations} recommendations that capture the essence of this ${type}.
Respond with ONLY a clean JSON object in this exact format:
{
    "recommendations": [
        {
            "title": "Title",
            "reason": "Two clear, concise sentences that explain specific thematic or stylistic connections to ${
              mediaDetails.title
            }. Focus on narrative elements, themes, and artistic approach."
        }
    ]
}

Rules for recommendations:
${RECOMMENDATION_RULES.baseRules.map((rule) => `- ${rule}`).join("\n")}

Focus on connections like:
${RECOMMENDATION_RULES.connectionTypes.map((type) => `- ${type}`).join("\n")}

Avoid:
${RECOMMENDATION_RULES.avoidance.map((item) => `- ${item}`).join("\n")}

Remember: Return ONLY the JSON object with no additional text, markdown, or explanation.`;

export const generateCustomPrompt = (
  details: any,
  type: string,
  prompt: string,
  numRecommendations: number = 6
) => `
Based on this ${type}:
Title: "${details?.title}"
Overview: "${details?.overview}"
Genres: ${details?.genres?.map((g: any) => g.name).join(", ")}
Release Year: ${new Date(details?.release_date || "").getFullYear()}
Rating: ${details?.vote_average}

User Question: "${prompt}"

Generate exactly ${numRecommendations} recommendations that address the user's question. 
Respond with ONLY a clean JSON object in this exact format:
{
    "recommendations": [
        {
            "title": "Title",
            "reason": "Two clear, concise sentences that connect this recommendation to both the original ${type} and the user's request. Focus on themes, style, and relevant elements without mentioning ratings or repeating the user's prompt."
        }
    ]
}

Rules for recommendations:
${RECOMMENDATION_RULES.baseRules.map((rule) => `- ${rule}`).join("\n")}

Remember: Return ONLY the JSON object with no additional text, markdown, or explanation.`;

export const generateTraktRecommendationsPrompt = (
  sortedContent: any[],
  watchedTitles: string[],
  favoriteGenres: string[],
  decadePreferences: Record<string, number>,
  ratingDistribution: Record<string, number>,
  seen: string[],
  type: "movies" | "shows",
  numRecommendations: number
) => {
  return `Based on the user's watch history, generate ${numRecommendations} personalized ${type} recommendations.
    Consider their favorite genres (${favoriteGenres.join(
      ", "
    )}), decade preferences, and rating patterns.
    Exclude these titles: ${watchedTitles.join(", ")} and ${seen.join(", ")}.
    Respond with valid JSON in this format:
    {
        "recommendations": [
            {
                "title": "Movie Title",
                "reason": "Personalized reason for recommendation"
            }
        ]
    }`;
};
