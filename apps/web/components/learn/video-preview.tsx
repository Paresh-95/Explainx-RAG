"use client";

import { useState, useRef } from "react";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { cn } from "@repo/ui/lib/utils";

interface VideoPreviewProps {
  videoUrl: string;
  transcription?: string;
  className?: string;
}

interface TranscriptSegment {
  timestamp: string;
  text: string;
}

export default function VideoPreview({ 
  videoUrl, 
  transcription = "",
  className 
}: VideoPreviewProps) {
  const [currentTime, setCurrentTime] = useState("00:00");
  
  const videoRef = useRef<HTMLIFrameElement>(null);
  const embedUrl = getEmbedUrl(videoUrl);
  

  
  // Parse transcription into segments (assuming format like "00:00 text")
  const parseTranscription = (text: string): TranscriptSegment[] => {
    if (!text) {
      return [
        { timestamp: "00:00", text: "the universe is made of matter 98 of this matter ignoring the dark matter is pure hydrogen and helium but thankfully billions of years ago supergiant stars fused the hydrogen and helium into all the other elements and then exploded them all over the universe and that's where chemistry came from these elements group together into a vast array of different molecules and these molecules combined with each other in a stupendous number of complicated ways chemistry is the subject that studies this matter in all of its forms" }
      ];
    }
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const timestampMatch = line.match(/^(\d{2}:\d{2})/);
      const timestamp = timestampMatch?.[1] || "00:00"; // Ensure timestamp is always string
      return {
        timestamp: timestamp as string,
        text: line.replace(/^\d{2}:\d{2}\s*/, '').trim()
      };
    });
  };

  const transcriptSegments = parseTranscription(transcription);



  const jumpToTimestamp = (timestamp: string) => {
    // In a real implementation, you'd seek the YouTube video to this timestamp
    console.log(`Jumping to ${timestamp}`);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Video Section - Fixed at top */}
      <div className="flex-shrink-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        {/* Video Player */}
        <div className="relative aspect-video bg-white dark:bg-black rounded-lg shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <iframe
            ref={videoRef}
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>

      {/* Transcription Section - Scrollable */}
      {/* <div className="flex-1 min-h-0 bg-gray-50 dark:bg-neutral-900">
        <div className="h-full">
          <ScrollArea className="h-full">
            <div className="p-6">
              <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-4">Transcript</h3>
              <div className="space-y-4">
                {transcriptSegments.map((segment, index) => (
                  <div key={index} className="group">
                    <button
                      onClick={() => jumpToTimestamp(segment.timestamp)}
                      className="flex gap-4 text-left w-full hover:bg-gray-200 dark:hover:bg-white/10 p-2 rounded-lg transition-colors"
                    >
                      <span className="text-blue-600 dark:text-blue-400 font-mono text-sm flex-shrink-0 group-hover:text-blue-500 dark:group-hover:text-blue-300">
                        {segment.timestamp}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white">
                        {segment.text}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
              {transcriptSegments.length === 0 && (
                <div className="text-center text-gray-400 dark:text-gray-500 py-12">
                  <p>No transcript available for this video.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div> */}
    </div>
  );
}
// Convert watch URL to embed URL
const getEmbedUrl = (url: string): string => {
    const videoIdMatch = url.match(/(?:v=|vi=|v\/|\/v\/|youtu\.be\/|\/embed\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url; // Return original if no match
  };