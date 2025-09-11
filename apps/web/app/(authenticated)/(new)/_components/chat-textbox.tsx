"use client"
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/ui/button';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { toast } from "sonner";
import { Paperclip, Image, ArrowUp, X } from 'lucide-react';

export default function ChatInterface() {
    const [message, setMessage] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const router = useRouter();

    // Generate a UUID v4. Use crypto.randomUUID() when available, otherwise
    // use a secure getRandomValues-based fallback.
    const generateId = useCallback(() => {
        try {
            if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
                return (crypto as any).randomUUID();
            }
        } catch (e) {
            // fall through to fallback
        }

        // Fallback UUID v4 using getRandomValues
        const bytes = new Uint8Array(16);
        try {
            crypto.getRandomValues(bytes);
        } catch (e) {
            // Last-resort fallback to Math.random (not cryptographically secure)
            for (let i = 0; i < 16; i++) {
                bytes[i] = Math.floor(Math.random() * 256);
            }
        }

        // Per RFC 4122 set version and variant bits
        bytes[6] = ((bytes[6]!) & 0x0f) | 0x40; // version 4
        bytes[8] = ((bytes[8]!) & 0x3f) | 0x80; // variant

        const toHex = (b: number) => b.toString(16).padStart(2, '0');
        return `${toHex(bytes[0]!)}${toHex(bytes[1]!)}${toHex(bytes[2]!)}${toHex(bytes[3]!)}-${toHex(bytes[4]!)}${toHex(bytes[5]!)}-${toHex(bytes[6]!)}${toHex(bytes[7]!)}-${toHex(bytes[8]!)}${toHex(bytes[9]!)}-${toHex(bytes[10]!)}${toHex(bytes[11]!)}${toHex(bytes[12]!)}${toHex(bytes[13]!)}${toHex(bytes[14]!)}${toHex(bytes[15]!)}`;
    }, []);

    const handleSubmit = useCallback(() => {
        if (!message.trim()) return;

        const id = generateId();

        // Store the initial message in sessionStorage keyed by the chat id so the
        // new chat page can read it from session instead of using query params.
        try {
            sessionStorage.setItem(`chat_init_${id}`, message.trim());
        } catch (e) {
            // ignore storage errors
        }

        // Navigate to the chat page with the generated id.
        router.push(`/chat/${id}`);

        // clear the box after redirecting
        setMessage('');
    }, [generateId, message, router]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setUploadedFiles((prev) => {
            const combined = [...prev, ...uploadedImages, ...files];
            if (combined.length > 5) {
                toast.error("You can only upload up to 5 files or images.");
            }
            const limited = combined.slice(0, 5);
            setUploadedImages(limited.filter((file) => file.type.startsWith('image/')));
            return limited.filter((file) => !file.type.startsWith('image/'));
        });
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const images = Array.from(event.target.files || []);
        setUploadedImages((prev) => {
            const combined = [...prev, ...uploadedFiles, ...images];
            if (combined.length > 5) {
                toast.error("You can only upload up to 5 files or images.");
            }
            const limited = combined.slice(0, 5);
            setUploadedFiles(limited.filter((file) => !file.type.startsWith('image/')));
            return limited.filter((file) => file.type.startsWith('image/'));
        });
    };

    const removeFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeImage = (index: number) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white" >
            <div className="w-full max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-normal text-gray-800">
                        What's in your mind today?
                    </h1>
                </div>

                {/* Chat Input Container */}
                <div className="relative">
                    {/* Main Input Area */}
                    <div className="relative bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask anything or @mention a space"
                            className="min-h-[140px] resize-none border-0 focus:ring-0 focus-visible:ring-0 text-base text-gray-700 placeholder:text-gray-400 bg-transparent p-6 pr-20"
                            style={{ boxShadow: 'none' }}
                            onKeyDown={(e) => {
                                // Prevent submitting while composing (IME)
                                // Submit when Enter is pressed (without Shift).
                                // Allow Shift+Enter to insert a newline.
                                // Also preserve Cmd/Ctrl+Enter as an alternative.
                                const isComposing = (e.nativeEvent as any).isComposing;
                                if (isComposing) return;

                                if (e.key === 'Enter') {
                                    const submitBecausePlainEnter = !e.shiftKey;
                                    const submitBecauseModKey = e.metaKey || e.ctrlKey;

                                    if (submitBecausePlainEnter || submitBecauseModKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }
                            }}
                        />

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            className="absolute bottom-4 right-4 h-12 w-12 rounded-full p-0 shadow-md hover:shadow-lg transition-all duration-200"
                            style={{ backgroundColor: '#6139B3' }}
                            disabled={!message.trim()}
                        >
                            <ArrowUp className="h-6 w-6 text-white" />
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className=" bg-[#F6F4F3] mx-4  rounded-b-md">
                        <div className='flex items-center gap-6 px-4'>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-3 text-gray-600 hover:text-gray-800 hover:bg-white/50 px-0 py-2 h-auto rounded-none bg-transparent"
                            >
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <Paperclip className="h-5 w-5" />
                                    <span className="text-base font-normal">Add file</span>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </Button>

                            <Button
                                variant="ghost"
                                className="flex items-center gap-3 text-gray-600 hover:text-gray-800 hover:bg-white/50 px-0 py-2 h-auto rounded-none bg-transparent"
                            >
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <Image className="h-5 w-5" />
                                    <span className="text-base font-normal">Add image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </Button>
                        </div>
                        <div className="m-2 ">
                            <div className="grid grid-cols-5 gap-2 pb-2">
                                {uploadedImages.map((image, index) => (
                                    <div
                                        key={`img-${index}`}
                                        className="relative aspect-square w-full rounded-md overflow-hidden border bg-gray-50"
                                    >
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={image.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white text-gray-500"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}

                                {uploadedFiles.map((file, index) => (
                                    <div
                                        key={`file-${index}`}
                                        className="relative aspect-square w-full rounded-md overflow-hidden border bg-white flex flex-col items-center justify-center p-2 text-center"
                                    >
                                        <div className="flex items-center justify-center mb-1">
                                            <Paperclip className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <span className="text-xs text-gray-700 truncate w-full">{file.name}</span>
                                        <button
                                            className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white text-gray-500"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Uploaded Files and Images Preview */}

                </div>
            </div>
        </div>
    );
}