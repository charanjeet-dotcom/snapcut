"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Download,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import { fileToBase64 } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  removeBackground,
  suggestPromptsAction,
  refineImageAction,
} from "@/app/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Dropzone from "./dropzone";
import { Skeleton } from "../ui/skeleton";

export default function Editor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  const [isProcessing, startProcessing] = useTransition();
  const [isSuggesting, startSuggesting] = useTransition();
  const [isRefining, startRefining] = useTransition();

  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload an image file.",
      });
      return;
    }

    try {
      const base64Image = await fileToBase64(file);
      setOriginalImage(base64Image);
      setProcessedImage(null);
      setSuggestedPrompts([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read the image file.",
      });
    }
  };

  const handleRemoveBackground = () => {
    if (!originalImage) return;

    startProcessing(async () => {
      const result = await removeBackground(originalImage);
      if (result.success) {
        setProcessedImage(result.image);
      } else {
        toast({
          variant: "destructive",
          title: "Processing Failed",
          description: result.error,
        });
        setOriginalImage(null); // Reset on failure
      }
    });
  };
  
  const handleSuggestPrompts = () => {
    if (!originalImage || !processedImage) return;
    startSuggesting(async () => {
      const result = await suggestPromptsAction(originalImage, processedImage);
      if (result.success) {
        setSuggestedPrompts(result.prompts);
      } else {
        toast({
          variant: "destructive",
          title: "AI Suggestion Failed",
          description: result.error,
        });
      }
    });
  };

  const handleRefineImage = (prompt: string) => {
    if (!originalImage || !processedImage) return;
    
    // We don't actually use the prompt text in the action, but this simulates the user choice.
    startRefining(async () => {
      const result = await refineImageAction(originalImage, processedImage);
      if (result.success) {
        setProcessedImage(result.image);
        setSuggestedPrompts([]); // Clear prompts after refinement
      } else {
        toast({
          variant: "destructive",
          title: "AI Refinement Failed",
          description: result.error,
        });
      }
    });
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "snapcut_processed.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setSuggestedPrompts([]);
  };

  if (!originalImage) {
    return <Dropzone onImageUpload={handleImageUpload} />;
  }

  return (
    <div className="w-full max-w-7xl">
      <div className="flex justify-end mb-4">
        <Button variant="ghost" onClick={handleReset}>
          <X className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Original Image Card */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon /> Original Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square relative rounded-lg overflow-hidden border">
              <Image
                src={originalImage}
                alt="Original"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </CardContent>
        </Card>

        {/* Processed Image Card */}
        <Card className="flex flex-col transition-all duration-300 hover:shadow-xl hover:border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles /> Processed Image
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center items-center gap-4">
            <div className="aspect-square w-full relative rounded-lg overflow-hidden border bg-muted/30">
              {isProcessing || isRefining ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground p-4 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="font-medium text-lg">
                    {isProcessing
                      ? "Removing background..."
                      : "Refining with AI..."}
                  </p>
                  <p className="text-sm">This may take a moment.</p>
                </div>
              ) : processedImage ? (
                <Image
                  src={processedImage}
                  alt="Processed"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <Button
                    size="lg"
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                  >
                    <Wand2 className="mr-2 h-5 w-5" />
                    Remove Background
                  </Button>
                </div>
              )}
            </div>

            {processedImage && !isProcessing && !isRefining && (
              <div className="w-full flex flex-col gap-4 items-center">
                <div className="w-full flex flex-wrap justify-center gap-4">
                   <Button onClick={handleDownload} className="w-full sm:w-auto flex-grow sm:flex-grow-0">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button variant="outline" onClick={handleSuggestPrompts} disabled={isSuggesting} className="w-full sm:w-auto flex-grow sm:flex-grow-0">
                    {isSuggesting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Refine with AI
                  </Button>
                </div>

                {isSuggesting && (
                  <div className="w-full space-y-2 pt-4">
                     <p className="text-sm font-medium text-center text-muted-foreground">Getting AI suggestions...</p>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                )}
                
                {suggestedPrompts.length > 0 && !isRefining &&(
                   <div className="w-full space-y-3 pt-4 animate-in fade-in duration-500">
                    <p className="text-sm font-medium text-center text-muted-foreground">Choose a refinement style:</p>
                    {suggestedPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 group"
                        onClick={() => handleRefineImage(prompt)}
                        disabled={isRefining}
                      >
                        <Sparkles className="mr-3 h-4 w-4 text-accent transition-transform group-hover:scale-125" />
                        <span className="flex-1">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
