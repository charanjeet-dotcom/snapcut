
'use server';
/**
 * @fileOverview A flow for generating and editing images using a text prompt.
 *
 * - generateAndEditImage - A function that handles image generation and editing.
 * - GenerateAndEditImageInput - The input type for the generateAndEditImage function.
 * - GenerateAndEditImageOutput - The return type for the generateAndEditImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAndEditImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate or edit the image.'),
  imageToEdit: z
    .string()
    .optional()
    .describe(
      "An optional image to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. If not provided, a new image will be generated."
    ),
});
export type GenerateAndEditImageInput = z.infer<
  typeof GenerateAndEditImageInputSchema
>;

const GenerateAndEditImageOutputSchema = z.object({
  generatedImage: z
    .string()
    .describe(
      'The generated or edited image, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type GenerateAndEditImageOutput = z.infer<
  typeof GenerateAndEditImageOutputSchema
>;

export async function generateAndEditImage(
  input: GenerateAndEditImageInput
): Promise<GenerateAndEditImageOutput> {
  return generateAndEditImageFlow(input);
}

const generateAndEditImageFlow = ai.defineFlow(
  {
    name: 'generateAndEditImageFlow',
    inputSchema: GenerateAndEditImageInputSchema,
    outputSchema: GenerateAndEditImageOutputSchema,
  },
  async input => {
    let model;
    let generationPrompt: any;
    let config;

    if (input.imageToEdit) {
      // Image-to-image
      model = 'googleai/gemini-2.5-flash-image-preview';
      generationPrompt = [
        {media: {url: input.imageToEdit}},
        {text: input.prompt},
      ];
      config = { responseModalities: ['IMAGE'] };
    } else {
      // Text-to-image
      model = 'googleai/imagen-4.0-fast-generate-001';
      generationPrompt = input.prompt;
    }

    const {media} = await ai.generate({
      model,
      prompt: generationPrompt,
      config,
    });

    const imageUrl = media.url;
    if (!imageUrl) {
      throw new Error('Image generation failed.');
    }

    return {
      generatedImage: imageUrl,
    };
  }
);
