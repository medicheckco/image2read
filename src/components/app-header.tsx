"use client";

import Link from "next/link";
import { BookAudio, Cog, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSheet } from "@/components/settings-sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <BookAudio className="h-6 w-6 text-primary" />
          <span className="font-headline text-2xl font-bold tracking-wide">
            image2read
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <SettingsSheet>
            <Button variant="ghost" size={isMobile ? "icon" : "default"}>
              <Cog className="h-5 w-5" />
              {!isMobile && <span className="ml-2">Settings</span>}
            </Button>
          </SettingsSheet>
        </div>
      </div>
    </header>
  );
}
