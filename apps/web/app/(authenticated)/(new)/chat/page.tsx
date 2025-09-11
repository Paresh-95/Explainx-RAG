// app/history/page.tsx
"use client"
import React, { useState, useEffect } from 'react'
import Sidebar from '../_components/sidebar'
import { Button } from '@repo/ui/components/ui/button'
import { Search, MessageCircle, Clock, Trash2, MoreVertical } from 'lucide-react'

interface ChatHistory {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messageCount: number;
}

function HistoryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<ChatHistory[]>([]);

    // Mock data - replace with actual API call
    useEffect(() => {
        const mockHistory: ChatHistory[] = [
            {
                id: '1',
                title: 'Shiva: Key Aspects of Hindu Deity',
                lastMessage: 'Thanks for the detailed explanation about Shiva\'s significance in Hindu mythology.',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                messageCount: 12
            },
            {
                id: '2',
                title: 'Stop Button UI Modification',
                lastMessage: 'The stop button implementation looks perfect now.',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
                messageCount: 8
            },
            {
                id: '3',
                title: 'Next.js Toast Import Error',
                lastMessage: 'The toast import issue has been resolved by updating the import path.',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                messageCount: 15
            },
            {
                id: '4',
                title: 'Sidebar Avatar Click Interaction',
                lastMessage: 'Great! The avatar click handler is working as expected.',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                messageCount: 6
            },
            {
                id: '5',
                title: 'AI Video Background Removal Tool',
                lastMessage: 'Here\'s the complete implementation for the background removal feature.',
                timestamp: new Date(Date.now() - 19 * 60 * 60 * 1000), // 19 hours ago
                messageCount: 22
            },
            {
                id: '6',
                title: 'File Upload Thumbnail Preview',
                lastMessage: 'The thumbnail preview component is now working correctly.',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                messageCount: 9
            }
        ];

        setChatHistory(mockHistory);
        setFilteredHistory(mockHistory);
    }, []);

    // Filter chat history based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredHistory(chatHistory);
        } else {
            const filtered = chatHistory.filter(chat =>
                chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredHistory(filtered);
        }
    }, [searchQuery, chatHistory]);

    const formatTimeAgo = (timestamp: Date) => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
    };

    const handleChatClick = (chatId: string) => {
        // Navigate to chat page
        window.location.href = `/chat/${chatId}`;
    };

    const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    };

    return (
        <div className='flex h-screen overflow-hidden'>
            <Sidebar />
            <div className='flex-1 flex flex-col relative'>
                {/* Main Content Container */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="flex justify-center w-full">
                        <div className='w-full max-w-3xl px-4 py-8'>
                            {/* Header and Search Bar */}
                            <div className="sticky top-0 bg-white z-10">
                                <div className="mb-8">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Your chat history</h1>
                                    <p className="text-gray-600">
                                        You have {chatHistory.length} previous chats with explainx
                                    </p>
                                </div>
                                <div className="mb-8">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search your chats..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Chat History List */}
                            <div className="space-y-4">
                                {filteredHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {searchQuery ? 'No matching chats found' : 'No chat history'}
                                        </h3>
                                        <p className="text-gray-500">
                                            {searchQuery
                                                ? 'Try adjusting your search terms'
                                                : 'Start a conversation to see your chat history here'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredHistory.map((chat) => (
                                        <div
                                            key={chat.id}
                                            onClick={() => handleChatClick(chat.id)}
                                            className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">
                                                        {chat.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                        {chat.lastMessage}
                                                    </p>
                                                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatTimeAgo(chat.timestamp)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <MessageCircle className="h-3 w-3" />
                                                            <span>{chat.messageCount} messages</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => handleDeleteChat(chat.id, e)}
                                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HistoryPage;