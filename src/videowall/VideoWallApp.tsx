import React, { useState } from 'react';
import { VideoWallCanvas } from './components/VideoWallCanvas';
import { Controls } from './components/Controls';
import { Flushbox } from '../types';
import { DEFAULT_CONFIG } from './constants';
import { Monitor, ArrowLeft, LayoutTemplate, Hammer } from 'lucide-react';
import { ZoomControls } from '../components/shared/ZoomControls';
import { ExportMenu } from '../components/shared/ExportMenu';
import { WallConfiguration, ViewMode } from './types';

export default function VideoWallApp({ onSwitchMode }: { onSwitchMode?: () => void }) {
  const [config, setConfig] = useState<WallConfiguration>(DEFAULT_CONFIG);
  const [currentView, setCurrentView] = useState<ViewMode>('front');

  // New State for Feature Parity
  const [zoom, setZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [flushboxes, setFlushboxes] = useState<Flushbox[]>([]);
  const [showGuides, setShowGuides] = useState(false);
  const [dimensionOffsets, setDimensionOffsets] = useState({ center: -350, bottom: -600, top: -350 });
  const [railOffsets, setRailOffsets] = useState<Record<number, number>>({});

  // Room dimensions state
  const [roomDimensions, setRoomDimensions] = useState({ width: 4000, height: 3000 });

  // Handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetView = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePan = (dx: number, dy: number) => {
    setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleAddFlushbox = () => {
    const newBox: Flushbox = {
      id: Math.random().toString(36).substr(2, 9),
      x: 2000 + (flushboxes.length * 150),
      y: 1500,
      width: 97,
      height: 62,
      label: `FB${(flushboxes.length + 1).toString().padStart(2, '0')}`
    };
    setFlushboxes([...flushboxes, newBox]);
  };

  const handleFlushboxMove = (id: string, x: number, y: number) => {
    setFlushboxes(boxes => boxes.map(box =>
      box.id === id ? { ...box, x, y } : box
    ));
  };

  const handleDimensionMove = (type: 'center' | 'bottom' | 'top', offset: number) => {
    setDimensionOffsets(prev => ({
      ...prev,
      [type]: offset
    }));
  };

  const handleRailDimensionMove = (row: number, offset: number) => {
    setRailOffsets(prev => ({
      ...prev,
      [row]: offset
    }));
  };

  const handleExport = (mode: 'front' | 'backing') => {
    const svgId = mode === 'front' ? 'export-videowall-front' : 'export-videowall-backing';
    const svgElement = document.getElementById(svgId);

    if (!svgElement) {
      console.error("Could not find SVG element to export");
      return;
    }

    // Get the viewBox to determine the correct dimensions
    const viewBox = svgElement.getAttribute('viewBox');
    if (!viewBox) {
      console.error("SVG has no viewBox");
      return;
    }

    const [vbX, vbY, vbW, vbH] = viewBox.split(' ').map(Number);

    // Serialize the SVG
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    // Ensure XML namespace
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    // Create Blob
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Increase resolution for better quality
      const scale = 2;
      canvas.width = vbW * scale;
      canvas.height = vbH * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, vbW, vbH);

      const pngUrl = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `videowall-${mode}-${config.cols}x${config.rows}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Calculate Dimensions for Validation
  const totalWidth = (config.cols * config.display.width) + ((config.cols - 1) * config.gap);
  const totalHeight = (config.rows * config.display.height) + ((config.rows - 1) * config.gap);

  const warnings = {
    width: (totalWidth + 200) > roomDimensions.width, // 100mm buffer each side
    height: (totalHeight + 200) > roomDimensions.height // 100mm buffer top/bottom
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Hidden Render Instances for Export */}
      <div className="fixed -left-[9999px] invisible">
        <div style={{ width: roomDimensions.width, height: roomDimensions.height }}>
          <VideoWallCanvas
            id="export-videowall-front"
            config={config}
            zoom={1}
            panOffset={{ x: 0, y: 0 }}
            flushboxes={flushboxes}
            showGuides={showGuides}
            dimensionOffsets={dimensionOffsets}
            currentView="front"
            roomDimensions={roomDimensions}
            railOffsets={railOffsets}
            autoFit={true}
          />
        </div>
        <div style={{ width: roomDimensions.width, height: roomDimensions.height }}>
          <VideoWallCanvas
            id="export-videowall-backing"
            config={config}
            zoom={1}
            panOffset={{ x: 0, y: 0 }}
            flushboxes={flushboxes}
            showGuides={showGuides}
            dimensionOffsets={dimensionOffsets}
            currentView="backing"
            roomDimensions={roomDimensions}
            railOffsets={railOffsets}
            autoFit={true}
          />
        </div>
      </div>

      {/* Sidebar Controls */}
      <Controls
        config={config}
        onChange={setConfig}

        onAddFlushbox={handleAddFlushbox}
        showGuides={showGuides}
        onToggleGuides={() => setShowGuides(!showGuides)}
        roomDimensions={roomDimensions}
        onRoomDimensionsChange={setRoomDimensions}
        warnings={warnings}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-200">
              <Monitor className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Video Wall Architect</h1>
              <p className="text-xs text-slate-500 font-medium">Professional LED Wall Configurator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setCurrentView('front')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'front'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <LayoutTemplate className="w-4 h-4" />
                Front View
              </button>
              <button
                onClick={() => setCurrentView('backing')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'backing'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Hammer className="w-4 h-4" />
                Mounting View
              </button>
            </div>

            {onSwitchMode && (
              <button
                onClick={onSwitchMode}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium whitespace-nowrap"
              >
                Switch Mode
              </button>
            )}
            <div className="whitespace-nowrap">
              <ExportMenu onExport={handleExport} />
            </div>
          </div>

        </header>

        {/* Drawing Area */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <div className="relative w-full h-full max-w-[1600px] max-h-[900px] shadow-2xl shadow-slate-200/50 rounded-xl overflow-hidden bg-white ring-1 ring-slate-900/5">
            <VideoWallCanvas
              config={config}
              zoom={zoom}
              panOffset={panOffset}
              onPan={handlePan}
              flushboxes={flushboxes}
              onFlushboxMove={handleFlushboxMove}
              showGuides={showGuides}
              dimensionOffsets={dimensionOffsets}
              onDimensionMove={handleDimensionMove}
              currentView={currentView}
              roomDimensions={roomDimensions}
              railOffsets={railOffsets}
              onRailDimensionMove={handleRailDimensionMove}
            />

            <ZoomControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleResetView}
              zoomLevel={zoom}
            />
          </div>
        </div>
      </div >
    </div >
  );
};