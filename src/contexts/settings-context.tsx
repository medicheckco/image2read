
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Settings {
  language: string;
  setLanguage: (language: string) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  largeHitTargets: boolean;
  setLargeHitTargets: (enabled: boolean) => void;
  voiceName: string;
  setVoiceName: (voiceName: string) => void;
}

const defaultSettings: Settings = {
  language: "en-US",
  setLanguage: () => {},
  playbackSpeed: 1,
  setPlaybackSpeed: () => {},
  largeHitTargets: false,
  setLargeHitTargets: () => {},
  voiceName: "", // Empty string means use browser default
  setVoiceName: () => {},
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
  const [playbackSpeed, setPlaybackSpeed] = useState(defaultSettings.playbackSpeed);
  const [largeHitTargets, setLargeHitTargets] = useState(defaultSettings.largeHitTargets);
  const [voiceName, setVoiceName] = useState<string>(defaultSettings.voiceName);

  const value = {
    language,
    setLanguage,
    playbackSpeed,
    setPlaybackSpeed,
    largeHitTargets,
    setLargeHitTargets,
    voiceName,
    setVoiceName,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
};
