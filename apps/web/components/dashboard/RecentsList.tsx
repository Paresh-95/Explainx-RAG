"use client";

import Link from "next/link";
import { useRecents } from "../../contexts/recents-provider";
import { StudyMaterialCard, StudyMaterialCardSkeleton } from "../study-material-card";

export default function RecentsList() {
  const { recents, isLoading } = useRecents();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">Recents</h2>
        <Link href="/history" className="text-purple-600 hover:underline dark:text-purple-400">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-gray-100 dark:bg-zinc-900 rounded-xl">
              <StudyMaterialCardSkeleton />
            </div>
          ))
        ) : (
          recents.map((item: any) => (
            <div key={item.id} className="bg-gray-100 dark:bg-zinc-900 rounded-xl">
              <StudyMaterialCard
                item={{
                  ...item,
                  slug: item.id,
                  fileUrl: item.fileUrl || undefined,
                  type: item.type || "FILE",
                  mimeType: item.mimeType || undefined,
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}