'use server';
/**
 * @fileOverview Generates a game level layout based on an uploaded image.
 *
 * - generateLevelFromImage - A function that generates a game level layout from an image.
 * - GenerateLevelInput - The input type for the generateLevelFromImage function.
 * - GenerateLevelOutput - The return type for the generateLevelFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateLevelInputSchema = z.object({
  imageURL: z.string().describe('The URL of the uploaded image.'),
  gameFolder: z.string().optional().describe('Path to the game project folder, if available.'),
  theme: z.string().optional().describe('Optional theme to apply to the level generation.'),
});
export type GenerateLevelInput = z.infer<typeof GenerateLevelInputSchema>;

const GenerateLevelOutputSchema = z.object({
  levelLayout: z.string().describe('The generated game level layout in JSON format.'),
  suggestedScenes: z.array(z.string()).optional().describe('List of suggested scenes based on game folder analysis.'),
  themeSuggestions: z.array(z.string()).describe('Suggested themes derived from the image.'),
});
export type GenerateLevelOutput = z.infer<typeof GenerateLevelOutputSchema>;

export async function generateLevelFromImage(input: GenerateLevelInput): Promise<GenerateLevelOutput> {
  return generateLevelFromImageFlow(input);
}

const analyzeImagePrompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {
    schema: z.object({
      imageURL: z.string().describe('The URL of the uploaded image.'),
    }),
  },
  output: {
    schema: z.object({
      themeSuggestions: z.array(z.string()).describe('Suggested themes derived from the image.'),
    }),
  },
  prompt: `Analyze the following image and suggest three themes that would be appropriate for a game level based on its visual elements.\n\nImage URL: {{imageURL}}\n\nRespond with a JSON array of strings, where each string is a suggested theme.`, 
});

const generateLevelPrompt = ai.definePrompt({
  name: 'generateLevelPrompt',
  input: {
    schema: z.object({
      imageURL: z.string().describe('The URL of the uploaded image.'),
      theme: z.string().optional().describe('The theme to use for level generation.'),
      suggestedScenes: z.array(z.string()).optional().describe('List of available game scenes for layout suggestions'),
    }),
  },
  output: {
    schema: z.object({
      levelLayout: z.string().describe('The generated game level layout in JSON format.'),
    }),
  },
  prompt: `Generate a game level layout in JSON format based on the visual elements of the following image, using the specified theme. If there are some provided game scenes, apply the context of the game scenes while generating the level layout.\n\nImage URL: {{imageURL}}\nTheme: {{theme}}\nGame Scenes: {{suggestedScenes}}
\nRespond with a JSON object representing the level layout.`, 
});

const suggestScenesTool = ai.defineTool({
    name: 'suggestScenes',
    description: 'Suggests relevant scenes from the provided game folder based on the image.',
    inputSchema: z.object({
      gameFolder: z.string().describe('The path to the game project folder.'),
      imageURL: z.string().describe('The URL of the uploaded image.'),
    }),
    outputSchema: z.array(z.string()).describe('A list of suggested scene names.'),
  },
  async input => {
    // Placeholder implementation: Replace with actual logic to analyze the game folder and image.
    // and suggest relevant scenes.
    // For now, return a hardcoded list.
    console.log("Suggesting scenes from game folder", input.gameFolder, "based on image", input.imageURL);
    return ['scene1', 'scene2', 'scene3'];
  }
);

const generateLevelFromImageFlow = ai.defineFlow<
  typeof GenerateLevelInputSchema,
  typeof GenerateLevelOutputSchema
>({
  name: 'generateLevelFromImageFlow',
  inputSchema: GenerateLevelInputSchema,
  outputSchema: GenerateLevelOutputSchema,
}, async input => {
  const { imageURL, theme, gameFolder } = input;

  const [{ output: analyzeImageOutput }, suggestedScenes] = await Promise.all([
    analyzeImagePrompt({ imageURL }),
    gameFolder ? suggestScenesTool({ gameFolder, imageURL }) : Promise.resolve([]),
  ]);

  const { output: generateLevelOutput } = await generateLevelPrompt({
    imageURL,
    theme: theme ?? analyzeImageOutput?.themeSuggestions?.[0] ?? 'generic',
    suggestedScenes,
  });

  return {
    levelLayout: generateLevelOutput!.levelLayout,
    suggestedScenes,
    themeSuggestions: analyzeImageOutput!.themeSuggestions,
  };
});
