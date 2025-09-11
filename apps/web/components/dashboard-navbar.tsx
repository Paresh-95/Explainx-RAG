"use client";
import {
  Calculator,
  Smile,
  CreditCard,
  Settings,
  User,
  Calendar,
  Search,
  FileText,
  Folder,
} from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@repo/ui/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@repo/ui/components/ui/command";
import RevNSLogoWithText from "./revns-logo-with-text";
import { SidebarTrigger, useSidebar } from "@repo/ui/components/ui/sidebar";
import { useRecents } from "../contexts/recents-provider";
import { useSpaces } from "../contexts/space-provider";

const DashboardNavbar = () => {
  const [open, setOpen] = React.useState(false);
  const { open: sidebarOpen, isMobile, openMobile } = useSidebar();
  const { recents, isLoading: recentsLoading } = useRecents();
  const { spaces, isLoading: spacesLoading } = useSpaces();
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearchClick = () => {
    setOpen(true);
  };

  const handleRecentItemSelect = (item: any) => {
    setOpen(false);
    // Navigate to the learn content page
    router.push(`/learn/content/${item.docid}`);
  };

  const handleSpaceSelect = (space: any) => {
    setOpen(false);
    // Navigate to the space page
    router.push(`/spaces/${space.slug}`);
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-background flex flex-row items-center justify-between px-5 py-3">
      <div className="flex flex-row items-center gap-4">
        {(!sidebarOpen || (isMobile && !openMobile)) && (
          <SidebarTrigger />
        )}
        {(!sidebarOpen || (isMobile && !openMobile)) && (
          <RevNSLogoWithText size="default" />
        )}
      </div>
      <div className="flex flex-row gap-8 items-center justify-center">
        <Button className="px-4 py-1 border-2 border-green-500 bg-black text-green-500 rounded-full shadow-lg shadow-green-500/30">
          Upgrade
        </Button>
        <div
          className="border-1 border-gray-100 p-2 rounded-full bg-[#1f1f1f] cursor-pointer hover:bg-[#2a2a2a] transition-colors"
          onClick={handleSearchClick}
        >
          <p className="text-muted-foreground text-sm flex flex-row justify-center items-center gap-1">
            <Search size={14} />
            <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[12px] font-medium opacity-100 select-none  justify-center">
              <span className="text-xs text-[14px]">⌘</span>J
            </kbd>
          </p>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Recent">
                {recentsLoading ? (
                  <CommandItem disabled>
                    <span>Loading recent items...</span>
                  </CommandItem>
                ) : recents.length > 0 ? (
                  recents.slice(0, 5).map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleRecentItemSelect(item)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </CommandItem>
                  ))
                ) : (
                  <CommandItem disabled>
                    <span>No recent items</span>
                  </CommandItem>
                )}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Spaces">
                {spacesLoading ? (
                  <CommandItem disabled>
                    <span>Loading spaces...</span>
                  </CommandItem>
                ) : spaces.length > 0 ? (
                  spaces.slice(0, 5).map((space) => (
                    <CommandItem
                      key={space.id}
                      onSelect={() => handleSpaceSelect(space)}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      <span>{space.name}</span>
                    </CommandItem>
                  ))
                ) : (
                  <CommandItem disabled>
                    <span>No spaces found</span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
