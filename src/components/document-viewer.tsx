
"use client";

import React, { useState, useEffect, useRef } from "react";
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
import type { MockDocument, TextElement } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DocumentViewerProps {
  document: MockDocument;
  onExit: () => void;
  overrideImageUrls?: string[];
}

function DocumentViewer({ document, onExit, overrideImageUrls }: DocumentViewerProps) {
  const { largeHitTargets, playbackSpeed, language, voiceName } = useSettings();
  const { toast } = useToast();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // Track the actual pixel bounding box of the image container
  const [containerRect, setContainerRect] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSynthesis(null);
      setAvailableVoices([]);
      return;
    }

    const synth = window.speechSynthesis;
    setSpeechSynthesis(synth);

    const loadVoices = () => {
      try {
        const voices = synth.getVoices() || [];
        setAvailableVoices(voices);
      } catch {
        setAvailableVoices([]);
      }
    };

    if (synth.getVoices && synth.getVoices().length > 0) {
      loadVoices();
    } else {
      (synth as any).__docViewerOnVoicesChanged = loadVoices;
      synth.onvoiceschanged = loadVoices;
    }

    return () => {
      try {
        if (synth && (synth as any).__docViewerOnVoicesChanged && synth.onvoiceschanged === (synth as any).__docViewerOnVoicesChanged) {
          synth.onvoiceschanged = null;
        }
      } catch {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    if (!imageContainerRef.current) return;

    const node = imageContainerRef.current;

    const updateRect = () => {
      const rect = node.getBoundingClientRect();
      setContainerRect({ width: rect.width, height: rect.height });
    };

    // Initial
    updateRect();

    // Use ResizeObserver so resizing and scale changes keep overlays correct
    const ro = new ResizeObserver(() => updateRect());
    ro.observe(node);

    // Also update on window resize (safe guard)
    const onResize = () => updateRect();
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [imageContainerRef, scale, currentPageIndex]);

  const currentPage = document.pages[currentPageIndex];
  const pageImage = PlaceHolderImages.find((img) => img.id === currentPage.imageId);
  const imageUrl = overrideImageUrls ? overrideImageUrls[currentPageIndex] : pageImage?.imageUrl;

  const speak = (text: string) => {
    if (!speechSynthesis) {
      toast({
        variant: "destructive",
        title: "Speech Synthesis not available",
        description: "Your browser does not support text-to-speech.",
      });
      return;
    }

    try {
      speechSynthesis.cancel();
    } catch {}

    // Keep spaces and common punctuation. Trim empty results.
    const cleanedText = text.replace(/[^a-zA-Z0-9'\-\s.,?!€£€–—]/g, "").trim();
    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    if (language) utterance.lang = language;
    utterance.rate = playbackSpeed;

    if (availableVoices && availableVoices.length > 0) {
      let selectedVoice = voiceName ? availableVoices.find((v) => v && v.name === voiceName) : undefined;
      if (!selectedVoice && language) {
        const primaryLang = language.split("-")[0];
        selectedVoice = availableVoices.find((v) => !!v && !!v.lang && v.lang.split("-")[0] === primaryLang);
      }
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    toast({
      title: (
        <div className="flex items-center">
          <Volume2 className="mr-2 h-5 w-5 text-primary" />
          <span>Speaking: {cleanedText}</span>
        </div>
      ),
    });

    try {
      speechSynthesis.speak(utterance);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to speak text",
        description: String(err),
      });
    }
  };

  const handleWordClick = (word: TextElement) => {
    speak(word.text);
    setActiveWord(word.id);
    setTimeout(() => setActiveWord(null), 300);
  };

  const handleNextPage = () => {
    if (currentPageIndex < document.pages.length - 1) {
      setCurrentPageIndex((i) => i + 1);
      setScale(1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((i) => i - 1);
      setScale(1);
    }
  };

  const [imageSize, setImageSize] = useState({ width: 800, height: 1100 });
  useEffect(() => {
    if (!imageUrl) return;
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => setImageSize({ width: img.width, height: img.height });
    img.onerror = () => {
      // keep defaults
    };
  }, [imageUrl]);

  if (!imageUrl) {
    return <div className="flex h-screen items-center justify-center">Error loading document page.</div>;
  }

  // Keep a consistent base viewport for the viewer, scaled by `scale`.
  const containerWidth = 800;
  const aspectRatio = imageSize.width / imageSize.height || 8 / 11;
  const containerHeight = containerWidth / aspectRatio;

  // Helper to compute pixel rect for a text element (assuming word.x/y/width/height are percentages relative to the image)
  const computeWordRectPx = (word: TextElement) => {
    if (!containerRect) {
      // fallback to percent values relative to the logical container
      const left = (word.x / 100) * (containerWidth * scale);
      const top = (word.y / 100) * (containerHeight * scale);
      const widthPx = (word.width / 100) * (containerWidth * scale);
      const heightPx = (word.height / 100) * (containerHeight * scale);
      return { left, top, widthPx, heightPx };
    }
    const left = (word.x / 100) * containerRect.width;
    const top = (word.y / 100) * containerRect.height;
    const widthPx = (word.width / 100) * containerRect.width;
    const heightPx = (word.height / 100) * containerRect.height;
    return { left, top, widthPx, heightPx };
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col items-center justify-start bg-background/80 p-4">
      <div className="fixed top-20 left-4 z-10 flex gap-2">
        <Button variant="secondary" size="icon" onClick={onExit} aria-label="Exit Viewer">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="fixed top-20 right-4 z-10 flex gap-2">
        <Button variant="secondary" size="icon" onClick={() => setScale((s) => Math.min(s + 0.1, 2))} aria-label="Zoom In">
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))} aria-label="Zoom Out">
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative w-full max-w-4xl overflow-auto rounded-lg shadow-2xl" style={{ maxHeight: "calc(100vh - 10rem)" }}>
        <div
          ref={imageContainerRef}
          className="relative mx-auto"
          style={{
            width: containerWidth * scale,
            height: containerHeight * scale,
          }}
        >
          <Image
            src={imageUrl}
            alt={pageImage?.description || "Uploaded document"}
            width={imageSize.width}
            height={imageSize.height}
            className="pointer-events-none select-none"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            priority
          />

          {/* Render overlays in px so they always line up with the displayed image */}
          {containerRect !== null &&
            currentPage.textElements.map((word) => {
              const { left, top, widthPx, heightPx } = computeWordRectPx(word);

              // Enlarge hit target in px if requested (no transform)
              const factor = largeHitTargets ? 1.4 : 1.0;
              const adjWidth = Math.max(8, widthPx * factor);
              const adjHeight = Math.max(8, heightPx * factor);
              const leftAdj = left - (adjWidth - widthPx) / 2;
              const topAdj = top - (adjHeight - heightPx) / 2;

              const isActive = activeWord === word.id;

              return (
                <button
                  key={word.id}
                  aria-label={`Word ${word.text}`}
                  onClick={() => handleWordClick(word)}
                  className={cn(
                    "absolute z-20 overflow-hidden rounded-sm transition-all duration-150",
                    isActive ? "bg-accent/50" : "hover:bg-accent/30"
                  )}
                  style={{
                    left: leftAdj,
                    top: topAdj,
                    width: adjWidth,
                    height: adjHeight,
                    border: "none",
                    padding: 0,
                    margin: 0,
                    backgroundClip: "padding-box",
                  }}
                />
              );
            })}

          {/* Fallback rendering (when containerRect is null) using percent-based boxes (less accurate) */}
          {containerRect === null &&
            currentPage.textElements.map((word) => {
              const hitboxStylePercent = largeHitTargets
                ? { width: `${word.width * 1.4}%`, left: `${word.x - (word.width * 0.4) / 2}%` }
                : { width: `${word.width}%`, left: `${word.x}%` };

              return (
                <div
                  key={word.id}
                  className="absolute"
                  style={{
                    left: hitboxStylePercent.left,
                    top: `${word.y}%`,
                    width: hitboxStylePercent.width,
                    height: `${word.height}%`,
                  }}
                >
                  <button
                    aria-label={`Word ${word.text}`}
                    onClick={() => handleWordClick(word)}
                    className={cn(
                      "h-full w-full cursor-pointer rounded-sm transition-all duration-300",
                      activeWord === word.id ? "scale-105 bg-accent/50" : "hover:bg-accent/30"
                    )}
                    style={{ transform: "none" }} // don't scale visually
                  />
                </div>
              );
            })}
        </div>
      </div>

      <div className="mt-4 flex w-full max-w-4xl items-center justify-between">
        <Button onClick={handlePrevPage} disabled={currentPageIndex === 0} aria-label="Previous Page">
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <span className="text-lg font-semibold text-foreground">
          Page {currentPageIndex + 1} of {document.pages.length}
        </span>
        <Button onClick={handleNextPage} disabled={currentPageIndex === document.pages.length - 1} aria-label="Next Page">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default DocumentViewer;
