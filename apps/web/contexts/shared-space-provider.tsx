"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: string;
  youtubeUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
}

interface Space {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  visibility: "PUBLIC" | "PRIVATE" | "SHARED";
  createdAt: string;
  contents: number;
  studyMaterials: StudyMaterial[];
  owner: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
}

interface SharedSpacesContextType {
  sharedSpaces: Space[];
  isLoading: boolean;
  error: string | null;
  fetchSharedSpaces: () => Promise<void>;
}

const SharedSpacesContext = createContext<SharedSpacesContextType | undefined>(undefined);

export const useSharedSpaces = () => {
  const context = useContext(SharedSpacesContext);
  if (!context) {
    throw new Error('useSharedSpaces must be used within a SharedSpacesProvider');
  }
  return context;
};

interface SharedSpacesProviderProps {
  children: ReactNode;
}

export const SharedSpacesProvider: React.FC<SharedSpacesProviderProps> = ({ children }) => {
  const [sharedSpaces, setSharedSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchSharedSpaces = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/shared-spaces');
      const data = await response.json();
      if (data.success) {
        if (Array.isArray(data.spaces) && data.spaces.length > 0 && data.spaces[0].space) {
          setSharedSpaces(data.spaces.map((m: any) => m.space));
        } else {
          setSharedSpaces(data.spaces);
        }
        setHasFetched(true);
      } else {
        setError(data.error || 'Failed to fetch shared spaces');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching shared spaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched) {
      fetchSharedSpaces();
    }
  }, [hasFetched]);

  const value: SharedSpacesContextType = {
    sharedSpaces,
    isLoading,
    error,
    fetchSharedSpaces,
  };

  return (
    <SharedSpacesContext.Provider value={value}>
      {children}
    </SharedSpacesContext.Provider>
  );
}; 