
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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

export default function DocumentViewer({ document, onExit, overrideImageUrls }: DocumentViewerProps) {
  const { largeHitTargets, playbackSpeed, language } = useSettings();
  const { toast } = useToast();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    setSpeechSynthesis(synth);

    const loadVoices = () => {
        const availableVoices = synth.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
        }
    };

    // Voices may load asynchronously.
    if (synth.getVoices().length > 0) {
      loadVoices();
    } else {
        synth.onvoiceschanged = loadVoices;
    }

    return () => {
        synth.onvoiceschanged = null;
    };
  }, []);

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
    
    speechSynthesis.cancel(); // Cancel any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = playbackSpeed;

    if (voices.length > 0) {
        const langVoices = voices.filter(v => v.lang.startsWith(language.split('-')[0]));
        // Prefer a female voice, but fall back to any voice for the language.
        const selectedVoice = langVoices.find(v => /female/i.test(v.name)) || langVoices[0];
        
        utterance.voice = selectedVoice || voices[0];

        if (!utterance.voice) {
            console.warn(`No voice found for language '${language}'. Using browser default.`);
        }
    }


    toast({
        title: (
          <div className="flex items-center">
            <Volume2 className="mr-2 h-5 w-5 text-primary" />
            <span>Speaking: {text}</span>
          </div>
        ),
      });

    speechSynthesis.speak(utterance);
  };

  const handleWordClick = (word: TextElement) => {
    speak(word.text);
    setActiveWord(word.id);
    setTimeout(() => setActiveWord(null), 300);
  };

  const handleNextPage = () => {
    if (currentPageIndex < document.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setScale(1); // Reset zoom on page change
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setScale(1); // Reset zoom on page change
    }
  };

  const hitboxClass = useMemo(() => {
    return largeHitTargets ? "p-1" : "p-0";
  }, [largeHitTargets]);
  
  const [imageSize, setImageSize] = useState({ width: 800, height: 1100 });
  
  useEffect(() => {
    if (imageUrl) {
        const img = new window.Image();
        img.src = imageUrl;
        img.onload = () => {
            setImageSize({ width: img.width, height: img.height });
        };
    }
  }, [imageUrl]);

  if (!imageUrl) {
    return <div className="flex h-screen items-center justify-center">Error loading document page.</div>;
  }

  const containerWidth = 800; // base width for our viewing area
  const aspectRatio = imageSize.width / imageSize.height;
  const containerHeight = containerWidth / aspectRatio;

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

      <div className="relative w-full max-w-4xl overflow-auto rounded-lg shadow-2xl" style={{ maxHeight: 'calc(100vh - 10rem)'}}>
        <div 
          ref={imageContainerRef}
          className="relative mx-auto" 
          style={{ 
            width: containerWidth * scale, 
            height: containerHeight * scale 
          }}
        >
          <Image
            src={imageUrl}
            alt={pageImage?.description || "Uploaded document"}
            width={imageSize.width}
            height={imageSize.height}
            className="pointer-events-none select-none"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            priority
          />
          {currentPage.textElements.map((word) => (
            <div
              key={word.id}
              className={cn("absolute", hitboxClass)}
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                width: `${word.width}%`,
                height: `${word.height}%`,
              }}
            >
              <button
                aria-label={`Word ${word.text}`}
                onClick={() => handleWordClick(word)}
                className={cn(
                  "h-full w-full cursor-pointer rounded-sm transition-all duration-300",
                  activeWord === word.id
                    ? "scale-105 bg-accent/50"
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
