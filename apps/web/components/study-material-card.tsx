"use client";

import {
  AlignLeft,
  FileText,
  Image as ImageIcon,
  File,
  FileCode,
  Globe,
  Lock,
  MoreVertical,
  Eye,
  EyeOff,
  AlertCircle,
  MessageCircle,
  Play,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import { useEffect, useState } from "react";
import { cn } from "@repo/ui/lib/utils";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;
}

interface StudyMaterial {
  id: string;
  title: string;
  type: string;
  slug: string;
  youtubeUrl?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  createdAt: string;
  isPublic?: boolean;
  uploadedById?: string;
  space: {
    slug: string;
  };
  docid: string;
}

interface FileData {
  fileUrl: string;
  mimeType: string;
}

interface MaterialPermissions {
  canToggleVisibility: boolean;
  canMakePublic: boolean;
  canMakePrivate: boolean;
  userRole?: string;
}

interface StudyMaterialCardProps {
  item: StudyMaterial;
  canEdit?: boolean;
  onVisibilityUpdate?: (updatedMaterial: any) => void;
}

// Enhanced Visibility Toggle Component with Permission Checks
function MaterialVisibilityToggle({
  materialId,
  isPublic,
  onUpdate,
}: {
  materialId: string;
  isPublic: boolean;
  onUpdate: (newVisibility: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string>("");
  const [permissions, setPermissions] = useState<MaterialPermissions | null>(
    null,
  );

  // Fetch permissions when component mounts
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(
          `/api/study-material/${materialId}/toggle-visibility`,
        );
        if (response.ok) {
          const data = await response.json();
          setPermissions({
            canToggleVisibility: data.studyMaterial.canToggleVisibility,
            canMakePublic: data.studyMaterial.canMakePublic,
            canMakePrivate: data.studyMaterial.canMakePrivate,
            userRole: data.studyMaterial.userRole,
          });
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, [materialId]);

  const toggleVisibility = async (newVisibility: boolean) => {
    // Check permissions before making the request
    if (newVisibility && !permissions?.canMakePublic) {
      setError("You don't have permission to make this material public");
      return;
    }

    if (!newVisibility && !permissions?.canMakePrivate) {
      setError(
        "You don't have permission to change this material's visibility",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/study-material/${materialId}/toggle-visibility`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublic: newVisibility }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        onUpdate(newVisibility);
        setShowMenu(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update visibility");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Error updating visibility:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show toggle if permissions haven't loaded or user has no permissions
  if (
    !permissions ||
    (!permissions.canMakePublic && !permissions.canMakePrivate)
  ) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
          setError(""); // Clear any previous errors
        }}
        className="p-1 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        disabled={loading}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowMenu(false);
              setError("");
            }}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 min-w-[180px]">
            <div className="p-2 space-y-1">
              {/* Make Public Option */}
              {!isPublic && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleVisibility(true);
                  }}
                  disabled={loading || !permissions.canMakePublic}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded transition-colors bg-purple-600 text-white hover:bg-purple-700 ${!permissions.canMakePublic ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={
                    !permissions.canMakePublic
                      ? "Only space owners and admins can make materials public"
                      : ""
                  }
                >
                  {permissions.canMakePublic ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  <span>Make Public</span>
                  {!permissions.canMakePublic &&
                    permissions.userRole === "MEMBER" && (
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                    )}
                </button>
              )}

              {/* Make Private Option */}
              {isPublic && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleVisibility(false);
                  }}
                  disabled={loading || !permissions.canMakePrivate}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded transition-colors bg-purple-600 text-white hover:bg-purple-700 ${!permissions.canMakePrivate ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <EyeOff className="h-4 w-4" />
                  <span>Make Private</span>
                </button>
              )}

              {/* Info message for members */}
              {permissions.userRole === "MEMBER" &&
                !permissions.canMakePublic && (
                  <div className="px-3 py-2 text-xs text-zinc-400 border-t border-zinc-700">
                    <div className="flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>Members can only keep materials private</span>
                    </div>
                  </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="border-t border-zinc-700 p-2">
                <div className="flex items-start gap-2 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function getFileIcon(type?: string, mimeType?: string) {
  // Handle different material types
  if (type === "OTHER") {
    return <MessageCircle className="h-12 w-12 text-zinc-600" />;
  }

  if (type === "YOUTUBE_VIDEO" || type === "YOUTUBE") {
    return <Play className="h-12 w-12 text-zinc-600" />;
  }

  // Handle FILE type based on mimeType
  if (type === "FILE") {
    if (!mimeType) return <File className="h-12 w-12 text-zinc-600" />;

    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-12 w-12 text-zinc-600" />;
    }

    if (
      mimeType.startsWith("text/") ||
      mimeType.includes("pdf") ||
      mimeType.includes("document")
    ) {
      return <FileText className="h-12 w-12 text-zinc-600" />;
    }

    if (
      mimeType.includes("code") ||
      mimeType.includes("javascript") ||
      mimeType.includes("typescript")
    ) {
      return <FileCode className="h-12 w-12 text-zinc-600" />;
    }

    return <File className="h-12 w-12 text-zinc-600" />;
  }

  // Default fallback
  return <File className="h-12 w-12 text-zinc-600" />;
}

function getFilePreview(item: StudyMaterial) {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item.type === "FILE" && item.id) {
      setIsLoading(true);
      fetch(`/api/files/${item.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.fileUrl) {
            setFileData({
              fileUrl: data.fileUrl,
              mimeType: data.mimeType,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching file:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [item.id, item.type]);

  if (item.type === "YOUTUBE" && item.youtubeUrl) {
    return (
      <Image
        src={`https://img.youtube.com/vi/${item.youtubeUrl.split("v=")[1]}/maxresdefault.jpg`}
        alt={item.title}
        layout="fill"
        objectFit="cover"
        className="rounded-t-xl"
      />
    );
  }

  if (item.type === "FILE" && (fileData?.fileUrl || item.fileUrl)) {
    const fileUrl = fileData?.fileUrl || item.fileUrl;
    const mimeType = fileData?.mimeType || item.mimeType;
    const fileExtension = fileUrl?.split(".").pop()?.toLowerCase();
    const isPdf = fileExtension === "pdf";
    const isOfficeDocument = ["doc", "docx", "ppt", "pptx"].includes(
      fileExtension || "",
    );

    if (isLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center dark:bg-zinc-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-600"></div>
        </div>
      );
    }

    if (mimeType?.startsWith("image/") && fileUrl) {
      return (
        <Image
          src={fileUrl}
          alt={item.title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-xl"
        />
      );
    }

    if (isPdf && fileUrl) {
      return (
        <div className="w-full h-full dark: dark:bg-zinc-800 rounded-t-xl overflow-hidden">
          <Document
            file={fileUrl}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-600"></div>
              </div>
            }
            error={
              <div className="w-full h-full flex items-center justify-center">
                {getFileIcon(item.type, mimeType)}
              </div>
            }
          >
            <Page
              pageNumber={1}
              scale={0.3}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="rounded-t-xl"
              width={400}
            />
          </Document>
        </div>
      );
    }

    if (isOfficeDocument && fileUrl) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}&wdStartOn=1&wdScale=50`;
      return (
        <div className="w-full h-full  dark:bg-zinc-800 rounded-t-xl overflow-hidden">
          <iframe
            src={officeViewerUrl}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center  dark:bg-zinc-800">
        {getFileIcon(item.type, item.mimeType)}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center  dark:bg-zinc-800">
      {getFileIcon(item.type, item.mimeType)}
    </div>
  );
}

export function StudyMaterialCard({
  item,
  canEdit,
  onVisibilityUpdate,
}: StudyMaterialCardProps) {
  const [currentVisibility, setCurrentVisibility] = useState(
    item.isPublic ?? false,
  );

  const handleVisibilityUpdate = (newVisibility: boolean) => {
    setCurrentVisibility(newVisibility);
    onVisibilityUpdate?.({ ...item, isPublic: newVisibility });
  };

  return (
    <div className="relative group">
      <Link
        href={`/learn/content/${item.docid}`}
        className="bg-white dark:bg-zinc-900 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors overflow-hidden block border border-zinc-200 dark:border-zinc-800"
      >
        <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-700">
          {getFilePreview(item)}

          {/* Visibility Badge */}
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                currentVisibility
                  ? "bg-green-100 text-green-800 dark:bg-green-100 dark:text-green-800 bg-opacity-90"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-100 dark:text-gray-800 bg-opacity-90",
              )}
            >
              {currentVisibility ? (
                <>
                  <Globe className="h-3 w-3" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  Private
                </>
              )}
            </span>
          </div>

          {/* Edit Controls (only show for material owner) */}
          {canEdit && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MaterialVisibilityToggle
                materialId={item.id}
                isPublic={currentVisibility}
                onUpdate={handleVisibilityUpdate}
              />
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center mb-2">
            <AlignLeft className="h-5 w-5 mr-2 text-zinc-400" />
            <div className="font-medium text-lg truncate text-zinc-900 dark:text-white">{item.title}</div>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </div>
        </div>
      </Link>
    </div>
  );
}

export function StudyMaterialCardSkeleton() {
  return (
    <div className="bg-slate-200 dark:bg-zinc-900 rounded-xl overflow-hidden animate-pulse border border-zinc-200 dark:border-zinc-800">
      <div className="w-full h-32 bg-slate-300 dark:bg-zinc-800" />
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="h-5 w-5 mr-2 bg-gray-200 dark:bg-zinc-800 rounded" />
          <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
      </div>
    </div>
  );
}
