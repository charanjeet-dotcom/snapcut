
"use server";

import { enhanceExtraction } from "@/ai/flows/enhance-extraction-with-llm";
import { generateAndEditImage } from "@/ai/flows/generate-and-edit-image";
import { suggestRefinementPrompts } from "@/ai/flows/suggest-refinement-prompts";

export async function removeBackground(
  image: string,
  addShadow?: boolean
): Promise<{ success: true; image: string } | { success: false; error: string }> {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    console.error("Remove.bg API key is not configured.");
    return {
      success: false,
      error: "The background removal service is not configured. Please contact support.",
    };
  }

  try {
    const blob = await fetch(image).then(res => res.blob());
    const formData = new FormData();
    formData.append('image_file', blob);
    formData.append('size', 'auto');
    if (addShadow) {
      formData.append('add_shadow', 'true');
    }

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      // Try to parse the error response from remove.bg
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.errors?.[0]?.title || errorMessage;
      } catch (e) {
        // Ignore if response is not JSON
      }
      console.error("Error removing background:", await response.text());
      return { success: false, error: errorMessage };
    }

    const imageBlob = await response.blob();
    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    const base64Image = `data:${imageBlob.type};base64,${buffer.toString("base64")}`;

    return { success: true, image: base64Image };

  } catch (error: any) {
    console.error("Error removing background:", error);
    return {
      success: false,
      error: error.message || "Failed to remove background. Please try again.",
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

export async function generateImageAction(
  prompt: string,
  imageToEdit?: string
): Promise<{ success: true; image: string } | { success: false; error: string }> {
  try {
    const result = await generateAndEditImage({
      prompt,
      imageToEdit,
    });
    return { success: true, image: result.generatedImage };
  } catch (error: any) {
    console.error("Error generating image:", error);
    return {
      success: false,
      error: error.message || "Failed to generate image with AI. Please try again.",
    };
  }
}
