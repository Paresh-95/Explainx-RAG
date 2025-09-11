"use client"
import { Plus, MessageCircle, Box, Clock, ArrowUpRight, File, Folders, User, Settings, LogOut, CreditCard, Bell } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuGroup,
} from "@repo/ui/components/ui/dropdown-menu";

export default function Sidebar() {
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { data: session } = useSession();

    const menuItems = [
        {
            icon: MessageCircle,
            label: 'Chat',
            link: '/chat',
            items: ['Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum']
        },
        {
            icon: Box,
            label: 'Space',
            link: '/space/' + Math.random().toString(36).substring(2, 17),
            items: ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta']
        },
        {
            icon: Folders,
            label: 'Store',
            link: '/store',
            items: ['Documents', 'Images', 'Videos', 'Templates']
        },
    ];

    const handleProfileClick = () => {
        // You can add custom logic here for when avatar is clicked
        console.log('Avatar clicked!');
        setIsProfileOpen(!isProfileOpen);
    };

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className="flex h-screen relative">
            {/* Your Original Sidebar Design */}
            <div className="w-[100px] bg-[#F7F7F7] border-r border-[#EAEAEA] flex flex-col h-screen relative z-10">
                {/* Logo */}
                <Image
                    src="/assets/logo-light.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="mx-auto my-4"
                />

                {/* New Chat Button */}
                <div className="flex justify-center mb-8 mt-10">
                    <button className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors">
                        <Plus className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1">
                    <div className="space-y-6">
                        {menuItems.map((item, index) => (
                            <a
                                key={index}
                                href={item.link}
                                className="flex flex-col items-center"
                                onMouseEnter={() => setHoveredItem(index)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 group bg-[#EBEBEB] text-gray-600 hover:bg-[#EFE7FF] hover:text-[#935EFF]"
                                >
                                    <item.icon className="w-4 h-4 transition-colors duration-200" />
                                </div>
                                <div className="text-xs text-gray-600 text-center mt-2 font-medium">
                                    {item.label}
                                </div>
                            </a>
                        ))}
                    </div>
                </nav>

                {/* Bottom Section */}
                <div className="flex flex-col items-center space-y-6 pb-6">
                    {/* Upgrade Button */}
                    <div className="flex flex-col items-center">
                        <button className="w-12 h-12 text-gray-600 hover:bg-[#EFE7FF] hover:text-[#935EFF] rounded-full flex items-center justify-center transition-all duration-200">
                            <ArrowUpRight className="w-4 h-4 transition-colors duration-200" />
                        </button>
                        <div className="text-xs text-gray-600 text-center mt-2 font-medium">
                            Upgrade
                        </div>
                    </div>

                    {/* Enhanced Profile Dropdown */}
                    <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                        <DropdownMenuTrigger asChild>
                            <button
                                onClick={handleProfileClick}
                                className="border-2 border-gray-300 hover:border-[#935EFF] transition-colors duration-200 rounded-full focus:outline-none focus:border-[#935EFF] focus:ring-2 focus:ring-[#935EFF]/20"
                            >
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Profile"} />
                                    <AvatarFallback className="bg-purple-600 text-white font-medium text-sm">
                                        {session?.user?.name
                                            ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                                            : session?.user?.email
                                                ? session.user.email?.[0]?.toUpperCase()
                                                : 'U'
                                        }
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            side="right"
                            align="center"
                            sideOffset={12}
                            className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg"
                        >
                            <DropdownMenuLabel className="px-2 py-1.5">
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Profile"} />
                                        <AvatarFallback className="bg-purple-600 text-white text-xs">
                                            {session?.user?.name
                                                ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                                                : 'U'
                                            }
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">
                                            {session?.user?.name || 'User'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {session?.user?.email || 'user@example.com'}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuItem className="hover:bg-[#EFE7FF] hover:text-[#935EFF]">
                                    <User className="w-4 h-4 mr-2" />
                                    Account
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-[#EFE7FF] hover:text-[#935EFF]">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Preferences
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-[#EFE7FF] hover:text-[#935EFF]">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Billing
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-[#EFE7FF] hover:text-[#935EFF]">
                                    <Bell className="w-4 h-4 mr-2" />
                                    Notifications
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onSelect={handleLogout}
                                className="hover:bg-red-50 hover:text-red-600 text-red-600"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Secondary Panel with shadcn Card (overlay, does not affect layout) */}
            {hoveredItem !== null && (
                <Card
                    className="absolute left-[100px] top-0 h-screen w-64 shadow-lg border-0 rounded-none transition-all duration-200 ease-out z-50"
                    onMouseEnter={() => setHoveredItem(hoveredItem)}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            {menuItems[hoveredItem]?.label ? `${menuItems[hoveredItem].label}s` : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            {menuItems[hoveredItem]?.items.map((item, idx) => (
                                <Button
                                    key={idx}
                                    variant="ghost"
                                    className="w-full justify-start text-gray-700 hover:text-[#935EFF] hover:bg-[#EFE7FF] transition-all duration-150 h-auto py-2"
                                >
                                    {item}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="link"
                            className="mt-4 p-0 text-[#935EFF] hover:text-purple-700 text-sm font-medium h-auto"
                        >
                            View all
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}