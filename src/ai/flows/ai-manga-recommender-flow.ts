'use server';
/**
 * @fileOverview An AI-powered manga recommender flow.
 *
 * - recommendManga - A function that handles the manga recommendation process.
 * - AiMangaRecommenderInput - The input type for the recommendManga function.
 * - AiMangaRecommenderOutput - The return type for the recommendManga function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Placeholder for actual MangaDex API client
// In a real application, this would import from `lib/api.ts`
// and handle actual HTTP requests, rate limiting, etc.
const mockSearchMangaDex = async (query: string, genres?: string[]) => {
  console.log(`Mocking MangaDex search for query: "${query}", genres: ${genres?.join(', ')}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return some hardcoded mock data for demonstration
  const allMockManga = [
    {
      id: 'manga-id-1',
      title: 'Solo Leveling',
      description: 'The weakest hunter, Sung Jinwoo, gains a mysterious power.',
      genres: ['Action', 'Fantasy', 'Adventure'],
      coverArtUrl: 'https://uploads.mangadex.org/covers/manga-id-1/cover.jpg',
    },
    {
      id: 'manga-id-2',
      title: 'Omniscient Reader',
      description: 'Kim Dokja, who has read the webnovel "Three Ways to Survive in a Ruined World" for over ten years, becomes the only one who knows the ending.',
      genres: ['Fantasy', 'Action', 'System'],
      coverArtUrl: 'https://uploads.mangadex.org/covers/manga-id-2/cover.jpg',
    },
    {
      id: 'manga-id-3',
      title: 'Tower of God',
      description: 'Twenty-Fifth Baam, a boy who has spent his life beneath a colossal Tower, follows his friend Rachel to the Tower.',
      genres: ['Fantasy', 'Adventure'],
      coverArtUrl: 'https://uploads.mangadex.org/covers/manga-id-3/cover.jpg',
    },
    {
      id: 'manga-id-4',
      title: 'Return of the Mount Hua Sect',
      description: 'Chung Myung, one of the Twelve Great Swordsmen of Mount Hua, returns after 100 years.',
      genres: ['Action', 'Fantasy', 'Martial Arts'],
      coverArtUrl: 'https://uploads.mangadex.org/covers/manga-id-4/cover.jpg',
    },
    {
      id: 'manga-id-5',
      title: 'Lookism',
      description: 'A high school student who can switch between two bodies: one handsome and the other unattractive.',
      genres: ['Action', 'Drama', 'School Life'],
      coverArtUrl: 'https://uploads.mangadex.org/covers/manga-id-5/cover.jpg',
    },
    {
      id: 'manga-id-6',
      title: 'The Beginning After The End',
      description: 'King Grey has unrivaled strength, wealth, and prestige in a world ruled by martial ability. However, solitude lingers closely behind those with great power.',
      genres: ['Fantasy', 'Action', 'Adventure'],
      coverArtUrl: 'https://uploads.mangadex.org/covers/manga-id-6/cover.jpg',
    },
  ];

  let filteredManga = allMockManga;

  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredManga = filteredManga.filter(m =>
      m.title.toLowerCase().includes(lowerQuery) ||
      m.description?.toLowerCase().includes(lowerQuery)
    );
  }

  if (genres && genres.length > 0) {
    const lowerGenres = new Set(genres.map(g => g.toLowerCase()));
    filteredManga = filteredManga.filter(m =>
      m.genres?.some(mg => lowerGenres.has(mg.toLowerCase()))
    );
  }

  return filteredManga.slice(0, 5); // Limit results for mock
};


// Define the Zod schema for the input to the recommendation flow
const AiMangaRecommenderInputSchema = z.object({
  readingHistory: z
    .array(
      z.object({
        mangaId: z.string().describe('Unique identifier of the manga.'),
        title: z.string().describe('Title of the manga.'),
        genres: z
          .array(z.string())
          .describe('List of genres associated with the manga.'),
      })
    )
    .describe('List of manga the user has read.'),
  preferredGenres: z
    .array(z.string())
    .describe('Explicitly preferred genres by the user.'),
  excludedMangaIds: z
    .array(z.string())
    .describe('List of manga IDs that should not be recommended (e.g., already read or disliked).'),
});
export type AiMangaRecommenderInput = z.infer<
  typeof AiMangaRecommenderInputSchema
>;

// Define the Zod schema for the output of the recommendation flow
const AiMangaRecommenderOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        mangaId: z.string().describe('Unique identifier of the recommended manga.'),
        title: z.string().describe('Title of the recommended manga.'),
        coverUrl: z.string().describe('URL to the cover image of the recommended manga.'),
        reason: z.string().describe('Explanation from the AI for this recommendation.'),
      })
    )
    .describe('List of personalized manga recommendations.'),
});
export type AiMangaRecommenderOutput = z.infer<
  typeof AiMangaRecommenderOutputSchema
>;

// Define the tool to search MangaDex
const searchMangaDexTool = ai.defineTool(
  {
    name: 'searchMangaDex',
    description:
      'Searches the MangaDex API for manga based on given criteria (title, genres, etc.) and returns a list of matching manga. Use this tool to find potential recommendations.',
    inputSchema: z.object({
      query: z.string().describe('A general search query, could be keywords or part of a title.').optional(),
      genres: z.array(z.string()).optional().describe('List of genres to filter the search results.'),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string().describe('MangaDex ID of the manga.'),
        title: z.string().describe('Title of the manga.'),
        description: z.string().optional().describe('Short description or synopsis of the manga.'),
        genres: z.array(z.string()).optional().describe('List of genres associated with the manga.'),
        coverArtUrl: z.string().optional().describe('URL to the cover art of the manga.'),
      })
    ),
  },
  async input => {
    // In a real application, this would call the MangaDex API.
    // For this example, we use a mock function.
    return mockSearchMangaDex(input.query || '', input.genres);
  }
);


// Define the prompt for the AI manga recommender
const aiMangaRecommenderPrompt = ai.definePrompt({
  name: 'aiMangaRecommenderPrompt',
  input: { schema: AiMangaRecommenderInputSchema },
  output: { schema: AiMangaRecommenderOutputSchema },
  tools: [searchMangaDexTool],
  prompt: `You are an expert AI manga curator for "NoirManhwa", a modern manhwa reading platform. Your goal is to provide personalized recommendations for new manhwa series that the user will genuinely enjoy, based on their reading history and explicitly stated preferences.\n\nUser's Reading History:\n{{#if readingHistory}}\n{{#each readingHistory}}\n- Title: {{{this.title}}} (ID: {{{this.mangaId}}})\n  Genres: {{#each this.genres}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}\n{{/each}}\n{{else}}\nThe user has no recorded reading history.\n{{/if}}\n\nUser's Preferred Genres (explicitly stated):\n{{#if preferredGenres}}\n{{#each preferredGenres}}\n- {{{this}}}\n{{/each}}\n{{else}}\nThe user has not explicitly stated preferred genres.\n{{/if}}\n\nManga to Exclude (already read or disliked):\n{{#if excludedMangaIds}}\n{{#each excludedMangaIds}}\n- ID: {{{this}}}\n{{/each}}\n{{else}}\nNo manga specified for exclusion.\n{{/if}}\n\nBased on the above information, identify patterns in their reading taste (genres, themes, art styles implied by titles).\nThink step-by-step to formulate a search query using the 'searchMangaDex' tool to find relevant new series.\nPrioritize series that are similar in genre and theme to their history and preferred genres, but ensure they are *new* to the user (i.e., their IDs are not in the 'excludedMangaIds' list).\nAfter using the 'searchMangaDex' tool, select 3-5 best recommendations from the results. For each recommendation, provide a compelling reason why you think the user will enjoy it, specifically referencing aspects of their reading history or preferences. Ensure the recommendations are distinct and offer variety within their preferences.\n\nOutput your recommendations in the specified JSON format. Ensure all fields in the output schema are populated correctly.`,
});

// Define the Genkit flow
const aiMangaRecommenderFlow = ai.defineFlow(
  {
    name: 'aiMangaRecommenderFlow',
    inputSchema: AiMangaRecommenderInputSchema,
    outputSchema: AiMangaRecommenderOutputSchema,
  },
  async input => {
    // Call the prompt with the input. The prompt will use the tool internally.
    const { output } = await aiMangaRecommenderPrompt(input);
    return output!;
  }
);

// Wrapper function to expose the flow
export async function recommendManga(
  input: AiMangaRecommenderInput
): Promise<AiMangaRecommenderOutput> {
  return aiMangaRecommenderFlow(input);
}
