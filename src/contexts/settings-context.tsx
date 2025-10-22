
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Settings {
  language: string;
  setLanguage: (language: string) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  largeHitTargets: boolean;
  setLargeHitTargets: (enabled: boolean) => void;
}

const defaultSettings: Settings = {
  language: "en-US",
  setLanguage: () => {},
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
  const [playbackSpeed, setPlaybackSpeed] = useState(defaultSettings.playbackSpeed);
  const [largeHitTargets, setLargeHitTargets] = useState(defaultSettings.largeHitTargets);

  const value = {
    language,
    setLanguage,
    playbackSpeed,
    setPlaybackSpeed,
    largeHitTargets,
    setLargeHitTargets,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
};
