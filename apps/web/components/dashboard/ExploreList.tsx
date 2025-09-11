"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

// Mock data for explore items based on the image provided
const MOCK_EXPLORE = [
  {
    id: 1,
    title: "Let's build GPT: from scratc...",
    imageUrl: "/images/gpt-from-scratch.png", // Placeholder image
    timeAgo: "3 months ago",
    link: "#",
  },
  {
    id: 2,
    title: "Generative AI Full Course - ...",
    imageUrl: "/images/generative-ai.png", // Placeholder image
    timeAgo: "3 months ago",
    link: "#",
  },
  {
    id: 3,
    title: "Introduction to Cell Biology",
    imageUrl: "/images/cell-biology.png", // Placeholder image
    timeAgo: "3 months ago",
    link: "#",
  },
  // Add more mock data as needed
];

export default function ExploreList() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Explore</h2>
        <Link href="#" className="text-blue-500 hover:underline">
          Close all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MOCK_EXPLORE.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors overflow-hidden"
          >
            <div className="relative w-full h-32 bg-gray-700">
              {/* Placeholder for image */}
              <Image
                src={item.imageUrl}
                alt={item.title}
                layout="fill"
                objectFit="cover"
                className="rounded-t-xl"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 rounded-full p-1">
                <Play className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="p-4">
              <div className="font-medium text-lg truncate mb-1">{item.title}</div>
              <div className="text-sm text-zinc-400">{item.timeAgo}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 