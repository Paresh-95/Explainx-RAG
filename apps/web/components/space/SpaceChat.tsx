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
  ChevronsRight,
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
} from "../../types/chat";
import { useChatHistory } from "../../hooks/useChatHistory";
import QuizInteractive from "../learn/QuizInteractive";
import FlashcardsInteractive from "../learn/FlashcardsInteractive";
import MindmapInteractive from "../learn/MindmapInteractive";
import TimelineInteractive from "../learn/TimelineInteractive";
import { parseInteractivePayload } from "../learn/parseInteractivePayload";

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

// Enhanced Chat Message Component

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

// AI Tutor Component (empty state) - Updated to focus on all study materials in space
const AiTutorEmptyState = ({
  studyMaterials,
  onQuickAction,
}: {
  studyMaterials: StudyMaterial[];
  onQuickAction: (action: string) => void;
}) => {
  const processedMaterials = studyMaterials.filter((m) => m.isProcessed);
  const unprocessedMaterials = studyMaterials.filter((m) => !m.isProcessed);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 mb-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <MessageCircle size={28} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
        Learn with the AI Tutor
      </h3>

      {processedMaterials.length === 0 ? (
        <Alert className="mb-4 bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-orange-700 dark:text-orange-200">
            No processed documents available yet. Please upload documents and
            wait for them to be processed before asking questions.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-4 bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-green-700 dark:text-green-200">
            Ready to chat about {processedMaterials.length} processed
            document(s) in this space.
            {unprocessedMaterials.length > 0 && (
              <span className="block mt-1 text-orange-700 dark:text-orange-200">
                {unprocessedMaterials.length} document(s) still processing.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {processedMaterials.length > 0 && (
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-400">
          <p>Available documents:</p>
          <div className="mt-2 space-y-1">
            {processedMaterials.slice(0, 3).map((material) => (
              <div
                key={material.id}
                className="text-gray-500 dark:text-gray-400"
              >
                • {material.title}
              </div>
            ))}
            {processedMaterials.length > 3 && (
              <div className="text-gray-500 dark:text-gray-400">
                ... and {processedMaterials.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function InputBar({
  inputValue,
  setInputValue,
  handleSendMessage,
  spaceId,
  isLoading,
}: {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  spaceId: string;
  isLoading: boolean;
}) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState(0);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const options = [
    { label: "Quiz", icon: <FileQuestion size={12} /> },
    { label: "Mind Map", icon: <GitBranch size={12} /> },
    { label: "Voice Mode", icon: <Mic size={12} /> },
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
    if (!inputValue.trim() || isLoading) return;
    handleSendMessage();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-black">
      {filePreviews.length > 0 && (
        <div className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f1f1f] rounded p-2 mb-2">
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

// Main Component - Updated to work with all study materials in space and include chat history
export default function SpaceChat({
  spaceId,
  studyMaterials,
  session,
  onExpand,
  setPanelSize,
  panelSize,
  onSourceClick,
}: ChatComponentProps & {
  setPanelSize?: (size: number) => void;
  panelSize?: number;
  onSourceClick?: (source: { text: string; score: number }) => void;
}) {
  const [activeTab, setActiveTab] = useState("chat");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize chat history hook for space-level chat
  const {
    isLoading: isLoadingHistory,
    hasMore,
    error: historyError,
    loadChatHistory,
    loadMoreHistory,
    clearError,
  } = useChatHistory({
    spaceId,
    userId: session?.user?.id,
  });

  // Load initial chat history on component mount
  useEffect(() => {
    const loadInitialHistory = async () => {
      if (!session?.user?.id || hasLoadedHistory) return;

      try {
        const historyMessages = await loadChatHistory();
        if (historyMessages.length > 0) {
          // Sort messages by timestamp (oldest first)
          const sortedMessages = historyMessages.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );
          setMessages(sortedMessages);
        }
        setHasLoadedHistory(true);
      } catch (error) {
        console.error("Failed to load initial chat history:", error);
      }
    };

    loadInitialHistory();
  }, [session?.user?.id, hasLoadedHistory, loadChatHistory]);

  // Check processing status of all study materials
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkProcessingStatus = async () => {
      const unprocessedMaterials = studyMaterials.filter(
        (m) => !m.isProcessed && m.processingStatus !== "failed",
      );

      if (unprocessedMaterials.length > 0) {
        try {
          // Check status for all unprocessed materials
          const statusChecks = unprocessedMaterials.map(async (material) => {
            const response = await fetch(
              `/api/documents/status/${material.id}`,
            );
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.status.isProcessed) {
                // Update the study material status in the parent component
                // This would require a callback or state management
                console.log(`Material ${material.id} is now processed`);
              }
            }
          });

          await Promise.all(statusChecks);
        } catch (error) {
          console.error("Failed to check processing status:", error);
        }
      } else {
        // If all materials are processed or failed, clear the interval
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };

    checkProcessingStatus();
    // Set up polling for processing status
    intervalId = setInterval(checkProcessingStatus, 10000); // Check every 10 seconds

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [studyMaterials]);

  // Scroll to bottom for new messages (not for loaded history)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom whenever messages change (except when loading more history)
  useEffect(() => {
    if (!isLoadingHistory) {
      scrollToBottom();
    }
  }, [messages, isLoadingHistory, scrollToBottom]);

  const queryRAG = async (
    query: string,
    studyMaterialIds?: string[],
  ): Promise<RAGResponse> => {
    // If no specific study material IDs provided, use all processed materials in the space
    const processedMaterialIds =
      studyMaterialIds ||
      studyMaterials.filter((m) => m.isProcessed).map((m) => m.id);

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
        studyMaterialIds: processedMaterialIds, // Send all processed material IDs
        topK: 5,
        includeMetadata: true,
        userId: session?.user?.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to query RAG backend");
    }

    return response.json();
  };

  const handleSourceClick = (source: { text: string; score: number }) => {
    if (onSourceClick) {
      onSourceClick(source);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

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
      // Check if there are any processed materials in the space
      const processedMaterials = studyMaterials.filter((m) => m.isProcessed);

      if (processedMaterials.length === 0) {
        // No processed materials available
        const noDataMessage: ChatMessage = {
          id: messageId + "-ai",
          text: "I don't have any processed study materials to reference yet. Please upload documents and wait for them to be processed before asking questions about them. I can still help with general questions!",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) =>
          prev.filter((m) => m.id !== loadingMessage.id).concat(noDataMessage),
        );
        return;
      }

      // Query the RAG backend with all processed materials in the space
      const ragResponse = await queryRAG(userMessage);

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
    setInputValue(action);
    // Optionally auto-send the message
    // handleSendMessage();
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
    <div className="flex flex-col h-[calc(100vh-100px)] bg-white dark:bg-[#161616] text-gray-900 dark:text-white">
      <span
        className="hover:bg-gray-100 dark:hover:bg-slate-700 p-2 w-fit h-fit rounded-full"
        onClick={() => {
          if (setPanelSize) setPanelSize(100);
          if (onExpand) onExpand();
        }}
      >
        <ChevronsRight className="w-5 h-5 text-black dark:text-white" />
      </span>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
        {activeTab === "chat" && (
          <>
            {/* History Error Alert */}
            {historyError && (
              <div className="mb-4">
                <Alert className="bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-700 dark:text-red-200">
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
              <AiTutorEmptyState
                studyMaterials={studyMaterials}
                onQuickAction={handleQuickAction}
              />
            ) : (
              <div className="space-y-4">
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
                    <Loader2 size={24} className="animate-spin text-gray-400" />
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
      </div>
      <InputBar
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        spaceId={spaceId}
        isLoading={isLoading}
      />
    </div>
  );
}

