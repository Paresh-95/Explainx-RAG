"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  MessageCircle,
  Bookmark,
  FileQuestion,
  FileText,
  Layers,
  StickyNote,
  Search,
  GitBranch,
  Mic,
  Image,
  Paperclip,
  Send,
  Activity,
  Earth,
  AtSign,
  Bot,
  User,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import type {
  ChatComponentProps,
  ChatMessage,
  FilePreview,
  RAGResponse,
  StudyMaterial,
  ChatComponentRef,
} from "../../types/chat";
import { useChatHistory } from "../../hooks/useChatHistory";
import FlashcardUI from "./flashcard-ui";
import QuizUI from "./QuizUI";
import React from "react";
import Editor from "./editor";
import SummaryUI from "./SummaryUI";
import QuizInteractive from "./QuizInteractive";
import FlashcardsInteractive from "./FlashcardsInteractive";
import MindmapInteractive from "./MindmapInteractive";
import TimelineInteractive from "./TimelineInteractive";
import { parseInteractivePayload } from "./parseInteractivePayload";

interface ExtendedChatComponentProps extends ChatComponentProps {
  onSourceClick?: (source: { text: string; score: number }) => void;
}

// Add interface for document status
interface DocumentStatus {
  id: string;
  isProcessed: boolean;
  processingProgress?: number;
  error?: string;
}

// Processing Status Component
const ProcessingStatus = ({
  studyMaterial,
  onProcessingComplete,
}: {
  studyMaterial: StudyMaterial;
  onProcessingComplete: () => void;
}) => {
  const [status, setStatus] = useState<DocumentStatus>({
    id: studyMaterial.id,
    isProcessed: false,
  });
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/documents/status/${studyMaterial.id}`);
      if (!response.ok) {
        throw new Error("Failed to check document status");
      }

      const statusData: DocumentStatus = await response.json();
      setStatus(statusData);

      if (statusData.isProcessed) {
        // Refresh the window
        window.location.reload();
        onProcessingComplete();
      }
    } catch (err) {
      console.error("Error checking document status:", err);
      setError(err instanceof Error ? err.message : "Failed to check status");
    }
  }, [studyMaterial.id, onProcessingComplete]);

  useEffect(() => {
    // Initial check
    checkStatus();

    // Set up polling every 4 seconds if not processed
    const interval = setInterval(() => {
      if (!status.isProcessed) {
        checkStatus();
      } else {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [checkStatus, status.isProcessed]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-red-700 dark:text-red-400 mb-2">
          Processing Error
        </h3>
        <p className="text-sm text-red-600 dark:text-red-300 text-center max-w-md">
          {error}
        </p>
        <Button
          onClick={checkStatus}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          <RefreshCw size={16} className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="w-16 h-16 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
        <Loader2 size={28} className="text-blue-500 animate-spin" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
        Processing Document
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
        "{studyMaterial.title}" is being processed for AI chat.
      </p>
      {status.processingProgress && (
        <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${status.processingProgress}%` }}
          />
        </div>
      )}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        This usually takes a few minutes...
      </p>
    </div>
  );
};

// Tabs Component
const Tabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const tabs = [
    { id: "chat", label: "Chat", icon: <MessageCircle size={12} /> },
    { id: "flashcards", label: "Flashcards", icon: <Bookmark size={12} /> },
    { id: "quizzes", label: "Quizzes", icon: <FileQuestion size={12} /> },
    { id: "summary", label: "Summary", icon: <FileText size={12} /> },
    { id: "chapters", label: "Chapters", icon: <Layers size={12} /> },
    { id: "notes", label: "Notes", icon: <StickyNote size={12} /> },
  ];

  return (
    <div className="flex space-x-1 overflow-x-auto pb-3 px-4  border-gray-200 dark:border-gray-800 pt-3 bg-white dark:bg-[#161616] rounded-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-full transition-colors ${
            activeTab === tab.id
              ? "bg-purple-100 text-purple-800 dark:bg-white/10 dark:text-white"
              : "text-gray-500 hover:text-purple-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// Load More History Button Component
const LoadMoreButton = ({
  onLoadMore,
  isLoading,
  hasMore,
}: {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
}) => {
  if (!hasMore) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">No more chat history</p>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <Button
        onClick={onLoadMore}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Loading...
          </>
        ) : (
          <>
            <RefreshCw size={16} className="mr-2" />
            Load More History
          </>
        )}
      </Button>
    </div>
  );
};

const ChatMessage = ({
  message,
  onSourceClick,
}: {
  message: ChatMessage;
  onSourceClick: (source: { text: string; score: number }) => void;
}) => {
  const handleSourceClick = (source: { text: string; score: number }) => {
    if (onSourceClick) {
      onSourceClick(source);
    }
  };

  // Memoize the parsing function to prevent re-renders
  const parseInteractiveData = useCallback((text: string) => {
    try {
      let parsed = JSON.parse(text);
      // Handle double-encoded JSON
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      // Handle array format
      if (Array.isArray(parsed)) {
        const timelineItem = parsed.find((item) => item.type === "timeline");
        if (timelineItem) {
          // Filter out the type indicator, keep only events
          const timelineEvents = parsed.filter(
            (item) => item.year && item.event,
          );
          return { type: "timeline", data: timelineEvents };
        }
        const mindmapItem = parsed.find(
          (item) => item.type === "mindmap" && item.content,
        );
        if (mindmapItem) {
          return { type: "mindmap", data: parsed }; // Pass the entire array
        }
        const quizItem = parsed.find(
          (item) => item.type === "quiz" && item.content === undefined,
        );
        if (quizItem) {
          return { type: "quiz", data: parsed };
        }
        // Updated flashcards detection: only check for type
        const flashcardsItem = parsed.find(
          (item) => item.type === "flashcards",
        );
        if (flashcardsItem) {
          return { type: "flashcards", data: parsed };
        }
      }
      // Handle direct object format
      if (parsed && typeof parsed === "object") {
        if (parsed.type === "mindmap" || parsed.central_topic) {
          return { type: "mindmap", data: parsed };
        }
        if (parsed.type === "quiz") {
          return { type: "quiz", data: parsed };
        }
        if (parsed.type === "flashcards") {
          return { type: "flashcards", data: parsed };
        }
        if (parsed.type === "timeline") {
          // If it's a single object, wrap in array
          return { type: "timeline", data: [parsed] };
        }
      }
    } catch (e) {
      // If parsing fails, fall back to original parseInteractivePayload if it exists
      if (typeof parseInteractivePayload === "function") {
        return parseInteractivePayload(text);
      }
    }
    return null;
  }, []);

  // Memoize the interactive result to prevent re-computation
  const interactive = useMemo(() => {
    if (message.isUser || message.isLoading || message.error) {
      return null;
    }
    return parseInteractiveData(message.text);
  }, [
    message.isUser,
    message.isLoading,
    message.error,
    message.text,
    parseInteractiveData,
  ]);

  return (
    <div
      className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div className={`max-w-[85%] ${message.isUser ? "order-2" : "order-1"}`}>
        <div
          className={`flex items-start gap-3 ${message.isUser ? "flex-row-reverse" : "flex-row"}`}
        >
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${message.isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white"}`}
          >
            {message.isUser ? <User size={18} /> : <Bot size={18} />}
          </div>

          {/* Message Content */}
          <div
            className={`flex flex-col ${message.isUser ? "items-end" : "items-start"} w-full`}
          >
            <div
              className={
                `p-4 rounded-2xl max-w-full ` +
                (message.isUser
                  ? "bg-blue-600 text-white rounded-br-md"
                  : message.error
                    ? "bg-red-100 text-red-700 border border-red-300 rounded-bl-md dark:bg-red-900/50 dark:text-red-200 dark:border-red-700"
                    : message.isPersisted
                      ? "bg-gray-100 text-gray-900 rounded-bl-md border-l-2 border-gray-300 dark:bg-gray-800/70 dark:text-white dark:border-gray-600"
                      : "bg-gray-100 text-gray-900 rounded-bl-md dark:bg-gray-800 dark:text-white")
              }
            >
              {message.isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              ) : message.error ? (
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{message.error}</span>
                </div>
              ) : interactive ? (
                interactive.type === "quiz" ? (
                  <QuizInteractive quizData={interactive.data} />
                ) : interactive.type === "flashcards" ? (
                  <FlashcardsInteractive cards={interactive.data} />
                ) : interactive.type === "mindmap" ? (
                  <MindmapInteractive mindmap={interactive.data} />
                ) : interactive.type === "timeline" ? (
                  <TimelineInteractive timeline={interactive.data} />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </div>
                )
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </div>
              )}
            </div>

            {/* Sources in small circles - positioned below the message */}
            {!message.isUser &&
              !message.isLoading &&
              !message.error &&
              message.sources &&
              message.sources.length > 0 && (
                <div className="flex items-center gap-2 mt-2 ml-1">
                  <div className="flex flex-wrap gap-1">
                    {message.sources.slice(0, 3).map((source, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSourceClick(source)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-purple-100 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-medium transition-colors cursor-pointer border border-gray-300 dark:border-gray-600"
                        title={`Source ${idx + 1}: ${source.text.slice(0, 100)}...`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    {message.sources.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400 font-medium">
                        +{message.sources.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Confidence indicator */}
                  {message.confidence && (
                    <div className="text-xs text-gray-500 ml-2">
                      {Math.round(message.confidence * 100)}%
                    </div>
                  )}
                </div>
              )}

            {/* Timestamp with persisted indicator */}
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-1 flex items-center gap-2">
              <span>
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {message.isPersisted && (
                <span className="text-gray-400 dark:text-gray-600 text-xs">
                  • saved
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Tutor Component (empty state) - Updated to focus on current study material
const AiTutorEmptyState = ({
  currentStudyMaterial,
  studyMaterials = [],
  onQuickAction,
}: {
  currentStudyMaterial?: any;
  studyMaterials?: any[];
  onQuickAction: (action: string) => void;
}) => {
  const processedMaterials = studyMaterials.filter((m) => m.isProcessed);
  const isCurrentProcessed = currentStudyMaterial?.isProcessed;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 mb-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <MessageCircle size={28} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
        Learn with the AI Tutor
      </h3>
      <div className="grid grid-cols-3 gap-2 mt-8 w-full max-w-md text-sm">
        <button
          onClick={() =>
            onQuickAction(
              `Create a quiz based on "${currentStudyMaterial?.title || "current material"}"`,
            )
          }
          className="flex items-center justify-center gap-2 p-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700"
          disabled={!isCurrentProcessed}
        >
          <FileQuestion size={12} />
          <span>Quiz</span>
        </button>
        <button
          onClick={() =>
            onQuickAction(
              `Create a mind map of key concepts from "${currentStudyMaterial?.title || "current material"}"`,
            )
          }
          className="flex items-center justify-center gap-2 p-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700"
          disabled={!isCurrentProcessed}
        >
          <GitBranch size={12} />
          <span>Mind Map</span>
        </button>
        <button className="flex items-center justify-center gap-2 p-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700">
          <Mic size={12} />
          <span>Voice Mode</span>
        </button>
        <button
          onClick={() =>
            onQuickAction(
              `Generate flashcards for key terms from "${currentStudyMaterial?.title || "current material"}"`,
            )
          }
          className="flex items-center justify-center gap-2 p-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700"
          disabled={!isCurrentProcessed}
        >
          <Bookmark size={12} />
          <span>Flashcards</span>
        </button>
        <button
          onClick={() =>
            onQuickAction(
              `Search through "${currentStudyMaterial?.title || "current material"}"`,
            )
          }
          className="flex items-center justify-center gap-2 p-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700"
          disabled={!isCurrentProcessed}
        >
          <Search size={12} />
          <span>Search</span>
        </button>
        <button
          onClick={() =>
            onQuickAction(
              `Summarize the main points from "${currentStudyMaterial?.title || "current material"}"`,
            )
          }
          className="flex items-center justify-center gap-2 p-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700"
          disabled={!isCurrentProcessed}
        >
          <Activity size={12} />
          <span>Summary</span>
        </button>
      </div>
    </div>
  );
};

function InputBar({
  inputValue,
  setInputValue,
  handleSendMessage,
  spaceId,
  isLoading,
  disabled = false,
}: {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  spaceId: string;
  isLoading: boolean;
  disabled?: boolean;
}) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState(0);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const options = [
    { label: "Quiz", icon: <FileQuestion size={12} /> },
    { label: "MindMap", icon: <GitBranch size={12} /> },
    { label: "VoiceMode", icon: <Mic size={12} /> },
    { label: "Flashcards", icon: <Bookmark size={12} /> },
    { label: "Search", icon: <Search size={12} /> },
    { label: "Timeline", icon: <Activity size={12} /> },
  ];

  const uploadFileToS3 = async (
    file: File,
  ): Promise<{ fileUrl: string; studyMaterialId: string }> => {
    try {
      // Validate file type
      const allowedTypes = [
        // Documents
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        // Images
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "File type not supported. Please upload PDF, Word, PowerPoint, text files, or images (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF).",
        );
      }

      // Validate file size (300MB limit)
      const maxSize = 300 * 1024 * 1024; // 300MB in bytes
      if (file.size > maxSize) {
        throw new Error("File size exceeds 300MB limit");
      }

      const requestBody = {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        title: file.name,
        description: "",
        spaceId: spaceId,
        isTemporary: false,
      };

      const presignedResponse = await fetch("/api/upload-presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      let responseData;
      try {
        responseData = await presignedResponse.json();
      } catch (e) {
        console.error("Failed to parse response:", e);
        throw new Error("Invalid response from server");
      }

      if (!presignedResponse.ok) {
        console.error("Upload failed:", responseData);
        throw new Error(
          responseData?.error ||
            responseData?.message ||
            "Failed to get upload URL",
        );
      }

      if (!responseData.presignedUrl || !responseData.fileUrl) {
        console.error("Missing required fields in response:", responseData);
        throw new Error("Invalid response format from server");
      }

      const { presignedUrl, fileUrl, studyMaterialId } = responseData;

      // Step 2: Upload to S3
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setFilePreviews((prev) =>
              prev.map((p) =>
                p.name === file.name
                  ? { ...p, uploadState: { status: "uploading", progress } }
                  : p,
              ),
            );
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            setFilePreviews((prev) =>
              prev.map((p) =>
                p.name === file.name
                  ? {
                      ...p,
                      uploadState: {
                        status: "completed",
                        progress: 100,
                        fileUrl,
                        studyMaterialId,
                      },
                    }
                  : p,
              ),
            );
            resolve({ fileUrl, studyMaterialId });
          } else {
            setFilePreviews((prev) =>
              prev.map((p) =>
                p.name === file.name
                  ? {
                      ...p,
                      uploadState: {
                        status: "failed",
                        progress: 0,
                        error: "Upload failed",
                      },
                    }
                  : p,
              ),
            );
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          setFilePreviews((prev) =>
            prev.map((p) =>
              p.name === file.name
                ? {
                    ...p,
                    uploadState: {
                      status: "failed",
                      progress: 0,
                      error: "Network error during upload",
                    },
                  }
                : p,
            ),
          );
          reject(new Error("Network error during upload"));
        });

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      setFilePreviews((prev) =>
        prev.map((p) =>
          p.name === file.name
            ? {
                ...p,
                uploadState: {
                  status: "failed",
                  progress: 0,
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                },
              }
            : p,
        ),
      );
      throw error;
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding new files would exceed the limit
    if (filePreviews.length + files.length > 3) {
      alert("You can only upload up to 3 files/images");
      return;
    }

    // Add files to preview immediately
    Array.from(files).forEach((file) => {
      const preview: FilePreview = {
        type: file.type.startsWith("image/") ? "image" : "file",
        url: URL.createObjectURL(file),
        name: file.name,
        uploadState: { status: "uploading", progress: 0 },
        studyMaterialId: undefined,
      };
      setFilePreviews((prev) => [...prev, preview]);
    });

    // Upload each file to S3
    for (const file of Array.from(files)) {
      try {
        const { fileUrl, studyMaterialId } = await uploadFileToS3(file);
        setFilePreviews((prev) =>
          prev.map((p) =>
            p.name === file.name ? { ...p, url: fileUrl, studyMaterialId } : p,
          ),
        );

        console.log(
          "Uploaded file:",
          file.name,
          "with ID:",
          studyMaterialId,
          "and URL:",
          fileUrl,
        );
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    // Reset the input value to allow selecting the same file again
    event.target.value = "";
  };

  const removeFilePreview = (index: number) => {
    setFilePreviews((prev) => {
      const newPreviews = [...prev];
      const preview = newPreviews[index];
      if (preview?.type === "file" && !preview.studyMaterialId) {
        URL.revokeObjectURL(preview.url);
      }
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastAtIndex = value.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(" ")) {
        setShowMentions(true);
        setMentionPosition(lastAtIndex);
        setInputValue(value);
        return;
      }
    }

    setShowMentions(false);
    setInputValue(value);
  };

  const handleOptionSelect = (option: string) => {
    const beforeMention = inputValue.slice(0, mentionPosition);
    const afterMention = inputValue.slice(mentionPosition + 1);
    setInputValue(`${beforeMention}@${option.toLowerCase()} ${afterMention}`);
    setShowMentions(false);
  };

  const handleSubmit = () => {
    if (!inputValue.trim() || isLoading || disabled) return;
    handleSendMessage();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-transparent">
      {filePreviews.length > 0 && (
        <div className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#303030] rounded p-2 mb-2">
          <div className="flex flex-wrap gap-2">
            {filePreviews.map((preview, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-200 dark:bg-[#303030] rounded-lg px-2 py-1 w-fit"
              >
                {preview.type === "image" ? (
                  <img
                    src={preview.url}
                    alt="Preview"
                    className="h-6 w-6 object-cover rounded"
                  />
                ) : (
                  <FileText
                    size={16}
                    className="text-gray-700 dark:text-gray-300"
                  />
                )}
                <span className="text-sm text-gray-800 dark:text-gray-300 truncate max-w-[150px]">
                  {preview.name}
                </span>
                {preview.uploadState?.status === "uploading" && (
                  <div className="w-4 h-4 border-2 border-gray-500 dark:border-gray-300 border-t-transparent rounded-full animate-spin" />
                )}
                <button
                  onClick={() => removeFilePreview(index)}
                  className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center rounded-xl px-3 py-2 gap-2 w-full relative bg-gray-100 dark:bg-[#303030] border border-gray-300 dark:border-gray-700">
        {/* File Upload Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
          onClick={() => imageInputRef.current?.click()}
          disabled={isLoading}
        >
          <Image size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Paperclip size={20} />
        </Button>

        {/* Input */}
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ask anything"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-transparent border-none text-black dark:text-white placeholder-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
            disabled={isLoading}
          />
          {showMentions && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-lg z-50">
              <div className="p-1">
                {options.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleOptionSelect(option.label)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            className="border border-purple-600 text-xs px-3 h-8 rounded-full text-purple-600 hover:bg-purple-100 dark:hover:border-white dark:hover:text-white"
            variant="ghost"
            disabled={isLoading}
          >
            <Earth size={12} />
            Search
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-purple-600 text-white text-xs px-3 h-8 rounded-full hover:bg-purple-700"
                variant="ghost"
                disabled={isLoading}
              >
                <AtSign size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              {options.map((option) => (
                <DropdownMenuItem
                  key={option.label}
                  onClick={() => handleOptionSelect(option.label)}
                  className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {option.icon}
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            disabled={isLoading}
          >
            <Mic size={20} />
          </Button>

          <Button
            onClick={handleSubmit}
            size="icon"
            className={cn(
              "rounded-full",
              inputValue && !isLoading
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed",
            )}
            disabled={!inputValue || isLoading}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Component - Updated with document status checking
const ChatComponent = React.forwardRef<
  ChatComponentRef,
  ExtendedChatComponentProps
>(
  (
    {
      spaceId,
      studyMaterials,
      currentStudyMaterial: initialStudyMaterial,
      session,
      onSourceClick,
    }: ExtendedChatComponentProps,
    ref,
  ) => {
    const [activeTab, setActiveTab] = useState("chat");
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStudyMaterial, setCurrentStudyMaterial] =
      useState(initialStudyMaterial);
    const [isDocumentProcessed, setIsDocumentProcessed] = useState(
      initialStudyMaterial?.isProcessed || false,
    );
    const [pendingAction, setPendingAction] = useState<{
      text: string;
      action: "explain" | "summarize" | "chat";
    } | null>(null);
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [showProcessingStatus, setShowProcessingStatus] = useState(
      !initialStudyMaterial?.isProcessed,
    );

    // Initialize chat history hook
    const {
      isLoading: isLoadingHistory,
      hasMore,
      error: historyError,
      loadChatHistory,
      loadMoreHistory,
      clearError,
    } = useChatHistory({
      spaceId,
      studyMaterialId: currentStudyMaterial?.id ?? "",
      userId: session?.user?.id,
    });

    // Update study material when props change
    useEffect(() => {
      if (initialStudyMaterial) {
        setCurrentStudyMaterial(initialStudyMaterial);
        setIsDocumentProcessed(initialStudyMaterial.isProcessed || false);
        setShowProcessingStatus(!initialStudyMaterial.isProcessed);
      }
    }, [initialStudyMaterial]);

    // Handle processing completion
    const handleProcessingComplete = useCallback(() => {
      setIsDocumentProcessed(true);
      setShowProcessingStatus(false);
      // Optionally refetch the study material to get updated data
      if (currentStudyMaterial) {
        setCurrentStudyMaterial((prev) =>
          prev ? { ...prev, isProcessed: true } : prev,
        );
      }
    }, [currentStudyMaterial]);

    // If document is not processed, show only ProcessingStatus and hide all chatbot UI
    if (showProcessingStatus && currentStudyMaterial) {
      return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-[#161616] text-gray-900 dark:text-white min-h-0 items-center justify-center">
          <ProcessingStatus
            studyMaterial={currentStudyMaterial}
            onProcessingComplete={handleProcessingComplete}
          />
        </div>
      );
    }

    // Load initial chat history on component mount (only if document is processed)
    useEffect(() => {
      const loadInitialHistory = async () => {
        if (!session?.user?.id || hasLoadedHistory || !isDocumentProcessed)
          return;

        try {
          const historyMessages = await loadChatHistory();
          if (historyMessages.length > 0) {
            // Sort messages by timestamp (oldest first)
            const sortedMessages = historyMessages.sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
            );
            setMessages(sortedMessages);
          }
          setHasLoadedHistory(true);
        } catch (error) {
          console.error("Failed to load initial chat history:", error);
        }
      };

      loadInitialHistory();
    }, [
      session?.user?.id,
      hasLoadedHistory,
      loadChatHistory,
      isDocumentProcessed,
    ]);

    // Effect to handle pending actions
    useEffect(() => {
      if (pendingAction && !isLoading && isDocumentProcessed) {
        const { text, action } = pendingAction;
        let prompt = "";
        switch (action) {
          case "explain":
            prompt = `Explain this text in detail: "${text}"`;
            break;
          case "summarize":
            prompt = `Summarize this text: "${text}"`;
            break;
          case "chat":
            prompt = `Let's discuss this text: "${text}"`;
            break;
        }

        setInputValue(prompt);
        if (action !== "chat") {
          handleSendMessage();
        }
        setPendingAction(null);
      }
    }, [pendingAction, isLoading, isDocumentProcessed]);

    // Scroll to bottom for new messages (not for loaded history)
    const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Always scroll to bottom when messages change and chat tab is active
    useEffect(() => {
      if (activeTab === "chat") {
        scrollToBottom();
      }
    }, [messages, activeTab, scrollToBottom]);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      handleTextSelect: (
        text: string,
        action: "explain" | "summarize" | "chat",
      ) => {
        if (isDocumentProcessed) {
          setPendingAction({ text, action });
        }
      },
    }));

    const queryRAG = async (
      query: string,
      studyMaterialIds?: string[],
    ): Promise<RAGResponse> => {
      const response = await fetch("/api/chat/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Server-Auth": process.env.BACKEND_API_KEY!,
          "X-User-ID": session?.user?.id,
        },
        body: JSON.stringify({
          query,
          spaceId,
          studyMaterialId:
            studyMaterialIds?.length === 1
              ? studyMaterialIds[0]
              : (currentStudyMaterial?.id ?? ""),
          topK: 5,
          includeMetadata: true,
          userId: session?.user?.id,
        }),
      });

      console.log("QUERY RESPONSE", response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to query RAG backend");
      }

      return response.json();
    };

    const handleSendMessage = async () => {
      if (!inputValue.trim() || isLoading || !isDocumentProcessed) return;

      const userMessage = inputValue.trim();
      const messageId = Date.now().toString();

      // Add user message
      const userChatMessage: ChatMessage = {
        id: messageId + "-user",
        text: userMessage,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userChatMessage]);
      setInputValue("");
      setIsLoading(true);

      // Add loading message for AI response
      const loadingMessage: ChatMessage = {
        id: messageId + "-ai-loading",
        text: "",
        isUser: false,
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, loadingMessage]);

      // Scroll to bottom for new messages
      setTimeout(scrollToBottom, 100);

      try {
        // Check if current study material is processed
        if (!currentStudyMaterial?.isProcessed) {
          // Check if there are other processed materials in the space
          const processedMaterials = studyMaterials.filter(
            (m) => m.isProcessed,
          );

          if (processedMaterials.length === 0) {
            // No processed materials available
            const noDataMessage: ChatMessage = {
              id: messageId + "-ai",
              text: "I don't have any processed study materials to reference yet. Please upload and wait for documents to be processed before asking questions about them. I can still help with general questions!",
              isUser: false,
              timestamp: new Date(),
            };

            setMessages((prev) =>
              prev
                .filter((m) => m.id !== loadingMessage.id)
                .concat(noDataMessage),
            );
            return;
          } else {
            // There are other processed materials, but inform about current one
            const partialDataMessage: ChatMessage = {
              id: messageId + "-ai",
              text: `The current document "${currentStudyMaterial?.title || "Untitled"}" is still processing. I can answer questions about other processed documents in this space, but responses about this specific document may be limited until processing is complete.`,
              isUser: false,
              timestamp: new Date(),
            };

            setMessages((prev) =>
              prev
                .filter((m) => m.id !== loadingMessage.id)
                .concat(partialDataMessage),
            );
            return;
          }
        }

        // Query the RAG backend - prioritize current study material
        const ragResponse = await queryRAG(userMessage, [
          currentStudyMaterial.id,
        ]);

        // Create AI response message
        const aiMessage: ChatMessage = {
          id: messageId + "-ai",
          text: ragResponse.answer,
          isUser: false,
          timestamp: new Date(),
          sources: ragResponse.sources,
          confidence: ragResponse.confidence,
          chatId: ragResponse.chatId, // Track the saved chat ID
        };

        // Replace loading message with actual response
        setMessages((prev) =>
          prev.filter((m) => m.id !== loadingMessage.id).concat(aiMessage),
        );
      } catch (error) {
        console.error("Chat error:", error);

        // Create error message
        const errorMessage: ChatMessage = {
          id: messageId + "-ai-error",
          text: "",
          isUser: false,
          timestamp: new Date(),
          error:
            error instanceof Error
              ? error.message
              : "Failed to get response. Please try again.",
        };

        // Replace loading message with error
        setMessages((prev) =>
          prev.filter((m) => m.id !== loadingMessage.id).concat(errorMessage),
        );
      } finally {
        setIsLoading(false);
        // Scroll to bottom after response
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleQuickAction = (action: string) => {
      if (isDocumentProcessed) {
        setInputValue(action);
      }
    };

    const handleSourceClick = (source: { text: string; score: number }) => {
      if (onSourceClick) {
        onSourceClick(source);
      }
    };

    const handleLoadMoreHistory = async () => {
      try {
        const moreMessages = await loadMoreHistory();
        if (moreMessages.length > 0) {
          // Get current scroll position
          const container = chatContainerRef.current;
          const previousScrollHeight = container?.scrollHeight || 0;

          // Sort and prepend messages (oldest first)
          const sortedMessages = moreMessages.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );

          setMessages((prev) => [...sortedMessages, ...prev]);

          // Maintain scroll position
          setTimeout(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - previousScrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        console.error("Failed to load more history:", error);
      }
    };

    // Clear history error when component unmounts or changes
    useEffect(() => {
      return () => {
        if (historyError) {
          clearError();
        }
      };
    }, [historyError, clearError]);

    return (
      <div className="flex flex-col h-full w-full bg-white dark:bg-transparent text-gray-900 dark:text-white min-h-0 px-4">
        {/* Tabs - fixed height */}
        <div className="flex-shrink-0">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main content area - flexible height with proper overflow */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div ref={chatContainerRef} className="h-full overflow-y-auto">
            {activeTab === "chat" && (
              <>
                {/* Show processing status if document is not processed */}
                {!isDocumentProcessed && currentStudyMaterial ? (
                  <ProcessingStatus
                    studyMaterial={currentStudyMaterial}
                    onProcessingComplete={handleProcessingComplete}
                  />
                ) : (
                  <>
                    {/* History Error Alert */}
                    {historyError && (
                      <div className="p-4">
                        <Alert className="bg-red-900/20 border-red-700">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-red-200">
                            Failed to load chat history: {historyError}
                            <Button
                              onClick={clearError}
                              variant="outline"
                              size="sm"
                              className="ml-2 h-6 text-xs"
                            >
                              Dismiss
                            </Button>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {messages.length === 0 && !isLoadingHistory ? (
                      <div className="h-full min-h-[400px] flex items-center justify-center">
                        <AiTutorEmptyState
                          studyMaterials={studyMaterials}
                          onQuickAction={handleQuickAction}
                          currentStudyMaterial={
                            currentStudyMaterial ?? {
                              id: "",
                              title: "Untitled",
                              isProcessed: false,
                            }
                          }
                        />
                      </div>
                    ) : (
                      <div className="p-4 space-y-4">
                        {/* Load More History Button at the top */}
                        {hasMore && messages.length > 0 && (
                          <LoadMoreButton
                            onLoadMore={handleLoadMoreHistory}
                            isLoading={isLoadingHistory}
                            hasMore={hasMore}
                          />
                        )}

                        {/* Chat Messages */}
                        {messages.map((message) => (
                          <ChatMessage
                            key={message.id}
                            message={message}
                            onSourceClick={handleSourceClick}
                          />
                        ))}

                        {/* Loading indicator for initial history load */}
                        {isLoadingHistory && messages.length === 0 && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2
                              size={24}
                              className="animate-spin text-gray-400"
                            />
                            <span className="ml-2 text-gray-400">
                              Loading chat history...
                            </span>
                          </div>
                        )}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {activeTab === "flashcards" && (
              <div className="p-4 h-full">
                {!isDocumentProcessed ? (
                  <div className="flex items-center justify-center h-full">
                    <div>Loading...</div>
                  </div>
                ) : (
                  <FlashcardUI
                    studyMaterialId={currentStudyMaterial?.id!}
                    spaceId={spaceId}
                    userId={session?.user?.id!}
                  />
                )}
              </div>
            )}

            {activeTab === "quizzes" && (
              <div className="p-4 h-full">
                {!isDocumentProcessed ? (
                  <div className="flex items-center justify-center h-full">
                    <div>Loading...</div>
                  </div>
                ) : (
                  <QuizUI
                    studyMaterialId={currentStudyMaterial?.id!}
                    userId={session?.user?.id!}
                  />
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="p-4 h-full">
                <Editor />
              </div>
            )}

            {activeTab === "summary" && (
              <div className="p-4 h-full">
                {!isDocumentProcessed ? (
                  <div className="flex items-center justify-center h-full">
                    <div>Loading...</div>
                  </div>
                ) : (
                  <SummaryUI
                    studyMaterialId={currentStudyMaterial?.id!}
                    userId={session?.user?.id!}
                  />
                )}
              </div>
            )}

            {activeTab !== "chat" &&
              activeTab !== "flashcards" &&
              activeTab !== "quizzes" &&
              activeTab !== "notes" &&
              activeTab !== "summary" && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">
                    This is the {activeTab} tab (placeholder)
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Input bar - fixed height, disabled when not processed */}
        {activeTab === "chat" && (
          <div className="flex-shrink-0">
            <InputBar
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSendMessage={handleSendMessage}
              spaceId={spaceId}
              isLoading={isLoading}
              disabled={!isDocumentProcessed}
            />
          </div>
        )}
      </div>
    );
  },
);

export default ChatComponent;

