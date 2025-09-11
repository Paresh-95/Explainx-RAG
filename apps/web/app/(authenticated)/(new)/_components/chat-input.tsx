import React, { useState } from 'react';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { ArrowUp, Image, Paperclip, Square, X } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { toast } from "sonner";

interface ChatInputProps {
    message: string;
    setMessage: (value: string) => void;
    isStreaming: boolean;
    handleSubmit: (initialText?: string) => void;
    stopStreaming: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
    message,
    setMessage,
    isStreaming,
    handleSubmit,
    stopStreaming
}) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);

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

    const handleButtonClick = () => {
        if (isStreaming) {
            stopStreaming();
        } else {
            handleSubmit();
        }
    };

    return (
        <div className="absolute bottom-0 left-0 right-0  z-50 mt-10">
            <div className="flex justify-center w-full">
                <div className="w-full max-w-3xl px-4 py-4">
                    <div className="relative">
                        <div className="relative bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ask anything or @mention a space"
                                className="min-h-[140px] resize-none border-0 focus:ring-0 focus-visible:ring-0 text-base text-gray-700 placeholder:text-gray-400 bg-transparent p-6 pr-20"
                                style={{ boxShadow: 'none' }}
                                disabled={isStreaming}
                                onKeyDown={(e) => {
                                    const isComposing = (e.nativeEvent as any).isComposing;
                                    if (isComposing) return;

                                    if (e.key === 'Enter') {
                                        const submitBecausePlainEnter = !e.shiftKey;
                                        const submitBecauseModKey = e.metaKey || e.ctrlKey;

                                        if (submitBecausePlainEnter || submitBecauseModKey) {
                                            e.preventDefault();
                                            if (!isStreaming) {
                                                handleSubmit();
                                            }
                                        }
                                    }
                                }}
                            />

                            <Button
                                onClick={handleButtonClick}
                                className={`absolute bottom-4 right-4 h-12 w-12 rounded-full p-0 shadow-md hover:shadow-lg transition-all duration-200 ${isStreaming
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'hover:opacity-90'
                                    }`}
                                style={!isStreaming ? { backgroundColor: '#6139B3' } : undefined}
                                disabled={!isStreaming && !message.trim()}
                            >
                                {isStreaming ? (
                                    <Square className="h-6 w-6 text-white" />
                                ) : (
                                    <ArrowUp className="h-6 w-6 text-white" />
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 px-4 bg-[#F6F4F3] mx-4 rounded-b-md">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-3 text-gray-600 hover:text-gray-800 hover:bg-white/50 px-0 py-2 h-auto rounded-none bg-transparent"
                                disabled={isStreaming}
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
                                disabled={isStreaming}
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

                        <div className="m-2">
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
                </div>
            </div>
        </div>
    );
};

export default ChatInput;