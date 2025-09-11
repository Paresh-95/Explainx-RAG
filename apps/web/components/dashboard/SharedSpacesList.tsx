"use client";

import { useRouter } from "next/navigation";
import { useSharedSpaces } from "../../contexts/shared-space-provider";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SharedSpacesList() {
  const { sharedSpaces, isLoading } = useSharedSpaces();
  const router = useRouter();

  const handleSpaceClick = (ownerUsername: string, slug: string) => {
    router.push(`/${ownerUsername}/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">Shared With Me</h2>
          <Link href="/explore">
            <button className="px-4 py-2 flex items-center gap-2  text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors rounded-lg">
              Explore Spaces

              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">Shared With Me</h2>
        <Link href="/explore">
          <button className="px-4 py-2 flex items-center gap-2  text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors rounded-lg">
            Explore Spaces

            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sharedSpaces.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 dark:text-zinc-400 py-8">
            No shared spaces found.
          </div>
        ) : (
          sharedSpaces.map((space) => (
            <div
              key={space.id}
              className="bg-gray-100 dark:bg-zinc-900 rounded-xl p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-zinc-800 transition-colors border border-gray-200 dark:border-zinc-800"
              onClick={() => handleSpaceClick(space.owner.username, space.slug)}
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
                      {space.contents} {space.contents === 1 ? 'content' : 'contents'} • Shared
                    </div>
                  </div>
                </div>
                {/* No delete/trash icon for shared spaces */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 