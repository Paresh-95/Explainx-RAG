export interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  type: string;
  youtubeUrl: string | null;
  fileUrl: string | null;
  recordingUrl: string | null;
  mimeType: string | null;
  fileName: string | null;
  fileSize: number | null;
  isProcessed: boolean;
  createdAt: string;
  updatedAt: string;
  spaceId: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
  sources?: Array<{
    text: string;
    score: number;
  }>;
  confidence?: number;
}

export interface FilePreview {
  studyMaterialId: any;
  type: 'image' | 'file';
  url: string;
  name: string;
  uploadState?: {
    status: 'uploading' | 'completed' | 'failed';
    progress?: number;
    error?: string;
    fileUrl?: string;
    studyMaterialId?: string;
  };
}

export interface RAGResponse {
  answer: string;
  sources: Array<{
    text: string;
    score: number;
  }>;
  confidence: number;
}

export interface ChatComponentRef {
  handleTextSelect: (text: string, action: 'explain' | 'summarize' | 'chat') => void;
}

export interface ChatComponentProps {
  spaceId: string;
  studyMaterials: StudyMaterial[];
  currentStudyMaterial: StudyMaterial;
  session: any;
  onSourceClick?: (source: { text: string; score: number }) => void;
}

export interface LearnClientProps {
  studyMaterial: StudyMaterial;
  space: {
    id: string;
    studyMaterials: StudyMaterial[];
  };
  session: any;
} 

export interface Space {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  visibility: "PRIVATE" | "PUBLIC" | "ORGANIZATION_ONLY";
  createdAt: string;
  updatedAt: string;
  studyMaterials: any[];
  owner: {
    username: string | null;
    name: string | null;
    id: string;
  };
  userRole?: string;
  userMembership?: any;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canManageMembers: boolean;
    canUpload: boolean;
    canView: boolean;
    canJoin: boolean;
    canLeave: boolean;
  };
  memberCount?: number;
  materialCount?: number;
}