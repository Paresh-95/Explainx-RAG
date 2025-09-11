"use client";
import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@repo/ui/lib/utils";
import ChatComponent from "./chatbot";
import DashboardChatComponent from "../dashboard/dashboard-chatbot";
import { FilePreview } from "./file-preview";
import VideoPreview from "./video-preview";
import RecordPreview from "./record-preview";
import { LearnClientProps, ChatComponentRef } from "../../types";
import TabAudioRecorder from "./tab-preview";
import { GripIcon } from "lucide-react";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";

const LearnClient: React.FC<any> = ({
  studyMaterial,
  space,
  session,
  docid,
  spaceSlug,
  mode,
}: {
  studyMaterial: any;
  space: any;
  session: any;
  docid?: string;
  spaceSlug?: string;
  mode?: string;
}) => {
  const chatRef = React.useRef<ChatComponentRef>(null);
  const [highlightedText, setHighlightedText] = useState<string>("");
  const isMobile = useIsMobile();

  const handleTextSelect = (
    text: string,
    action: "explain" | "summarize" | "chat"
  ) => {
    if (chatRef.current) {
      chatRef.current.handleTextSelect(text, action);
    }
  };

  const handleSourceClick = (source: { text: string; score: number }) => {
    setHighlightedText(source.text);
    console.log(source.text);
    console.log(highlightedText);
  };

  // Determine which chat component to use based on whether there's a space
  const hasSpace = space && space.id;
  const ChatComponentToUse = hasSpace ? ChatComponent : DashboardChatComponent;

  return (
    <div className="h-[calc(100vh-100px)] w-full flex flex-col overflow-hidden -mt-10">
      {isMobile ? (
        <div className="h-full w-screen flex flex-col items-center justify-center">
          <div className="flex-1 min-h-0 overflow-hidden w-full">
            {hasSpace ? (
              <ChatComponent
                ref={chatRef}
                spaceId={space.id}
                studyMaterials={space.studyMaterials}
                currentStudyMaterial={studyMaterial}
                session={session}
                onSourceClick={handleSourceClick}
              />
            ) : (
              <DashboardChatComponent
                studyMaterials={studyMaterial ? [studyMaterial] : []}
                currentStudyMaterial={studyMaterial}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 w-full">
          <PanelGroup direction="horizontal" className="w-full h-full overflow-hidden">
            <Panel defaultSize={hasSpace ? 40 : 0}>
              <div className="h-full w-full flex flex-col">
                <div className="flex-1 min-h-0 overflow-hidden">
                  {studyMaterial === null && mode === "tab" ? (
                    <TabAudioRecorder docid={docid} space={spaceSlug} />
                  ) : studyMaterial === null && mode === "record" ? (
                    <RecordPreview docid={docid} space={spaceSlug} />
                  ) : studyMaterial.recordingUrl ? (
                    <RecordPreview
                      recordingUrl={studyMaterial.recordingUrl}
                      fileUrl={studyMaterial.fileUrl}
                    />
                  ) : studyMaterial.youtubeUrl ? (
                    <VideoPreview videoUrl={studyMaterial.youtubeUrl} />
                  ) : studyMaterial.fileUrl ? (
                    <FilePreview
                      fileUrl={studyMaterial.fileUrl}
                      onTextSelect={handleTextSelect}
                      highlightText={highlightedText}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <p className="text-lg mb-2">No file available for preview</p>
                        <p className="text-sm">
                          This study material may be text-based or the file is still processing.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

           {hasSpace && (
             <PanelResizeHandle
             className={cn(
               "relative w-px bg-gray-500 dark:bg-gray-700 cursor-col-resize hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
             )}
           >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
               <GripIcon className="w-4 h-4" />
             </div>
           </PanelResizeHandle>
           )}

            <Panel defaultSize={ hasSpace ? 60 : 100}>
              <div className="h-full w-full flex flex-col min-h-0">
                <div className="flex-1 min-h-0 overflow-hidden">
                  {hasSpace ? (
                    <ChatComponent
                      ref={chatRef}
                      spaceId={space.id}
                      studyMaterials={space.studyMaterials}
                      currentStudyMaterial={studyMaterial}
                      session={session}
                      onSourceClick={handleSourceClick}
                    />
                  ) : (
                    <DashboardChatComponent
                      studyMaterials={studyMaterial ? [studyMaterial] : []}
                      currentStudyMaterial={studyMaterial}
                    />
                  )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      )}
    </div>
  );
};

export default LearnClient;
