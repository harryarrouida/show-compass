interface WatchedTitleWithRating {
  title: string;
  overview: string;
  userRating?: number;
}

interface MediaDetails {
  title: string;
  overview: string;
  genres: Array<{ name: string }>;
  release_date: string;
  vote_average: number;
}

interface WatchlistItem {
  title: string;
  overview?: string;
}

interface RatingDistribution {
  high?: number;
  medium?: number;
  low?: number;
}

interface FilterOptions {
  lengthPreference?: "short" | "medium" | "long";
  status?: "ongoing" | "completed" | "both";
  minimumRating?: number;
}

// ===== HELPER FUNCTIONS =====

const extractUserEssentials = (
  watchedTitles: WatchedTitleWithRating[],
  favoriteGenres: string[],
  ratingDistribution: RatingDistribution
) => {
  const topGenres = favoriteGenres.slice(0, 3);

  const highestRated = watchedTitles
    .filter(title => title.title && title.overview)
    // .sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
    // .slice(0, 5);

  let emotionalProfile = "varied emotional experiences";
  if (ratingDistribution) {
    const { high = 0, medium = 0, low = 0 } = ratingDistribution;
    if (high > medium && high > low) {
      emotionalProfile = "deeply moving, transformative experiences that resonate long after viewing";
    } else if (medium > high && medium > low) {
      emotionalProfile = "consistently engaging and emotionally satisfying content";
    } else if (low > high && low > medium) {
      emotionalProfile = "diverse emotional journeys, even unconventional ones";
    }
  }

  return { topGenres, highestRated, emotionalProfile };
};

const buildConstraintsSection = (
  watchedTitles: WatchedTitleWithRating[],
  animeOnly: boolean,
  filters?: FilterOptions
) => {
  const constraints = [];
  
  if (watchedTitles.length > 0) {
    constraints.push(`• **CRITICAL: NEVER recommend any of these already-watched titles:** ${watchedTitles.map(t => `"${t.title}"`).join(", ")}`);
  }
  
  constraints.push(`• **Content Type:** ${animeOnly ? "ONLY anime/animation" : "NO anime/animation - live-action only"}`);
  
  if (filters?.lengthPreference) {
    const lengthMap = {
      short: "Short series (max 12 episodes)",
      medium: "Medium series (12-24 episodes)", 
      long: "Long series (24+ episodes)"
    };
    constraints.push(`• **Length:** ${lengthMap[filters.lengthPreference]}`);
  }
  
  if (filters?.status) {
    const statusMap = {
      ongoing: "Currently airing series only",
      completed: "Completed series only",
      both: "Both ongoing and completed series"
    };
    constraints.push(`• **Status:** ${statusMap[filters.status]}`);
  }
  
  if (filters?.minimumRating) {
    constraints.push(`• **Quality Standard:** Minimum ${filters.minimumRating}/10 rating`);
  }
  
  constraints.push("• **Diversity:** Ensure all recommendations offer distinct emotional experiences and avoid repetitive suggestions");
  
  return constraints.join("\n");
};

// ===== 1. GENERAL RECOMMENDATIONS (USER HISTORY-BASED) =====
export const generateTraktRecommendationsPrompt = (
  watchedTitles: WatchedTitleWithRating[],
  favoriteGenres: string[],
  decadePreferences: any,
  ratingDistribution: RatingDistribution,
  seenTitles: string[],
  type: string,
  numRecommendations: number,
  animeOnly: boolean,
  filters?: FilterOptions
) => {
  const { topGenres, emotionalProfile } = extractUserEssentials(
    watchedTitles, 
    favoriteGenres, 
    ratingDistribution
  );

  const constraints = buildConstraintsSection(watchedTitles, animeOnly, filters);

  return `You are an expert emotional curator and recommendation engine. Your mission is to find ${numRecommendations} ${type} that will deliver the same **emotional fulfillment and deeply satisfying viewing experience** as the user's most cherished content.

USER'S EMOTIONAL PROFILE:
• **Core Genres:** ${topGenres.join(", ")}
• **Emotional Preference:** Seeks ${emotionalProfile}
• **Viewing Philosophy:** Values content that creates lasting emotional impact and meaningful connections

CONSTRAINTS:
${constraints}

RECOMMENDATION PHILOSOPHY:
Focus on the **emotional journey and psychological satisfaction** each title provides. Think: "This recommendation will make the user feel the same way their favorite content does - whether that's wonder, excitement, catharsis, or deep contemplation."

Consider:
- What emotions does this content evoke?
- How does it make viewers feel during and after watching?
- What kind of emotional or intellectual satisfaction does it provide?
- Does it create the same sense of connection and engagement?

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Compelling explanation focused on the emotional experience and psychological satisfaction this content delivers, matching the user's proven taste for deeply resonant storytelling."
    }
  ]
}

Return ONLY valid JSON. Focus on emotional resonance over plot similarities.`;
};

// ===== 2. WATCHLIST RECOMMENDATIONS (SELECT FROM WATCHLIST) =====
export const generateWatchlistPrompt = (
  ratingDistribution: RatingDistribution,
  decadePreferences: any,
  favoriteGenres: string[],
  watchedTitles: WatchedTitleWithRating[],
  watchlist: WatchlistItem[],
  type: string,
  numRecommendations: number,
  animeOnly: boolean,
  filters?: FilterOptions
) => {
  const { topGenres, highestRated, emotionalProfile } = extractUserEssentials(
    watchedTitles, 
    favoriteGenres, 
    ratingDistribution
  );

  const watchlistDisplay = watchlist.length
    ? watchlist.map(item => 
        `"${item.title}"${item.overview ? ` - ${item.overview.substring(0, 60)}...` : ''}`
      ).join("\n")
    : "No watchlist items provided.";

  const constraints = buildConstraintsSection(watchedTitles, animeOnly, filters);

  return `You are an expert emotional curator. From this user's watchlist, select ${numRecommendations} ${type} titles that will provide the most **emotionally satisfying and fulfilling viewing experiences** based on their proven taste preferences.

USER'S EMOTIONAL BLUEPRINT:
• **Favorite Genres:** ${topGenres.join(", ")}
• **Highest Rated Content:** ${highestRated.map(t => `"${t.title}" (${t.userRating || 'loved'}/10)`).join(", ")}
• **Emotional Preference:** Craves ${emotionalProfile}
• **What They Value:** Content that creates deep emotional connections and lasting impact

WATCHLIST OPTIONS (Choose ONLY from these):
${watchlistDisplay}

CONSTRAINTS:
${constraints}

CURATION STRATEGY:
Analyze each watchlist item for its **emotional potential and psychological resonance**. Ask yourself:
- Which titles will create the most meaningful emotional experience?
- What feelings will these evoke that match their established preferences?
- How will these satisfy their craving for ${emotionalProfile}?

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title from Watchlist",
      "reason": "Focus on the emotional journey and psychological satisfaction this watchlist item will provide, explaining why it matches their proven taste for deeply resonant content."
    }
  ]
}

Return ONLY valid JSON. Prioritize emotional resonance over surface-level genre matching.`;
};

// ===== 3. MEDIA-SPECIFIC RECOMMENDATIONS =====
export const generateDefaultPrompt = (
  mediaDetails: MediaDetails,
  type: string,
  numRecommendations: number = 8
) => {
  const genres = mediaDetails.genres.map(g => g.name).join(", ");
  const year = new Date(mediaDetails.release_date).getFullYear();

  return `You are an expert in emotional storytelling and content curation. Generate ${numRecommendations} ${type} recommendations that deliver the same **emotional resonance and psychological satisfaction** as the source content.

SOURCE CONTENT ANALYSIS:
• **Title:** "${mediaDetails.title}"
• **Emotional Core:** "${mediaDetails.overview}"
• **Genre Elements:** ${genres}
• **Era:** ${year}
• **Audience Connection:** ${mediaDetails.vote_average}/10

EMOTIONAL MATCHING STRATEGY:
Focus on the **feelings, atmosphere, and emotional journey** rather than surface plot similarities. Consider:
- What emotions does the source content evoke?
- What psychological needs does it fulfill?
- How does it make viewers feel during and after the experience?
- What kind of emotional catharsis or satisfaction does it provide?

Find content that creates the same **emotional state and viewing satisfaction**. Think: "If the source content made you feel [specific emotion/experience], these recommendations will give you that same feeling through different but equally powerful storytelling."

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Clear explanation of the emotional experience this provides and why it creates the same psychological satisfaction as the source content, emphasizing the feelings and atmosphere it evokes."
    }
  ]
}

Return ONLY valid JSON. Focus on emotional resonance over plot mechanics.`;
};

// ===== 4. CUSTOM CHAT RECOMMENDATIONS =====
export const generateCustomPrompt = (
  details: Partial<MediaDetails>,
  type: string,
  prompt: string,
  numRecommendations: number = 10
) => {
  const hasBaseMedia = details?.title;
  const baseContext = hasBaseMedia ?
    `EMOTIONAL CONTEXT FROM BASE CONTENT:
• **Title:** "${details.title}"
• **Emotional Foundation:** "${details.overview || "N/A"}"
• **Genre Atmosphere:** ${details.genres?.map(g => g.name).join(", ") || "N/A"}
• **Era/Setting:** ${details.release_date ? new Date(details.release_date).getFullYear() : "N/A"}
• **Audience Resonance:** ${details.vote_average || "N/A"}/10` :
    "NO BASE CONTENT PROVIDED. Focus entirely on fulfilling the user's emotional and experiential request.";

  return `You are an expert emotional curator and content specialist. Generate ${numRecommendations} ${type} recommendations that perfectly fulfill the user's specific request, focusing on the **desired emotional experience and psychological satisfaction**.

${baseContext}

USER'S EMOTIONAL REQUEST:
"${prompt}"

APPROACH:
Analyze the user's request for the underlying **emotional needs and experiential desires**. Consider:
- What feelings are they seeking?
- What kind of emotional journey do they want?
- What psychological satisfaction are they craving?
- How can you match their desired emotional state?

Focus on content that will create the **exact emotional experience** they're seeking, whether that's excitement, contemplation, catharsis, wonder, or any other feeling.

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Direct explanation of how this content fulfills their emotional request, focusing on the feelings, atmosphere, and psychological satisfaction it provides rather than just plot elements."
    }
  ]
}

Return ONLY valid JSON. Prioritize emotional fulfillment over literal interpretation.`;
}