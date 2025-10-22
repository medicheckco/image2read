
"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/settings-context";

export function SettingsSheet({ children }: { children: React.ReactNode }) {
  const {
    language,
    setLanguage,
    playbackSpeed,
    setPlaybackSpeed,
    largeHitTargets,
    setLargeHitTargets,
    voiceName,
    setVoiceName,
  } = useSettings();

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const voices = synth.getVoices();
      const filteredVoices = voices.filter(v => v.lang.startsWith(language.split('-')[0]));
      setAvailableVoices(filteredVoices);
      if (!voiceName && filteredVoices.length > 0) {
        setVoiceName(filteredVoices[0].name);
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
  }, [language, voiceName, setVoiceName]);


  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Reset voice when language changes
    setVoiceName("");
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Settings</SheetTitle>
          <SheetDescription>
            Configure the application to your child's needs.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="es-ES">Spanish</SelectItem>
                <SelectItem value="fr-FR">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />
          
          <div className="grid gap-3">
            <Label htmlFor="voice">Voice</Label>
            <Select value={voiceName} onValueChange={setVoiceName} disabled={availableVoices.length === 0}>
                <SelectTrigger id="voice">
                    <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                    {availableVoices.length > 0 ? (
                        availableVoices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="loading" disabled>
                           Loading voices...
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid gap-3">
            <Label htmlFor="playback-speed">Playback Speed: {playbackSpeed}x</Label>
            <Slider
              id="playback-speed"
              min={0.5}
              max={1.5}
              step={0.1}
              value={[playbackSpeed]}
              onValueChange={(value) => setPlaybackSpeed(value[0])}
            />
          </div>

          <Separator />
          
          <div className="grid gap-3">
            <Label>Accessibility</Label>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="large-targets">Large Hit Targets</Label>
                <p className="text-sm text-muted-foreground">
                    Increases the touch area for words.
                </p>
              </div>
              <Switch
                id="large-targets"
                checked={largeHitTargets}
                onCheckedChange={setLargeHitTargets}
              />
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
