// hooks/useChatHistory.ts
import { useState, useCallback } from 'react';
import type { SavedChatEntry, ChatMessage } from '../types/chat';

interface UseChatHistoryProps {
  spaceId?: string;
  studyMaterialId?: string;
  userId?: string;
}

interface UseChatHistoryReturn {
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadChatHistory: () => Promise<ChatMessage[]>;
  loadMoreHistory: () => Promise<ChatMessage[]>;
  clearError: () => void;
}

export function useChatHistory({
  spaceId,
  studyMaterialId,
  userId,
}: UseChatHistoryProps): UseChatHistoryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  const convertSavedChatToMessages = useCallback((savedChats: SavedChatEntry[]): ChatMessage[] => {
    const messages: ChatMessage[] = [];
    
    for (const savedChat of savedChats) {
      // Add user message
      messages.push({
        id: `${savedChat.id}-user`,
        text: savedChat.query,
        isUser: true,
        timestamp: new Date(savedChat.createdAt),
        isPersisted: true,
        chatId: savedChat.id,
      });

      // Add AI response
      messages.push({
        id: `${savedChat.id}-ai`,
        text: savedChat.response,
        isUser: false,
        timestamp: new Date(savedChat.createdAt),
        sources: savedChat.sources,
        confidence: savedChat.confidence,
        isPersisted: true,
        chatId: savedChat.id,
      });
    }

    return messages;
  }, []);

  const fetchChatHistory = useCallback(async (limit = 25, offset = 0): Promise<SavedChatEntry[]> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (spaceId) {
      params.append('spaceId', spaceId);
    }

    if (studyMaterialId) {
      params.append('studyMaterialId', studyMaterialId);
    }

    const response = await fetch(`/api/chat/history?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to load chat history');
    }

    const data = await response.json();
    return data.chats || [];
  }, [spaceId, studyMaterialId, userId]);

  const loadChatHistory = useCallback(async (): Promise<ChatMessage[]> => {
    if (!userId) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const savedChats = await fetchChatHistory(25, 0);
      const messages = convertSavedChatToMessages(savedChats);
      
      setLoadedCount(savedChats.length);
      setHasMore(savedChats.length === 25); // If we got exactly 25, there might be more
      
      return messages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat history';
      setError(errorMessage);
      console.error('Failed to load chat history:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchChatHistory, convertSavedChatToMessages]);

  const loadMoreHistory = useCallback(async (): Promise<ChatMessage[]> => {
    if (!userId || !hasMore || isLoading) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const savedChats = await fetchChatHistory(25, loadedCount);
      const messages = convertSavedChatToMessages(savedChats);
      
      setLoadedCount(prev => prev + savedChats.length);
      setHasMore(savedChats.length === 25); // If we got exactly 25, there might be more
      
      return messages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more chat history';
      setError(errorMessage);
      console.error('Failed to load more chat history:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId, hasMore, isLoading, loadedCount, fetchChatHistory, convertSavedChatToMessages]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    hasMore,
    error,
    loadChatHistory,
    loadMoreHistory,
    clearError,
  };
}