"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useSpaces } from "../../contexts/space-provider";
import type { CreateMethod } from "./DashboardClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Switch } from "@repo/ui/components/ui/switch";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Progress } from "@repo/ui/components/ui/progress";
import {
  Upload,
  Link2,
  Mic,
  ArrowLeft,
  Loader2,
  Globe,
  Lock,
  CheckCircle,
  FileText,
  X,
} from "lucide-react";
import {
  ClientSpaceFormSchema,
  type ClientSpaceFormInput,
} from "../../lib/validation";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

interface CreateStudyMaterialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMethod?: CreateMethod | null;
  onFileUpload?: (
    file: File,
    spaceId: string,
    title: string,
    description: string,
  ) => Promise<void>;
  fixedSpaceId?: string;
  tourModalId?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

type UploadStatus = "idle" | "uploading" | "completed" | "failed";

interface UploadState {
  status: UploadStatus;
  progress: number;
  fileUrl?: string;
  studyMaterialId?: string;
  error?: string;
}

export default function CreateStudyMaterial({
  open,
  onOpenChange,
  initialMethod,
  onFileUpload,
  fixedSpaceId,
  tourModalId,
}: CreateStudyMaterialProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const {
    spaces,
    isLoading: isLoadingSpaces,
    error: spacesError,
    fetchSpaces,
  } = useSpaces();

  const [step, setStep] = useState<"select" | "form">(
    initialMethod ? "form" : "select",
  );
  const [method, setMethod] = useState<CreateMethod | null>(
    initialMethod || null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [createOnboarding, setCreateOnboarding] = useState(false);

  const [formData, setFormData] = useState({
    youtubeUrl: "",
    isPublic: false,
    title: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const [isRecording, setIsRecording] = useState(false);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");

  useEffect(() => {
    if (initialMethod) {
      setMethod(initialMethod);
      setStep("form");
    }
  }, [initialMethod]);

  useEffect(() => {
    if (fixedSpaceId) {
      setSelectedSpaceId(fixedSpaceId);
    }
  }, [fixedSpaceId]);

  // Show success toast when spaces are loaded after an error
  useEffect(() => {
    if (!isLoadingSpaces && !spacesError && spaces.length > 0) {
      // Only show toast if we were previously in an error state
      const wasInErrorState = sessionStorage.getItem("spacesErrorState");
      if (wasInErrorState === "true") {
        toast({
          title: "Spaces loaded",
          description: "Your spaces have been loaded successfully.",
        });
        sessionStorage.removeItem("spacesErrorState");
      }
    }

    // Track error state
    if (spacesError) {
      sessionStorage.setItem("spacesErrorState", "true");
    }
  }, [isLoadingSpaces, spacesError, spaces.length, toast]);

  // Auto-retry loading spaces when modal opens if there was an error
  useEffect(() => {
    if (open && spacesError && !isLoadingSpaces) {
      fetchSpaces();
    }
  }, [open, spacesError, isLoadingSpaces, fetchSpaces]);

  const resetModal = () => {
    setStep("select");
    setMethod(null);
    setFormData({
      youtubeUrl: "",
      isPublic: false,
      title: "",
    });
    setFile(null);
    setUploadState({ status: "idle", progress: 0 });
    setError(null);
    setValidationErrors({});
    setIsRecording(false);
    setSelectedSpaceId("");
    setCreateOnboarding(false);
  };

  const handleMethodSelect = (selectedMethod: any) => {
    setMethod(selectedMethod);
    setStep("form");
    setValidationErrors({});
    setError(null);
  };

  const handleBack = () => {
    if (step === "form") {
      setStep("select");
      setMethod(null);
      setValidationErrors({});
      setError(null);
      setUploadState({ status: "idle", progress: 0 });
    }
  };

  const validateForm = (): boolean => {
    if (!method) return false;
    setValidationErrors({});
    setError(null);
    try {
      // Check if spaces are still loading
      if (!fixedSpaceId && isLoadingSpaces) {
        throw new Error("Please wait for spaces to load");
      }
      
      // Check if there's an error loading spaces
      if (!fixedSpaceId && spacesError) {
        throw new Error("Failed to load spaces. Please try refreshing.");
      }
      
      // Check if no spaces are available
      if (!fixedSpaceId && !isLoadingSpaces && !spacesError && spaces.length === 0) {
        throw new Error("No spaces available. Please create a space first.");
      }
      
      if (method === "upload" && !file) {
        throw new Error("Please select a file to upload");
      }
      if (method === "upload" && file && !validateFileSize(file)) {
        return false; // Error already set in validateFileSize
      }
      if (method === "paste" && !formData.youtubeUrl) {
        throw new Error("Please enter a YouTube URL");
      }
      if (method === "paste" && !isValidYouTubeUrl(formData.youtubeUrl)) {
        throw new Error("Please enter a valid YouTube URL");
      }
      if (!fixedSpaceId && !selectedSpaceId) {
        throw new Error("Please select a space");
      }
      return true;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Validation failed");
      }
      return false;
    }
  };

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File size (${formatFileSize(file.size)}) exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`,
      );
      return false;
    }
    return true;
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Check for valid YouTube domains
      const validDomains = [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtu.be",
      ];

      if (!validDomains.includes(hostname)) {
        return false;
      }

      // Handle youtu.be short URLs
      if (hostname === "youtu.be" || hostname === "www.youtu.be") {
        const videoId = urlObj.pathname.slice(1); // Remove leading slash
        return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
      }

      // Handle youtube.com URLs
      if (hostname.includes("youtube.com")) {
        const pathname = urlObj.pathname;
        const searchParams = urlObj.searchParams;

        // Standard watch URLs
        if (pathname === "/watch") {
          const videoId = searchParams.get("v");
          return videoId !== null && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
        }

        // Embed URLs
        if (pathname.startsWith("/embed/")) {
          const videoId = pathname.slice(7); // Remove '/embed/'
          return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
        }

        // Shorts URLs
        if (pathname.startsWith("/shorts/")) {
          const videoId = pathname.slice(8); // Remove '/shorts/'
          return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
        }

        // Live URLs
        if (pathname === "/live") {
          const videoId = searchParams.get("v");
          return videoId !== null && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
        }
      }

      return false;
    } catch {
      // Invalid URL format
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !validateForm() || !selectedSpaceId) return;

    setLoading(true);

    try {
      if (method === "upload" && file) {
        // Handle file upload
        const { fileUrl } = await uploadFileToS3(file);

        // Create study material
        const response = await fetch("/api/study-material", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileUrl,
            spaceId: selectedSpaceId,
            title: formData.title || file.name,
            description: "",
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create study material");
        }

        const studyMaterial = await response.json();

        // Show success toast
        toast({
          title: "Success",
          description:
            "File uploaded successfully. Processing will begin shortly.",
        });

        // Wait for processing to complete or fail
        let isProcessed = false;
        let isFailed = false;
        const maxTimeout = 300000; // 5 minutes timeout as a safety measure
        const startTime = Date.now();

        while (
          !isProcessed &&
          !isFailed &&
          Date.now() - startTime < maxTimeout
        ) {
          try {
            const statusResponse = await fetch(
              `/api/documents/status/${studyMaterial.id}`,
            );
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.success && statusData.status) {
                isProcessed = statusData.status.isProcessed || false;
                isFailed = statusData.status.processingStatus === "failed";

                if (isProcessed) {
                  toast({
                    title: "Processing Complete",
                    description: "Your document is ready to use!",
                  });
                  // Close modal and redirect to the study material page
                  onOpenChange(false);
                  resetModal();

                  // Check if user wants to create onboarding
                  if (createOnboarding) {
                    router.push(`/spaces/${selectedSpaceId}/onboarding/create`);
                  } else {
                    router.push(`/learn/content/${studyMaterial.docid}`);
                  }
                  return;
                } else if (isFailed) {
                  toast({
                    title: "Processing Failed",
                    description:
                      "There was an error processing your document. Please try again.",
                    variant: "destructive",
                  });
                  onOpenChange(false);
                  resetModal();

                  // Even if processing failed, check for onboarding creation
                  if (createOnboarding) {
                    router.push(`/spaces/${selectedSpaceId}/onboarding/create`);
                  }
                  return;
                } else {
                  // Show progress toast
                  const progress = statusData.status.metadata?.progress || 0;
                  toast({
                    title: "Processing",
                    description: `Processing your document... ${progress}% complete`,
                  });
                }
              }
            }
          } catch (error) {
            console.error("Error checking processing status:", error);
          }
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
        }

        if (!isProcessed && !isFailed) {
          toast({
            title: "Processing Started",
            description:
              "Your document is being processed. You'll be notified when it's ready.",
          });
          // Close modal without redirecting to content
          onOpenChange(false);
          resetModal();

          // Check if user wants to create onboarding
          if (createOnboarding) {
            router.push(`/spaces/${selectedSpaceId}/onboarding/create`);
          }
        }
      } else if (method === "paste" && formData.youtubeUrl && session.user) {
        // Handle YouTube video
        const response = await fetch("/api/study-material", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            youtubeUrl: formData.youtubeUrl,
            spaceId: selectedSpaceId,
            title: formData.title || "YouTube Video",
            description: "",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create study material");
        }

        const studyMaterial = await response.json();

        // Start YouTube processing
        const processResponse = await fetch("/api/youtube/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studyMaterialId: studyMaterial.id,
            spaceId: selectedSpaceId,
            youtubeUrl: formData.youtubeUrl,
            userId: session.user.id,
            title: formData.title || "YouTube Video",
          }),
        });

        if (!processResponse.ok) {
          throw new Error("Failed to start YouTube video processing");
        }

        // Show success toast
        toast({
          title: "Success",
          description:
            "YouTube video processing started. This may take a few minutes.",
        });

        // Wait for processing to complete or fail
        let isProcessed = false;
        let isFailed = false;
        const maxTimeout = 300000; // 5 minutes timeout as a safety measure
        const startTime = Date.now();

        while (
          !isProcessed &&
          !isFailed &&
          Date.now() - startTime < maxTimeout
        ) {
          try {
            const statusResponse = await fetch(
              `/api/youtube/status/${studyMaterial.id}`,
            );
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.success && statusData.status) {
                isProcessed = statusData.status.isProcessed || false;
                isFailed = statusData.status.processingStatus === "failed";

                if (isProcessed) {
                  toast({
                    title: "Processing Complete",
                    description: "Your YouTube video is ready to use!",
                  });
                  // Close modal and redirect to the study material page
                  onOpenChange(false);
                  resetModal();

                  // Check if user wants to create onboarding
                  if (createOnboarding) {
                    router.push(`/spaces/${selectedSpaceId}/onboarding/create`);
                  } else {
                    router.push(`/learn/content/${studyMaterial.docid}`);
                  }
                  return;
                } else if (isFailed) {
                  toast({
                    title: "Processing Failed",
                    description:
                      "There was an error processing your YouTube video. Please try again.",
                    variant: "destructive",
                  });
                  onOpenChange(false);
                  resetModal();

                  // Even if processing failed, check for onboarding creation
                  if (createOnboarding) {
                    router.push(`/spaces/${selectedSpaceId}/onboarding/create`);
                  }
                  return;
                } else {
                  // Show progress toast
                  const progress = statusData.status.metadata?.progress || 0;
                  toast({
                    title: "Processing",
                    description: `Processing your YouTube video... ${progress}% complete`,
                  });
                }
              }
            }
          } catch (error) {
            console.error("Error checking processing status:", error);
          }
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
        }

        if (!isProcessed && !isFailed) {
          toast({
            title: "Processing Started",
            description:
              "Your YouTube video is being processed. You'll be notified when it's ready.",
          });
          // Close modal without redirecting to content
          onOpenChange(false);
          resetModal();

          // Check if user wants to create onboarding
          if (createOnboarding) {
            router.push(`/spaces/${selectedSpaceId}/onboarding/create`);
          }
        }
      }

      // Fallback onboarding check for any other completion paths
      // This handles cases where neither upload nor YouTube methods are used
      // or if processing completes immediately without entering the while loops
      if (createOnboarding && method !== "upload" && method !== "paste") {
        onOpenChange(false);
        resetModal();
        router.push(`/spaces/${selectedSpaceId}/onboarding/create`);
        return;
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  const uploadFileToS3 = async (file: File): Promise<{ fileUrl: string }> => {
    try {
      setUploadState({ status: "uploading", progress: 0 });

      // Step 1: Get presigned URL
      const presignedResponse = await fetch("/api/upload-presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          title: file.name,
          description: "",
          isTemporary: true,
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { presignedUrl, fileUrl } = await presignedResponse.json();

      // Step 2: Upload to S3 with progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadState((prev) => ({ ...prev, progress }));
          }
        });

        xhr.addEventListener("load", async () => {
          if (xhr.status === 200) {
            setUploadState({
              status: "completed",
              progress: 100,
              fileUrl,
            });
            resolve({ fileUrl });
          } else {
            const error = new Error("Upload failed");
            setUploadState({
              status: "failed",
              progress: 0,
              error: "Upload failed",
            });
            reject(error);
          }
        });

        xhr.addEventListener("error", () => {
          const error = new Error("Upload failed");
          setUploadState({
            status: "failed",
            progress: 0,
            error: "Network error during upload",
          });
          reject(error);
        });

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      setUploadState({
        status: "failed",
        progress: 0,
        error: error instanceof Error ? error.message : "Upload failed",
      });
      throw error;
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      // Validate file size before setting
      if (!validateFileSize(selectedFile)) {
        return; // Don't set the file if it's too large
      }
    }

    setFile(selectedFile);
    setUploadState({ status: "idle", progress: 0 });

    if (validationErrors.file) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadState({ status: "idle", progress: 0 });
    setError(null); // Clear any file size errors
  };
  // Helper function to check if upload is in progress
  const isUploading = () => {
    return uploadState.status === "uploading";
  };

  // Helper function to check if form should be disabled
  const isFormDisabled = () => {
    return loading || isUploading() || (!fixedSpaceId && (isLoadingSpaces || !!spacesError || spaces.length === 0));
  };

  const generateRandomKey = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleRecordClick = (type: "audio" | "browser") => {
    if (!selectedSpaceId && !fixedSpaceId) {
      setError("Please select a space");
      return;
    }
    const id = generateRandomKey();
    const spaceSlug =
      spaces.find((s) => s.id === (fixedSpaceId || selectedSpaceId))?.slug ||
      "";
    onOpenChange(false);
    resetModal();
    if (type === "browser") {
      router.push(`/learn/content/${id}?tab=${spaceSlug}`);
    } else {
      router.push(`/learn/content/${id}?record=${spaceSlug}`);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">
          How do you want to create your space?
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Choose how you'd like to add your study material
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Card
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => handleMethodSelect("upload")}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Upload File</CardTitle>
              <CardDescription className="text-sm">
                PDF, DOC, or other documents (up to 100MB)
              </CardDescription>
            </div>
          </CardHeader>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="onboarding">Create Onboarding Flow</Label>
              <p className="text-xs text-muted-foreground">
                Set up a guided introduction for new space members
              </p>
            </div>
            <Switch
              id="onboarding"
              checked={createOnboarding}
              onCheckedChange={setCreateOnboarding}
              disabled={isUploading()}
            />
          </div>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => handleMethodSelect("paste")}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Link2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base">Paste URL</CardTitle>
              <CardDescription className="text-sm">
                YouTube videos or web links
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent transition-colors opacity-50"
          onClick={() => handleMethodSelect("record")}
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Mic className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-base">Record Audio</CardTitle>
              <CardDescription className="text-sm">
                Record lectures or notes (Coming Soon)
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  // Minimal upload UI for file selection
  const renderUploadMinimal = () => {
    if (!file) return null;
    return (
      <div className="flex items-center gap-2 border rounded px-3 py-2 bg-muted">
        <FileText className="h-4 w-4 text-blue-600" />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm truncate">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemoveFile}
          className="h-6 w-6 p-0 ml-auto"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </Button>
        {uploadState.status === "uploading" && (
          <Progress value={uploadState.progress} className="h-1 w-16 ml-2" />
        )}
      </div>
    );
  };

  const renderUploadProgress = () => {
    if (uploadState.status === "idle" || !file) return null;

    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-sm">{file.name}</span>
            {uploadState.status === "completed" && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
          {uploadState.status !== "uploading" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {uploadState.status === "uploading" && (
          <div className="space-y-2">
            <Progress value={uploadState.progress} className="h-2" />
            <p className="text-xs text-gray-600">
              Uploading... {Math.round(uploadState.progress)}%
            </p>
          </div>
        )}

        {uploadState.status === "completed" && (
          <p className="text-xs text-green-600">
            ✓ Upload completed successfully
          </p>
        )}

        {uploadState.status === "failed" && (
          <div className="space-y-2">
            <p className="text-xs text-red-600">
              ✗ Upload failed: {uploadState.error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadState({ status: "idle", progress: 0 })}
              className="h-6 text-xs"
            >
              Try Again
            </Button>
          </div>
        )}

        {uploadState.status === "uploading" ||
        uploadState.status === "completed" ||
        uploadState.status === "failed" ? null : (
          <p className="text-xs text-muted-foreground">
            {Math.round(file.size / (1024 * 1024))} MB • Ready to upload
          </p>
        )}
      </div>
    );
  };

  const renderForm = () => {
    if (method === "record") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Record Audio</span>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!fixedSpaceId && isLoadingSpaces && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <AlertDescription>Loading your spaces...</AlertDescription>
            </Alert>
          )}
          {!fixedSpaceId && (
            <div>
              <Label htmlFor="space">Select Space *</Label>
              <Select
                value={selectedSpaceId}
                onValueChange={setSelectedSpaceId}
                disabled={isUploading() || isLoadingSpaces}
              >
                <SelectTrigger
                  id="tour-space-select"
                  className={validationErrors.spaceId ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      isLoadingSpaces
                        ? "Loading spaces..."
                        : spacesError
                          ? "Error loading spaces"
                          : "Select a space"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {spacesError ? (
                    <SelectItem value="error" disabled>
                      Error loading spaces
                    </SelectItem>
                  ) : spaces.length === 0 ? (
                    <SelectItem value="no-spaces" disabled>
                      No spaces available
                    </SelectItem>
                  ) : (
                    spaces.map((space) => (
                      <SelectItem key={space.id} value={space.id}>
                        {space.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {validationErrors.spaceId && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.spaceId}
                </p>
              )}
              {spacesError && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-red-500 text-sm">
                    Failed to load spaces. Please try refreshing.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchSpaces}
                    disabled={isLoadingSpaces}
                    className="h-6 px-2 text-xs"
                  >
                    {isLoadingSpaces ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Retry"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              className="flex-1"
              onClick={() => handleRecordClick("audio")}
              disabled={loading}
            >
              Audio Record
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => handleRecordClick("browser")}
              disabled={loading}
            >
              Browser Record
            </Button>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">
            {method === "upload" && "Upload File"}
            {method === "paste" && "Paste URL"}
            {(method as CreateMethod) === "record" && "Record Audio"}
          </span>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!fixedSpaceId && isLoadingSpaces && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <AlertDescription>Loading your spaces...</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {!fixedSpaceId && (
            <div>
              <Label htmlFor="space">Select Space *</Label>
              <Select
                value={selectedSpaceId}
                onValueChange={setSelectedSpaceId}
                disabled={isUploading() || isLoadingSpaces}
              >
                <SelectTrigger
                  id="tour-space-select"
                  className={validationErrors.spaceId ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      isLoadingSpaces
                        ? "Loading spaces..."
                        : spacesError
                          ? "Error loading spaces"
                          : "Select a space"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {spacesError ? (
                    <SelectItem value="error" disabled>
                      Error loading spaces
                    </SelectItem>
                  ) : spaces.length === 0 ? (
                    <SelectItem value="no-spaces" disabled>
                      No spaces available
                    </SelectItem>
                  ) : (
                    spaces.map((space) => (
                      <SelectItem key={space.id} value={space.id}>
                        {space.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {validationErrors.spaceId && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.spaceId}
                </p>
              )}
              {spacesError && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-red-500 text-sm">
                    Failed to load spaces. Please try refreshing.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchSpaces}
                    disabled={isLoadingSpaces}
                    className="h-6 px-2 text-xs"
                  >
                    {isLoadingSpaces ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Retry"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="tour-title-input"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder={
                method === "upload"
                  ? "Enter a title (optional)"
                  : "Enter a title for your video"
              }
              required={method === "paste"}
              className={validationErrors.title ? "border-red-500" : ""}
              disabled={isUploading()}
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.title}
              </p>
            )}
          </div>

          {method === "paste" && (
            <div>
              <Label htmlFor="url">YouTube URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) =>
                  handleInputChange("youtubeUrl", e.target.value)
                }
                placeholder="https://youtube.com/watch?v=..."
                required
                className={validationErrors.youtubeUrl ? "border-red-500" : ""}
                disabled={isUploading()}
              />
              {validationErrors.youtubeUrl && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.youtubeUrl}
                </p>
              )}
            </div>
          )}

          {method === "upload" && (
            <div>
              <Label htmlFor="file">Upload File *</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Maximum file size: 100MB
              </p>
              {!file && (
                <Input
                  id="tour-file-input"
                  type="file"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] || null)
                  }
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                  required
                  className={validationErrors.file ? "border-red-500" : ""}
                  disabled={isUploading()}
                />
              )}
              {validationErrors.file && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.file}
                </p>
              )}

              {/* Minimal Upload UI */}
              {renderUploadMinimal()}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isFormDisabled()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isFormDisabled()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading() && "Uploading..."}
            {loading && !isUploading() && "Creating..."}
            {!loading && !isUploading() && !fixedSpaceId && isLoadingSpaces && "Loading Spaces..."}
            {!loading &&
              !isUploading() &&
              !(!fixedSpaceId && isLoadingSpaces) &&
              (method === "upload" ? "Upload File" : "Add Video")}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetModal();
          setFile(null);
          setUploadState({ status: "idle", progress: 0 });
        }
      }}
    >
      <DialogContent className="sm:max-w-md" id={tourModalId}>
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Create New Study Space" : "Space Details"}
          </DialogTitle>
          <DialogDescription>
            {step === "select"
              ? "Create a personalized study space with your materials"
              : "Fill in the details for your new study space"}
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? renderMethodSelection() : renderForm()}
      </DialogContent>
    </Dialog>
  );
}
