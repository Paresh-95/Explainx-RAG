"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import 'react-pdf/dist/Page/TextLayer.css'; 
import 'react-pdf/dist/Page/AnnotationLayer.css'; // Add this for proper layering
import { 
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    FileText,
    Sparkles,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;
}

interface FilePreviewProps {
    fileUrl: string;
    className?: string;
    onTextSelect?: (text: string, action: 'explain' | 'summarize' | 'chat') => void;
    highlightText?: string;
}

export function FilePreview({ fileUrl, className, onTextSelect, highlightText }: FilePreviewProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(0.8);
    const [rotation, setRotation] = useState<number>(0);
    const [officeScale, setOfficeScale] = useState<number>(100);
    const [officeRotation, setOfficeRotation] = useState<number>(0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [selectedText, setSelectedText] = useState<string>('');
    const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number } | null>(null);
    const [highlightedText, setHighlightedText] = useState<string>('');
    const [highlightedElements, setHighlightedElements] = useState<Element[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

    const fileExtension = fileUrl.split(".").pop()?.toLowerCase();
    const isOfficeDocument = ["doc", "docx"].includes(fileExtension || "");
    const isPdf = fileExtension === "pdf";

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth - 32);
            }
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);

        let resizeObserver: ResizeObserver;
        if (containerRef.current && window.ResizeObserver) {
            resizeObserver = new ResizeObserver(updateWidth);
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener("resize", updateWidth);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, []);

    // Enhanced highlighting effect
    useEffect(() => {
        // Clear previous highlights
        console.log("File Preview",highlightedText);
        highlightedElements.forEach(element => {
            element.classList.remove('highlighted-text');
        });
        setHighlightedElements([]);

        if (highlightText && highlightText.trim()) {
            setHighlightedText(highlightText);
            
            // Wait for PDF to render, then search for and highlight text
            const timer = setTimeout(() => {
                const textElements = document.querySelectorAll('.textLayer span');
                const newHighlightedElements: Element[] = [];
                const searchText = highlightText.trim().toLowerCase();
                
                // Function to normalize text for comparison
                const normalizeText = (text: string) => {
                    return text.toLowerCase()
                        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
                        .trim();
                };

                // First pass: find exact matches
                textElements.forEach(element => {
                    const elementText = normalizeText(element.textContent || '');
                    const searchTextNormalized = normalizeText(searchText);
                    
                    if (elementText === searchTextNormalized) {
                        element.classList.add('highlighted-text');
                        element.setAttribute('data-text', element.textContent || '');
                        newHighlightedElements.push(element);
                    }
                });

                // If no exact matches found, try partial matching
                if (newHighlightedElements.length === 0) {
                    const searchWords = searchText.split(/\s+/).filter(word => word.length > 2);
                    
                    textElements.forEach(element => {
                        const elementText = normalizeText(element.textContent || '');
                        const hasMatch = searchWords.some(word => 
                            elementText.includes(normalizeText(word))
                        );
                        
                        if (hasMatch) {
                            element.classList.add('highlighted-text');
                            element.setAttribute('data-text', element.textContent || '');
                            newHighlightedElements.push(element);
                        }
                    });
                }

                setHighlightedElements(newHighlightedElements);

                // Scroll to first highlighted element
                if (newHighlightedElements.length > 0 && newHighlightedElements[0]) {
                    newHighlightedElements[0].scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [highlightText, numPages, scale]);

    // Add CSS for highlighting and proper layering
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            /* Fix for proper text layer positioning within each page */
            .react-pdf__Page {
                position: relative !important;
                display: inline-block !important;
                margin-bottom: 16px !important;
            }
            
            .react-pdf__Page__canvas {
                display: block !important;
                position: relative !important;
            }
            
            .react-pdf__Page__textContent {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                z-index: 2 !important;
                pointer-events: auto !important;
            }
            
            .textLayer {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                z-index: 2 !important;
                pointer-events: auto !important;
            }
            
            .textLayer span {
                color: transparent !important;
                position: absolute !important;
                white-space: pre !important;
                cursor: text !important;
                transform-origin: 0% 0% !important;
                pointer-events: auto !important;
            }
            
            .highlighted-text {
                background-color: #ffeb3b !important;
                color: transparent !important;
                border-radius: 2px !important;
                padding: 1px 2px !important;
                box-shadow: 0 0 0 1px rgba(255, 235, 59, 0.5) !important;
                animation: highlight-pulse 2s ease-in-out !important;
                z-index: 3 !important;
                position: relative !important;
            }
            
            .highlighted-text::before {
                content: attr(data-text);
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                color: rgba(0, 0, 0, 0.8) !important;
                padding: 1px 2px;
            }
            
            @keyframes highlight-pulse {
                0% { background-color: #ffeb3b; }
                50% { background-color: #ff9800; }
                100% { background-color: #ffeb3b; }
            }

            /* Ensure annotation layer is properly positioned within each page */
            .react-pdf__Page__annotations {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                z-index: 3 !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const handleZoomIn = () => {
        if (isOfficeDocument) {
            setOfficeScale((prev) => Math.min(prev + 25, 100));
        } else {
            setScale((prev) => Math.min(prev + 0.2, 1.0));
        }
    };

    const handleZoomOut = () => {
        if (isOfficeDocument) {
            setOfficeScale((prev) => Math.max(prev - 25, 25));
        } else {
            setScale((prev) => Math.max(prev - 0.2, 0.5));
        }
    };

    const handleRotate = () => {
        if (isOfficeDocument) {
            setOfficeRotation((prev) => (prev + 90) % 360);
        } else {
            setRotation((prev) => (prev + 90) % 360);
        }
    };

    const scrollToPage = (page: number) => {
        const el = pageRefs.current[page - 1];
        if (el && containerRef.current) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPage = parseInt(e.target.value);
        if (newPage >= 1 && newPage <= numPages) {
            setPageNumber(newPage);
            scrollToPage(newPage);
        }
    };

    const handlePrevPage = () => {
        setPageNumber((prev) => {
            const newPage = Math.max(prev - 1, 1);
            scrollToPage(newPage);
            return newPage;
        });
    };

    const handleNextPage = () => {
        setPageNumber((prev) => {
            const newPage = Math.min(prev + 1, numPages);
            scrollToPage(newPage);
            return newPage;
        });
    };

    const handleDownload = () => {
        window.open(fileUrl, "_blank");
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            setSelectionPopup(null);
            return;
        }

        const text = selection.toString().trim();
        if (!text) {
            setSelectionPopup(null);
            return;
        }

        setSelectedText(text);

        // Get selection coordinates
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        if (containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const scrollTop = containerRef.current.scrollTop;
            
            // Calculate position relative to the container and scroll position
            setSelectionPopup({
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + scrollTop - 40 // 40px above the selection
            });
        }
    };

    const handleAction = (action: 'explain' | 'summarize' | 'chat') => {
        if (selectedText && onTextSelect) {
            onTextSelect(selectedText, action);
            setSelectionPopup(null);
            setSelectedText('');
        }
    };

    const renderSelectionPopup = () => {
        if (!selectionPopup) return null;

        return (
            <div 
                className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1"
                style={{
                    left: `${selectionPopup.x}px`,
                    top: `${selectionPopup.y}px`,
                    transform: 'translateX(-50%)'
                }}
            >
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleAction('explain')}
                    >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Explain
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleAction('summarize')}
                    >
                        <FileText className="h-3 w-3 mr-1" />
                        Summarize
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleAction('chat')}
                    >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chat
                    </Button>
                </div>
            </div>
        );
    };

    const renderOfficeDocument = () => {
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}&wdStartOn=1&wdScale=${officeScale}&wdRotation=${officeRotation}`;
        return (
            <div className="relative w-full h-full">
                <iframe src={officeViewerUrl} className="w-full h-full border-0" allowFullScreen />
            </div>
        );
    };

    const renderPdfDocument = () => (
        <div 
            className="w-full h-full overflow-auto px-4 relative" 
            ref={containerRef}
            onMouseUp={handleTextSelection}
        >
            {renderSelectionPopup()}
            <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            Loading document...
                        </div>
                    </div>
                }
                error={
                    <div className="flex items-center justify-center h-full text-destructive">
                        <div className="text-center">
                            <div className="text-xl mb-2">⚠️</div>
                            Failed to load document. Please try again.
                        </div>
                    </div>
                }
            >
                {Array.from({ length: numPages }, (_, index) => (
                    <div
                        key={`page_${index + 1}`}
                        ref={(el) => {
                            pageRefs.current[index] = el;
                        }}
                        className="mb-4 flex justify-center"
                    >
                        <Page
                            pageNumber={index + 1}
                            scale={scale}
                            rotate={rotation}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            width={containerWidth > 0 ? Math.min(containerWidth, 800) : undefined}
                            className="shadow-lg"
                        />
                    </div>
                ))}
            </Document>
        </div>
    );

    return (
        <div className={cn("flex flex-col h-full", className)}>
            <div className="flex-shrink-0 p-4 border-b ">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleZoomOut}
                            disabled={isOfficeDocument ? officeScale <= 25 : scale <= 0.5}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleZoomIn}
                            disabled={isOfficeDocument ? officeScale >= 100 : scale >= 1.0}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleRotate}>
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground ml-2">
                            Zoom: {isOfficeDocument ? `${officeScale}%` : `${Math.round(scale * 100)}%`}
                        </span>
                    </div>
                    {!isOfficeDocument && numPages > 0 && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={pageNumber <= 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                value={pageNumber}
                                onChange={handlePageChange}
                                className="w-16 text-center h-8"
                                min={1}
                                max={numPages}
                            />
                            <span className="text-sm text-muted-foreground">/ {numPages}</span>
                            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={pageNumber >= numPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900">
                <div className="h-full p-4">
                    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
                        <div className="h-full overflow-y-auto">
                            {isOfficeDocument ? renderOfficeDocument() : renderPdfDocument()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}