// app/store/page.tsx
"use client"
import React, { useState, useRef } from 'react'
import Sidebar from '../_components/sidebar'
import { Button } from '@repo/ui/components/ui/button';
import { Upload, File, Image as ImageIcon, X, Eye, Trash2 } from 'lucide-react';

interface UploadedFile {
    id: string;
    file: File;
    preview?: string;
    type: 'image' | 'document';
    uploadedAt: Date;
}

function StorePage() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList) => {
        Array.from(files).forEach(file => {
            const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const isImage = file.type.startsWith('image/');

            const uploadedFile: UploadedFile = {
                id: fileId,
                file,
                type: isImage ? 'image' : 'document',
                uploadedAt: new Date()
            };

            if (isImage) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedFile.preview = e.target?.result as string;
                    setUploadedFiles(prev => [...prev, uploadedFile]);
                };
                reader.readAsDataURL(file);
            } else {
                setUploadedFiles(prev => [...prev, uploadedFile]);
            }
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const deleteFile = (fileId: string) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        if (selectedFile && selectedFile.id === fileId) {
            setSelectedFile(null);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const FilePreview = ({ file }: { file: UploadedFile }) => {
        if (file.type === 'image' && file.preview) {
            return (
                <div className="relative group">
                    <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setSelectedFile(file)}
                                className="bg-white/90 hover:bg-white"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteFile(file.id)}
                                className="bg-red-500/90 hover:bg-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative group bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 h-48 flex flex-col items-center justify-center">
                <File className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-600 text-center truncate w-full px-2">
                    {file.file.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {formatFileSize(file.file.size)}
                </p>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteFile(file.id)}
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className='flex h-screen overflow-hidden'>
            <Sidebar />
            <div className='flex-1 flex flex-col'>
                {/* Full Width Container for Store */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="max-w-3xl mx-auto p-6 h-full flex flex-col">
                        {/* Header */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900">Store</h1>
                                    <p className="text-gray-600 mt-1">A personal store where you can upload and manage your own files</p>
                                </div>
                                <Button
                                    onClick={openFileDialog}
                                    className="bg-[#6139B3] hover:bg-[#5128A3] text-white"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                </Button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            {uploadedFiles.length === 0 ? (
                                /* Empty State */
                                <div
                                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
                                        ? 'border-[#6139B3] bg-purple-50'
                                        : 'border-gray-300 bg-white hover:border-gray-400'
                                        }`}
                                    onDrop={handleDrop}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="flex gap-2 mb-4">
                                            <ImageIcon className="h-12 w-12 text-gray-400" />
                                            <File className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {dragActive ? 'Drop files here' : 'Upload your files'}
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Drag and drop files here, or click to select files
                                        </p>
                                        <Button
                                            onClick={openFileDialog}
                                            className="bg-[#6139B3] hover:bg-[#5128A3]"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Choose Files
                                        </Button>
                                        <p className="text-sm text-gray-500 mt-4">
                                            Supports images, documents, and more
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Files Grid */
                                <div
                                    className={`transition-colors rounded-lg p-4 ${dragActive ? 'bg-purple-50 border-2 border-dashed border-[#6139B3]' : ''
                                        }`}
                                    onDrop={handleDrop}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                        {uploadedFiles.map((file) => (
                                            <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                                <FilePreview file={file} />
                                                <div className="p-4">
                                                    <h3 className="text-sm font-medium text-gray-900 truncate" title={file.file.name}>
                                                        {file.file.name}
                                                    </h3>
                                                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                                        <span>{formatFileSize(file.file.size)}</span>
                                                        <span>{file.uploadedAt.toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {dragActive && (
                                        <div className="text-center py-8">
                                            <p className="text-[#6139B3] font-medium">Drop files to upload</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
                            onChange={handleFileInput}
                            className="hidden"
                        />

                        {/* Image Preview Modal */}
                        {selectedFile && selectedFile.type === 'image' && selectedFile.preview && (
                            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                                <div className="relative max-w-4xl max-h-full">
                                    <Button
                                        onClick={() => setSelectedFile(null)}
                                        className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 text-white"
                                        size="sm"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <img
                                        src={selectedFile.preview}
                                        alt={selectedFile.file.name}
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 rounded-b-lg">
                                        <p className="font-medium">{selectedFile.file.name}</p>
                                        <p className="text-sm opacity-75">{formatFileSize(selectedFile.file.size)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StorePage;