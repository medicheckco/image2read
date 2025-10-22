"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  X,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings-context";
import type { MockDocument, Character } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DocumentViewerProps {
  document: MockDocument;
  onExit: () => void;
  overrideImageUrl?: string;
}

export default function DocumentViewer({ document, onExit, overrideImageUrl }: DocumentViewerProps) {
  const { largeHitTargets, playbackMode } = useSettings();
  const { toast } = useToast();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [activeChar, setActiveChar] = useState<string | null>(null);

  const currentPage = document.pages[currentPageIndex];
  const pageImage = PlaceHolderImages.find((img) => img.id === currentPage.imageId);
  
  const imageUrl = overrideImageUrl || pageImage?.imageUrl;

  const handleCharClick = (char: Character) => {
    const message = `Playing ${playbackMode === 'phoneme' ? 'sound for' : 'letter name'}: ${char.char}`;
    console.log(message);
    toast({
      title: (
        <div className="flex items-center">
          <Volume2 className="mr-2 h-5 w-5 text-primary" />
          <span>{message}</span>
        </div>
      ),
    });
    setActiveChar(char.id);
    setTimeout(() => setActiveChar(null), 300);
  };

  const handleNextPage = () => {
    if (currentPageIndex < document.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const hitboxClass = useMemo(() => {
    return largeHitTargets ? "p-2" : "p-0.5";
  }, [largeHitTargets]);

  if (!imageUrl) {
    return <div>Error loading document page.</div>;
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col items-center justify-start bg-background/80 p-4">
      <div className="fixed top-20 left-4 z-10 flex gap-2">
        <Button variant="secondary" size="icon" onClick={onExit} aria-label="Exit Viewer">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="fixed top-20 right-4 z-10 flex gap-2">
        <Button variant="secondary" size="icon" onClick={() => setScale(s => Math.min(s + 0.1, 2))} aria-label="Zoom In">
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} aria-label="Zoom Out">
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative w-full max-w-4xl overflow-auto rounded-lg shadow-2xl">
        <div className="relative mx-auto" style={{ width: 800 * scale, height: 1100 * scale }}>
          <Image
            src={imageUrl}
            alt={pageImage?.description || "Uploaded document"}
            width={800}
            height={1100}
            className="pointer-events-none select-none"
            style={{ width: '100%', height: '100%' }}
            priority
          />
          {currentPage.characters.map((char) => (
            <div
              key={char.id}
              className={cn("absolute", hitboxClass)}
              style={{
                left: `${char.x}%`,
                top: `${char.y}%`,
                width: `${char.width}%`,
                height: `${char.height}%`,
              }}
            >
              <button
                aria-label={`Letter ${char.char}`}
                onClick={() => handleCharClick(char)}
                className={cn(
                  "h-full w-full cursor-pointer rounded-sm transition-all duration-300",
                  activeChar === char.id
                    ? "scale-125 bg-accent/50"
                    : "hover:bg-accent/30"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex w-full max-w-4xl items-center justify-between">
        <Button
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0}
          aria-label="Previous Page"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <span className="text-lg font-semibold text-foreground">
          Page {currentPageIndex + 1} of {document.pages.length}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={currentPageIndex === document.pages.length - 1}
          aria-label="Next Page"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
