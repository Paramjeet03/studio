'use server';
/**
 * @fileOverview A Genkit flow to generate level descriptions and suggest improvements based on an image.
 *
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateLevelDescriptionInputSchema = z.object({
  imageURL: z.string().describe('The URL of the uploaded image.'),
  levelDescription: z.string().optional().describe('Optional user description of the level.'),
  suggestionLevel: z.number().describe('The level of AI suggestion (0-100).'),
});
export type GenerateLevelDescriptionInput = z.infer<typeof GenerateLevelDescriptionInputSchema>;

const GenerateLevelDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated level description, including suggestions for improvement.'),
});
export type GenerateLevelDescriptionOutput = z.infer<typeof GenerateLevelDescriptionOutputSchema>;

export async function generateLevelDescription(
  input: GenerateLevelDescriptionInput
): Promise<GenerateLevelDescriptionOutput> {
  return generateLevelDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLevelDescriptionPrompt',
  input: {
    schema: z.object({
      imageURL: z.string().describe('The URL of the uploaded image.'),
      levelDescription: z.string().optional().describe('Optional user description of the level.'),
      suggestionLevel: z.number().describe('The level of AI suggestion (0-100).'),
    }),
  },
  output: {
    schema: z.object({
      description: z.string().describe('The generated level description, including suggestions for improvement.'),
    }),
  },
  prompt: `You are an AI assistant designed to analyze game level images and generate creative and detailed level descriptions for game developers, along with specific suggestions for improvements.

Based on the image provided and the user's optional description, generate a level description that captures the essence of the scene and suggests potential gameplay elements. Also, provide suggestions on how to improve the level design based on the image. Consider the suggestion level to adjust the creativity and detail of the description and suggestions.

Image URL: {{imageURL}}
User Description: {{levelDescription}}
Suggestion Level: {{suggestionLevel}}

Here are some considerations for elements to include in your level description:
*   **Environment and Setting:** Describe the environment. Is it a forest, a desert, a futuristic city, or something else? What are the dominant colors and textures? What makes this setting unique?
*   **Gameplay Opportunities:** What unique gameplay opportunities does the setting afford? Does it encourage exploration, puzzle-solving, combat, or a combination of these?
*   **Unique Elements:** Describe any unique architectural or natural elements, such as ancient ruins, waterfalls, hidden caves, or futuristic skyscrapers.

Here are some examples of level improvement suggestions that you can provide in response:

*   **Adding more diverse enemy types to enhance combat challenges.**
*   **Integrating interactive elements like switches or moving platforms.**
*   **Improving the lighting scheme to create a more immersive atmosphere.**
*   **Suggesting more specific placement of collectibles or power-ups.**
*   **Suggesting the creation of multiple routes to end of level.**

Respond with a detailed level description followed by concrete suggestions for improvement.
`,
});

const generateLevelDescriptionFlow = ai.defineFlow<
  typeof GenerateLevelDescriptionInputSchema,
  typeof GenerateLevelDescriptionOutputSchema
>({
  name: 'generateLevelDescriptionFlow',
  inputSchema: GenerateLevelDescriptionInputSchema,
  outputSchema: GenerateLevelDescriptionOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
