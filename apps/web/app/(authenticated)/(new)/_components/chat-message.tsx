// _components/chat-message.tsx
"use client"
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/ui/avatar';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'answer';
    timestamp: Date;
    isStreaming?: boolean;
}

interface ChatMessageProps {
    message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const { data: session } = useSession();

    const formatTime = (timestamp: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(timestamp);
    };

    if (message.role === 'user') {
        return (
            <div className='bg-white my-5'>
                <div>
                    <div className="flex items-center justify-between">
                        <div className='flex items-center gap-4'>
                            <Avatar className="w-5 h-5">
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
                            <span className='text-xs font-bold'>You</span>
                        </div>
                        <span className='text-[#4B4B4B] text-xs'>
                            {formatTime(message.timestamp)}
                        </span>
                    </div>
                    <div className='text-lg ml-9 mt-2'>
                        {message.content}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-white my-5'>
            <div className='mt-5 border rounded-md border-[#E4E4E4] p-5 bg-[#F6F4F3]'>
                <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center'>
                        <Image src={'/assets/logo-light.png'} width={30} height={30} alt='AI Answer' />
                        <span className='text-sm font-semibold ml-2'>Answer</span>
                    </div>
                    <span className='text-[#4B4B4B] text-xs'>
                        {formatTime(message.timestamp)}
                    </span>
                </div>
                <div className='pl-10'>
                    <MessageContent content={message.content} isStreaming={message.isStreaming || false} />
                </div>
            </div>
        </div>
    );
}

function MessageContent({ content, isStreaming }: { content: string; isStreaming: boolean }) {
    if (!content && isStreaming) {
        return (
            <div className="text-gray-500 italic">
                Thinking...
            </div>
        );
    }

    const formatMarkdown = (text: string) => {
        // Split by code blocks first to preserve them
        const parts = text.split(/(```[\s\S]*?```)/);

        return parts.map((part, partIndex) => {
            if (part.startsWith('```') && part.endsWith('```')) {
                // Handle code blocks
                const code = part.slice(3, -3);
                const lines = code.split('\n');
                const language = lines[0]?.trim();
                const codeContent = lines.slice(1).join('\n');

                return (
                    <pre key={partIndex} className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto border">
                        {language && (
                            <div className="text-gray-400 text-xs mb-2 font-medium">{language}</div>
                        )}
                        <code className="text-sm font-mono">{codeContent}</code>
                    </pre>
                );
            }

            // Process non-code block content
            const lines = part.split('\n');
            const elements: JSX.Element[] = [];
            let currentIndex = 0;

            while (currentIndex < lines.length) {
                const line = lines[currentIndex]?.trim() || '';

                if (!line) {
                    elements.push(<div key={`${partIndex}-${currentIndex}`} className="h-4" />);
                    currentIndex++;
                    continue;
                }

                // Handle headings
                if (line.startsWith('###')) {
                    const headingText = line.replace(/^#{1,3}\s*/, '').replace(/\*\*/g, '');
                    elements.push(
                        <h3 key={`${partIndex}-${currentIndex}`} className="text-lg font-semibold mt-6 mb-3 text-gray-800">
                            {headingText}
                        </h3>
                    );
                    currentIndex++;
                    continue;
                }

                if (line.startsWith('##')) {
                    const headingText = line.replace(/^#{1,2}\s*/, '').replace(/\*\*/g, '');
                    elements.push(
                        <h2 key={`${partIndex}-${currentIndex}`} className="text-xl font-bold mt-6 mb-4 text-gray-800">
                            {headingText}
                        </h2>
                    );
                    currentIndex++;
                    continue;
                }

                if (line.startsWith('#')) {
                    const headingText = line.replace(/^#\s*/, '').replace(/\*\*/g, '');
                    elements.push(
                        <h1 key={`${partIndex}-${currentIndex}`} className="text-2xl font-bold mt-6 mb-4 text-gray-800">
                            {headingText}
                        </h1>
                    );
                    currentIndex++;
                    continue;
                }

                // Handle list items
                if (line.startsWith('-') || line.match(/^\d+\./)) {
                    const listItems: string[] = [];
                    const isOrdered = line.match(/^\d+\./);

                    // Collect all consecutive list items
                    while (currentIndex < lines.length) {
                        const currentLine = lines[currentIndex]?.trim() || '';
                        if (currentLine.startsWith('-') || currentLine.match(/^\d+\./)) {
                            const itemText = currentLine.replace(/^[-\d\.]\s*/, '');
                            listItems.push(itemText);
                            currentIndex++;
                        } else if (!currentLine) {
                            // Skip empty lines within lists
                            currentIndex++;
                        } else {
                            break;
                        }
                    }

                    const ListComponent = isOrdered ? 'ol' : 'ul';
                    elements.push(
                        <ListComponent
                            key={`${partIndex}-list-${currentIndex}`}
                            className={`my-3 ml-4 space-y-1 ${isOrdered ? 'list-decimal' : 'list-disc'}`}
                        >
                            {listItems.map((item, itemIndex) => (
                                <li key={itemIndex} className="text-gray-700 leading-relaxed">
                                    {formatInlineText(item)}
                                </li>
                            ))}
                        </ListComponent>
                    );
                    continue;
                }

                // Handle regular paragraphs
                elements.push(
                    <p key={`${partIndex}-${currentIndex}`} className="text-gray-700 leading-relaxed mb-3">
                        {formatInlineText(line)}
                    </p>
                );
                currentIndex++;
            }

            return <div key={partIndex}>{elements}</div>;
        });
    };

    const formatInlineText = (text: string) => {
        // Handle inline code
        const parts = text.split(/(`[^`]+`)/);

        return parts.map((part, index) => {
            if (part.startsWith('`') && part.endsWith('`')) {
                const code = part.slice(1, -1);
                return (
                    <code key={index} className="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-gray-800">
                        {code}
                    </code>
                );
            }

            // Handle bold text
            const boldParts = part.split(/(\*\*[^*]+\*\*)/);
            return boldParts.map((boldPart, boldIndex) => {
                if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                    const boldText = boldPart.slice(2, -2);
                    return <strong key={`${index}-${boldIndex}`} className="font-semibold">{boldText}</strong>;
                }
                return boldPart;
            });
        });
    };

    return (
        <div className="prose prose-sm max-w-none">
            {formatMarkdown(content)}
        </div>
    );
}