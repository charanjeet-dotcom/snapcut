"use server";

import { enhanceExtraction } from "@/ai/flows/enhance-extraction-with-llm";
import { suggestRefinementPrompts } from "@/ai/flows/suggest-refinement-prompts";

export async function removeBackground(
  image: string
): Promise<{ success: true; image: string } | { success: false; error: string }> {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    console.error("Remove.bg API key is not configured.");
    return {
      success: false,
      error: "The background removal service is not configured. Please contact support.",
    };
  }

  // The fileToBase64 function returns a data URI: data:[<mediatype>];base64,<data>
  // We need to extract just the base64 data part.
  const base64Data = image.split(",")[1];

  try {
    const response = await fetch("https://api.remove.bg/v1/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_file_b64: base64Data,
        size: "auto", // Automatically determine output size
      }),
    });

    if (!response.ok) {
      // Try to parse the error response from remove.bg
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.errors?.[0]?.title || `Request failed with status ${response.status}`;
      console.error("Error removing background:", errorMessage);
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
