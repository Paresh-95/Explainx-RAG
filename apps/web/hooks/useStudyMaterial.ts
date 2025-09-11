import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { StudyMaterial } from "../types/chat";

interface UseStudyMaterialOptions {
  message?: boolean;
  firstMessage?: string;
  redirect?: boolean;
}

interface CreateStudyMaterialParams {
  title: string;
  description?: string;
  content?: string;
  type?: string;
}

export const useStudyMaterial = (options: UseStudyMaterialOptions = {}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStudyMaterial = async (
    params: CreateStudyMaterialParams,
  ): Promise<StudyMaterial | null> => {
    if (!session?.user?.id) {
      setError("User not authenticated");
      return null;
    }

    setIsCreating(true);
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/study-material", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Server-Auth": process.env.BACKEND_API_KEY!,
          "X-User-ID": session.user.id,
        },
        body: JSON.stringify({
          title: params.title,
          description: params.description || `Study material: ${params.title}`,
          type: params.type || "OTHER_DOCUMENT",
          isChunk: false, // Always false as requested
          content: params.content,
          // No spaceId - will be null/undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create study material");
      }

      const studyMaterial = await response.json();

      // Only redirect if explicitly requested (default to true for backward compatibility)
      if (options.redirect !== false) {
        router.push(`/learn/content/${studyMaterial.docid}`);
      }

      return studyMaterial;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create study material";
      setError(errorMessage);
      console.error("Failed to create study material:", err);
      return null;
    } finally {
      setIsCreating(false);
      setIsProcessing(false);
    }
  };

  return {
    createStudyMaterial,
    isCreating,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
};

