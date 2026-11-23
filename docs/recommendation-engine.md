# Hybrid recommendation engine

## How it works

1. **TMDB candidates:** The server fetches real movies or shows from TMDB recommendations, similar titles, discovery, and trending lists. For Trakt watchlist mode, the server loads the actual TMDB IDs from the user's watchlist.
2. **Taste signals:** Watched history is used for breadth and exclusions, but is **not** treated as proof of enjoyment. Personal Trakt ratings of 8+ are positive and ratings of 4 or below exclude a title. Saved recommendations and explicit Interested/Not interested actions also contribute.
3. **Groq ranking:** The model sees short synopses and IDs for an eligible TMDB candidate pool. It returns only IDs with emotional/atmospheric explanations. Genres are secondary signals.
4. **Strict output verification:** Returned IDs must belong to the eligible pool. The server discards duplicates, invalid IDs, and invalid explanations. Client interfaces render the server-verified TMDB metadata directly instead of searching for AI-generated strings.

## Privacy and limitations

- Interest feedback is stored in `localStorage` on this device. It does not synchronize between devices and can be cleared with site data.
- Watchlist eligibility and anime preference are checked in the server pipeline.
- TMDB public ratings are displayed for media quality context, **not** interpreted as individual user preferences.
- Trakt ratings availability depends on the connected user's scope and Trakt API availability. If retrieval fails, rankings can proceed without ratings.
- The existing generation quota is client-side UX throttling, **not** a server-side cost-control or abuse-prevention mechanism. A production service should enforce authenticated request quotas on the server.
- Candidate coverage is bounded (up to 60 watchlist entries or 70 general candidates per generation). Very large watchlists are sampled from their first TMDB IDs.
- No embedding search or long-term account-synced taste profile yet.

## Manual test plan

- Browse a movie, verify same-media recommendations load, and confirm no source title appears in results.
- Refine the recommendation with a mood constraint, check that the results have real TMDB IDs and stable posters.
- Open a recommendation, choose **Not interested**, and verify it disappears and is excluded on the next generation.
- Choose **Interested** for another title and verify the preference survives a refresh.
- Connect Trakt with some watch history, generate 5 and 10 picks, and verify watched and saved titles are excluded.
- Rate a title on Trakt at 8+ or 4 or below, generate again, and verify the server receives personal ratings. Low-rated titles should not appear.
- Enable watchlist mode; verify every result belongs to the Trakt watchlist. Test an empty watchlist.
- Enable anime-only mode; verify results use original Japanese language and TMDB animation genre (some anime without these tags may be omitted).
- Confirm successful production build in GitHub Actions, then smoke-test with real TMDB and Groq keys before merging.
