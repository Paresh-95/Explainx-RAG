// app/chat/[id]/page.tsx
"use client"
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import Sidebar from '../../_components/sidebar'
import ChatMessage from '../../_components/chat-message'
import { Button } from '@repo/ui/components/ui/button';
import { ArrowUp, Image, Paperclip, Square } from 'lucide-react';
import ChatInput from '../../_components/chat-input';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'answer';
    timestamp: Date;
    isStreaming?: boolean;
}

function ChatPage() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (force = false) => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
            try {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: force ? 'auto' : 'smooth'
                });
            } catch (e) {
                // Fallback
                container.scrollTop = container.scrollHeight;
            }
        });
    };

    // On mount, read initial message from sessionStorage
    useEffect(() => {
        try {
            const parts = window.location.pathname.split('/');
            const id = parts[parts.length - 1];
            if (id) {
                const key = `chat_init_${id}`;
                const initial = sessionStorage.getItem(key);
                if (initial) {
                    sessionStorage.removeItem(key);
                    // Small delay to ensure component is fully mounted
                    setTimeout(() => handleSubmit(initial), 100);
                }
            }
        } catch (e) {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll when messages change
    useLayoutEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        const shouldForceScroll = isStreaming || lastMessage?.role === 'user';

        // Use a longer timeout for streaming messages to ensure content is rendered
        const timeout = isStreaming ? 50 : 0;

        setTimeout(() => {
            scrollToBottom(shouldForceScroll);
        }, timeout);

    }, [messages, isStreaming]);

    const stopStreaming = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsStreaming(false);

            setMessages(prev => prev.map(msg => ({ ...msg, isStreaming: false })));
        }
    };

    const handleSubmit = async (initialText?: string) => {
        const textToSend = (initialText ?? message).trim();
        if (!textToSend || isStreaming) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: textToSend,
            role: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        if (!initialText) setMessage('');

        setIsStreaming(true);

        const controller = new AbortController();
        setAbortController(controller);

        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantMessageId,
            content: '',
            role: 'answer',
            timestamp: new Date(),
            isStreaming: true
        };

        // Add assistant message after a brief delay to ensure user message is rendered
        setTimeout(() => {
            setMessages(prev => [...prev, assistantMessage]);
        }, 50);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(msg => ({
                        role: msg.role === 'answer' ? 'assistant' : msg.role,
                        content: msg.content
                    }))
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No reader available');
            }

            let accumulatedContent = '';
            let updateCount = 0;

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);

                        if (data === '[DONE]') {
                            setIsStreaming(false);
                            setAbortController(null);

                            setMessages(prev => prev.map(msg =>
                                msg.id === assistantMessageId
                                    ? { ...msg, isStreaming: false }
                                    : msg
                            ));
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                accumulatedContent += parsed.content;
                                updateCount++;

                                setMessages(prev => prev.map(msg =>
                                    msg.id === assistantMessageId
                                        ? { ...msg, content: accumulatedContent }
                                        : msg
                                ));

                                // Force scroll every few updates to keep up with streaming
                                if (updateCount % 3 === 0) {
                                    scrollToBottom(true);
                                }
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Request was aborted');
                return;
            }

            console.error('Error sending message:', error);

            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                content: 'Sorry, I encountered an error. Please try again.',
                role: 'answer',
                timestamp: new Date()
            };

            setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId).concat(errorMessage));
        } finally {
            setIsStreaming(false);
            setAbortController(null);
        }
    };

    const handleFileUpload = () => {
        console.log('File upload clicked');
    };

    const handleImageUpload = () => {
        console.log('Image upload clicked');
    };

    return (
        <div className='flex h-screen overflow-hidden'>
            <Sidebar />
            <div className='flex-1 flex flex-col relative'>
                {/* Messages Container with proper ref */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto bg-white mb-5"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="flex justify-center w-full">
                        <div className='w-full max-w-3xl px-4 py-4'>
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p>Start a conversation...</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <ChatMessage
                                        key={msg.id}
                                        message={msg}
                                    />
                                ))
                            )}

                            <div ref={messagesEndRef} />
                            <div className="pb-44"></div>
                        </div>
                    </div>
                </div>

                {/* Fixed Chat Input Container */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                    <div className="flex justify-center w-full">
                        <div className="w-full max-w-3xl px-4 py-4">
                            {/* <div className="flex justify-center mb-4">
                                <Button
                                    onClick={stopStreaming}
                                    variant="outline"
                                    className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                                >
                                    <Square className="h-4 w-4" />
                                    Stop generating
                                </Button>
                            </div> */}

                            <ChatInput
                                message={message}
                                setMessage={setMessage}
                                isStreaming={isStreaming}
                                handleSubmit={handleSubmit}
                                stopStreaming={stopStreaming}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatPage;