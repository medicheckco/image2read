"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type PlaybackMode = "phoneme" | "letter";
type Voice = "male" | "female";

interface Settings {
  language: string;
  setLanguage: (language: string) => void;
  playbackMode: PlaybackMode;
  setPlaybackMode: (mode: PlaybackMode) => void;
  voice: Voice;
  setVoice: (voice: Voice) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  largeHitTargets: boolean;
  setLargeHitTargets: (enabled: boolean) => void;
}

const defaultSettings: Settings = {
  language: "en-US",
  setLanguage: () => {},
  playbackMode: "phoneme",
  setPlaybackMode: () => {},
  voice: "female",
  setVoice: () => {},
  playbackSpeed: 1,
  setPlaybackSpeed: () => {},
  largeHitTargets: false,
  setLargeHitTargets: () => {},
};

const SettingsContext = createContext<Settings>(defaultSettings);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState(defaultSettings.language);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(defaultSettings.playbackMode);
  const [voice, setVoice] = useState<Voice>(defaultSettings.voice);
  const [playbackSpeed, setPlaybackSpeed] = useState(defaultSettings.playbackSpeed);
  const [largeHitTargets, setLargeHitTargets] = useState(defaultSettings.largeHitTargets);

  const value = {
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
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
};
