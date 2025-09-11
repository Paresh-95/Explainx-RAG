import React from 'react';

interface TimelineItem {
  year: string;
  event: string;
  note?: string;
}

interface TimelineInteractiveProps {
  timeline: TimelineItem[];
}

const TimelineInteractive = ({ timeline }: TimelineInteractiveProps) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Early return if no timeline data
  if (!timeline || timeline.length === 0) {
    return <div className="p-4">No timeline data available.</div>;
  }

  // Filter out any objects that don't have year and event properties (like type indicators)
  const timelineItems = timeline.filter(item => item.year && item.event);

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
    a.download = 'timeline.svg';
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
    <div
      className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-black bg-opacity-90' : ''}`}
      ref={containerRef}
      style={{ minWidth: isFullscreen ? '100vw' : 400, minHeight: isFullscreen ? '100vh' : 400 }}
    >
      {/* Top-right controls */}
      
      {/* Timeline Container */}
      <div className={` `}>
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical timeline line */}
          <svg width="4" height="100%" style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, zIndex: 0 }}>
            <rect x="0" y="0" width="4" height="100%" fill="#4B5563" />
          </svg>
          {timelineItems.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <div key={idx} className="relative mb-16 last:mb-0">
                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-500 rounded-full border-4 border-gray-900 z-10"></div>
                {/* Timeline card */}
                <div className={`relative ${isLeft ? 'mr-auto pr-12' : 'ml-auto pl-12'} w-1/2`}>
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
                    {/* Year */}
                    <div className="text-gray-400 text-sm font-mono mb-2">
                      {item.year}
                    </div>
                    {/* Event title */}
                    <h3 className="text-white text-xl font-bold mb-3 leading-tight">
                      {item.event}
                    </h3>
                    {/* Note/description */}
                    {item.note && item.note !== '' && (
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {item.note}
                      </p>
                    )}
                  </div>
                  {/* Connecting line from card to timeline */}
                  <div className={`absolute top-8 ${isLeft ? 'right-6' : 'left-6'} w-6 h-0.5 bg-gray-600`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineInteractive;