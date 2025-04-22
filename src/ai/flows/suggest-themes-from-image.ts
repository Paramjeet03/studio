// use server'
'use server';
/**
 * @fileOverview This file defines a Genkit flow to suggest relevant themes (e.g., 'Forest', 'Desert', 'Sci-Fi') based on an uploaded image.
 *
 * - suggestThemesFromImage - A function that handles the theme suggestion process.
 * - SuggestThemesFromImageInput - The input type for the suggestThemesFromImage function.
 * - SuggestThemesFromImageOutput - The return type for the suggestThemesFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestThemesFromImageInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the uploaded image.'),
});
export type SuggestThemesFromImageInput = z.infer<
  typeof SuggestThemesFromImageInputSchema
>;

const SuggestThemesFromImageOutputSchema = z.object({
  themes: z
    .array(z.string())
    .describe('An array of suggested themes derived from the image.'),
});
export type SuggestThemesFromImageOutput = z.infer<
  typeof SuggestThemesFromImageOutputSchema
>;

export async function suggestThemesFromImage(
  input: SuggestThemesFromImageInput
): Promise<SuggestThemesFromImageOutput> {
  return suggestThemesFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestThemesFromImagePrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the uploaded image.'),
    }),
  },
  output: {
    schema: z.object({
      themes: z
        .array(z.string())
        .describe('An array of suggested themes derived from the image.'),
    }),
  },
  prompt: `You are an AI assistant designed to analyze images and suggest relevant themes for game level design.

  Based on the content of the image provided, suggest several themes that would be appropriate for a game level.
  Examples of themes include: Forest, Desert, Sci-Fi, Cyberpunk, Medieval, etc.

  Respond with an array of themes.

  Image: {{media url=photoUrl}}`,
});

const suggestThemesFromImageFlow = ai.defineFlow<
  typeof SuggestThemesFromImageInputSchema,
  typeof SuggestThemesFromImageOutputSchema
>(
  {
    name: 'suggestThemesFromImageFlow',
    inputSchema: SuggestThemesFromImageInputSchema,
    outputSchema: SuggestThemesFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
