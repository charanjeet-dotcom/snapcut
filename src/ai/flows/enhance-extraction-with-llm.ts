// Enhance extraction with LLM
'use server';
/**
 * @fileOverview Refines foreground extraction using an LLM to determine and apply better prompts.
 *
 * - enhanceExtraction - A function that handles the enhancement of foreground extraction.
 * - EnhanceExtractionInput - The input type for the enhanceExtraction function.
 * - EnhanceExtractionOutput - The return type for the enhanceExtraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceExtractionInputSchema = z.object({
  initialImage: z
    .string()
    .describe(
      "The initial image with background removed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  originalImage: z
    .string()
    .describe(
      "The original image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhanceExtractionInput = z.infer<typeof EnhanceExtractionInputSchema>;

const EnhanceExtractionOutputSchema = z.object({
  enhancedImage: z
    .string()
    .describe(
      'The enhanced image with refined foreground extraction, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type EnhanceExtractionOutput = z.infer<typeof EnhanceExtractionOutputSchema>;

export async function enhanceExtraction(input: EnhanceExtractionInput): Promise<EnhanceExtractionOutput> {
  return enhanceExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceExtractionPrompt',
  input: {schema: EnhanceExtractionInputSchema},
  output: {schema: EnhanceExtractionOutputSchema},
  prompt: `You are an expert image editor. You will refine the foreground extraction of an image.

  You will be given the initial image with the background removed and the original image.  Your goal is to identify areas where the initial extraction was poor and generate a refined image with a better foreground extraction.

  Initial Image: {{media url=initialImage}}
  Original Image: {{media url=originalImage}}

  Output the enhanced image as a data URI.
  `,
});

const enhanceExtractionFlow = ai.defineFlow(
  {
    name: 'enhanceExtractionFlow',
    inputSchema: EnhanceExtractionInputSchema,
    outputSchema: EnhanceExtractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      enhancedImage: output!.enhancedImage,
    };
  }
);
