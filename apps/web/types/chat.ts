// types/chat.ts - Updated chat types to include persisted chat
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
  sources?: Array<{ text: string; score: number }>;
  confidence?: number;
  // New fields for persisted chats
  isPersisted?: boolean; // Whether this message is from saved chat history
  chatId?: string; // Reference to the saved chat entry
}

export interface SavedChatEntry {
  id: string;
  spaceId?: string;
  userId: string;
  chatType: 'MATERIAL' | 'SPACE';
  studyMaterialId?: string;
  studyMaterialIds?: string[];
  query: string;
  response: string;
  sources?: any;
  confidence?: number;
  ragMetadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface RAGResponse {
  answer: string;
  sources?: Array<{ text: string; score: number }>;
  confidence?: number;
  chatId?: string; // Added to track the saved chat
}

export interface FilePreview {
  type: 'image' | 'file';
  url: string;
  name: string;
  uploadState?: {
    status: 'uploading' | 'completed' | 'failed';
    progress: number;
    error?: string;
    fileUrl?: string;
    studyMaterialId?: string;
  };
  studyMaterialId?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  type: string;
  docid: string;
  youtubeUrl?: string;
  fileUrl?: string;
  recordingUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  isProcessed: boolean;
  processingStatus?: string;
  isChunk?: boolean;
  spaceId?: string;
  uploadedById: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatComponentProps {
  spaceId: string;
  studyMaterials: StudyMaterial[];
  currentStudyMaterial?: StudyMaterial;
  session?: any;
  onExpand?: () => void;
}

export interface DashboardChatComponentProps {
  studyMaterials: StudyMaterial[];
  currentStudyMaterial?: StudyMaterial;
}

export interface ChatComponentRef {
  handleTextSelect: (text: string, action: 'explain' | 'summarize' | 'chat') => void;
}