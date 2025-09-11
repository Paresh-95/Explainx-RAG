"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ExamSettings {
  questionType?: string;
  examLength?: number;
  count?: number;
}
interface ExamSettingsContextType {
  examSettings: ExamSettings;
  setExamSettings: (settings: ExamSettings) => void;
}

const ExamSettingsContext = createContext<ExamSettingsContextType | undefined>(undefined);

export const ExamSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [examSettings, setExamSettings] = useState<ExamSettings>({});
  return (
    <ExamSettingsContext.Provider value={{ examSettings, setExamSettings }}>
      {children}
    </ExamSettingsContext.Provider>
  );
};

export const useExamSettings = () => {
  const context = useContext(ExamSettingsContext);
  if (!context) {
    throw new Error('useExamSettings must be used within an ExamSettingsProvider');
  }
  return context;
}; 