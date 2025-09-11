"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: string;
  docid: string;
  youtubeUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
  space: {
    id: string;
    name: string;
    slug: string;
  };
}

interface RecentsContextType {
  recents: StudyMaterial[];
  allStudyMaterials: StudyMaterial[];
  isLoading: boolean;
  error: string | null;
  fetchRecents: (limit?: number) => Promise<void>;
  fetchAllStudyMaterials: () => Promise<void>;
}

const RecentsContext = createContext<RecentsContextType | undefined>(undefined);

export const useRecents = () => {
  const context = useContext(RecentsContext);
  if (!context) {
    throw new Error('useRecents must be used within a RecentsProvider');
  }
  return context;
};

interface RecentsProviderProps {
  children: ReactNode;
}

export const RecentsProvider: React.FC<RecentsProviderProps> = ({ children }) => {
  const [recents, setRecents] = useState<StudyMaterial[]>([]);
  const [allStudyMaterials, setAllStudyMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchRecents = async (limit?: number) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const url = limit ? `/api/docs/recents?limit=${limit}` : '/api/docs/recents';
      console.log('Fetching recents from:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        console.log('Received recents data:', data.studyMaterials);
        setRecents(data.studyMaterials);
        setHasFetched(true);
      } else {
        console.error('Failed to fetch recents:', data.error);
        setError(data.error || 'Failed to fetch recent study materials');
      }
    } catch (err) {
      console.error('Error fetching recent study materials:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllStudyMaterials = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const url = '/api/docs/recents';
      console.log('Fetching all study materials from:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        console.log('Received all study materials data:', data.studyMaterials);
        setAllStudyMaterials(data.studyMaterials);
      } else {
        console.error('Failed to fetch all study materials:', data.error);
        setError(data.error || 'Failed to fetch study materials');
      }
    } catch (err) {
      console.error('Error fetching study materials:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched) {
      console.log('Initial fetch of study materials');
      fetchRecents(4); // Fetch 4 recent items for the dashboard
      fetchAllStudyMaterials(); // Fetch all items for the sidebar
    }
  }, [hasFetched]);

  const value: RecentsContextType = {
    recents,
    allStudyMaterials,
    isLoading,
    error,
    fetchRecents,
    fetchAllStudyMaterials,
  };

  return (
    <RecentsContext.Provider value={value}>
      {children}
    </RecentsContext.Provider>
  );
}; 