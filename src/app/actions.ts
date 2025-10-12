"use server";

import { enhanceExtraction } from "@/ai/flows/enhance-extraction-with-llm";
import { suggestRefinementPrompts } from "@/ai/flows/suggest-refinement-prompts";

// Mock function to simulate an API call for background removal
export async function removeBackground(
  image: string
): Promise<{ success: true; image: string } | { success: false; error: string }> {
  try {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // In a real app, you'd call an external API like remove.bg here.
    // We are calling our GenAI flow to simulate an initial background removal.
    const result = await enhanceExtraction({
        originalImage: image,
        initialImage: image, // Passing original image as initial to get a first pass
    });

    return { success: true, image: result.enhancedImage };
  } catch (error) {
    console.error("Error removing background:", error);
    return {
      success: false,
      error: "Failed to remove background. Please try again.",
    };
  }
}

export async function suggestPromptsAction(
  originalImage: string,
  processedImage: string
): Promise<{ success: true; prompts: string[] } | { success: false; error: string }> {
  try {
    const result = await suggestRefinementPrompts({
      originalImageUri: originalImage,
      initialExtractionResult: processedImage,
    });
    return { success: true, prompts: result.suggestedPrompts };
  } catch (error) {
    console.error("Error suggesting prompts:", error);
    return {
      success: false,
      error: "Failed to get AI suggestions. Please try again.",
    };
  }
}

export async function refineImageAction(
  originalImage: string,
  processedImage: string
): Promise<{ success: true; image: string } | { success: false; error: string }> {
  try {
    const result = await enhanceExtraction({
      originalImage: originalImage,
      initialImage: processedImage,
    });
    return { success: true, image: result.enhancedImage };
  } catch (error) {
    console.error("Error refining image:", error);
    return {
      success: false,
      error: "Failed to refine image with AI. Please try again.",
    };
  }
}
