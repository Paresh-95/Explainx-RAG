"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FirstMessageContextType {
  firstMessage: string | null;
  setFirstMessage: (message: string | null) => void;
  clearFirstMessage: () => void;
}

const FirstMessageContext = createContext<FirstMessageContextType | undefined>(undefined);

export const useFirstMessage = () => {
  const context = useContext(FirstMessageContext);
  if (context === undefined) {
    throw new Error('useFirstMessage must be used within a FirstMessageProvider');
  }
  return context;
};

interface FirstMessageProviderProps {
  children: ReactNode;
}

export const FirstMessageProvider: React.FC<FirstMessageProviderProps> = ({ children }) => {
  const [firstMessage, setFirstMessage] = useState<string | null>(null);

  const clearFirstMessage = () => {
    setFirstMessage(null);
  };

  return (
    <FirstMessageContext.Provider value={{ firstMessage, setFirstMessage, clearFirstMessage }}>
      {children}
    </FirstMessageContext.Provider>
  );
}; 