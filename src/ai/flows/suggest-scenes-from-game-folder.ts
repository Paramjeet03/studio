'use server';
/**
 * @fileOverview AI agent that suggests appropriate scenes based on the game folder content.
 *
 * - suggestScenesFromGameFolder - A function that suggests scenes based on the game folder.
 * - SuggestScenesFromGameFolderInput - The input type for the suggestScenesFromGameFolder function.
 * - SuggestScenesFromGameFolderOutput - The return type for the suggestScenesFromGameFolder function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestScenesFromGameFolderInputSchema = z.object({
  gameFolderPath: z.string().describe('The path to the game folder.'),
});
export type SuggestScenesFromGameFolderInput = z.infer<typeof SuggestScenesFromGameFolderInputSchema>;

const SuggestScenesFromGameFolderOutputSchema = z.object({
  suggestedScenes: z
    .array(z.string())
    .describe('A list of suggested scene names based on the game folder content.'),
});
export type SuggestScenesFromGameFolderOutput = z.infer<typeof SuggestScenesFromGameFolderOutputSchema>;

export async function suggestScenesFromGameFolder(
  input: SuggestScenesFromGameFolderInput
): Promise<SuggestScenesFromGameFolderOutput> {
  return suggestScenesFromGameFolderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestScenesFromGameFolderPrompt',
  input: {
    schema: z.object({
      gameFolderPath: z.string().describe('The path to the game folder.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedScenes: z
        .array(z.string())
        .describe('A list of suggested scene names based on the game folder content.'),
    }),
  },
  prompt: `You are a game development assistant. Given the following game folder path, suggest appropriate scenes that would fit the game's style and functionality. Consider existing assets, code (variables, functions), language, and engine.

Game Folder Path: {{{gameFolderPath}}}

Suggest a list of scene names. The list should contain only names of scenes, not descriptions.
`,
});

const suggestScenesFromGameFolderFlow = ai.defineFlow<
  typeof SuggestScenesFromGameFolderInputSchema,
  typeof SuggestScenesFromGameFolderOutputSchema
>({
  name: 'suggestScenesFromGameFolderFlow',
  inputSchema: SuggestScenesFromGameFolderInputSchema,
  outputSchema: SuggestScenesFromGameFolderOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
