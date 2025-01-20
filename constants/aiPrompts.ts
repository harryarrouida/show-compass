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
) => `You are a sophisticated media analyst and recommendation engine. Generate EXACTLY ${numRecommendations} high-quality ${type} recommendations based on these details:

Input Media:
- Title: "${mediaDetails.title}"
- Overview: "${mediaDetails.overview}"
- Genres: ${mediaDetails.genres.map((g) => g.name).join(", ")}
- Release Year: ${new Date(mediaDetails.release_date).getFullYear()}
- Rating: ${mediaDetails.vote_average}

STRICT Requirements:
1. Focus on narrative depth, thematic resonance, character complexity, and emotional impact.
2. Each recommendation MUST have exactly two detailed sentences:
   - First sentence: Explain the thematic or stylistic connection to the input media
   - Second sentence: Highlight a unique aspect that would appeal to fans of the original
3. NEVER include plot summaries, ratings, release dates, or popularity metrics
4. Recommendations MUST span multiple genres while maintaining thematic relevance
5. At least 3 recommendations MUST be from ${
  new Date().getFullYear() - 3
} or later
6. All recommendations MUST be available on major streaming platforms
7. Prioritize critically acclaimed content that matches the tone and sophistication level
8. Avoid Content with low ratings, low popularity, and low user ratings, new releases, and upcoming releases

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Two sentences explaining the deep thematic/stylistic connection and unique appeal."
    }
  ]
}

CRITICAL: Return ONLY valid JSON. Any explanatory text outside the JSON structure will cause errors.`;

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
You are a perceptive media recommendation engine. Generate EXACTLY ${numRecommendations} ${type} recommendations that seamlessly blend the essence of the original content with the user's specific interests.

Input Media:
- Title: "${details?.title || "N/A"}"
- Overview: "${details?.overview || "N/A"}"
- Genres: ${details?.genres?.map((g) => g.name).join(", ") || "N/A"}
- Release Year: ${
  details?.release_date ? new Date(details?.release_date).getFullYear() : "N/A"
}
- Rating: ${details?.vote_average || "N/A"}

User's Request: "${prompt}"

STRICT Requirements:
1. Each recommendation MUST demonstrate BOTH:
   - Clear connection to the original media's themes, style, or emotional core
   - Direct relevance to the user's specific request
2. Each recommendation MUST include exactly two sentences:
   - First sentence: Explain how it matches the user's specific request
   - Second sentence: Highlight its thematic or stylistic connection to the original media
3. At least three recommendations MUST be from ${
  new Date().getFullYear() - 3
} or later
4. Recommendations MUST span different genres while maintaining thematic relevance
5. All titles MUST be available on major streaming platforms
6. NEVER include:
   - Plot summaries
   - Ratings or review scores
   - Release dates
   - Popularity metrics
7. Focus on elements that specifically matter to the user's request:
   - If they ask about specific themes, emphasize those
   - If they want certain character types, prioritize those
   - If they mention mood or atmosphere, focus on that
   - If they specify story elements, highlight those
8. Avoid Content with low ratings, low popularity, and low user ratings, new releases, and upcoming releases

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "How it matches the user's request followed by its connection to the original media."
    }
  ]
}

CRITICAL: Return ONLY valid JSON. Any additional text will result in failure.`;

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
You are a sophisticated media analyst specializing in personalized content discovery. Generate EXACTLY ${numRecommendations} highly tailored ${
  type + (animeOnly ? " anime" : "")
} recommendations based on deep analysis of the user's viewing patterns.

User Profile Analysis:
1. Recent Watch History (Last 30):
${watchedTitles
  .slice(0, 30)
  .map((title) => title.title + " - " + title.overview)
  .join(", ")}

2. Viewing Preferences:
- Most Watched Genres: ${favoriteGenres.join(", ")}
- Era Preferences: ${JSON.stringify(decadePreferences)}
- Rating Pattern: ${JSON.stringify(ratingDistribution)}

EXCLUDED Content (Already Watched):
${watchedTitles.map((title) => title.title).join(", ")}

STRICT Requirements:
1. Analyze Content Patterns:
   - Identify recurring themes across ALL watched content
   - Understand preferred story structures and narrative approaches
   - Recognize emotional resonance patterns
   - Map complexity preferences and pacing choices
   - Note genre combination patterns they gravitate towards
   - Avoid Content with low ratings, low popularity, and low user ratings, new releases, and upcoming releases

2. Each recommendation MUST include two sentences that:
   - First: Connect to the user's broader viewing patterns and thematic preferences
   - Second: Highlight specific elements that align with their demonstrated taste profile

Bad Example (Too specific):
"This show is similar to Breaking Bad with its dark tone and morally gray protagonist. Like Better Call Saul, it features complex legal drama and character development."

Good Example (Pattern-based):
"This series embodies the user's consistent attraction to narratives exploring moral complexity and psychological transformation, evident across their viewing history. The show's methodical pacing and focus on intricate character relationships aligns with their demonstrated preference for deeply layered storytelling that prioritizes emotional depth over action."

3. When Analyzing Patterns, Consider:
   - Thematic threads that appear across different genres
   - Storytelling approaches they consistently engage with
   - Character dynamics they regularly seek out
   - Emotional experiences they gravitate towards
   - Production qualities they value

4. Focus on Understanding:
   - NOT what shows are "similar" to what they've watched
   - BUT what elements consistently capture their interest
   - NOT direct show-to-show comparisons
   - BUT patterns in their content choices

5. Content Requirements:
   - MUST include ${Math.ceil(numRecommendations / 3)} titles from ${
  new Date().getFullYear() - 3
} or later
   - All titles MUST be available on major streaming platforms
   - MUST span multiple genres while matching user's genre preferences
   - MUST be ${type}${animeOnly ? " anime" : " content"}
   - ABSOLUTELY NO titles from their watch history

6. NEVER include:
   - Plot summaries
   - Ratings or reviews
   - Release dates
   - Popularity metrics
   - Already watched content
   - Unavailable or upcoming releases

7. Prioritize recommendations based on:
   - Most-watched genres
   - Preferred release decades
   - Typical rating ranges
   - Recurring themes in watch history
   - Similar narrative complexity

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Connection to viewing patterns followed by alignment with preferences."
    }
  ]
}

CRITICAL: Return ONLY valid JSON. NEVER recommend already watched titles. Focus on understanding and matching the user's demonstrated taste patterns.`;

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
You are a perceptive viewing pattern analyst. Your task is to identify the EXACTLY ${numRecommendations} most personally relevant ${
  type + (animeOnly ? " anime" : "")
} titles from the user's watchlist by analyzing their demonstrated preferences.

Comprehensive User Profile:
1. Content Preferences:
- Rating Patterns: ${JSON.stringify(ratingDistribution)}
- Era Preferences: ${JSON.stringify(decadePreferences)}
- Genre Affinities: ${JSON.stringify(favoriteGenres)}

2. Watch History Analysis (Last 30):
${watchedTitles
  .slice(0, 30)
  .map((item) => item.title + " - " + item.overview)
  .join(", ")}

3. Available Watchlist Options:
${watchlist.map((item) => item.title).join(", ")}

Already Watched (EXCLUDE):
${watchedTitles.map((title) => title.title).join(", ")}

STRICT Selection Criteria:
1. Analyze Content Patterns:
   - Identify recurring themes across ALL watched content
   - Understand preferred story structures and narrative approaches
   - Recognize emotional resonance patterns
   - Map complexity preferences and pacing choices
   - Note genre combination patterns they gravitate towards
   - Avoid Content with low ratings, low popularity, and low user ratings, new releases, and upcoming releases

2. Each recommendation MUST include two sentences that:
   - First: Connect to the user's broader viewing patterns and thematic preferences
   - Second: Highlight specific elements that align with their demonstrated taste profile

Bad Example (Too specific):
"This show is similar to Breaking Bad with its dark tone and morally gray protagonist. Like Better Call Saul, it features complex legal drama and character development."

Good Example (Pattern-based):
"This series embodies the user's consistent attraction to narratives exploring moral complexity and psychological transformation, evident across their viewing history. The show's methodical pacing and focus on intricate character relationships aligns with their demonstrated preference for deeply layered storytelling that prioritizes emotional depth over action."

3. When Analyzing Patterns, Consider:
   - Thematic threads that appear across different genres
   - Storytelling approaches they consistently engage with
   - Character dynamics they regularly seek out
   - Emotional experiences they gravitate towards
   - Production qualities they value

4. Focus on Understanding:
   - NOT what shows are "similar" to what they've watched
   - BUT what elements consistently capture their interest
   - NOT direct show-to-show comparisons
   - BUT patterns in their content choices

5. Selection Requirements:
   - MUST be chosen ONLY from their provided watchlist
   - MUST reflect their demonstrated genre preferences
   - MUST align with their typical content choices
   - MUST be ${type}${animeOnly ? " anime" : " content"}
   - Only suggest additional titles if watchlist options are exhausted

6. NEVER include:
   - Plot summaries
   - Ratings or popularity metrics
   - Already watched content
   - Release dates or reviews
   - Content not from their watchlist unless explicitly needed

7. Prioritize watchlist items based on:
   - Strongest match to favorite genres
   - Alignment with preferred eras
   - Similarity to highly-rated content
   - Thematic connections to frequently watched content
   - Match to preferred storytelling approaches

JSON Format:
{
  "recommendations": [
    {
      "title": "Title",
      "reason": "Pattern match explanation followed by watchlist priority justification."
    }
  ]
}

CRITICAL: 
- Return ONLY valid JSON
- Select ONLY from provided watchlist unless insufficient
- NEVER recommend already watched titles
- MUST provide exactly ${numRecommendations} recommendations
- Focus on understanding and matching demonstrated preferences`;
