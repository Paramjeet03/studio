'use server';
/**
 * @fileOverview Generates a game level layout in JSON format based on an uploaded image and description.
 *
 * - generateLevelFromImage - A function that generates a game level layout from an image and description.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const GenerateLevelInputSchema = z.object({
  imageURL: z.string().describe('The URL of the uploaded image.'),
  levelDescription: z.string().optional().describe('Optional user description of the level requirements'),
  codeLanguage: z.string().describe('The coding language for the level file. Supported languages are python, lua, gdscript, csharp, json'),
  repoUrl: z.string().optional().describe('Optional repository URL for pushing the code.'),
  repoToken: z.string().optional().describe('Optional repository token for authentication.'),
});
export type GenerateLevelInput = z.infer<typeof GenerateLevelInputSchema>;

const GenerateLevelOutputSchema = z.object({
  levelLayout: z.string().describe('The generated game level layout in the specified coding language.'),
});
export type GenerateLevelOutput = z.infer<typeof GenerateLevelOutputSchema>;

export async function generateLevelFromImage(input: GenerateLevelInput): Promise<GenerateLevelOutput> {
  return generateLevelFromImageFlow(input);
}

const generateLevelTemplatesPrompt = ai.definePrompt({
  name: 'generateLevelTemplatesPrompt',
  input: {
    schema: z.object({
      imageURL: z.string().describe('The URL of the uploaded image.'),
      levelDescription: z.string().optional().describe('User description of level requirements'),
      codeLanguage: z.string().describe('The coding language for the level file. Supported languages are python, lua, gdscript, csharp, json'),
      repoUrl: z.string().optional().describe('Optional repository URL for pushing the code.'),
      repoToken: z.string().optional().describe('Optional repository token for authentication.'),
    }),
  },
  output: {
    schema: z.object({
      levelLayout: z.string().describe('The generated game level layout in the specified coding language.'),
    }),
  },
  prompt: `You are an expert game level designer. Generate a game level layout code based on the analysis of the following image, adhering to the syntax rules of the specified coding language. The level code should represent a unique interpretation of the image, optimized for the specified game. If the coding language is python, then make sure the python code is syntactically correct.
Ensure that you return the code without any additional explanations or conversation, with only the code enclosed in a code block.

Image URL: {{imageURL}}
User Description: {{levelDescription}}
Coding Language: {{codeLanguage}}
Repository URL: {{repoUrl}}
Repository Token: {{repoToken}}

Here's an example format for the level layout code:

\`\`\`{{codeLanguage}}
# Example level data for a jungle-themed platformer in Python
level_data = {
    "theme": "jungle",
    "layout": {
        "start": (0, 0),
        "end": (50, 20),
    },
     "collectibles": {
            "gems": [
                (5, 3, "pink"),
                (12, 7, "purple"),
                (25, 12, "pink"),
                (38, 5, "purple"),
                (45, 15, "pink")
            ]
        },
}

def generate_level():
    return level_data
\`\`\`

Respond with the generated level layout code in the specified coding language.`,
});


const generateLevelFromImageFlow = ai.defineFlow<
  typeof GenerateLevelInputSchema,
  typeof GenerateLevelOutputSchema
>({
  name: 'generateLevelFromImageFlow',
  inputSchema: GenerateLevelInputSchema,
  outputSchema: GenerateLevelOutputSchema,
}, async input => {
  const { imageURL, theme, levelDescription, codeLanguage, repoUrl, repoToken } = input;

  try {
        const { output: generateLevelTemplatesOutput } = await generateLevelTemplatesPrompt({
            imageURL,
            levelDescription: levelDescription,
            codeLanguage: codeLanguage,
            repoUrl: repoUrl,
            repoToken: repoToken,
        });
        if (!generateLevelTemplatesOutput) {
            console.error('AI prompt returned empty output');
            return {
                levelLayout: `// Level generation failed.  Please try again or revise your description. \n // No output from AI Prompt`,
            };
        }
        let levelLayout = generateLevelTemplatesOutput.levelLayout;
        if (!levelLayout) {
            console.error('AI prompt returned empty level layout');
            levelLayout = `// Level generation failed.  Please try again or revise your description. \n // No level layout was generated.`;
        }

        return {
            levelLayout: levelLayout,
        };
    } catch (error: any) {
        console.error('Error generating level:', error);
        return {
            levelLayout: `// Level generation failed.  Please try again or revise your description.\n// Error: ${error.message || 'Unknown error'}`,
        };
    }
});
