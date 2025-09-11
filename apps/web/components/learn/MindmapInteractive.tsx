"use client"
import React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type NodeOrigin,
  ConnectionLineType,

  MiniMap,
  type Node,
  type Edge,
  Panel
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Download, Fullscreen } from "lucide-react";

// This component renders a mindmap using @xyflow/react.
// Expected prop format:
// mindmap = {
//   nodes: [
//     { id: string, label: string, position: { x: number, y: number } },
//     ...
//   ],
//   edges: [
//     { id: string, source: string, target: string },
//     ...
//   ]
// }

interface MindmapNode {
  id: string;
  label: string;
  position: { x: number; y: number };
}

interface MindmapEdge {
  id: string;
  source: string;
  target: string;
}

interface MindmapData {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}

interface MindmapInteractiveProps {
  mindmap: MindmapData;
}

const MindmapInteractive: React.FC<MindmapInteractiveProps> = ({ mindmap }) => {
  // Transform nodes to @xyflow/react format
  const nodes: Node[] = mindmap.nodes.map((node) => ({
    id: node.id,
    data: { label: node.label },
    position: node.position,
    type: "default",
    style: {
      background: "#ffffff", // Light background
      color: "#000000",       // Default black text for light mode
      dark: {
        background: "#1f2937", // Tailwind's gray-800 for dark mode
        color: "#ffffff",      // White text for visibility
      },
    },
  }));
  

  const proOptions = { hideAttribution: true };


  // Edges are already in the correct format for @xyflow/react
  const edges: Edge[] = mindmap.edges;

  const nodeOrigin: NodeOrigin = [0.5, 0.5];
  const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3 };
  const defaultEdgeOptions = { style: connectionLineStyle, type: 'mindmap' };

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Download SVG as image
  const handleDownload = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fullscreen toggle
  const handleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div className={`flex flex-col min-w-[400px] min-h-[400px] ${isFullscreen ? 'fixed inset-0 z-50 bg-black bg-opacity-90' : ''}`} ref={containerRef}>
      {/* Top-right controls */}
      {isFullscreen && (
        <button
          onClick={handleFullscreen}
          title="Close Fullscreen"
          className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow hover:bg-gray-200"
        >
          <span className="sr-only">Close Fullscreen</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L14 14M6 14L14 6" stroke="black" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
     
      {/* Mindmap Container */}
      <div style={{ width: isFullscreen ? '100vw' : 400, height: isFullscreen ? '100vh' : 400 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeOrigin={nodeOrigin}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineStyle={connectionLineStyle}
          connectionLineType={ConnectionLineType.Straight}
          proOptions={proOptions}
          fitView
        >
          <Controls showInteractive={false} />
          <Panel position="top-left" className="flex justify-between items-center">Mind Map 

          <div className="">
        <button onClick={handleFullscreen} title="Fullscreen" className="p-2 rounded ">
          <Fullscreen size={20} />
        </button>
      </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default MindmapInteractive;