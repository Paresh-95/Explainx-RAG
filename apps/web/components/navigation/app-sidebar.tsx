"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@repo/ui/components/ui/sidebar";

import RevNSLogoWithText from "../revns-logo-with-text";
import { DashedButtonDirect } from "../dashed-btn";
import {
  History,
  Plus,
  AlignLeft,
  Box,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Play,
  FileText,
  Image as ImageIcon,
  File,
  FileCode,
} from "lucide-react";
import Link from "next/link";
import { NavUser } from "./nav-user";
import { usePathname } from "next/navigation";
import { useSpaces } from "../../contexts/space-provider";
import { useRecents } from "../../contexts/recents-provider";
import { CreateSpaceDialog } from "../spaces/create-space-dialog";
import { useState } from "react";

const tools = [
  {
    title: "Feedback",
    url: "dashboard/feedack",
    icon: ThumbsUp,
  },
  {
    title: "Quick Guide",
    url: "dashboard/quick-guide",
    icon: Box,
  },
  {
    title: "Chrome Extension",
    url: "dashboard/extension",
    icon: Box,
  },
  {
    title: "Survey",
    url: "/dashboard/survey",
    icon: Box,
  },
  {
    title: "Discord Server",
    url: "/discord",
    icon: Box,
  },
  {
    title: "Invite & Earn",
    url: "/invite",
    icon: Box,
  },
];

function getFileIcon(type?: string, mimeType?: string) {
  // Handle different material types
  if (type === "OTHER") {
    return <MessageCircle className="h-4 w-4" />;
  }

  if (type === "YOUTUBE_VIDEO" || type === "YOUTUBE") {
    return <Play className="h-4 w-4" />;
  }

  // Handle FILE type based on mimeType
  if (type === "FILE") {
    if (!mimeType) return <File className="h-4 w-4" />;

    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    }

    if (
      mimeType.startsWith("text/") ||
      mimeType.includes("pdf") ||
      mimeType.includes("document")
    ) {
      return <FileText className="h-4 w-4" />;
    }

    if (
      mimeType.includes("code") ||
      mimeType.includes("javascript") ||
      mimeType.includes("typescript")
    ) {
      return <FileCode className="h-4 w-4" />;
    }

    return <File className="h-4 w-4" />;
  }

  // Default fallback
  return <File className="h-4 w-4" />;
}

export function AppSidebar({
  user,
}: {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
}) {
  const { open } = useSidebar();
  const pathname = usePathname();
  const { spaces, isLoading: spacesLoading } = useSpaces();
  const { allStudyMaterials, isLoading: recentsLoading } = useRecents();
  const [showAll, setShowAll] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const displayedMaterials = showAll
    ? allStudyMaterials
    : allStudyMaterials.slice(0, 8);
  const hasMore = allStudyMaterials.length > 8;

  return (
    <Sidebar className="bg-white dark:bg-[#1f1f1f] flex flex-col h-full border-r border-gray-200 dark:border-[#232323]">
      <SidebarHeader className="flex-shrink-0">
        <Link href="/dashboard">
          <div className="flex flex-row justify-between  items-center p-2">
            {open && <RevNSLogoWithText />}
            <div className="flex items-center justify-center">
              {open && <SidebarTrigger />}
            </div>
          </div>
        </Link>
      </SidebarHeader>

      {/* Fixed scrollable content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 px-4 py-3">
          <Link href="/dashboard">
            <DashedButtonDirect
              className={`bg-purple-600 text-white hover:bg-purple-700 border border-purple-700 shadow-sm ${pathname === "/dashboard" ? "ring-2 ring-purple-400" : ""
                }`}
            >
              <Plus size={16} className="text-white" />
              <span className="text-sm font-medium">Add Content</span>
            </DashedButtonDirect>
          </Link>
        </div>

        <SidebarContent
          className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-[#1f1f1f]"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuButton
                asChild
                className={
                  pathname === "/history"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-purple-100 dark:hover:bg-[#292929]"
                }
              >
                <Link href="/history">
                  <History />
                  <span>History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-sm text-gray-700 dark:text-gray-300">
              Study Materials
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentsLoading ? (
                  // Loading skeleton for study materials
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <SidebarMenuItem key={`study-material-skeleton-${i}`}>
                        <div className="flex items-center space-x-2 px-2 py-1.5">
                          <div className="w-4 h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                          <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-20 animate-pulse" />
                        </div>
                      </SidebarMenuItem>
                    ))}
                  </>
                ) : (
                  <>
                    {displayedMaterials.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          className={
                            pathname === `/learn/content/${item.docid}/${item}`
                              ? "bg-purple-600 text-white"
                              : "hover:bg-purple-100 dark:hover:bg-[#292929]"
                          }
                        >
                          <Link
                            href={`/learn/content/${item.docid}/`}
                            className="hover:bg-purple-100 dark:hover:bg-[#292929]"
                          >
                            {getFileIcon(item.type, item.mimeType)}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    {hasMore && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setShowAll(!showAll)}
                          className="hover:bg-purple-100 dark:hover:bg-[#292929]"
                        >
                          {showAll ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              <span>Show Less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              <span>Show More</span>
                            </>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-sm text-gray-700 dark:text-gray-300">
              Spaces
            </SidebarGroupLabel>
            <div className="px-2 py-3">
              <DashedButtonDirect
                className={`bg-purple-600 text-white hover:bg-purple-700 border border-purple-700 shadow-sm ${pathname === "/dashboard" ? "ring-2 ring-purple-400" : ""
                  }`}
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus size={16} className="text-white" />
                <span className="text-sm font-medium">Create Space</span>
              </DashedButtonDirect>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {spacesLoading ? (
                  // Loading skeleton for spaces
                  <>
                    {[1, 2].map((i) => (
                      <SidebarMenuItem key={`skeleton-${i}`}>
                        <div className="flex items-center space-x-2 px-2 py-1.5">
                          <div className="w-4 h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                          <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-20 animate-pulse" />
                        </div>
                      </SidebarMenuItem>
                    ))}
                  </>
                ) : (
                  // Actual spaces from context
                  spaces.map((space) => (
                    <SidebarMenuItem key={space.id}>
                      <SidebarMenuButton
                        asChild
                        className={
                          pathname === `/spaces/${space.slug}`
                            ? "bg-purple-600 text-white"
                            : "hover:bg-purple-100 dark:hover:bg-[#292929]"
                        }
                      >
                        <Link
                          href={`/spaces/${space.slug}`}
                          className="hover:bg-purple-100 dark:hover:bg-[#292929]"
                        >
                          <Box />
                          <span>{space.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-sm text-gray-700 dark:text-gray-300">
              Help & Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tools.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={
                        pathname === item.url
                          ? "bg-purple-600 text-white"
                          : "hover:bg-purple-100 dark:hover:bg-[#292929]"
                      }
                    >
                      <a
                        href={item.url}
                        className="hover:bg-purple-100 dark:hover:bg-[#292929]"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>

      <SidebarFooter className="flex-shrink-0 bg-white dark:bg-[#1f1f1f] border-t border-gray-200 dark:border-[#232323]">
        <NavUser user={user} />
      </SidebarFooter>

      <CreateSpaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </Sidebar>
  );
}
