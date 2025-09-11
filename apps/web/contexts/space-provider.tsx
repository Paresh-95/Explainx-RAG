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

interface SpacesContextType {
  spaces: Space[];
  isLoading: boolean;
  error: string | null;
  fetchSpaces: () => Promise<void>;
  addSpace: (space: Space) => void;
  removeSpace: (spaceId: string) => void;
  updateSpace: (spaceId: string, updates: Partial<Space>) => void;
}

const SpacesContext = createContext<SpacesContextType | undefined>(undefined);

export const useSpaces = () => {
  const context = useContext(SpacesContext);
  if (!context) {
    throw new Error('useSpaces must be used within a SpacesProvider');
  }
  return context;
};

interface SpacesProviderProps {
  children: ReactNode;
}

export const SpacesProvider: React.FC<SpacesProviderProps> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchSpaces = async () => {
    // Prevent multiple simultaneous fetches
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/spaces?isPublic=false&visibility=PRIVATE&page=1&limit=50');
      const data = await response.json();
      
      if (data.success) {
        setSpaces(data.spaces);
        setHasFetched(true);
      } else {
        setError(data.error || 'Failed to fetch spaces');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching spaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount if not already fetched
  useEffect(() => {
    if (!hasFetched) {
      fetchSpaces();
    }
  }, [hasFetched]);

  const addSpace = (space: Space) => {
    setSpaces(prev => [...prev, space]);
  };

  const removeSpace = (spaceId: string) => {
    setSpaces(prev => prev.filter(space => space.id !== spaceId));
  };

  const updateSpace = (spaceId: string, updates: Partial<Space>) => {
    setSpaces(prev => 
      prev.map(space => 
        space.id === spaceId 
          ? { ...space, ...updates }
          : space
      )
    );
  };

  const value: SpacesContextType = {
    spaces,
    isLoading,
    error,
    fetchSpaces,
    addSpace,
    removeSpace,
    updateSpace,
  };

  return (
    <SpacesContext.Provider value={value}>
      {children}
    </SpacesContext.Provider>
  );
};