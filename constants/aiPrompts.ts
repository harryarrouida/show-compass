export const generateDefaultPrompt = (
  mediaDetails: {
    title: string;
    overview: string;
    genres: Array<{ name: string }>;
    release_date: string;
    vote_average: number;
  },
  type: string,
  recentHistory: Array<{ title: string; reason: string }> = [],
  numRecommendations: number = 8
) => {
  // Analyze user history for mood patterns
  const historyContext = recentHistory.length > 0
    ? `\n\nUSER'S VIEWING PATTERN ANALYSIS:
The user has recently engaged with these titles:
${recentHistory.map((h) => `- "${h.title}": ${h.reason}`).join("\n")}

Based on this history, identify their emotional and atmospheric preferences:
- What MOODS do they gravitate toward? (melancholic, uplifting, tense, contemplative)
- What PACING do they prefer? (slow-burn, fast-paced, meditative)
- What THEMES resonate with them? (identity, loss, hope, redemption)
- What ATMOSPHERE appeals to them? (intimate, epic, gritty, dreamlike)

Use these patterns to refine your recommendations, ensuring they align with the user's demonstrated taste profile.`
    : "";

  return `You are analyzing "${mediaDetails.title}" to find ${numRecommendations} ${type} recommendations that match its EMOTIONAL ESSENCE and ATMOSPHERIC QUALITIES.

CONTENT TO ANALYZE:
Title: "${mediaDetails.title}"
Overview: "${mediaDetails.overview}"
Release Year: ${new Date(mediaDetails.release_date).getFullYear()}
Quality Rating: ${mediaDetails.vote_average}/10

IGNORE the genre labels. Instead, deeply analyze:

1. EMOTIONAL TONE & MOOD:
   - What is the dominant emotional atmosphere? (melancholic, hopeful, tense, whimsical, bittersweet, cynical)
   - What feelings does this evoke in viewers?
   - Is it emotionally heavy or light? Cathartic or comforting?

2. NARRATIVE PACING & STRUCTURE:
   - Is this contemplative and slow-burn, or fast-paced and explosive?
   - Does it prioritize character development or plot momentum?
   - Is the storytelling linear, non-linear, or experimental?

3. ATMOSPHERIC QUALITIES:
   - What is the visual/aesthetic feel? (gritty, dreamlike, naturalistic, stylized)
   - Is the atmosphere intimate or epic? Claustrophobic or expansive?
   - Does it feel cozy, unsettling, inspiring, or meditative?

4. CHARACTER & RELATIONSHIP DYNAMICS:
   - Is this character-driven or plot-driven?
   - Ensemble cast or lone protagonist?
   - What type of relationships are central? (family, romance, friendship, isolation)

5. THEMATIC DEPTH:
   - What core ideas/emotions does it explore? (identity, belonging, loss, hope, redemption, morality)
   - What philosophical or emotional questions does it raise?
   - What is the emotional journey for the viewer?
${historyContext}

YOUR TASK:
Find ${numRecommendations} ${type}s that share the same EMOTIONAL RESONANCE, ATMOSPHERIC QUALITIES, and NARRATIVE APPROACH.

For each recommendation, explain:
- The MOOD/EMOTIONAL match (not genre)
- The ATMOSPHERIC similarity
- The PACING and narrative style alignment
- The THEMATIC connection
- Why someone who connected with "${mediaDetails.title}" would appreciate this

CRITICAL RULES:
- DO NOT mention genres in your reasoning
- FOCUS on emotional experience and atmosphere
- PRIORITIZE mood compatibility over surface-level similarities
- Consider the user's demonstrated preferences from their history
- Ensure pacing compatibility (don't recommend frenetic content to contemplative viewers)

Return ONLY valid JSON, no extra text.`;
};

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
  recentHistory: Array<{ title: string; reason: string }> = [],
  numRecommendations: number = 10
) => {
  // Analyze user history for mood patterns
  const historyContext = recentHistory.length > 0
    ? `\n\nUSER'S TASTE PROFILE (from viewing history):
${recentHistory.map((h) => `- "${h.title}": ${h.reason}`).join("\n")}

Analyze this history to understand:
- Their preferred EMOTIONAL TONES and MOODS
- Their PACING preferences (contemplative vs fast-paced)
- Their THEMATIC interests
- Their ATMOSPHERIC preferences

Use this profile to interpret their request and ensure recommendations align with their demonstrated taste.`
    : "";

  return `You are helping a user find ${numRecommendations} ${type} recommendations based on their specific request.

REFERENCE CONTENT (for context):
${details?.title ? `Title: "${details.title}"` : ""}
${details?.overview ? `Overview: "${details.overview}"` : ""}
${details?.release_date ? `Release Year: ${new Date(details.release_date).getFullYear()}` : ""}
${details?.vote_average ? `Quality Rating: ${details.vote_average}/10` : ""}

USER'S REQUEST: "${prompt}"
${historyContext}

YOUR TASK - INTERPRET THE REQUEST EMOTIONALLY:

1. DECODE THE MOOD REQUEST:
   - If they say "something sad" → interpret as "emotionally devastating, cathartic, explores grief or loss"
   - If they say "feel-good" → interpret as "uplifting, heartwarming, hopeful, emotionally restorative"
   - If they say "intense" → interpret as "tense, gripping, emotionally charged, high-stakes"
   - If they say "weird" → interpret as "surreal, unconventional, dreamlike, experimental"
   - If they say "cozy" → interpret as "comforting, intimate, warm, low-stakes"

2. TRANSLATE TO CINEMATIC QUALITIES:
   - What EMOTIONAL TONE matches their request?
   - What ATMOSPHERE would satisfy this mood?
   - What PACING would feel right? (slow-burn meditation vs explosive energy)
   - What THEMATIC elements align with their request?
   - What type of CHARACTER JOURNEY would resonate?

3. CONSIDER THEIR DEMONSTRATED TASTE:
   - Look at their viewing history patterns
   - If they typically enjoy contemplative content, don't recommend frenetic options (unless explicitly requested)
   - If they gravitate toward dark/heavy content, lean into that preference
   - Match the sophistication level of their usual choices

4. FIND MOOD-COMPATIBLE RECOMMENDATIONS:
   - Prioritize EMOTIONAL and ATMOSPHERIC match over literal interpretation
   - Consider the FEELING they're seeking, not just the surface request
   - Ensure PACING compatibility with their preferences
   - Match the THEMATIC depth they typically enjoy

For each recommendation, explain:
- How it fulfills the EMOTIONAL request
- The specific MOOD/ATMOSPHERE it provides
- Why it aligns with their demonstrated taste profile
- The THEMATIC or emotional journey it offers
- Any relevant PACING or narrative style notes

CRITICAL RULES:
- AVOID mentioning genres (unless the user specifically asked for a genre)
- FOCUS on emotional experience and atmospheric qualities
- INTERPRET vague requests through an emotional/atmospheric lens
- RESPECT their viewing history patterns
- Provide THOUGHTFUL, PERSONALIZED reasoning

Return ONLY valid JSON, no extra text.`;
};

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
  animeOnly: boolean,
  lengthPreference?: "short" | "medium" | "long",
  episodeCount?: { min?: number; max?: number },
  status?: "ongoing" | "completed" | "both",
  minimumRating?: number
) => {
  // Extract mood and atmosphere patterns from overviews
  const moodAnalysis = `Based on the user's watch history, they demonstrate preferences for:

EMOTIONAL TONES & MOODS:
Analyze the overviews and identify recurring emotional atmospheres across their viewing history. Look for patterns in:
- Dominant moods (melancholic, uplifting, tense, whimsical, bittersweet, cynical, hopeful, dark)
- Emotional weight (heavy/serious vs light/comedic)
- Tonal complexity (layered emotions vs straightforward)

NARRATIVE & PACING PREFERENCES:
From their viewing patterns, determine their preferred:
- Pacing style (contemplative slow-burn vs fast-paced explosive)
- Narrative complexity (intricate plots vs character-focused)
- Storytelling approach (mystery-box, episodic, serialized, anthology)

ATMOSPHERIC QUALITIES:
Identify atmospheric tendencies:
- Visual/aesthetic preferences (gritty, dreamlike, naturalistic, stylized)
- Scale preferences (intimate character studies vs epic narratives)
- Setting atmospheres (claustrophobic, expansive, cozy, unsettling)

THEMATIC INTERESTS:
What recurring themes appear across their watch history:
- Identity and self-discovery
- Loss, grief, and redemption
- Moral complexity and ambiguity
- Hope and resilience
- Relationships and human connection
- Power and corruption
- Survival and adaptation

CHARACTER & RELATIONSHIP DYNAMICS:
- Character-driven vs plot-driven preferences
- Ensemble casts vs lone protagonists
- Relationship focus (family, romance, friendship, isolation)
- Character complexity (morally gray vs clear heroes/villains)`;

  const timestamp = Date.now();

  return `Generate ${numRecommendations} highly personalized ${type}${animeOnly ? " anime" : ""
    } recommendations based on the user's OVERALL TASTE PROFILE and viewing patterns.

GENERATION SEED: ${timestamp}
(This ensures variety between generations)

${moodAnalysis}

VIEWING STATISTICS:
- Total content analyzed: ${watchedTitles.length} ${type}
- Quality preferences: ${JSON.stringify(ratingDistribution)}
- Era preferences: ${JSON.stringify(decadePreferences)}
${lengthPreference ? `- Length preference: ${lengthPreference}` : ""}
${episodeCount && Object.keys(episodeCount).length > 0 ? `- Episode range: ${JSON.stringify(episodeCount)}` : ""}
${status && status !== "both" ? `- Show status: ${status}` : ""}
${minimumRating && minimumRating > 0 ? `- Minimum rating: ${minimumRating}/10` : ""}

YOUR TASK:
Analyze the AGGREGATE MOOD AND EMOTIONAL PROFILE from their entire watch history. DO NOT focus on individual titles.

Find ${numRecommendations} ${type} that match their:
1. EMOTIONAL PREFERENCES: What feelings and moods do they gravitate toward?
2. ATMOSPHERIC TENDENCIES: What type of atmosphere resonates with them?
3. PACING COMPATIBILITY: Do they prefer contemplative or energetic pacing?
4. THEMATIC ALIGNMENT: What ideas and themes consistently interest them?
5. CHARACTER DYNAMICS: What type of character journeys do they enjoy?

CRITICAL RULES:
- DO NOT mention ANY specific titles from their watch history in your reasoning
- DO NOT use phrases like "similar to X" or "found in shows like Y"
- FOCUS on their OVERALL taste profile, not individual titles
- Base recommendations on AGGREGATE PATTERNS across all their viewing
- Explain matches using MOOD, ATMOSPHERE, and EMOTIONAL QUALITIES
- Consider VARIETY - recommend diverse titles that all fit their taste profile
- Ensure recommendations are DIFFERENT from commonly suggested shows

For each recommendation, explain:
- How it matches their EMOTIONAL TONE preferences
- How it aligns with their ATMOSPHERIC tendencies
- Why the PACING fits their demonstrated preferences
- What THEMATIC elements will resonate
- How the CHARACTER DYNAMICS match their taste

FORBIDDEN:
- Mentioning specific titles from watch history
- Generic genre-based reasoning
- Surface-level plot comparisons
- Phrases like "fans of X will enjoy"

REQUIRED:
- Mood and atmosphere-based reasoning
- Global taste profile alignment
- Emotional compatibility explanation
- Unique, varied recommendations

Return ONLY valid JSON in this format:
{
  "recommendations": [
    {
      "title": "Exact Title",
      "reason": "Detailed explanation of how this matches the user's OVERALL emotional preferences, atmospheric tendencies, pacing style, and thematic interests. NO specific title references."
    }
  ]
}`;
};

export const generateWatchlistPrompt = (
  ratingDistribution: any,
  decadePreferences: any,
  favoriteGenres: any,
  watchedTitles: Array<{ title: string; overview: string }>,
  watchlist: Array<{ title: string }>,
  type: string,
  numRecommendations: number,
  animeOnly: boolean,
  lengthPreference?: "short" | "medium" | "long",
  episodeCount?: { min?: number; max?: number },
  status?: "ongoing" | "completed" | "both",
  minimumRating?: number
) => {
  const timestamp = Date.now();

  return `Generate ${numRecommendations} personalized ${type}${animeOnly ? " anime" : ""
    } recommendations FROM THE USER'S WATCHLIST based on their OVERALL TASTE PROFILE.

GENERATION SEED: ${timestamp}

TASK: Select items from the watchlist that best match the user's demonstrated emotional and atmospheric preferences.

USER'S OVERALL TASTE PROFILE:
- Quality preferences: ${JSON.stringify(ratingDistribution)}
- Era preferences: ${JSON.stringify(decadePreferences)}
- Total viewing history analyzed: ${watchedTitles.length} ${type}
${lengthPreference ? `- Length preference: ${lengthPreference}` : ""}
${episodeCount && Object.keys(episodeCount).length > 0 ? `- Episode range: ${JSON.stringify(episodeCount)}` : ""}
${status && status !== "both" ? `- Show status: ${status}` : ""}
${minimumRating && minimumRating > 0 ? `- Minimum rating: ${minimumRating}/10` : ""}

Based on their watch history, analyze their preferences for:
- EMOTIONAL TONES: What moods do they gravitate toward?
- PACING: Contemplative vs fast-paced?
- ATMOSPHERE: Gritty, dreamlike, cozy, intense?
- THEMES: Identity, loss, hope, moral complexity?
- CHARACTER FOCUS: Character-driven vs plot-driven?

WATCHLIST TITLES TO CHOOSE FROM:
${watchlist.map((item) => item.title).join(", ")}

CRITICAL RULES:
- DO NOT mention specific titles from their watch history
- DO NOT use phrases like "similar to X" or "found in shows like Y"
- Select items that match their OVERALL emotional and atmospheric preferences
- Explain matches using MOOD and TASTE PROFILE alignment
- Provide VARIETY in selections

For each recommendation, explain:
- How it matches their EMOTIONAL PREFERENCES
- How it aligns with their demonstrated ATMOSPHERIC tendencies
- Why it fits their PACING and narrative style preferences
- What THEMATIC elements will resonate

Return ONLY valid JSON:
{
  "recommendations": [
    {
      "title": "Title from watchlist",
      "reason": "Explanation of how this matches their OVERALL taste profile. NO specific title references."
    }
  ]
}`;
};
