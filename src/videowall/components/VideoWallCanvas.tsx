import React, { useRef, useState } from 'react';
import { WallConfiguration, MountingReference, MountingSystemType } from '../types';
import { Flushbox } from '../../types';
import { DimensionLine } from '../../components/shared/DimensionLine';
import { FlushboxObject } from '../../components/shared/FlushboxObject';
import { Guides } from '../../components/shared/Guides';
import { SVG_COLORS as COLORS, SVG_FONTS as FONTS } from '../../constants/svgStyles';

interface VideoWallCanvasProps {
  config: WallConfiguration;
  zoom?: number;
  panOffset?: { x: number; y: number };
  onPan?: (dx: number, dy: number) => void;
  flushboxes?: Flushbox[];
  onFlushboxMove?: (id: string, x: number, y: number) => void;
  showGuides?: boolean;
  dimensionOffsets?: { center: number; bottom: number; top: number };
  onDimensionMove?: (type: 'center' | 'bottom' | 'top', offset: number) => void;
  currentView: 'front' | 'backing';
  roomDimensions?: { width: number; height: number };
  railOffsets?: Record<number, number>;
  onRailDimensionMove?: (row: number, offset: number) => void;
  id?: string;
  autoFit?: boolean;
}

export const VideoWallCanvas: React.FC<VideoWallCanvasProps> = ({
  config,
  zoom = 1,
  panOffset = { x: 0, y: 0 },
  onPan,
  flushboxes = [],
  onFlushboxMove,
  showGuides = false,
  dimensionOffsets = { center: -350, bottom: -600, top: -350 },
  onDimensionMove,
  currentView,
  roomDimensions = { width: 4000, height: 3000 },
  railOffsets = {},
  onRailDimensionMove,
  id,
  autoFit = false
}) => {
  const { display, rows, cols, gap, mountingReference, mountingValue } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [draggingDimension, setDraggingDimension] = useState<'center' | 'bottom' | 'top' | null>(null);
  const [draggingRailRow, setDraggingRailRow] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; originalOffset: number } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Handlers for Pan
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Only pan if middle mouse button or spacebar held (simulated here by checking target)
    // For now, let's allow panning on background drag if not dragging something else
    if ((e.target as Element).tagName === 'svg' || (e.target as Element).tagName === 'rect') {
      setIsPanning(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setLastPanPoint({ x: clientX, y: clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning && onPan) {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      const dx = clientX - lastPanPoint.x;
      const dy = clientY - lastPanPoint.y;
      onPan(dx, dy);
      setLastPanPoint({ x: clientX, y: clientY });
    }

    // Handle Dimension Drag
    if (draggingDimension && dragStart && onDimensionMove) {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      // Calculate delta in SVG coordinates (simplified)
      const delta = (clientX - dragStart.x) * (1 / zoom);
      onDimensionMove(draggingDimension, dragStart.originalOffset + delta);
    }

    // Handle Rail Dimension Drag
    if (draggingRailRow !== null && dragStart && onRailDimensionMove) {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const delta = (clientX - dragStart.x) * (1 / zoom);
      onRailDimensionMove(draggingRailRow, dragStart.originalOffset + delta);
    }

    // Handle Flushbox Drag
    if (draggingId && onFlushboxMove) {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      // Simple conversion from screen to SVG coords (approximate for now)
      // Ideally we use getScreenCTM but for this quick fix:
      const svg = svgRef.current;
      if (svg) {
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        onFlushboxMove(draggingId, svgP.x, svgP.y);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingDimension(null);
    setDraggingRailRow(null);
    setDragStart(null);
    setDraggingId(null);
  };

  const handleDimensionMouseDown = (e: React.MouseEvent, type: 'center' | 'bottom' | 'top') => {
    e.stopPropagation();
    setDraggingDimension(type);
    setDragStart({
      x: e.clientX,
      originalOffset: dimensionOffsets[type]
    });
  };

  const handleRailDimensionMouseDown = (e: React.MouseEvent, row: number, currentOffset: number) => {
    e.stopPropagation();
    setDraggingRailRow(row);
    setDragStart({
      x: e.clientX,
      originalOffset: currentOffset
    });
  };

  // Calculations
  const totalWidth = (cols * display.width) + ((cols - 1) * gap);
  const totalHeight = (rows * display.height) + ((rows - 1) * gap);

  // Calculate vertical position based on mounting reference
  let startY = 0; // Top of the video wall in SVG coords
  const floorY = 2500; // Arbitrary floor line for visualization context

  if (mountingReference === MountingReference.FLOOR_TO_TOP) {
    startY = floorY - mountingValue;
  } else if (mountingReference === MountingReference.FLOOR_TO_CENTER) {
    startY = floorY - mountingValue - (totalHeight / 2);
  } else if (mountingReference === MountingReference.FLOOR_TO_BOTTOM) {
    startY = floorY - mountingValue - totalHeight;
  }

  const startX = (roomDimensions.width - totalWidth) / 2;

  const svgTvCenterY = startY + totalHeight / 2;
  const svgTvBottomY = startY + totalHeight;
  const svgFloorY = floorY;

  const centerHeight = floorY - svgTvCenterY;
  const bottomHeight = floorY - svgTvBottomY;

  // Room Boundaries
  const ceilingY = floorY - roomDimensions.height;
  const roomWidth = roomDimensions.width;

  // ViewBox calculations
  let viewBox: string;
  let vbWidth: number;
  let vbHeight: number;

  if (autoFit) {
    // Calculate bounding box of content
    const padding = 500; // Extra padding around the content
    const minX = Math.min(0, startX - padding);
    const minY = Math.min(ceilingY, startY - padding);
    const maxX = Math.max(roomWidth, startX + totalWidth + padding);
    const maxY = Math.max(floorY, startY + totalHeight + padding);

    vbWidth = maxX - minX;
    vbHeight = maxY - minY;
    viewBox = `${minX} ${minY} ${vbWidth} ${vbHeight}`;
  } else {
    vbWidth = roomDimensions.width;
    vbHeight = roomDimensions.height;
    // Shift Y origin to ceilingY so the view starts at the top of the room
    viewBox = `${-panOffset.x} ${ceilingY - panOffset.y} ${vbWidth / zoom} ${vbHeight / zoom}`;
  }

  const renderScreens = () => {
    const screens = [];
    // Dimensions for Vogel's Connect-it PFB 3427
    const PFB_HEIGHT = 180; // PFB 3427 interface bar height
    const PFS_WIDTH = 45;   // PFS 35xx interface display strip width (approx)
    const PFS_DEPTH = 35;   // Depth of the strip
    const BAR_DEPTH = 95;   // Depth of the bar (PFB 3427)

    // Calculate bar positions (one per row, centered vertically relative to display row)
    // Actually, usually 2 bars per row for tall displays, or 1 for smaller?
    // Standard video wall usually has 1 rail per row if using specific video wall bars, or 2.
    // Let's assume 1 horizontal rail per row for simplicity, or maybe 2 if height > 600?
    // Vogel's PFB 34xx is often used with PFS 35xx.
    // Let's draw 1 main horizontal bar per row for now to represent the rail.

    for (let r = 0; r < rows; r++) {
      // Draw Horizontal Rail (PFB) for this row - Only in Backing View
      if (config.mountingSystem === MountingSystemType.VOGELS_CONNECT_IT && currentView === 'backing') {
        const rowY = startY + r * (display.height + gap);

        // Vogel's Logic: Rail Center is 150mm ABOVE Display Center
        const displayCenterY = rowY + (display.height / 2);
        const railCenterY = displayCenterY - 150; // -150 in SVG coords (upwards)
        const railY = railCenterY - (PFB_HEIGHT / 2);

        // Rail spans the entire width of the row
        const rowWidth = (cols * display.width) + ((cols - 1) * gap);

        // Calculate mounting tab positions based on PFB 3427 technical drawing
        // Drawing shows outer tabs very close to edges with center tab in middle
        // For 2765mm rail: outer tabs ~100-150mm from edges
        const screwHoleDiameter = 13; // SW13 screws
        const MAX_SEGMENT_LENGTH = 2750;
        const numSegments = Math.ceil(rowWidth / MAX_SEGMENT_LENGTH);
        const segmentLength = rowWidth / numSegments;

        const tabPositions: number[] = [];
        for (let i = 0; i < numSegments; i++) {
          const segmentStart = i * segmentLength;
          tabPositions.push(segmentStart + (segmentLength * 0.15));
          tabPositions.push(segmentStart + (segmentLength * 0.50));
          tabPositions.push(segmentStart + (segmentLength * 0.85));
        }

        screens.push(
          <g key={`rail-${r}`}>
            {/* Mounting Tabs - top and bottom at each position */}
            {tabPositions.map((pos, i) => (
              <g key={`tab-group-${i}`}>
                {/* Top tab */}
                <rect
                  x={startX + pos - 30}
                  y={railY - 20}
                  width={60}
                  height={20}
                  fill="#e2e8f0" // Light gray/white - same as rail
                  stroke="#0f172a"
                  strokeWidth="2"
                  rx="2"
                />
                {/* Top tab screw hole */}
                <circle
                  cx={startX + pos}
                  cy={railY - 10}
                  r={screwHoleDiameter / 2}
                  fill="#64748b" // Lighter gray to be visible
                  stroke="#0f172a"
                  strokeWidth="1"
                />

                {/* Bottom tab */}
                <rect
                  x={startX + pos - 30}
                  y={railY + PFB_HEIGHT}
                  width={60}
                  height={20}
                  fill="#e2e8f0" // Light gray/white - same as rail
                  stroke="#0f172a"
                  strokeWidth="2"
                  rx="2"
                />
                {/* Bottom tab screw hole */}
                <circle
                  cx={startX + pos}
                  cy={railY + PFB_HEIGHT + 10}
                  r={screwHoleDiameter / 2}
                  fill="#64748b" // Lighter gray to be visible
                  stroke="#0f172a"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Main Rail Body - light colored like technical drawing */}
            <rect
              x={startX}
              y={railY}
              width={rowWidth}
              height={PFB_HEIGHT}
              fill="#e2e8f0" // Light gray/white
              stroke="#0f172a" // Black outline
              strokeWidth="3"
              rx="3"
            />

            {/* Inner profile detail (161mm inner height) */}
            <rect
              x={startX + 10}
              y={railY + 9.5}
              width={rowWidth - 20}
              height={161}
              fill="none"
              stroke="#64748b" // Darker gray for detail
              strokeWidth="2"
              rx="2"
            />

            {/* Screw holes at the 3 mounting positions */}
            {tabPositions.map((pos, i) => (
              <g key={`screw-${i}`}>
                {/* Screw hole */}
                <circle
                  cx={startX + pos}
                  cy={railY + (PFB_HEIGHT / 2)}
                  r={screwHoleDiameter / 2}
                  fill="#0f172a"
                  stroke="#64748b"
                  strokeWidth="1"
                />
                {/* Center indicator */}
                <circle
                  cx={startX + pos}
                  cy={railY + (PFB_HEIGHT / 2)}
                  r={3}
                  fill="#94a3b8"
                />
              </g>
            ))}

            {/* Rail grooves/channels */}
            <line
              x1={startX + 5}
              y1={railY + PFB_HEIGHT * 0.3}
              x2={startX + rowWidth - 5}
              y2={railY + PFB_HEIGHT * 0.3}
              stroke="#94a3b8"
              strokeWidth="2"
            />
            <line
              x1={startX + 5}
              y1={railY + PFB_HEIGHT * 0.7}
              x2={startX + rowWidth - 5}
              y2={railY + PFB_HEIGHT * 0.7}
              stroke="#94a3b8"
              strokeWidth="2"
            />

            {/* Rail Label */}
            <text
              x={startX + 10}
              y={railY + PFB_HEIGHT - 10}
              fontSize="20"
              fill="#94a3b8" // slate-400
              fontFamily="monospace"
            >
              PFB 3427
            </text>

            {/* Rail Elevation Dimension */}
            <DimensionLine
              x1={startX}
              y1={floorY}
              x2={startX}
              y2={railY + (PFB_HEIGHT / 2)}
              label={`Rail AFFL: ${Math.round(floorY - (railY + (PFB_HEIGHT / 2)))}mm`}
              offset={railOffsets[r] ?? (-150 - (r * 100))} // Default staggered left offsets
              vertical={true}
              color="#64748b"
              onMouseDown={(e) => handleRailDimensionMouseDown(e, r, railOffsets[r] ?? (-150 - (r * 100)))}
              isDragging={draggingRailRow === r}
            />
          </g>
        );
      }

      for (let c = 0; c < cols; c++) {
        const x = startX + c * (display.width + gap);
        const y = startY + r * (display.height + gap);

        if (currentView === 'backing') {
          // Backing View: Ghosted Display + Brackets
          screens.push(
            <g key={`${r}-${c}-backing`}>
              {/* Ghosted Display Outline */}
              <rect
                x={x}
                y={y}
                width={display.width}
                height={display.height}
                fill="white"
                fillOpacity="0.05"
                stroke={COLORS.slate900}
                strokeWidth="3"
                strokeDasharray="12,12"
              />

              {/* Connect-it Vertical Strips (PFS) - REMOVED per user request */}

              {/* Display Label */}
              <text
                x={x + display.width / 2}
                y={y + display.height / 2}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={COLORS.slate400}
                fontSize="48"
                fontWeight="bold"
                opacity="0.5"
              >
                {r + 1}-{c + 1}
              </text>
            </g>
          );
        } else {
          // Front View (Original)
          screens.push(
            <g key={`${r}-${c}`}>
              {/* Display Body */}
              <rect
                x={x}
                y={y}
                width={display.width}
                height={display.height}
                fill={COLORS.slate900}
                stroke={COLORS.slate800}
                strokeWidth="1"
                rx="1"
              />

              {/* Screen Bezel & Glare - Now full size */}
              <rect
                x={x}
                y={y}
                width={display.width}
                height={display.height}
                fill={COLORS.slate900}
              />
              <path
                d={`M ${x} ${y} L ${x + (display.width * 0.4)} ${y} L ${x} ${y + (display.height * 0.6)} Z`}
                fill="white"
                opacity="0.03"
              />
            </g>
          );
        }
      }
    }
    return screens;
  };

  // Horizontal Positioning (Centered on Wall)
  const groupCenterX = startX + totalWidth / 2;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-inner border border-slate-200 p-4">
      <svg
        id={id}
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full max-w-[100%] max-h-[100%] bg-grid-pattern border border-slate-100"
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : 'default' }}
      >
        {/* Wall & Floor */}
        <line x1="-5000" y1={floorY} x2="10000" y2={floorY} stroke={COLORS.slate800} strokeWidth="12" />
        <text
          x={startX - 500}
          y={floorY - 40}
          fill={COLORS.slate800}
          style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: FONTS.sans }}
        >
          FFL (Finished Floor Level)
        </text>

        {/* Room Outline */}
        <g id="room-outline">
          {/* Ceiling */}
          <line x1={0} y1={ceilingY} x2={roomWidth} y2={ceilingY} stroke={COLORS.slate300} strokeWidth="2" />
          {/* Left Wall */}
          <line x1={0} y1={ceilingY} x2={0} y2={floorY} stroke={COLORS.slate300} strokeWidth="2" />
          {/* Right Wall */}
          <line x1={roomWidth} y1={ceilingY} x2={roomWidth} y2={floorY} stroke={COLORS.slate300} strokeWidth="2" />

          {/* Room Dimensions Labels */}
          <text x={roomWidth / 2} y={ceilingY - 20} textAnchor="middle" fill={COLORS.slate400} fontSize="24" fontFamily={FONTS.sans}>
            {Math.round(roomDimensions.width)}mm
          </text>
          <text x={-20} y={ceilingY + roomDimensions.height / 2} textAnchor="end" fill={COLORS.slate400} fontSize="24" fontFamily={FONTS.sans} transform={`rotate(-90, -20, ${ceilingY + roomDimensions.height / 2})`}>
            {Math.round(roomDimensions.height)}mm
          </text>
        </g>

        {/* Center Line Indicator */}
        <line
          x1={groupCenterX - 80}
          y1={svgTvCenterY}
          x2={groupCenterX + 80}
          y2={svgTvCenterY}
          stroke={COLORS.red500}
          strokeWidth="3"
          strokeDasharray="20,15,5,15"
        />
        <line
          x1={groupCenterX}
          y1={svgTvCenterY - 80}
          x2={groupCenterX}
          y2={svgTvCenterY + 80}
          stroke={COLORS.red500}
          strokeWidth="3"
          strokeDasharray="20,15,5,15"
        />
        <text
          x={groupCenterX + 100}
          y={svgTvCenterY}
          fill={COLORS.red500}
          alignmentBaseline="middle"
          style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: FONTS.mono }}
        >
          CL
        </text>

        {/* Video Wall */}
        {renderScreens()}

        {/* Guides */}
        {showGuides && (
          <Guides
            viewWidth={vbWidth}
            viewHeight={vbHeight}
            floorY={floorY}
            showGuides={showGuides}
            showCamera={false}
            cameraPosition="bottom"
            displayTopY={startY}
            displayBottomY={startY + totalHeight}
            groupCenterX={startX + totalWidth / 2}
          />
        )}

        {/* Flushboxes */}
        {currentView === 'backing' && flushboxes.map((box, index) => (
          <FlushboxObject
            key={box.id}
            box={box}
            viewHeight={floorY}
            isDragging={draggingId === box.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDraggingId(box.id);
            }}
            index={index}
          />
        ))}

        {/* Dimensions */}
        {/* Total Width */}
        <DimensionLine
          x1={startX}
          y1={startY}
          x2={startX + totalWidth}
          y2={startY}
          label={`${Math.round(totalWidth)}mm`}
          offset={-150}
          vertical={false}
        />

        {/* Total Height */}
        <DimensionLine
          x1={startX + totalWidth}
          y1={startY}
          x2={startX + totalWidth}
          y2={startY + totalHeight}
          label={`${Math.round(totalHeight)}mm`}
          offset={150}
          vertical={true}
        />

        {/* Mounting Heights */}
        {currentView !== 'backing' && (
          <g
            onMouseDown={(e) => handleDimensionMouseDown(e, 'center')}
            style={{ cursor: draggingDimension === 'center' ? 'grabbing' : 'grab' }}
          >
            <line x1={startX} y1={svgTvCenterY} x2={startX + dimensionOffsets.center} y2={svgTvCenterY} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
            <DimensionLine
              x1={startX + dimensionOffsets.center + 50}
              y1={svgFloorY}
              x2={startX + dimensionOffsets.center + 50}
              y2={svgTvCenterY}
              label={`AFFL (Center): ${Math.round(centerHeight)}mm`}
              offset={0}
              vertical={true}
              onMouseDown={(e) => handleDimensionMouseDown(e, 'center')}
              isDragging={draggingDimension === 'center'}
            />
          </g>
        )}

        <g
          onMouseDown={(e) => handleDimensionMouseDown(e, 'bottom')}
          style={{ cursor: draggingDimension === 'bottom' ? 'grabbing' : 'grab' }}
        >
          <line x1={startX} y1={svgTvBottomY} x2={startX + dimensionOffsets.bottom} y2={svgTvBottomY} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
          <DimensionLine
            x1={startX + dimensionOffsets.bottom + 50}
            y1={svgFloorY}
            x2={startX + dimensionOffsets.bottom + 50}
            y2={svgTvBottomY}
            label={`AFFL (Bottom): ${Math.round(bottomHeight)}mm`}
            offset={0}
            vertical={true}
            onMouseDown={(e) => handleDimensionMouseDown(e, 'bottom')}
            isDragging={draggingDimension === 'bottom'}
          />
        </g>

        <g
          onMouseDown={(e) => handleDimensionMouseDown(e, 'top')}
          style={{ cursor: draggingDimension === 'top' ? 'grabbing' : 'grab' }}
        >
          <line x1={startX} y1={startY} x2={startX + dimensionOffsets.top} y2={startY} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
          <DimensionLine
            x1={startX + dimensionOffsets.top + 50}
            y1={svgFloorY}
            x2={startX + dimensionOffsets.top + 50}
            y2={startY}
            label={`AFFL (Top): ${Math.round(floorY - startY)}mm`}
            offset={0}
            vertical={true}
            onMouseDown={(e) => handleDimensionMouseDown(e, 'top')}
            isDragging={draggingDimension === 'top'}
          />
        </g>

      </svg>
    </div>
  );
};