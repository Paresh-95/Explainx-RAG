// File: components/SpaceView.tsx
"use client";

import { useState } from "react";
import { Space, StudyMaterial, User } from "@prisma/client";

interface SpaceWithRelations extends Space {
  studyMaterials: StudyMaterial[];
  owner: Pick<User, "username" | "name">;
}

interface SpaceViewProps {
  space: SpaceWithRelations;
  isOwner: boolean;
}

export default function SpaceView({ space, isOwner }: SpaceViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: space.name,
    description: space.description || "",
    isPublic: space.isPublic,
  });

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/spaces/${space.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        setIsEditing(false);
        window.location.reload(); // Refresh to show updates
      }
    } catch (error) {
      console.error("Error updating space:", error);
    }
  };

  const getEmbedUrl = (youtubeUrl: string) => {
    const videoId = youtubeUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="text-3xl font-bold w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none"
            />
            <textarea
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
              rows={3}
              placeholder="Space description"
            />
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editData.isPublic}
                  onChange={(e) =>
                    setEditData({ ...editData, isPublic: e.target.checked })
                  }
                  className="mr-2"
                />
                Public Space
              </label>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{space.name}</h1>
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Edit
                </button>
              )}
            </div>
            {space.description && (
              <p className="text-gray-600 mb-4">{space.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>By {space.owner.name || space.owner.username}</span>
              <span>•</span>
              <span>{space.isPublic ? "Public" : "Private"}</span>
              <span>•</span>
              <span>{new Date(space.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {space.studyMaterials.map((material) => (
          <div
            key={material.id}
            className="border border-gray-200 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4">{material.title}</h3>

            {material.type === "YOUTUBE_VIDEO" && material.youtubeUrl && (
              <div className="aspect-video">
                {getEmbedUrl(material.youtubeUrl) ? (
                  <iframe
                    src={getEmbedUrl(material.youtubeUrl)!}
                    className="w-full h-full rounded"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <a
                      href={material.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View YouTube Video
                    </a>
                  </div>
                )}
              </div>
            )}

            {(material.type === "PDF_DOCUMENT" ||
              material.type === "DOC_DOCUMENT") &&
              material.fileUrl && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-lg font-medium">{material.fileName}</p>
                    <p className="text-gray-500 mb-4">
                      {material.fileSize &&
                        `${Math.round(material.fileSize / 1024)} KB`}
                    </p>
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                      Download File
                    </a>
                  </div>
                </div>
              )}

            {material.description && (
              <p className="text-gray-600 mt-4">{material.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
