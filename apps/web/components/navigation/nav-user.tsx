"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  ToggleLeft,
} from "lucide-react"
import { signOut } from "next-auth/react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/ui/sidebar"
import { ModeToggle } from "../mode-toggle"

export function NavUser({
  user,
}: {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  }
}) {
  const { isMobile } = useSidebar()

  // Map session user to the expected format
  const userDisplay = {
    name: user.name || user.username || "User",
    email: user.email || "",
    avatar: user.image || "",
  }

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
      redirect: true
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent dark:hover:bg-[#292929]"
            >
              <Avatar className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-zinc-800">
                <AvatarImage src={userDisplay.avatar} alt={userDisplay.name} />
                <AvatarFallback className="rounded-lg bg-purple-600 text-white">
                  {userDisplay.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-gray-900 dark:text-gray-100">{userDisplay.name}</span>
                <span className="truncate text-xs text-gray-500 dark:text-gray-400">{userDisplay.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-gray-500 dark:text-gray-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-white dark:bg-[#232323] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-800 shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-zinc-800">
                  <AvatarImage src={userDisplay.avatar} alt={userDisplay.name} />
                  <AvatarFallback className="rounded-lg bg-purple-600 text-white">
                    {userDisplay.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-gray-900 dark:text-gray-100">{userDisplay.name}</span>
                  <span className="truncate text-xs text-gray-500 dark:text-gray-400">{userDisplay.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="hover:bg-purple-100 dark:  hover:text-purple-700 dark:hover:text-purple-200">
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="hover:bg-purple-100 dark:  hover:text-purple-700 dark:hover:text-purple-200">
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-purple-100 dark:  hover:text-purple-700 dark:hover:text-purple-200">
                <div className="flex items-center justify-between gap-2 w-full cursor-pointer">
                  <ToggleLeft />
                  <span className="ml-2">Change Theme</span> <span className="text-gray-500 dark:text-gray-400">|</span>
                  <ModeToggle />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-purple-100 dark:  hover:text-purple-700 dark:hover:text-purple-200">
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-purple-100 dark:  hover:text-purple-700 dark:hover:text-purple-200">
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
