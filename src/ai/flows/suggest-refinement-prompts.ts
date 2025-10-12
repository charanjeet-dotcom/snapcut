// src/ai/flows/suggest-refinement-prompts.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting refinement prompts to improve foreground extraction after initial background removal.
 *
 * It includes:
 * - suggestRefinementPrompts: The main function to generate refinement prompts.
 * - SuggestRefinementPromptsInput: The input type for the function, including the original image and initial extraction result.
 * - SuggestRefinementPromptsOutput: The output type, providing a list of suggested prompts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRefinementPromptsInputSchema = z.object({
  originalImageUri: z
    .string()
    .describe(
      'The original image as a data URI (e.g., data:image/png;base64,...).'
    ),
  initialExtractionResult: z
    .string()
    .describe(
      'The data URI of the image after initial background removal.'
    ),
});

export type SuggestRefinementPromptsInput = z.infer<
  typeof SuggestRefinementPromptsInputSchema
>;

const SuggestRefinementPromptsOutputSchema = z.object({
  suggestedPrompts: z.array(z.string()).describe(
    'An array of suggested refinement prompts to improve foreground extraction.'
  ),
});

export type SuggestRefinementPromptsOutput = z.infer<
  typeof SuggestRefinementPromptsOutputSchema
>;

export async function suggestRefinementPrompts(
  input: SuggestRefinementPromptsInput
): Promise<SuggestRefinementPromptsOutput> {
  return suggestRefinementPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRefinementPromptsPrompt',
  input: {schema: SuggestRefinementPromptsInputSchema},
  output: {schema: SuggestRefinementPromptsOutputSchema},
  prompt: `You are an AI assistant that suggests refinement prompts for improving foreground extraction in images after an initial background removal process.

  Given the original image and the initial extraction result, analyze the shortcomings of the extraction and suggest three different prompts that a user could apply to a generative AI model to refine the foreground extraction.

  Original Image: {{media url=originalImageUri}}
  Initial Extraction Result: {{media url=initialExtractionResult}}

  Consider areas where the foreground is poorly defined, incomplete, or contains unwanted artifacts from the background. Suggest prompts that address these specific issues to achieve a cleaner and more accurate extraction.

  Format your response as a JSON object with a \"suggestedPrompts\" field containing an array of three strings.
  `,
});

const suggestRefinementPromptsFlow = ai.defineFlow(
  {
    name: 'suggestRefinementPromptsFlow',
    inputSchema: SuggestRefinementPromptsInputSchema,
    outputSchema: SuggestRefinementPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
