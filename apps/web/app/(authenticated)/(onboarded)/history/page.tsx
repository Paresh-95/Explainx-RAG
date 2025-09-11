"use client";

import { useRecents } from "../../../../contexts/recents-provider";
import {
  StudyMaterialCard,
  StudyMaterialCardSkeleton,
} from "../../../../components/study-material-card";
import { useEffect } from "react";

export default function HistoryPage() {
  const { allStudyMaterials, isLoading } = useRecents();

  useEffect(() => {
    console.log("All Study Materials:", allStudyMaterials);
  }, [allStudyMaterials]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Study History</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? // Loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <StudyMaterialCardSkeleton key={`skeleton-${index}`} />
            ))
          : allStudyMaterials.map((item) => {
              console.log("Rendering item:", item);
              return (
                <StudyMaterialCard
                  key={item.id}
                  item={{
                    ...item,
                    slug: item.id,
                    fileUrl: item.fileUrl || undefined,
                    type: item.type || "FILE",
                    mimeType: item.mimeType || undefined,
                  }}
                />
              );
            })}
      </div>
    </div>
  );
}
