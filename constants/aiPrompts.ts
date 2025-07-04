// Assuming analyzeViewingPatterns eventually provides this structure
interface WatchedTitleWithRating {
  title: string;
  overview: string;
  userRating?: number; // Added for explicit user rating
}

// ===== HELPER FUNCTIONS =====

// Extract user's core preferences efficiently
const extractUserEssentials = (
  watchedTitles: Array<WatchedTitleWithRating>, // Now expecting userRating
  favoriteGenres: string[],
  ratingDistribution: { high?: number; medium?: number; low?: number } // Assuming these are counts
) => {
  // Get top 3 genres
  const topGenres = favoriteGenres.slice(0, 3);

  // Get highest rated titles: PRIORITIZE titles with explicit userRating
  // If userRating is present, sort by it. Otherwise, use what's provided, assuming some preference order.
  const highestRated = watchedTitles
    .filter(title => title.title && title.overview)
    .sort((a, b) => (b.userRating || 0) - (a.userRating || 0)) // Sort by userRating, highest first
    .slice(0, 5); // Top 5 for context

  // Simple preference indicators based on rating distribution counts
  let qualityLevel = "generally good"; // Default
  if (ratingDistribution) {
    const { high = 0, medium = 0, low = 0 } = ratingDistribution;
    if (high > medium && high > low) {
      qualityLevel = "high-quality, critically acclaimed, and deeply satisfying";
    } else if (medium > high && medium > low) {
      qualityLevel = "solid, consistently enjoyable, and well-made";
    } else if (low > high && low > medium) {
      qualityLevel = "diverse and entertaining (even if not always highly rated)";
    }
  }

  return { topGenres, highestRated, qualityLevel };
};

// ===== 1. GENERAL RECOMMENDATIONS (USER HISTORY-BASED) =====
export const generateTraktRecommendationsPrompt = (
  watchedTitles: Array<WatchedTitleWithRating>, // Now expecting userRating for better highestRated
  favoriteGenres: string[],
  decadePreferences: any, // Potentially integrate this into prompt later if useful
  ratingDistribution: { high?: number; medium?: number; low?: number },
  seenTitles: string[], // Renamed from 'seen' for clarity
  type: string,
  numRecommendations: number,
  animeOnly: boolean,
  lengthPreference?: "short" | "medium" | "long",
  episodeCount?: { min?: number; max?: number },
  status?: "ongoing" | "completed" | "both",
  minimumRating?: number // Assuming this is a global rating (e.g., TMDB average)
) => {
  const { topGenres, highestRated, qualityLevel } = extractUserEssentials(watchedTitles, favoriteGenres, ratingDistribution);

  const ex = watchedTitles.length
    ? `• **CRITICAL: NEVER recommend any of the following titles, as the user has already watched them:** ${watchedTitles.map(t => `"${t.title}"`).join(", ")}.` // Emphasize avoidance even more
    : "";

  return `You are an expert recommendation engine. Generate ${numRecommendations} ${type}${animeOnly ? " anime" : ""} recommendations that will give the user the same **emotional satisfaction and overall viewing experience** as their favorite content.

USER'S TASTE PROFILE:
• Favorite genres: ${topGenres.join(", ")}
• Quality preference: Prefers ${qualityLevel} content.

CONSTRAINTS (Adhere to all applicable constraints strictly):
${ex}
• **Ensure all recommendations are diverse; do not recommend variations of the same title or repeatedly reference a single favorite in your reasons.**

RECOMMENDATION STRATEGY:
Find content that delivers the same **emotional payoff and viewing satisfaction** as their favorites. Focus on "if you loved X, you'll love Y because it offers a similar [emotional tone/narrative style/viewing experience]."
• **IMPORTANT: Reasons should ONLY refer to the user's overall taste profile and preferences, NOT compare the recommendation to a specific watched title.**

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Brief, compelling explanation of why this specifically delivers similar emotional payoff and viewing experience, based on the user's overall taste profile, distinct from other recommendations."
    }
  ]
}

Return ONLY valid JSON. Do not include any other text, preambles, or explanations.`;
};

// ===== 2. WATCHLIST RECOMMENDATIONS (SELECT FROM WATCHLIST) =====
export const generateWatchlistPrompt = (
  ratingDistribution: { high?: number; medium?: number; low?: number },
  decadePreferences: any, // Not used in current prompt, keep for compatibility or remove
  favoriteGenres: string[],
  watchedTitles: Array<WatchedTitleWithRating>, // Now expecting userRating
  watchlist: Array<{ title: string; overview?: string }>, // Added overview for potential LLM use
  type: string,
  numRecommendations: number,
  animeOnly: boolean,
  lengthPreference?: "short" | "medium" | "long",
  episodeCount?: { min?: number; max?: number },
  status?: "ongoing" | "completed" | "both",
  minimumRating?: number
) => {
  const { topGenres, highestRated, qualityLevel } = extractUserEssentials(watchedTitles, favoriteGenres, ratingDistribution);

  const watchlistItemsString = watchlist.length
    ? watchlist.map(item => `"${item.title}"${item.overview ? ` (${item.overview.substring(0, 50)}...)` : ''}`).join(", ")
    : "No items provided in watchlist.";

  return `You are an expert curator. From this user's watchlist, select ${numRecommendations} ${type}${animeOnly ? " anime" : ""} titles that best match their proven taste preferences for **emotional satisfaction and overall viewing quality**.

USER'S PROVEN TASTE:
• Favorite genres: ${topGenres.join(", ")}
• Content they rated highest: ${highestRated.map(t => `"${t.title}" (rated ${t.userRating || 'N/A'})`).join(", ")}
• Quality standard: Prefers ${qualityLevel} content.

WATCHLIST OPTIONS (Choose ONLY from these titles):
${watchlistItemsString}

SELECTION CRITERIA:
Carefully pick titles *only* from the provided watchlist that are most likely to deliver the same **emotional payoff and quality experience** as their existing favorites.
• **Ensure selected recommendations are diverse within the watchlist; do not recommend very similar items or focus on just one aspect.**
• **IMPORTANT: Reasons should ONLY refer to the user's overall taste profile and preferences, NOT compare the recommendation to a specific watched title.**

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title from Watchlist",
      "reason": "Concise explanation of why this watchlist item matches their proven taste profile and will deliver similar satisfaction to their favorites, highlighting its unique appeal."
    }
  ]
}

Return ONLY valid JSON. Do not include any other text, preambles, or explanations.`;
};

// ===== 3. MEDIA-SPECIFIC RECOMMENDATIONS =====
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
) => {
  const genres = mediaDetails.genres.map(g => g.name).join(", ");
  const year = new Date(mediaDetails.release_date).getFullYear();

  return `You are an expert content matcher. Generate ${numRecommendations} ${type} recommendations that deliver the same **overall viewing experience and emotional tone** as the input content.

SOURCE CONTENT:
• Title: "${mediaDetails.title}"
• Overview: "${mediaDetails.overview}"
• Genres: ${genres}
• Release Year: ${year}
• Global Rating: ${mediaDetails.vote_average}/10

MATCHING STRATEGY:
Find content that gives viewers a similar **emotional and intellectual experience**. Focus on "If you enjoyed the atmosphere and themes of [Source Title], you'll likely appreciate [Recommendation Title] because..."
• **Ensure all recommendations are diverse in their specific appeal and do not overly similar to each other.**

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Clear explanation of why this delivers a similar viewing experience and emotional satisfaction as the source content, emphasizing its distinct qualities."
    }
  ]
}

Return ONLY valid JSON.`;
};

// ===== 4. CUSTOM CHAT RECOMMENDATIONS =====
export const generateCustomPrompt = (
  details: {
    title?: string;
    overview?: string;
    genres?: Array<{ name: string }>;
    release_date?: string;
    vote_average?: number;
  },
  type: string,
  prompt: string, // The actual user query
  numRecommendations: number = 10
) => {
  const hasBaseMedia = details?.title;
  const baseContext = hasBaseMedia ?
    `BASE CONTENT DETAILS:
• Title: "${details.title}"
• Overview: "${details.overview || "N/A"}"
• Genres: ${details.genres?.map((g) => g.name).join(", ") || "N/A"}
• Release Year: ${details.release_date ? new Date(details.release_date).getFullYear() : "N/A"}
• Global Rating: ${details.vote_average || "N/A"}/10` :
    "NO SPECIFIC BASE CONTENT PROVIDED. Focus solely on the user's request.";

  return `You are an expert recommendation specialist. Generate ${numRecommendations} ${type} recommendations that perfectly fulfill the user's specific request, focusing on the **desired feeling or experience**.

${baseContext}

USER'S SPECIFIC REQUEST:
"${prompt}"

APPROACH:
Analyze the user's request, considering the base content if provided, and find titles that directly match their stated preferences, desired themes, or specific criteria, emphasizing the **emotional and experiential outcome**.
• **Provide diverse recommendations that broadly cover the user's request, avoiding overly similar suggestions.**

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Direct and concise explanation of how this content fulfills the user's specific request, highlighting relevant themes, genre elements, or tone that contribute to the desired experience."
    }
  ]
}

Return ONLY valid JSON.`;
};
