'use server';
/**
 * @fileOverview Generates a game level layout in JSON format based on an uploaded image, incorporating sprites from the provided game folder.
 *
 * - generateLevelFromImage - A function that generates a game level layout from an image, including sprite integration.
 * - GenerateLevelInput - The input type for the generateLevelFromImage function.
 * - GenerateLevelOutput - The return type for the generateLevelFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateLevelInputSchema = z.object({
  imageURL: z.string().describe('The URL of the uploaded image.'),
  gameFolder: z.string().optional().describe('Path to the game project folder, if available.  This folder should contain a subfolder named "sprites" with available sprite images.'),
  theme: z.string().optional().describe('Optional theme to apply to the level generation.'),
  levelDescription: z.string().optional().describe('Optional user description of the level requirements'),
});
export type GenerateLevelInput = z.infer<typeof GenerateLevelInputSchema>;

const GenerateLevelOutputSchema = z.object({
  levelLayout: z.string().describe('The generated game level layout in JSON format, including sprite references.'),
  themeSuggestions: z.array(z.string()).describe('Suggested themes derived from the image.'),
  spriteSuggestions: z.array(z.string()).optional().describe('Suggested sprites from the game folder, if available.'),
  backgroundImageURL: z.string().optional().describe('Suggested background image URL'),
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

const detailedImageAnalysisPrompt = ai.definePrompt({
  name: 'detailedImageAnalysisPrompt',
  input: {
    schema: z.object({
      imageURL: z.string().describe('The URL of the uploaded image.'),
    }),
  },
  output: {
    schema: z.object({
      elements: z.array(z.string()).describe('Key visual elements detected in the image (e.g., mountains, water, buildings).'),
      composition: z.string().describe('Overall composition and layout of the image (e.g., centered, chaotic, balanced).'),
      colorPalette: z.array(z.string()).describe('Dominant colors and their shades in the image.'),
      levelType: z.string().describe('A description of the type of level most suitable for the image (e.g platformer, puzzle, adventure)'),
    }),
  },
  prompt: `You are an AI assistant designed to analyze images and provide a detailed breakdown for game level generation.

Analyze the provided image focusing on elements that can be translated into game level design. Provide the visual elements, composition, color palette and level type for the image.

Image URL: {{imageURL}}

Respond with a JSON object containing:
- elements: An array of strings, each describing a key visual element detected in the image (e.g., mountains, water, buildings).
- composition: A brief description of the overall composition and layout of the image (e.g., centered, chaotic, balanced).
- colorPalette: An array of strings, listing the dominant colors and their shades in the image.
- levelType: A description of the type of level most suitable for the image (e.g platformer, puzzle, adventure)
`,
});

const generateLevelTemplatesPrompt = ai.definePrompt({
  name: 'generateLevelTemplatesPrompt',
  input: {
    schema: z.object({
      imageURL: z.string().describe('The URL of the uploaded image.'),
      theme: z.string().optional().describe('The theme to use for level generation.'),
      elements: z.array(z.string()).describe('Key visual elements detected in the image'),
      composition: z.string().describe('Overall composition and layout of the image'),
      levelType: z.string().describe('Type of level suitable for this image'),
      levelDescription: z.string().optional().describe('User description of level requirements'),
      spriteSuggestions: z.array(z.string()).optional().describe('List of available sprite names'),
    }),
  },
  output: {
    schema: z.object({
      levelLayout: z.string().describe('The generated game level layout in JSON format, including sprite usage.'),
    }),
  },
  prompt: `You are an expert game level designer. Generate a game level layout in JSON format based on the analysis of the following image. Incorporate the visual elements, composition, and level type to create compelling and engaging level design. The layout should represent a unique interpretation of the image. Use the provided sprites to add visual details and interactive elements.
  Pay close attention to the level type, and incorporate specific game design elements appropriate for the level type. For example, for a platformer make sure to include adequate platforms, for an adventure game make sure to include rooms, pathways, treasure locations, etc.
  Also use the composition of the image to give you some ideas. For example, if the composition is chaotic, then make the layout feel chaotic and dangerous.
  In the level layout, include specific instructions or comments on where different sprites should be placed and how they should be used to enhance the gameplay experience.
  Make sure that all the sprite names that you include in the JSON, exist in the spriteSuggestions list.

Image URL: {{imageURL}}
Theme: {{theme}}
Visual Elements: {{elements}}
Composition: {{composition}}
Level Type: {{levelType}}
User Description: {{levelDescription}}
Available Sprites: {{spriteSuggestions}}

Respond with the generated level layout in JSON format.`,
});

const listSpritesTool = ai.defineTool({
    name: 'listSprites',
    description: 'Lists available sprite image file names from the provided game folder.',
    inputSchema: z.object({
      gameFolder: z.string().describe('The path to the game project folder. This folder should contain a subfolder named "sprites".'),
    }),
    outputSchema: z.array(z.string()).describe('A list of sprite image file names (e.g., ["player.png", "enemy.png", "platform.png"]).'),
  },
  async input => {
    const {gameFolder} = input;
    if (!gameFolder) {
      console.log("No game folder provided, cannot list sprites.");
      return [];
    }
    const spritesFolder = `${gameFolder}/sprites`;
    console.log("Looking for sprites in:", spritesFolder);

    // Placeholder implementation: Replace with actual logic to read the directory.
    // and return the sprite names.
    // For now, return a hardcoded list.
    return ['player.png', 'enemy.png', 'platform.png'];
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
  const { imageURL, theme, gameFolder, levelDescription } = input;

  const [{ output: analyzeImageOutput }, { output: detailedAnalysis }] = await Promise.all([
    analyzeImagePrompt({ imageURL }),
    detailedImageAnalysisPrompt({ imageURL }),
  ]);

  const {result: spriteListResult} = await listSpritesTool({gameFolder: gameFolder ?? ''});
  const spriteSuggestions = spriteListResult;

  const { output: generateLevelTemplatesOutput } = await generateLevelTemplatesPrompt({
    imageURL,
    theme: theme ?? analyzeImageOutput?.themeSuggestions?.[0] ?? 'generic',
    elements: detailedAnalysis!.elements,
    composition: detailedAnalysis!.composition,
    levelType: detailedAnalysis!.levelType,
    levelDescription: levelDescription,
    spriteSuggestions: spriteSuggestions ?? [],
  });

  // Generate placeholder image URLs (replace with your logic)
  const backgroundImageURL = `https://picsum.photos/800/600?random=${Math.random()}`; // Example: Random background

  return {
    levelLayout: generateLevelTemplatesOutput!.levelLayout,
    themeSuggestions: analyzeImageOutput!.themeSuggestions,
    spriteSuggestions: spriteSuggestions,
    backgroundImageURL: backgroundImageURL,
  };
});
