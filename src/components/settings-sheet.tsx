"use client";

import React from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/settings-context";

export function SettingsSheet({ children }: { children: React.ReactNode }) {
  const {
    language,
    setLanguage,
    playbackMode,
    setPlaybackMode,
    voice,
    setVoice,
    playbackSpeed,
    setPlaybackSpeed,
    largeHitTargets,
    setLargeHitTargets,
  } = useSettings();

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
            <Select value={language} onValueChange={setLanguage}>
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
            <Label>Playback Mode</Label>
            <RadioGroup
              value={playbackMode}
              onValueChange={(value) => setPlaybackMode(value as "phoneme" | "letter")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phoneme" id="phoneme" />
                <Label htmlFor="phoneme">Phoneme (Sound)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="letter" id="letter" />
                <Label htmlFor="letter">Letter Name</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-3">
            <Label>Voice</Label>
            <RadioGroup
              value={voice}
              onValueChange={(value) => setVoice(value as "male" | "female")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
            </RadioGroup>
          </div>

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
                    Increases the touch area for letters.
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
