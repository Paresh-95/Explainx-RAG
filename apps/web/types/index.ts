export type CreateMethod = "upload" | "paste" | "record" | null;

export type AuthSearchParams = {
  error?: string;
  success?: string;
  invite?: string;
  next?: string;
};

export interface LearnClientProps {
  studyMaterial: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    docid: string;
    youtubeUrl: string | null;
    fileUrl: string | null;
    recordingUrl: string | null;
    fileName: string | null;
    fileSize: number | null;
    mimeType: string | null;
    duration: number | null;
    isProcessed: boolean;
    processingStatus: string | null;
    spaceId: string;
    uploadedById: string;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
    uploadedBy: {
      id: string;
      username: string | null;
      name: string | null;
    };
    space: {
      id: string;
      name: string;
      description: string | null;
      slug: string;
      isPublic: boolean;
      visibility: string;
      ownerId: string;
      organizationId: string | null;
      settings: any;
      tags: string[];
      createdAt: Date;
      updatedAt: Date;
      owner: {
        id: string;
        username: string | null;
        name: string | null;
      };
      organization?: {
        id: string;
        name: string;
        slug: string;
      } | null;
      studyMaterials: Array<{
        id: string;
        title: string;
        description: string | null;
        type: string;
        youtubeUrl: string | null;
        fileUrl: string | null;
        recordingUrl: string | null;
        fileName: string | null;
        fileSize: number | null;
        mimeType: string | null;
        duration: number | null;
        isProcessed: boolean;
        processingStatus: string | null;
        spaceId: string;
        uploadedById: string;
        metadata: any;
        createdAt: Date;
        updatedAt: Date;
        uploadedBy: {
          id: string;
          username: string | null;
          name: string | null;
        };
      }>;
    };
  };
  space: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    isPublic: boolean;
    visibility: string;
    ownerId: string;
    organizationId: string | null;
    settings: any;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    owner: {
      id: string;
      username: string | null;
      name: string | null;
    };
    organization?: {
      id: string;
      name: string;
      slug: string;
    } | null;
    studyMaterials: Array<{
      id: string;
      title: string;
      description: string | null;
      type: string;
      youtubeUrl: string | null;
      fileUrl: string | null;
      recordingUrl: string | null;
      fileName: string | null;
      fileSize: number | null;
      mimeType: string | null;
      duration: number | null;
      isProcessed: boolean;
      processingStatus: string | null;
      spaceId: string;
      uploadedById: string;
      metadata: any;
      createdAt: Date;
      updatedAt: Date;
      uploadedBy: {
        id: string;
        username: string | null;
        name: string | null;
      };
    }>;
  };
  session: any;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  type: string;
  docid?: string;
  youtubeUrl: string | null;
  fileUrl: string | null;
  recordingUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  duration: number | null;
  isProcessed: boolean;
  processingStatus: string | null;
  spaceId: string;
  uploadedById: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: {
    id: string;
    username: string | null;
    name: string | null;
  };
}

export interface ChatComponentRef {
  handleTextSelect: (
    text: string,
    action: "explain" | "summarize" | "chat",
  ) => void;
}

export interface ChatComponentProps {
  spaceId: string;
  studyMaterials: StudyMaterial[];
  currentStudyMaterial: StudyMaterial;
  session: any;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Array<{
    chunkId: string;
    score: number;
    text: string;
  }>;
  confidence?: number;
  isLoading?: boolean;
  error?: string;
}

export interface UploadState {
  status: "idle" | "uploading" | "completed" | "failed";
  progress: number;
  error?: string;
  fileUrl?: string;
  studyMaterialId?: string;
}

export interface FilePreview {
  type: string;
  url: string;
  name: string;
  studyMaterialId?: string;
  uploadState?: UploadState;
}

export interface RAGResponse {
  success: boolean;
  answer: string;
  sources: Array<{
    chunkId: string;
    score: number;
    text: string;
  }>;
  confidence: number;
  context?: string;
  error?: string;
}
