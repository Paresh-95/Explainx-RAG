import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  AlertCircle,
  Loader2,
  RefreshCw,
  Upload,
  Mic,
  Earth,
  AtSign,
  FileText,
  Image,
  Paperclip,
  FileQuestion,
  GitBranch,
  Bookmark,
  Search,
  Activity,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import type {
  ChatMessage,
  RAGResponse,
  DashboardChatComponentProps,
  StudyMaterial,
  FilePreview,
} from "../../types/chat";
import { useSession } from "next-auth/react";
import React from "react";
import QuizInteractive from "../learn/QuizInteractive";
import FlashcardsInteractive from "../learn/FlashcardsInteractive";
import MindmapInteractive from "../learn/MindmapInteractive";
import TimelineInteractive from "../learn/TimelineInteractive";
import { useStudyMaterial } from "../../hooks/useStudyMaterial";
import { useFirstMessage } from "../../contexts/first-message-provider";
import { useChatHistory } from "../../hooks/useChatHistory";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { cn } from "@repo/ui/lib/utils";
import { parseInteractivePayload } from "../learn/parseInteractivePayload";

// Chat Message Component
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

// Input Bar Component

function InputBar({
  inputValue,
  setInputValue,
  handleSendMessage,
  isLoading,
  disabled = false,
}: {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
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
    <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-black">
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
// Main Dashboard Chat Component
const DashboardChatComponent = React.forwardRef<
  any,
  DashboardChatComponentProps
>(
  (
    { studyMaterials, currentStudyMaterial }: DashboardChatComponentProps,
    ref,
  ) => {
    const { data: session } = useSession();
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentMaterialId, setCurrentMaterialId] = useState<string | null>(
      currentStudyMaterial?.id || null,
    );
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
    const [isProcessingFirstMessageNow, setIsProcessingFirstMessageNow] =
      useState(false);
    // Add ref to track if first message is being processed
    const isProcessingFirstMessage = useRef(false);
    const processedFirstMessages = useRef(new Set<string>());

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use the custom hook for creating study materials
    const {
      createStudyMaterial,
      isCreating: isCreatingMaterial,
      error: materialError,
      clearError: clearMaterialError,
    } = useStudyMaterial({
      message: false, // Don't send first message automatically in dashboard
    });

    // Use the first message context
    const { firstMessage, clearFirstMessage } = useFirstMessage();

    // Memoize the current material ID to prevent unnecessary re-renders
    const memoizedCurrentMaterialId = useMemo(() => {
      return currentStudyMaterial?.id || null;
    }, [currentStudyMaterial?.id]);

    // Chat history hook (studyMaterialId only, never spaceId)
    const {
      isLoading: isLoadingHistory,
      hasMore,
      error: historyError,
      loadChatHistory,
      loadMoreHistory,
      clearError: clearHistoryError,
    } = useChatHistory({
      studyMaterialId: memoizedCurrentMaterialId || undefined,
      userId: session?.user?.id,
    });

    // Memoized queryRAG function
    const queryRAG = useCallback(
      async (query: string): Promise<RAGResponse> => {
        const response = await fetch("/api/chat/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Server-Auth": process.env.BACKEND_API_KEY!,
            ...(session?.user?.id ? { "X-User-ID": session.user.id } : {}),
          },
          body: JSON.stringify({
            query,
            studyMaterialId: memoizedCurrentMaterialId,
            topK: 5,
            includeMetadata: true,
            useChunks: false,
            userId: session?.user?.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to query RAG backend");
        }

        return response.json();
      },
      [memoizedCurrentMaterialId, session?.user?.id],
    );

    // Memoized handleFirstMessage function
    const handleFirstMessage = useCallback(
      async (message: string) => {
        // Create a unique key for this first message + material combination
        const messageKey = `${message}-${memoizedCurrentMaterialId}`;

        // Prevent duplicate processing
        if (
          isProcessingFirstMessage.current ||
          processedFirstMessages.current.has(messageKey) ||
          isLoading
        ) {
          console.log("Skipping duplicate first message processing", {
            isProcessing: isProcessingFirstMessage.current,
            alreadyProcessed: processedFirstMessages.current.has(messageKey),
            isLoading,
          });
          return;
        }

        console.log(
          "Processing first message:",
          message,
          "for material:",
          memoizedCurrentMaterialId,
        );

        // Set flags to prevent duplicates
        isProcessingFirstMessage.current = true;
        processedFirstMessages.current.add(messageKey);

        const messageId = Date.now().toString();

        // Add user message
        const userChatMessage: ChatMessage = {
          id: messageId + "-user",
          text: message,
          isUser: true,
          timestamp: new Date(),
        };

        setMessages([userChatMessage]);
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

        try {
          // Query the RAG backend
          const ragResponse = await queryRAG(message);

          // Create AI response message
          const aiMessage: ChatMessage = {
            id: messageId + "-ai",
            text: ragResponse.answer,
            isUser: false,
            timestamp: new Date(),
            sources: ragResponse.sources,
            confidence: ragResponse.confidence,
          };

          // Replace loading message with actual response
          setMessages((prev) =>
            prev.filter((m) => m.id !== loadingMessage.id).concat(aiMessage),
          );

          // Clear the first message from context
          clearFirstMessage();
        } catch (error) {
          console.error("First message error:", error);

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

          // Clear the first message from context even on error
          clearFirstMessage();
        } finally {
          setIsLoading(false);
          isProcessingFirstMessage.current = false;
        }
      },
      [memoizedCurrentMaterialId, queryRAG, isLoading, clearFirstMessage],
    );

    // Set current material ID when currentStudyMaterial changes
    useEffect(() => {
      const newMaterialId = memoizedCurrentMaterialId;
      if (currentMaterialId !== newMaterialId) {
        console.log(
          "Material changed from",
          currentMaterialId,
          "to",
          newMaterialId,
        );
        setCurrentMaterialId(newMaterialId);
        setHasLoadedHistory(false);
        setMessages([]); // Clear messages when switching materials

        // Clear processed first messages for old material
        processedFirstMessages.current.clear();
        isProcessingFirstMessage.current = false;
      }
    }, [memoizedCurrentMaterialId, currentMaterialId]);

    // Load initial chat history
    const loadInitialHistory = useCallback(async () => {
      if (
        !session?.user?.id ||
        !memoizedCurrentMaterialId ||
        hasLoadedHistory
      ) {
        return;
      }

      console.log(
        "Loading initial history for material:",
        memoizedCurrentMaterialId,
      );

      try {
        const historyMessages = await loadChatHistory();
        if (historyMessages.length > 0) {
          const sortedMessages = historyMessages.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );
          setMessages(sortedMessages);
          console.log("Loaded", sortedMessages.length, "history messages");
        } else {
          setMessages([]);
          console.log("No history messages found");
        }
        setHasLoadedHistory(true);
        console.log("History loading completed");
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setHasLoadedHistory(true); // Set to true even on error to prevent infinite retries
      }
    }, [
      session?.user?.id,
      memoizedCurrentMaterialId,
      hasLoadedHistory,
      loadChatHistory,
    ]);

    // Effect for loading initial history
    useEffect(() => {
      loadInitialHistory();
    }, [loadInitialHistory]);

    // Memoize the first message processing condition
    const shouldProcessFirstMessage = useMemo(() => {
      const messageKey = firstMessage
        ? `${firstMessage}-${memoizedCurrentMaterialId}`
        : null;

      return (
        firstMessage &&
        memoizedCurrentMaterialId &&
        messages.length === 0 &&
        hasLoadedHistory &&
        !isLoadingHistory &&
        !isProcessingFirstMessage.current &&
        !processedFirstMessages.current.has(messageKey || "")
      );
    }, [
      firstMessage,
      memoizedCurrentMaterialId,
      messages.length,
      hasLoadedHistory,
      isLoadingHistory,
    ]);

    // Effect for handling first message - with strict conditions
    useEffect(() => {
      if (shouldProcessFirstMessage && firstMessage) {
        console.log("Conditions met for first message processing");
        // Add a small delay to ensure history loading state is fully updated
        const timer = setTimeout(() => {
          handleFirstMessage(firstMessage);
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [shouldProcessFirstMessage, firstMessage, handleFirstMessage]);

    // Scroll to bottom for new messages
    const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Memoized handleSendMessage function
    const handleSendMessage = useCallback(async () => {
      if (!inputValue.trim() || isLoading || !session?.user?.id) return;

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
        // Query the RAG backend
        const ragResponse = await queryRAG(userMessage);

        // Create AI response message
        const aiMessage: ChatMessage = {
          id: messageId + "-ai",
          text: ragResponse.answer,
          isUser: false,
          timestamp: new Date(),
          sources: ragResponse.sources,
          confidence: ragResponse.confidence,
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
        setTimeout(scrollToBottom, 100);
      }
    }, [inputValue, isLoading, session?.user?.id, queryRAG, scrollToBottom]);

    // Always scroll to bottom when messages change
    useEffect(() => {
      scrollToBottom();
    }, [messages, scrollToBottom]);

    // Handle file upload
    const handleFileUpload = () => {
      fileInputRef.current?.click();
    };

    const handleFileChange = async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = event.target.files?.[0];
      if (!file || !session?.user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Create study material using the custom hook
        const studyMaterial = await createStudyMaterial({
          title: file.name,
          description: `Uploaded file: ${file.name}`,
          type: "OTHER_DOCUMENT",
        });

        if (studyMaterial) {
          setCurrentMaterialId(studyMaterial.id);
          setHasLoadedHistory(false); // force reload history for new material

          // Add a system message indicating the file was uploaded
          const systemMessage: ChatMessage = {
            id: Date.now().toString() + "-system",
            text: `File "${file.name}" uploaded successfully. You can now ask questions about this content.`,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, systemMessage]);
        }
      } catch (err) {
        console.error("Failed to upload file:", err);
        setError(err instanceof Error ? err.message : "Failed to upload file");
      } finally {
        setIsLoading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    // Load more history handler
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
          setTimeout(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - previousScrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        // error handled by hook
      }
    };

    // Clear history error when component unmounts or changes
    useEffect(() => {
      return () => {
        if (historyError) {
          clearHistoryError();
        }
      };
    }, [historyError, clearHistoryError]);

    // Combine errors from both sources
    const combinedError = error || materialError;

    // Quick action handler
    const handleQuickAction = (actionPrompt: string) => {
      setInputValue(actionPrompt);
    };

    if (combinedError) {
      return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-[#161616] text-gray-900 dark:text-white min-h-0">
          <div className="p-4">
            <Alert className="bg-red-900/20 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                {combinedError}
                <Button
                  onClick={() => {
                    setError(null);
                    clearMaterialError();
                  }}
                  variant="outline"
                  size="sm"
                  className="ml-2 h-6 text-xs"
                >
                  <RefreshCw size={12} className="mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    // Show chat history error (from useChatHistory)
    if (historyError) {
      return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-[#161616] text-gray-900 dark:text-white min-h-0">
          <div className="p-4">
            <Alert className="bg-red-900/20 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                Failed to load chat history: {historyError}
                <Button
                  onClick={clearHistoryError}
                  variant="outline"
                  size="sm"
                  className="ml-2 h-6 text-xs"
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full w-full bg-white dark:bg-[#161616] text-gray-900 dark:text-white min-h-0">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <MessageCircle
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Dashboard Chat
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentMaterialId
                  ? `Chatting with: ${currentStudyMaterial?.title || "Uploaded content"}`
                  : "Upload a file to start chatting or select a study material"}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div ref={chatContainerRef} className="h-full overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Load More History Button at the top */}
              {hasMore && messages.length > 0 && (
                <div className="text-center py-4">
                  <Button
                    onClick={handleLoadMoreHistory}
                    disabled={isLoadingHistory}
                    variant="outline"
                    size="sm"
                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {isLoadingHistory ? (
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
              )}
              {messages.length === 0 && !currentMaterialId ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Upload size={48} className="text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No content selected
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Upload a file or select a study material to start chatting
                  </p>
                  <Button
                    onClick={handleFileUpload}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload File
                  </Button>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onSourceClick={() => {}}
                  />
                ))
              )}
              {/* Loading indicator for initial history load */}
              {isLoadingHistory && messages.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-400">
                    Loading chat history...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0">
          <InputBar
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSendMessage}
            isLoading={isLoading || isCreatingMaterial}
          />
        </div>
      </div>
    );
  },
);

DashboardChatComponent.displayName = "DashboardChatComponent";

export default React.memo(DashboardChatComponent);

