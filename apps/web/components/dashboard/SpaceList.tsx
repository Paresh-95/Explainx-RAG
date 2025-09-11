"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSpaces } from "../../contexts/space-provider";
import { CreateSpaceDialog } from "../spaces/create-space-dialog";

export default function SpacesList() {
  const { spaces, isLoading: isFetching } = useSpaces();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  const handleSpaceClick = (slug: string) => {
    router.push(`/spaces/${slug}`);
  };

  if (isFetching) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Spaces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-zinc-900 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">My Spaces</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {spaces.map((space) => (
          <div
            key={space.id}
            className="bg-gray-100 dark:bg-zinc-900 rounded-xl p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-zinc-800 transition-colors border border-gray-200 dark:border-zinc-800"
            onClick={() => handleSpaceClick(space.slug)}
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 text-zinc-400 dark:text-zinc-400"
                >
                  <path d="m21 16-9 5-9-5" />
                  <path d="m21 8-9 5-9-5" />
                  <path d="m3 8 9-5 9 5" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{space.name}</div>
                  <div className="text-sm text-gray-500 dark:text-zinc-400">
                    {space.contents} {space.contents === 1 ? 'content' : 'contents'} • {space.visibility.toLowerCase()}
                  </div>
                </div>
              </div>
              <Trash className="h-5 w-5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-400 dark:hover:text-zinc-300 cursor-pointer" />
            </div>
          </div>
        ))}

        <div
        id="tour-add-space"
          className="border border-dashed border-purple-600 dark:border-purple-600 rounded-xl p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus  className="h-6 w-6 text-purple-600" />
        </div>
      </div>

      <CreateSpaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}