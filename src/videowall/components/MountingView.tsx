import React from 'react';
import { WallConfiguration, MountingReference, MountingSystemType } from '../types';
import { Hammer } from 'lucide-react';

interface MountingViewProps {
  config: WallConfiguration;
}

export const MountingView: React.FC<MountingViewProps> = ({ config }) => {
  const { display, rows, cols, gap, mountingReference, mountingValue, mountingSystem } = config;

  // --- Calculations ---

  // Handle NaN during typing
  const safeRows = isNaN(rows) ? 0 : rows;
  const safeCols = isNaN(cols) ? 0 : cols;
  const safeGap = isNaN(gap) ? 0 : gap;
  const safeDisplayWidth = isNaN(display.width) ? 0 : display.width;
  const safeDisplayHeight = isNaN(display.height) ? 0 : display.height;
  const safeMountingValue = isNaN(mountingValue) ? 0 : mountingValue;

  // 1. Structural Heights
  const totalWidth = (safeCols * safeDisplayWidth) + ((safeCols - 1) * safeGap);
  const totalHeight = (safeRows * safeDisplayHeight) + ((safeRows - 1) * safeGap);
  
  // Calculate Bottom Edge of video wall from floor
  let distToBottom = 0;
  switch (mountingReference) {
    case MountingReference.FLOOR_TO_BOTTOM:
      distToBottom = safeMountingValue;
      break;
    case MountingReference.FLOOR_TO_CENTER:
      distToBottom = safeMountingValue - (totalHeight / 2);
      break;
    case MountingReference.FLOOR_TO_TOP:
      distToBottom = safeMountingValue - totalHeight;
      break;
  }
  distToBottom = Math.max(0, distToBottom);

  // VESA Offsets
  // Assuming VESA is centered on the back of the display.
  // We will position the single rail at the TOP VESA hole location to carry the weight.
  const displayCenterY = safeDisplayHeight / 2;
  const vesaTopY = displayCenterY + (display.vesaHeight / 2); // Distance from bottom edge to top holes

  // --- SVG Drawing Logic for Rails ---
  
  // Define layout
  const paddingX = Math.max(totalWidth * 0.2, 500);
  const paddingTop = 400;
  const paddingBottom = 200;
  const vbWidth = totalWidth + (paddingX * 2);
  const vbHeight = totalHeight + distToBottom + paddingTop + paddingBottom;
  
  const wallOriginX = paddingX;
  const floorY = vbHeight - paddingBottom;
  const wallBottomY = floorY - distToBottom;
  const wallTopY = wallBottomY - totalHeight;

  // Calculate Rail Y positions (Single Rail per Row)
  const railPositions = [];
  
  for (let r = 0; r < safeRows; r++) {
    // Distance from Wall Top to this row's top edge
    const rowTopFromWallTop = r * (safeDisplayHeight + safeGap);
    
    // Absolute Y of this row's top edge
    const rowTopAbsY = wallTopY + rowTopFromWallTop;
    const rowBottomAbsY = rowTopAbsY + safeDisplayHeight;
    
    // Rail Position: Aligned with VESA Top holes
    const railY = rowBottomAbsY - vesaTopY;
    const railAFFL = floorY - railY;

    railPositions.push({
      row: r + 1,
      railY: railY,
      railAFFL: railAFFL,
    });
  }

  const fontSize = Math.max(totalWidth / 60, 24);
  const dimX = 150; // Fixed x position for dimensions column

  return (
    <div className="w-full h-full bg-slate-100 p-4 overflow-hidden">
      
      {/* Structural Drawing - Full Width */}
      <div className="w-full h-full bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Hammer className="w-5 h-5 text-slate-500" />
                Structural Elevation & Rail Layout
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold font-mono border border-indigo-100">
                {mountingSystem === MountingSystemType.VOGELS_L_SERIES ? "VOGEL'S SINGLE RAIL CONFIG" : "GENERIC RAIL LAYOUT"}
            </span>
        </div>
        
        <div className="flex-1 overflow-auto relative bg-white">
           <svg 
            viewBox={`0 0 ${vbWidth > 0 ? vbWidth : 100} ${vbHeight > 0 ? vbHeight : 100}`} 
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
             {/* Grid */}
            <pattern id="gridSub" width={fontSize * 2} height={fontSize * 2} patternUnits="userSpaceOnUse">
               <path d={`M ${fontSize*2} 0 L 0 0 0 ${fontSize*2}`} fill="none" stroke="#f8fafc" strokeWidth="2"/>
               <path d={`M ${fontSize*2} 0 L 0 0 0 ${fontSize*2}`} fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#gridSub)" />

            {/* Floor */}
            <line x1="0" y1={floorY} x2={vbWidth} y2={floorY} stroke="#0f172a" strokeWidth="4" />
            <text x={vbWidth - 50} y={floorY - 20} textAnchor="end" fontSize={fontSize} fontWeight="bold" fill="#0f172a">FFL</text>

            {/* Ghosted Screens with Dashed Outlines */}
            {Array.from({ length: safeRows }).map((_, r) => (
                Array.from({ length: safeCols }).map((_, c) => (
                    <rect 
                        key={`ghost-${r}-${c}`}
                        x={wallOriginX + c * (safeDisplayWidth + safeGap)}
                        y={wallTopY + r * (safeDisplayHeight + safeGap)}
                        width={safeDisplayWidth}
                        height={safeDisplayHeight}
                        fill="#eff6ff" // Blue-50
                        fillOpacity="0.8"
                        stroke="#3b82f6" // Blue-500
                        strokeWidth="2"
                        strokeDasharray="8 6" // Technical dashed look
                    />
                ))
            ))}

            {/* Top Dimension (Total Width) */}
            <g>
                <line 
                    x1={wallOriginX} 
                    y1={wallTopY - 100} 
                    x2={wallOriginX + totalWidth} 
                    y2={wallTopY - 100} 
                    stroke="#64748b" 
                    strokeWidth="1.5" 
                />
                <line x1={wallOriginX} y1={wallTopY - 90} x2={wallOriginX} y2={wallTopY - 110} stroke="#64748b" strokeWidth="1.5" />
                <line x1={wallOriginX + totalWidth} y1={wallTopY - 90} x2={wallOriginX + totalWidth} y2={wallTopY - 110} stroke="#64748b" strokeWidth="1.5" />
                <text 
                    x={wallOriginX + totalWidth / 2} 
                    y={wallTopY - 120} 
                    textAnchor="middle" 
                    fontSize={fontSize * 0.9} 
                    fill="#64748b" 
                    fontWeight="500"
                >
                    {Math.round(totalWidth)}mm
                </text>
            </g>

            {/* Rails */}
            {railPositions.map((pos, idx) => {
                const railHeight = 60; 
                const railYTop = pos.railY - (railHeight/2);
                
                return (
                    <g key={`row-${idx}`}>
                        {/* Brackets behind the rail */}
                        {totalWidth > 0 && Array.from({ length: Math.ceil(totalWidth / 400) }).map((_, i) => {
                             const bx = wallOriginX + (i * 400) + 50;
                             const by = pos.railY - (railHeight/2) - 15;
                             return (
                                <g key={`bracket-${idx}-${i}`}>
                                    <rect x={bx - 10} y={by} width={20} height={railHeight + 30} rx="2" fill="#475569" />
                                    <circle cx={bx} cy={by + 8} r="3" fill="#cbd5e1" />
                                    <circle cx={bx} cy={by + railHeight + 22} r="3" fill="#cbd5e1" />
                                </g>
                             );
                        })}

                        {/* Main Rail Body */}
                        <rect 
                            x={wallOriginX} 
                            y={railYTop} 
                            width={totalWidth} 
                            height={railHeight} 
                            fill="#1e293b" // Slate 800
                            rx="1"
                        />
                        
                        {/* Rail Highlight */}
                        <rect 
                            x={wallOriginX} 
                            y={railYTop + 5} 
                            width={totalWidth} 
                            height={railHeight/3} 
                            fill="white"
                            fillOpacity="0.1" 
                        />
                        
                        {/* Bottom Shadow line */}
                        <line 
                            x1={wallOriginX} 
                            y1={railYTop + railHeight} 
                            x2={wallOriginX + totalWidth} 
                            y2={railYTop + railHeight} 
                            stroke="black" 
                            strokeOpacity="0.3" 
                            strokeWidth="2" 
                        />

                        {/* --- Clean Elevation Markers (Left Side) --- */}
                        
                        {/* Extension line from rail to dim column */}
                        <line 
                            x1={dimX} 
                            y1={pos.railY} 
                            x2={wallOriginX} 
                            y2={pos.railY} 
                            stroke="#94a3b8" 
                            strokeDasharray="4 4" 
                            strokeWidth="1"
                            opacity="0.6"
                        />
                        
                        {/* Vertical Dimension Line from Floor up to Rail */}
                        <line 
                            x1={dimX} 
                            y1={floorY} 
                            x2={dimX} 
                            y2={pos.railY} 
                            stroke="#3b82f6" 
                            strokeWidth="1.5"
                        />
                        {/* Arrow at Rail */}
                        <path 
                            d={`M${dimX} ${pos.railY} L${dimX - 8} ${pos.railY + 12} L${dimX + 8} ${pos.railY + 12} Z`} 
                            fill="#3b82f6" 
                        />
                        
                        {/* Text Label */}
                        <text 
                            x={dimX - 15} 
                            y={pos.railY} 
                            fontSize={fontSize} 
                            fill="#0f172a" 
                            fontWeight="bold"
                            textAnchor="end"
                            dominantBaseline="middle"
                        >
                            AFFL {Math.round(pos.railAFFL)}
                        </text>

                    </g>
                );
            })}

            {/* Center Line visual */}
            <line 
                x1={wallOriginX + totalWidth/2} 
                y1={wallTopY} 
                x2={wallOriginX + totalWidth/2} 
                y2={floorY} 
                stroke="#ef4444" 
                strokeDasharray="10 5" 
                opacity="0.4"
                strokeWidth="2"
            />
            
            {/* Dimensions Legend */}
             <g transform={`translate(${wallOriginX + totalWidth + 100}, ${wallTopY})`}>
                <text x="0" y="0" fontSize={fontSize*0.8} fill="#64748b" fontWeight="bold">
                   MOUNTING DETAILS
                </text>
                <text x="0" y={fontSize * 1.5} fontSize={fontSize*0.8} fill="#64748b">
                   Configuration: {safeCols}x{safeRows}
                </text>
                <text x="0" y={fontSize * 3} fontSize={fontSize*0.8} fill="#64748b">
                    Rail Length: {Math.round(totalWidth)}mm
                </text>
                <text x="0" y={fontSize * 4.5} fontSize={fontSize*0.8} fill="#64748b">
                    VESA Pattern: {display.vesaWidth}x{display.vesaHeight}mm
                </text>
                <text x="0" y={fontSize * 6} fontSize={fontSize*0.8} fill="#64748b">
                    Est. Total Weight: {Math.round(safeRows * safeCols * display.weight)}kg
                </text>
             </g>

          </svg>
        </div>
      </div>
    </div>
  );
};