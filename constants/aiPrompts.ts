// COMPLETE RECOMMENDATION SYSTEM - ALL 4 PROMPT TYPES

// ===== 1. GENERAL RECOMMENDATIONS (from all available content) =====
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
  const tasteProfile = analyzeTasteProfile(watchedTitles, favoriteGenres, ratingDistribution);
  
  return `You are an expert media analyst. Generate ${numRecommendations} ${type}${
    animeOnly ? " anime" : ""
  } recommendations based on deep taste analysis.

TASTE PROFILE ANALYSIS:
${tasteProfile}

PREFERENCE CONSTRAINTS:
- Primary genres of interest: ${favoriteGenres.join(", ")}
- Preferred time periods: ${JSON.stringify(decadePreferences)}
- Rating patterns: ${JSON.stringify(ratingDistribution)}${
  lengthPreference ? `\n- Content length preference: ${lengthPreference}` : ""
}${episodeCount ? `\n- Episode range: ${JSON.stringify(episodeCount)}` : ""}${
  status ? `\n- Series status: ${status}` : ""
}${minimumRating ? `\n- Minimum quality threshold: ${minimumRating}` : ""}

EXCLUSIONS: ${watchedTitles.map((t) => t.title).join(", ")}

INSTRUCTIONS:
- Analyze the taste profile to understand storytelling preferences, thematic interests, and narrative complexity
- Recommend content that matches the psychological and emotional resonance patterns
- Focus on WHY content appeals based on core taste elements, not surface-level similarities
- Avoid direct comparisons to specific watched content
- Emphasize narrative depth, character development style, thematic resonance, and emotional tone

JSON Response Format:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Concise explanation of why this matches the user's core taste profile - focus on thematic elements, narrative style, emotional depth, and story structure that align with their preferences."
    }
  ]
}

Return ONLY valid JSON.`;
};

// ===== 2. WATCHLIST RECOMMENDATIONS (prioritized from user's existing watchlist) =====
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
  const tasteProfile = analyzeTasteProfile(watchedTitles, favoriteGenres, ratingDistribution);
  const watchPreferences = analyzeWatchingBehavior(ratingDistribution, decadePreferences, favoriteGenres);
  
  return `You are an expert media curator. From the user's existing watchlist, prioritize and select ${numRecommendations} ${type}${
    animeOnly ? " anime" : ""
  } titles that best match their viewing psychology and taste preferences.

COMPREHENSIVE TASTE ANALYSIS:
${tasteProfile}

VIEWING BEHAVIOR PATTERNS:
${watchPreferences}

SELECTION CONSTRAINTS:
- Content length preference: ${lengthPreference || "flexible"}${
  episodeCount ? `\n- Episode range: ${JSON.stringify(episodeCount)}` : ""
}${status ? `\n- Series status: ${status}` : ""}${
  minimumRating ? `\n- Quality threshold: ${minimumRating}+` : ""
}

AVAILABLE WATCHLIST OPTIONS:
${watchlist.map((item) => item.title).join(", ")}

CURATION INSTRUCTIONS:
- Analyze each watchlist title's narrative structure, thematic depth, and emotional resonance
- Prioritize content that aligns with the user's core storytelling preferences and psychological engagement patterns
- Consider viewing momentum - what would naturally follow their recent watching patterns
- Focus on WHY each selection resonates with their established taste DNA
- Avoid surface-level genre matching - dig into narrative psychology and emotional appeal
- Select titles that offer the optimal viewing experience based on their demonstrated preferences

JSON Response Format:
{
  "recommendations": [
    {
      "title": "Title from Watchlist",
      "reason": "Detailed analysis of why this title from their watchlist perfectly aligns with their viewing psychology, narrative preferences, and emotional engagement patterns established through their watch history."
    }
  ]
}

Return ONLY valid JSON.`;
};

// ===== 3. MEDIA-SPECIFIC RECOMMENDATIONS (based on single clicked media) =====
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
  const mediaProfile = analyzeMediaProfile(mediaDetails);
  
  return `You are an expert content analyst. Generate ${numRecommendations} ${type} recommendations that capture the essence and appeal of the input media.

INPUT MEDIA ANALYSIS:
${mediaProfile}

SOURCE MATERIAL:
- Title: "${mediaDetails.title}"
- Core Narrative: "${mediaDetails.overview}"
- Thematic Categories: ${mediaDetails.genres.map((g) => g.name).join(", ")}
- Production Era: ${new Date(mediaDetails.release_date).getFullYear()}
- Quality Benchmark: ${mediaDetails.vote_average}/10

RECOMMENDATION STRATEGY:
- Identify the core emotional and thematic DNA of the source material
- Focus on narrative structure, character dynamics, and storytelling approach
- Emphasize WHY viewers connect with this type of content
- Avoid surface-level genre matching - dig into psychological appeal
- Consider pacing, tone, complexity level, and emotional resonance
- Recommend content that satisfies the same viewing motivations

JSON Response Format:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Analytical explanation of why this recommendation captures the same narrative essence, emotional resonance, and viewing satisfaction as the original - focus on storytelling DNA rather than surface similarities."
    }
  ]
}

Return ONLY valid JSON.`;
};

// ===== 4. CUSTOM CHAT RECOMMENDATIONS (media + user refinement) =====
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
) => {
  const mediaProfile = details?.title ? analyzeMediaProfile(details as any) : "No base media provided";
  
  return `You are an expert recommendation specialist. Generate ${numRecommendations} ${type} recommendations that blend the essence of the base media with the user's specific refinement request.

BASE MEDIA ANALYSIS:
${mediaProfile}

SOURCE REFERENCE:
- Title: "${details?.title || "Not specified"}"
- Narrative Core: "${details?.overview || "Not provided"}"
- Thematic Elements: ${details?.genres?.map((g) => g.name).join(", ") || "Not specified"}
- Era: ${details?.release_date ? new Date(details?.release_date).getFullYear() : "Not specified"}
- Quality Level: ${details?.vote_average || "Not specified"}/10

USER REFINEMENT REQUEST:
"${prompt}"

SYNTHESIS STRATEGY:
- Extract the core appeal and narrative DNA from the base media
- Integrate the user's specific modifications and preferences
- Focus on WHY the combination would create the desired viewing experience
- Balance fidelity to the source material with the user's creative direction
- Emphasize thematic resonance, emotional tone, and storytelling approach
- Avoid literal interpretations - understand the psychological intent

JSON Response Format:
{
  "recommendations": [
    {
      "title": "Title Name",
      "reason": "Comprehensive explanation of how this recommendation synthesizes the base media's core appeal with the user's specific refinement, focusing on narrative psychology and emotional satisfaction."
    }
  ]
}

Return ONLY valid JSON.`;
};

// ===== HELPER FUNCTIONS =====

// Analyze taste patterns from viewing history
const analyzeTasteProfile = (
  watchedTitles: Array<{ title: string; overview: string }>,
  favoriteGenres: string[],
  ratingDistribution: any
) => {
  const overviews = watchedTitles.map(t => t.overview).join(" ");
  
  const themeAnalysis = {
    characterDriven: /character|personal|relationship|family|friendship|identity|growth|journey/gi,
    darkThemes: /dark|death|survival|horror|psychological|thriller|mystery|crime/gi,
    actionAdventure: /action|adventure|battle|fight|war|quest|epic|journey/gi,
    emotional: /love|romance|emotional|heart|feel|touching|drama/gi,
    complex: /complex|intricate|layered|deep|philosophical|thought|mind/gi,
    supernatural: /magic|supernatural|fantasy|sci-fi|powers|abilities|mystical/gi,
    realistic: /real|life|contemporary|modern|social|society|realistic/gi,
    comedic: /comedy|humor|funny|laugh|wit|amusing|entertaining/gi,
    suspenseful: /suspense|tension|mystery|thriller|twist|reveal/gi
  };
  
  const patterns = Object.keys(themeAnalysis).filter(theme => {
    const matches = overviews.match(themeAnalysis[theme]);
    return matches && matches.length > watchedTitles.length * 0.25;
  });
  
  const avgRating = ratingDistribution ? 
    Object.keys(ratingDistribution).reduce((sum, rating) => 
      sum + (parseFloat(rating) * ratingDistribution[rating]), 0
    ) / Object.values(ratingDistribution).reduce((a, b) => a + b, 0) : null;
  
  let profile = `Demonstrates strong affinity for content emphasizing: ${patterns.join(", ")} storytelling elements.`;
  
  if (avgRating) {
    if (avgRating >= 8) profile += " Exhibits discerning taste, consistently seeking critically acclaimed, high-caliber content.";
    else if (avgRating >= 7) profile += " Appreciates well-executed content with solid production values and narrative craft.";
    else profile += " Values entertainment and engagement over critical consensus, open to diverse quality levels.";
  }
  
  // Enhanced genre psychology insights
  if (favoriteGenres.includes("Drama")) profile += " Gravitates toward character-driven narratives with emotional depth and psychological complexity.";
  if (favoriteGenres.includes("Thriller") || favoriteGenres.includes("Mystery")) profile += " Seeks intellectually engaging, suspenseful narratives with intricate plot development.";
  if (favoriteGenres.includes("Fantasy") || favoriteGenres.includes("Sci-Fi")) profile += " Values imaginative world-building, speculative concepts, and escapist storytelling.";
  if (favoriteGenres.includes("Comedy")) profile += " Appreciates wit, humor, and lighter narrative tones that provide emotional relief.";
  if (favoriteGenres.includes("Horror")) profile += " Drawn to psychological intensity, atmospheric tension, and boundary-pushing content.";
  if (favoriteGenres.includes("Action")) profile += " Enjoys dynamic pacing, physical conflict, and high-stakes narrative momentum.";
  
  return profile;
};

// Analyze viewing behavior patterns
const analyzeWatchingBehavior = (
  ratingDistribution: any,
  decadePreferences: any,
  favoriteGenres: any
) => {
  let behavior = "";
  
  if (ratingDistribution) {
    const ratings = Object.keys(ratingDistribution).map(Number);
    const avgRating = ratings.reduce((sum, rating, index) => 
      sum + (rating * Object.values(ratingDistribution)[index]), 0
    ) / Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
    
    const ratingSpread = Math.max(...ratings) - Math.min(...ratings);
    
    if (ratingSpread > 5) behavior += "Exhibits selective viewing patterns with clear quality distinctions and strong opinions. ";
    if (avgRating > 7.5) behavior += "Consistently gravitates toward critically acclaimed, high-quality content. ";
    if (avgRating < 6.5) behavior += "More forgiving of production flaws, prioritizes entertainment value and personal enjoyment. ";
  }
  
  if (decadePreferences) {
    const preferredEras = Object.keys(decadePreferences).filter(decade => 
      decadePreferences[decade] > 20
    );
    if (preferredEras.length <= 2) behavior += "Shows distinct era preferences, likely values specific production aesthetics or nostalgic elements. ";
    else behavior += "Demonstrates temporal flexibility, focusing on content quality over production era. ";
  }
  
  if (favoriteGenres && favoriteGenres.length) {
    if (favoriteGenres.length <= 3) behavior += "Maintains focused genre preferences, seeking specific narrative experiences and emotional territories. ";
    else behavior += "Exhibits genre flexibility, prioritizing storytelling craft and execution over categorical boundaries. ";
  }
  
  return behavior || "Demonstrates balanced viewing patterns with openness to diverse content types and storytelling approaches.";
};

// Analyze individual media profile
const analyzeMediaProfile = (mediaDetails: {
  title: string;
  overview: string;
  genres: Array<{ name: string }>;
  release_date: string;
  vote_average: number;
}) => {
  const overview = mediaDetails.overview;
  const genres = mediaDetails.genres.map(g => g.name);
  const year = new Date(mediaDetails.release_date).getFullYear();
  const rating = mediaDetails.vote_average;
  
  // Analyze narrative themes from overview
  const narrativeThemes = [];
  if (/character|personal|relationship|family|friendship|identity|growth|journey/gi.test(overview)) {
    narrativeThemes.push("character-driven storytelling");
  }
  if (/dark|death|survival|horror|psychological|thriller|mystery|crime/gi.test(overview)) {
    narrativeThemes.push("psychological intensity");
  }
  if (/action|adventure|battle|fight|war|quest|epic/gi.test(overview)) {
    narrativeThemes.push("dynamic conflict");
  }
  if (/love|romance|emotional|heart|feel|touching|drama/gi.test(overview)) {
    narrativeThemes.push("emotional resonance");
  }
  if (/complex|intricate|layered|deep|philosophical|thought|mind/gi.test(overview)) {
    narrativeThemes.push("narrative complexity");
  }
  
  // Production era insights
  let eraContext = "";
  if (year >= 2020) eraContext = "Contemporary production with modern storytelling sensibilities.";
  else if (year >= 2010) eraContext = "Modern production balancing traditional and innovative approaches.";
  else if (year >= 2000) eraContext = "Early 2000s aesthetic with foundational genre elements.";
  else eraContext = "Classic production with timeless storytelling elements.";
  
  // Quality assessment
  let qualityLevel = "";
  if (rating >= 8.5) qualityLevel = "Exceptional critical acclaim and audience satisfaction.";
  else if (rating >= 7.5) qualityLevel = "Strong critical reception with broad appeal.";
  else if (rating >= 6.5) qualityLevel = "Solid entertainment value with niche appeal.";
  else qualityLevel = "Cult or specialized appeal, prioritizing specific audience segments.";
  
  return `Core narrative DNA: ${narrativeThemes.join(", ")}. Genre framework: ${genres.join(", ")}. ${eraContext} ${qualityLevel} Appeals to viewers seeking ${narrativeThemes.length > 0 ? narrativeThemes[0] : "engaging narrative experiences"}.`;
};
