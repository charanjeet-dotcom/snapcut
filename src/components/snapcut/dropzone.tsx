"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

interface DropzoneProps {
  onImageUpload: (file: File) => void;
}

export default function Dropzone({ onImageUpload }: DropzoneProps) {
  const [isHover, setIsHover] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageUpload(acceptedFiles[0]);
      }
      setIsHover(false);
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    onDragEnter: () => setIsHover(true),
    onDragLeave: () => setIsHover(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative w-full max-w-2xl cursor-pointer rounded-xl border-2 border-dashed border-border bg-card p-8 text-center transition-all duration-300 hover:border-primary hover:bg-muted/50",
        (isDragActive || isHover) && "border-primary bg-muted/50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <UploadCloud
          className={cn(
            "h-16 w-16 transition-colors",
            (isDragActive || isHover) && "text-primary"
          )}
        />
        <div className="space-y-1">
          <p className="text-xl font-semibold text-foreground">
            Drag & drop an image here
          </p>
          <p>or click to select a file</p>
        </div>
        <p className="text-xs">Supports: PNG, JPG, GIF, WEBP</p>
      </div>
    </div>
  );
}
