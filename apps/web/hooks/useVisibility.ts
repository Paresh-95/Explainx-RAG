import { useState, useCallback } from "react";

// Space Visibility Hook
export function useSpaceVisibility(spaceId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleVisibility = useCallback(
    async (isPublic: boolean) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/spaces/${spaceId}/toggle-visibility`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPublic }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to toggle space visibility",
          );
        }

        const result = await response.json();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [spaceId],
  );

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/spaces/${spaceId}/toggle-visibility`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch space visibility");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [spaceId]);

  return {
    toggleVisibility,
    fetchStatus,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

// Study Material Visibility Hook
export function useStudyMaterialVisibility(materialId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleVisibility = useCallback(
    async (isPublic: boolean) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/study-material/${materialId}/toggle-visibility`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPublic }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to toggle material visibility",
          );
        }

        const result = await response.json();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [materialId],
  );

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/study-material/${materialId}/toggle-visibility`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch material visibility",
        );
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [materialId]);

  return {
    toggleVisibility,
    fetchStatus,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

// Toast notification helper
export function showVisibilityToast(
  type: "space" | "material",
  isPublic: boolean,
  updatedCount?: number,
) {
  const entityType = type === "space" ? "Space" : "Study material";
  const visibility = isPublic ? "public" : "private";

  let message = `${entityType} is now ${visibility}`;

  if (type === "space" && updatedCount !== undefined) {
    message += `. ${updatedCount} study materials updated.`;
  }

  // You can integrate this with your toast library
  // For example, if using react-hot-toast:
  // toast.success(message);

  console.log(message); // Fallback for now
  return message;
}

// Utility function to get visibility badge props
export function getVisibilityBadgeProps(isPublic: boolean) {
  return {
    text: isPublic ? "Public" : "Private",
    icon: isPublic ? "Globe" : "Lock",
    className: isPublic
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800",
  };
}

// Utility function to check if user can edit visibility
export function canEditVisibility(
  currentUserId: string,
  ownerId: string,
  userRole?: string,
) {
  return (
    currentUserId === ownerId || userRole === "ADMIN" || userRole === "OWNER"
  );
}
