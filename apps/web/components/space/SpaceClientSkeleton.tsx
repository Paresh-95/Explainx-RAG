"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@repo/ui/lib/utils";

interface SpaceClientSkeletonProps {
  showChat?: boolean;
}

export default function SpaceClientSkeleton({ showChat = false }: SpaceClientSkeletonProps) {
  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white">
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={showChat ? 50 : 100} minSize={30}>
          <div className="h-full flex flex-col overflow-hidden">
            {/* Fixed top section */}
            <div className="flex-none p-4 border-b border-zinc-300 dark:border-zinc-800">
              <div className="w-full max-w-6xl mx-auto">
                <div className="h-8 bg-zinc-300 dark:bg-zinc-800 rounded-lg w-64 mb-8 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-300 dark:border-zinc-800">
                    <div className="flex flex-col items-start">
                      <div className="h-6 w-6 bg-zinc-300 dark:bg-zinc-700 rounded mb-2 animate-pulse" />
                      <div className="h-6 bg-zinc-300 dark:bg-zinc-700 rounded w-16 mb-1 animate-pulse" />
                      <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-24 animate-pulse" />
                    </div>
                  </div>
                  {/* Repeat similar structure for other cards */}
                </div>
              </div>
            </div>

            {/* Scrollable Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-6xl mx-auto mb-8">
                  <div>
                    <div className="h-9 bg-zinc-300 dark:bg-zinc-800 rounded-lg w-48 mb-2 animate-pulse" />
                    <div className="h-6 bg-zinc-300 dark:bg-zinc-800 rounded-lg w-64 animate-pulse" />
                  </div>
                  <div className="flex gap-4 mt-4 md:mt-0">
                    <div className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-purple-600 text-white hover:bg-purple-700">
                      <div className="h-5 w-5 bg-white/40 rounded animate-pulse" />
                      <div className="h-5 bg-white/40 rounded w-20 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
                      <div className="h-5 w-5 bg-zinc-400 dark:bg-zinc-600 rounded animate-pulse" />
                      <div className="h-5 bg-zinc-400 dark:bg-zinc-600 rounded w-24 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {showChat && (
          <>
            <PanelResizeHandle className="w-px bg-zinc-300 dark:bg-gray-700 cursor-col-resize mx-2" />
            <Panel defaultSize={50} minSize={20}>
              <div className="h-full bg-zinc-100 dark:bg-zinc-950 border-l border-zinc-300 dark:border-zinc-800">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-zinc-300 dark:border-zinc-800">
                    <div className="h-6 bg-zinc-300 dark:bg-zinc-800 rounded w-32 animate-pulse" />
                  </div>
                  {/* Chat messages... */}
                  <div className="p-4 border-t border-zinc-300 dark:border-zinc-800">
                    <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>

  );
}