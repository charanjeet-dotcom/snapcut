'use server';
/**
 * @fileOverview A flow for generating images using Imagen 3.
 *
 * - generateWithImagen - A function that handles image generation.
 * - GenerateWithImagenInput - The input type for the generateWithImagen function.
 * - GenerateWithImagenOutput - The return type for the generateWithImagen function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWithImagenInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the image.'),
});
export type GenerateWithImagenInput = z.infer<
  typeof GenerateWithImagenInputSchema
>;

const GenerateWithImagenOutputSchema = z.object({
  generatedImage: z
    .string()
    .describe(
      'The generated image, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type GenerateWithImagenOutput = z.infer<
  typeof GenerateWithImagenOutputSchema
>;

export async function generateWithImagen(
  input: GenerateWithImagenInput
): Promise<GenerateWithImagenOutput> {
  return generateWithImagenFlow(input);
}

const generateWithImagenFlow = ai.defineFlow(
  {
    name: 'generateWithImagenFlow',
    inputSchema: GenerateWithImagenInputSchema,
    outputSchema: GenerateWithImagenOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-3.0-generate-002',
      prompt: input.prompt,
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
