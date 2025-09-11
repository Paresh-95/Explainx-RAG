"use client";

import { useState, useEffect } from "react";
import {
  X,
  Globe,
  Lock,
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

interface SpaceVisibilityModalProps {
  spaceId: string;
  spaceName: string;
  isOpen: boolean;
  onClose: () => void;
  onVisibilityUpdate?: (updatedSpace: any) => void;
}

export default function SpaceVisibilityModal({
  spaceId,
  spaceName,
  isOpen,
  onClose,
  onVisibilityUpdate,
}: SpaceVisibilityModalProps) {
  const [currentVisibility, setCurrentVisibility] = useState<boolean | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Fetch current space visibility when modal opens
  useEffect(() => {
    if (isOpen && spaceId) {
      fetchSpaceVisibility();
    }
  }, [isOpen, spaceId]);

  const fetchSpaceVisibility = async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/toggle-visibility`);
      if (response.ok) {
        const data = await response.json();
        setCurrentVisibility(data.space.isPublic);
      }
    } catch (err) {
      console.error("Error fetching space visibility:", err);
    }
  };

  const toggleVisibility = async (isPublic: boolean) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/spaces/${spaceId}/toggle-visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentVisibility(isPublic);
        setSuccess(
          `Space is now ${isPublic ? "public" : "private"}. ` +
            `${result.data.updatedStudyMaterials} study materials updated.`,
        );

        // Notify parent component
        onVisibilityUpdate?.({
          isPublic,
          visibility: result.data.space.visibility,
        });

        // Auto close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update visibility");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <h2 className="text-xl font-semibold text-white">
            Space Visibility Settings
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">
              "{spaceName}"
            </h3>
            <p className="text-sm text-zinc-400">
              Control who can discover and access this space and its study
              materials.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg">
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{success}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Visibility Options */}
          {currentVisibility !== null && (
            <div className="space-y-4">
              {/* Private Option */}
              <div
                className={cn(
                  "p-4 border-2 rounded-lg cursor-pointer transition-all",
                  !currentVisibility
                    ? "border-blue-500 bg-blue-500 bg-opacity-10"
                    : "border-zinc-700 hover:border-zinc-600",
                  loading && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => !loading && toggleVisibility(false)}
              >
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium">Private</h4>
                      {!currentVisibility && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">
                      Only space members can access this space and its study
                      materials
                    </p>
                  </div>
                </div>
              </div>

              {/* Public Option */}
              <div
                className={cn(
                  "p-4 border-2 rounded-lg cursor-pointer transition-all",
                  currentVisibility
                    ? "border-green-500 bg-green-500 bg-opacity-10"
                    : "border-zinc-700 hover:border-zinc-600",
                  loading && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => !loading && toggleVisibility(true)}
              >
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium">Public</h4>
                      {currentVisibility && (
                        <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">
                      Anyone can discover and access this space and its study
                      materials
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {currentVisibility === null && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              <span className="ml-2 text-zinc-400">
                Loading current settings...
              </span>
            </div>
          )}

          {/* Important Note */}
          <div className="mt-6 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-zinc-300">
                <strong>Note:</strong> Changing space visibility will also
                update all study materials in this space that were uploaded by
                you (the space owner) to match the same visibility setting.
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="mt-4 flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-zinc-300">
                Updating space visibility...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
