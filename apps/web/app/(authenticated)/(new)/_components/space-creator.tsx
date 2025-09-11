"use client"
import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Plus, Trash2, User } from 'lucide-react';

interface FileItem {
    id: number;
    name: string;
    type: string;
}

export default function NewSpace(): JSX.Element {
    const [spaceName, setSpaceName] = useState<string>('New Space');
    const [description, setDescription] = useState<string>('');
    const [instructions, setInstructions] = useState<string>('');
    const [links, setLinks] = useState<string[]>([]);
    const [newLink, setNewLink] = useState<string>('');
    const [files, setFiles] = useState<FileItem[]>([
    ]);

    const removeFile = (id: number): void => {
        setFiles(files.filter(file => file.id !== id));
    };

    const addLink = (): void => {
        if (newLink.trim() && !links.includes(newLink.trim())) {
            setLinks([...links, newLink.trim()]);
            setNewLink('');
        }
    };

    const removeLink = (linkToRemove: string): void => {
        setLinks(links.filter(link => link !== linkToRemove));
    };

    const handleLinkKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLink();
        }
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const newFiles: FileItem[] = Array.from(selectedFiles).map(file => ({
                id: Date.now() + Math.random(), // Ensure unique IDs for multiple files
                name: file.name,
                type: 'document'
            }));
            setFiles([...files, ...newFiles]);
        }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
        const target = e.target as HTMLImageElement;
        const nextSibling = target.nextSibling as HTMLElement;
        target.style.display = 'none';
        if (nextSibling) {
            nextSibling.style.display = 'flex';
        }
    };

    return (
        <div className='flex flex-col justify-center items-center min-h-screen'>
            <div className="w-full max-w-3xl p-6 bg-white">

                {/* Header - No Box */}
                <div className="mb-8">
                    <input
                        type="text"
                        value={spaceName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSpaceName(e.target.value)}
                        className="text-3xl font-light text-gray-400 mb-2 w-full border-none outline-none bg-transparent"
                        placeholder="New Space"
                    />
                    <textarea
                        value={description}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                        className="text-gray-400 w-full border-none outline-none bg-transparent resize-none text-sm"
                        placeholder="Description of what this space about"
                        rows={1}
                    />
                </div>

                {/* Instructions Section - Input Box */}
                <div className="mb-8">
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-base font-medium text-gray-900 mb-2">Instructions</h3>
                        <textarea
                            value={instructions}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                            className="w-full text-sm text-gray-500 bg-transparent border-none outline-none resize-none"
                            placeholder="Add instructions to format, scope, and add relevance to your search results."
                            rows={2}
                        />
                    </div>
                </div>

                {/* Files Section - Input Box */}
                <div className="mb-8">
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-base font-medium text-gray-900 mb-2">Files</h3>
                        <div className="text-gray-500 text-sm mb-4">
                            Upload or sync files to be used as sources in every search.
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Add File Button */}
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileUpload}
                                multiple
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-dashed cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: '#6139B3', borderColor: '#6139B3' }}
                            >
                                <Plus className="w-5 h-5 text-white" />
                            </label>

                            {/* File Items */}
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg"
                                >
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        type="button"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Links Section - Input Box */}
                <div className="mb-8">
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-base font-medium text-gray-900 mb-2">Links</h3>
                        <div className="text-gray-500 text-sm mb-4">
                            Add URLs to be used as sources in every search.
                        </div>

                        <div className="space-y-3">
                            {/* Input for new link */}
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={newLink}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewLink(e.target.value)}
                                    onKeyPress={handleLinkKeyPress}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://example.com"
                                />
                                <button
                                    onClick={addLink}
                                    disabled={!newLink.trim()}
                                    className="px-4 py-2 text-white text-sm rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#6139B3' }}
                                    type="button"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Display added links */}
                            {links.length > 0 && (
                                <div className="space-y-2">
                                    {links.map((link, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg"
                                        >
                                            <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-800 truncate flex-1 mr-2"
                                            >
                                                {link}
                                            </a>
                                            <button
                                                onClick={() => removeLink(link)}
                                                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                                type="button"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Access Section - Input Box */}
                <div className="mb-8">
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-base font-medium text-gray-900 mb-2">Access</h3>
                        <div className="flex items-center gap-2">
                            {/* User Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                <img
                                    src="/api/placeholder/40/40"
                                    alt="User avatar"
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                />
                                <User className="w-5 h-5 text-gray-500" style={{ display: 'none' }} />
                            </div>

                            {/* Add User Button */}
                            <button
                                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                                type="button"
                            >
                                <Plus className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create Button */}
                <div className="flex justify-start">
                    <button
                        className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#6139B3' }}
                        type="button"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>

    );
}