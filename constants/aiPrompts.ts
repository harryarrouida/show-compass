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

// ===== ENHANCED HELPER FUNCTIONS =====

const extractUserEssentials = (
  watchedTitles: WatchedTitleWithRating[],
  favoriteGenres: string[],
  ratingDistribution: RatingDistribution
) => {
  const topGenres = favoriteGenres.slice(0, 3);

  const highestRated = watchedTitles
    .filter(title => title.title && title.overview)
    .sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
    .slice(0, 5);

  // Enhanced emotional profiling with more nuanced categories
  let emotionalProfile = "varied emotional experiences";
  let emotionalIntensity = "moderate";
  
  if (ratingDistribution) {
    const { high = 0, medium = 0, low = 0 } = ratingDistribution;
    const total = high + medium + low;
    
    if (total > 0) {
      const highPercentage = (high / total) * 100;
      const mediumPercentage = (medium / total) * 100;
      
      // Determine emotional intensity
      if (highPercentage > 60) {
        emotionalIntensity = "high - seeks profound, transformative experiences";
      } else if (mediumPercentage > 50) {
        emotionalIntensity = "balanced - appreciates consistent emotional engagement";
      } else {
        emotionalIntensity = "exploratory - open to diverse emotional journeys";
      }
      
      // Determine emotional preference
      if (high > medium && high > low) {
        emotionalProfile = "deeply moving, transformative experiences that create lasting emotional impact";
      } else if (medium > high && medium > low) {
        emotionalProfile = "consistently engaging content with reliable emotional satisfaction";
      } else if (low > high && low > medium) {
        emotionalProfile = "experimental and unconventional emotional journeys";
      } else {
        emotionalProfile = "balanced emotional experiences across different intensities";
      }
    }
  }

  return { topGenres, highestRated, emotionalProfile, emotionalIntensity };
};

const analyzeViewingPatterns = (watchedTitles: WatchedTitleWithRating[]) => {
  const patterns = {
    preferredNarrativeStyle: "varied",
    emotionalTolerance: "moderate",
    complexityPreference: "balanced"
  };

  // Analyze overviews for narrative patterns
  const overviews = watchedTitles.map(t => t.overview).filter(Boolean);
  
  // Look for keywords that indicate preferences
  const darkThemes = overviews.filter(o => 
    /dark|death|murder|crime|psychological|thriller|horror/i.test(o)
  ).length;
  
  const lightThemes = overviews.filter(o => 
    /comedy|romance|family|adventure|friendship|love/i.test(o)
  ).length;
  
  const complexThemes = overviews.filter(o => 
    /complex|philosophical|existential|mystery|intricate|layered/i.test(o)
  ).length;

  if (darkThemes > lightThemes * 1.5) {
    patterns.emotionalTolerance = "high - comfortable with intense, challenging content";
  } else if (lightThemes > darkThemes * 1.5) {
    patterns.emotionalTolerance = "preffers uplifting, positive emotional experiences";
  }

  if (complexThemes > watchedTitles.length * 0.3) {
    patterns.complexityPreference = "high - appreciates layered, thought-provoking narratives";
  }

  return patterns;
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
      short: "Short series (max 12 episodes) - focused, concise storytelling",
      medium: "Medium series (12-24 episodes) - balanced narrative development", 
      long: "Long series (24+ episodes) - extensive character and world development"
    };
    constraints.push(`• **Length:** ${lengthMap[filters.lengthPreference]}`);
  }
  
  if (filters?.status) {
    const statusMap = {
      ongoing: "Currently airing series only - fresh, evolving narratives",
      completed: "Completed series only - fully realized story arcs",
      both: "Both ongoing and completed series - diverse completion states"
    };
    constraints.push(`• **Status:** ${statusMap[filters.status]}`);
  }
  
  if (filters?.minimumRating) {
    constraints.push(`• **Quality Standard:** Minimum ${filters.minimumRating}/10 rating - proven emotional impact`);
  }
  
  constraints.push("• **Diversity:** Ensure recommendations offer distinct emotional experiences while maintaining thematic coherence");
  constraints.push("• **Emotional Authenticity:** Prioritize content with genuine emotional depth over superficial genre matching");
  
  return constraints.join("\n");
};

// ===== 1. ENHANCED GENERAL RECOMMENDATIONS =====
export const generateTraktRecommendationsPrompt = (
  watchedTitles: WatchedTitleWithRating[],
  favoriteGenres: string[],
  ratingDistribution: RatingDistribution,
  type: string,
  numRecommendations: number,
  animeOnly: boolean,
  filters?: FilterOptions
) => {
  const { topGenres, emotionalProfile, emotionalIntensity } = extractUserEssentials(
    watchedTitles, 
    favoriteGenres, 
    ratingDistribution
  );

  const viewingPatterns = analyzeViewingPatterns(watchedTitles);
  const constraints = buildConstraintsSection(watchedTitles, animeOnly, filters);

  // Extract emotional themes from highest rated content
  const emotionalThemes = watchedTitles
    .filter(t => t.userRating && t.userRating >= 8)
    .map(t => t.overview)
    .join(" ");

  return `You are an expert emotional curator and recommendation engine specializing in psychological resonance. Your mission is to find ${numRecommendations} ${type} that will deliver the same **emotional fulfillment and deeply satisfying viewing experience** as the user's most cherished content.

USER'S EMOTIONAL DNA:
• **Core Genres:** ${topGenres.join(", ")}
• **Emotional Preference:** Seeks ${emotionalProfile}
• **Emotional Intensity:** ${emotionalIntensity}
• **Narrative Style:** ${viewingPatterns.preferredNarrativeStyle}
• **Emotional Tolerance:** ${viewingPatterns.emotionalTolerance}
• **Complexity Preference:** ${viewingPatterns.complexityPreference}

EMOTIONAL CONTEXT FROM LOVED CONTENT:
${emotionalThemes ? `The user's highest-rated content suggests they connect with: "${emotionalThemes.substring(0, 300)}..."` : "Limited emotional context available"}

CONSTRAINTS:
${constraints}

ADVANCED CURATION STRATEGY:
1. **Emotional Resonance Matching:** Analyze the psychological and emotional patterns from their viewing history
2. **Feeling-State Replication:** Find content that creates the same internal emotional state
3. **Satisfaction Curve:** Match the emotional journey and resolution style they prefer
4. **Subconscious Appeal:** Consider what draws them beyond conscious genre preferences

EVALUATION CRITERIA:
- **Emotional Authenticity:** Does this content have genuine emotional depth?
- **Psychological Satisfaction:** Will this fulfill their specific emotional needs?
- **Resonance Potential:** How likely is this to create lasting emotional impact?
- **Narrative Harmony:** Does this match their preferred storytelling rhythm?

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Deep explanation of the emotional experience this provides, focusing on the specific feelings, psychological satisfaction, and why it matches their proven emotional preferences and viewing patterns."
    }
  ]
}

Return ONLY valid JSON. Focus on emotional resonance and psychological fulfillment over surface-level similarities.`;
};

// ===== 2. ENHANCED WATCHLIST RECOMMENDATIONS =====
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
  const { topGenres, highestRated, emotionalProfile, emotionalIntensity } = extractUserEssentials(
    watchedTitles, 
    favoriteGenres, 
    ratingDistribution
  );

  const viewingPatterns = analyzeViewingPatterns(watchedTitles);
  const constraints = buildConstraintsSection(watchedTitles, animeOnly, filters);

  const watchlistDisplay = watchlist.length
    ? watchlist.map((item, index) => 
        `${index + 1}. "${item.title}"${item.overview ? ` - ${item.overview.substring(0, 80)}...` : ''}`
      ).join("\n")
    : "No watchlist items provided.";

  return `You are an expert emotional curator and priority strategist. From this user's watchlist, select ${numRecommendations} ${type} titles that will provide the most **emotionally satisfying and psychologically fulfilling viewing experiences** based on their proven taste preferences.

USER'S EMOTIONAL BLUEPRINT:
• **Favorite Genres:** ${topGenres.join(", ")}
• **Highest Rated Content:** ${highestRated.map(t => `"${t.title}" (${t.userRating || 'loved'}/10)`).join(", ")}
• **Emotional Craving:** ${emotionalProfile}
• **Emotional Intensity:** ${emotionalIntensity}
• **Viewing Patterns:** ${viewingPatterns.complexityPreference}, ${viewingPatterns.emotionalTolerance}

WATCHLIST ANALYSIS POOL:
${watchlistDisplay}

CONSTRAINTS:
${constraints}

STRATEGIC CURATION APPROACH:
1. **Emotional Fit Assessment:** Analyze each watchlist item's emotional potential against their proven preferences
2. **Satisfaction Prediction:** Which titles will create the most meaningful emotional experiences?
3. **Timing Optimization:** Consider their current emotional state and viewing readiness
4. **Resonance Maximization:** Prioritize content that matches their emotional intensity and tolerance levels

SELECTION CRITERIA:
- **Immediate Emotional Appeal:** Will this capture their attention based on their preferences?
- **Sustained Engagement:** Does this match their complexity and narrative preferences?
- **Emotional Payoff:** Will this provide the emotional satisfaction they seek?
- **Personal Relevance:** How well does this align with their emotional DNA?

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title from Watchlist",
      "reason": "Detailed analysis of why this watchlist item perfectly matches their emotional preferences, considering their specific patterns for ${emotionalProfile} and how it will provide the psychological satisfaction they seek."
    }
  ]
}

Return ONLY valid JSON. Prioritize emotional resonance and personal fit over arbitrary selection.`;
};

// ===== 3. ENHANCED MEDIA-SPECIFIC RECOMMENDATIONS =====
export const generateDefaultPrompt = (
  mediaDetails: MediaDetails,
  type: string,
  numRecommendations: number = 8
) => {
  const genres = mediaDetails.genres.map(g => g.name).join(", ");
  const year = new Date(mediaDetails.release_date).getFullYear();
  
  // Analyze emotional themes in the overview
  const emotionalKeywords = mediaDetails.overview.toLowerCase();
  let emotionalTone = "balanced";
  
  if (/dark|death|murder|crime|psychological|thriller|horror|tragic/.test(emotionalKeywords)) {
    emotionalTone = "intense and psychologically challenging";
  } else if (/comedy|funny|light|cheerful|uplifting|joy/.test(emotionalKeywords)) {
    emotionalTone = "uplifting and emotionally positive";
  } else if (/romance|love|relationship|heart/.test(emotionalKeywords)) {
    emotionalTone = "emotionally intimate and relationship-focused";
  } else if (/adventure|action|exciting|thrilling/.test(emotionalKeywords)) {
    emotionalTone = "exciting and adrenaline-driven";
  }

  return `You are an expert in emotional storytelling and psychological content curation. Generate EXACTLY ${numRecommendations} ${type} recommendations that deliver the same **emotional resonance and psychological satisfaction** as the source content.

SOURCE CONTENT EMOTIONAL ANALYSIS:
• **Title:** "${mediaDetails.title}"
• **Emotional Core:** "${mediaDetails.overview}"
• **Emotional Tone:** ${emotionalTone}
• **Genre Atmosphere:** ${genres}
• **Audience Resonance:** ${mediaDetails.vote_average}/10 (${mediaDetails.vote_average >= 8 ? 'highly resonant' : mediaDetails.vote_average >= 6 ? 'solidly engaging' : 'niche appeal'})

EMOTIONAL MATCHING METHODOLOGY:
1. **Feeling-State Analysis:** What specific emotions does the source content evoke?
2. **Psychological Needs:** What deeper human needs does it fulfill (catharsis, escape, connection, growth)?
3. **Emotional Journey:** How does it take viewers through emotional transformation?
4. **Satisfaction Type:** What kind of emotional resolution or experience does it provide?

RECOMMENDATION PHILOSOPHY:
Think: "If someone loved [source content] for how it made them FEEL, what other content would create that same emotional state through different but equally powerful storytelling?"

Focus on:
- **Emotional Resonance:** Same feelings, different story
- **Psychological Satisfaction:** Same internal rewards and fulfillment
- **Atmospheric Harmony:** Similar emotional environment and tone
- **Narrative Rhythm:** Compatible pacing and emotional flow

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Precise explanation of the emotional experience this provides and why it creates the same psychological satisfaction as the source content. Focus on the specific feelings, atmosphere, and emotional journey rather than plot mechanics."
    }
  ]
}

Return ONLY valid JSON. Prioritize emotional and psychological alignment over superficial similarities.`;
};

// ===== 4. ENHANCED CUSTOM CHAT RECOMMENDATIONS =====
export const generateCustomPrompt = (
  details: Partial<MediaDetails>,
  type: string,
  prompt: string,
  numRecommendations: number = 10
) => {
  const hasBaseMedia = details?.title;
  
  // Analyze the user's prompt for emotional intent
  const promptAnalysis = {
    emotionalIntent: "general",
    intensityLevel: "moderate",
    specificNeeds: []
  };
  
  const promptLower = prompt.toLowerCase();
  
  if (/sad|depressing|cry|emotional|heartbreaking/.test(promptLower)) {
    promptAnalysis.emotionalIntent = "cathartic and emotionally intense";
    promptAnalysis.intensityLevel = "high";
  } else if (/happy|funny|comedy|light|cheerful|uplifting/.test(promptLower)) {
    promptAnalysis.emotionalIntent = "uplifting and mood-boosting";
  } else if (/scary|horror|thriller|suspense|tense/.test(promptLower)) {
    promptAnalysis.emotionalIntent = "thrilling and adrenaline-inducing";
    promptAnalysis.intensityLevel = "high";
  } else if (/romantic|love|relationship|date/.test(promptLower)) {
    promptAnalysis.emotionalIntent = "romantically satisfying and emotionally intimate";
  } else if (/complex|deep|philosophical|thought-provoking/.test(promptLower)) {
    promptAnalysis.emotionalIntent = "intellectually stimulating and contemplative";
  }

  const baseContext = hasBaseMedia ?
    `EMOTIONAL FOUNDATION FROM BASE CONTENT:
• **Title:** "${details.title}"
• **Emotional Anchor:** "${details.overview || "N/A"}"
• **Genre Atmosphere:** ${details.genres?.map(g => g.name).join(", ") || "N/A"}
• **Audience Resonance:** ${details.vote_average || "N/A"}/10` :
    "NO BASE CONTENT PROVIDED. Focus entirely on fulfilling the user's emotional and experiential request.";

  return `You are an expert emotional curator and content specialist. Generate EXACTLY ${numRecommendations} ${type} recommendations that perfectly fulfill the user's specific request, focusing on the **desired emotional experience and psychological satisfaction**.

${baseContext}

USER'S EMOTIONAL REQUEST ANALYSIS:
• **Raw Request:** "${prompt}"
• **Emotional Intent:** ${promptAnalysis.emotionalIntent}
• **Intensity Level:** ${promptAnalysis.intensityLevel}
• **Underlying Need:** The user seeks content that will create specific feelings and psychological states

ADVANCED CURATION APPROACH:
1. **Intent Decoding:** What emotional state are they trying to achieve?
2. **Need Fulfillment:** What psychological needs are they expressing?
3. **Experience Design:** How can content create their desired emotional journey?
4. **Satisfaction Optimization:** What will leave them feeling emotionally fulfilled?

RECOMMENDATION STRATEGY:
- **Emotional Precision:** Match the exact emotional experience they're seeking
- **Psychological Satisfaction:** Fulfill their underlying emotional needs
- **Atmospheric Alignment:** Create the right emotional environment
- **Experience Quality:** Ensure high emotional payoff and satisfaction

JSON FORMAT:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Detailed explanation of how this content fulfills their specific emotional request, focusing on the precise feelings, atmosphere, and psychological satisfaction it provides. Connect directly to their stated needs and desired emotional experience."
    }
  ]
}

Return ONLY valid JSON. Focus on emotional precision and psychological fulfillment over literal interpretation.`;
}
