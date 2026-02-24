
import React, { useState, useRef } from 'react';
import { DisplayDimensions, InstallationSpecs, ScenarioType, MountingBracket, ViewMode, CameraPosition, Flushbox } from '../types';
import { DUAL_SCREEN_GAP } from '../constants';
import { SVG_COLORS as COLORS, SVG_FONTS as FONTS } from '../constants/svgStyles';
import { DimensionLine } from './shared/DimensionLine';
import { FlushboxObject } from './shared/FlushboxObject';
import { Guides } from './shared/Guides';

interface ElevationDrawingProps {
  dimensions: DisplayDimensions;
  specs: InstallationSpecs;
  scenario: ScenarioType;
  wallWidth: number;
  wallHeight: number;
  displayCount: 1 | 2;
  bracket: MountingBracket;
  viewMode: ViewMode;
  showGuides?: boolean;
  showCamera?: boolean;
  cameraPosition?: CameraPosition;
  cameraInverted?: boolean;
  flushboxes?: Flushbox[];
  onFlushboxMove?: (id: string, x: number, y: number) => void;
  zoom?: number;
  panOffset?: { x: number, y: number };
  onPan?: (dx: number, dy: number) => void;
  dimensionOffsets?: { center: number, bottom: number, top: number };
  onDimensionMove?: (type: 'center' | 'bottom' | 'top', offsetX: number) => void;
  id?: string;
  className?: string;
}

export const ElevationDrawing: React.FC<ElevationDrawingProps> = ({
  dimensions,
  specs,
  scenario,
  wallWidth,
  wallHeight,
  displayCount,
  bracket,
  viewMode,
  showGuides = false,
  showCamera = false,
  cameraPosition = 'bottom',
  cameraInverted = false,
  flushboxes = [],
  onFlushboxMove,
  zoom = 1.0,
  panOffset = { x: 0, y: 0 },
  onPan,
  dimensionOffsets = { center: -350, bottom: -600, top: -350 },
  onDimensionMove,
  id,
  className = ""
}) => {
  // Coordinate system: SVG 0,0 is Top-Left.
  const viewWidth = wallWidth;
  const viewHeight = wallHeight;
  const gap = DUAL_SCREEN_GAP;
  const isBacking = viewMode === 'backing';

  // Drag State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number, y: number } | null>(null);
  const [draggingDimension, setDraggingDimension] = useState<'center' | 'bottom' | 'top' | null>(null);
  const [dimensionDragStart, setDimensionDragStart] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate viewBox based on zoom and pan
  const viewBox = `${panOffset.x} ${panOffset.y} ${viewWidth / zoom} ${viewHeight / zoom}`;

  // Drag Handlers
  const getMousePosition = (evt: React.MouseEvent | React.TouchEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const CTM = svg.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };

    const clientX = 'touches' in evt ? evt.touches[0].clientX : (evt as React.MouseEvent).clientX;
    const clientY = 'touches' in evt ? evt.touches[0].clientY : (evt as React.MouseEvent).clientY;

    return {
      x: (clientX - CTM.e) / CTM.a,
      y: (clientY - CTM.f) / CTM.d
    };
  };

  const handleMouseDown = (evt: React.MouseEvent | React.TouchEvent, id: string) => {
    if (!onFlushboxMove) return;
    evt.stopPropagation();
    setDraggingId(id);
  };

  const handleBackgroundMouseDown = (evt: React.MouseEvent) => {
    if (!onPan || draggingId) return;
    setIsPanning(true);
    const { x, y } = getMousePosition(evt);
    setPanStart({ x, y });
  };

  const handleDimensionMouseDown = (evt: React.MouseEvent, type: 'center' | 'bottom' | 'top') => {
    if (!onDimensionMove) return;
    evt.stopPropagation();
    const { x } = getMousePosition(evt);
    setDraggingDimension(type);
    setDimensionDragStart(x);
  };

  const handleMouseMove = (evt: React.MouseEvent | React.TouchEvent) => {
    if (draggingId && onFlushboxMove) {
      evt.preventDefault();

      const { x, y } = getMousePosition(evt);
      const boxWidth = 97;
      const boxHeight = 62;

      onFlushboxMove(draggingId, x - (boxWidth / 2), y - (boxHeight / 2));
    } else if (isPanning && onPan && panStart) {
      const { x, y } = getMousePosition(evt);
      const dx = x - panStart.x;
      const dy = y - panStart.y;
      onPan(-dx, -dy); // Negative because viewBox moves opposite to visual pan
      setPanStart({ x, y });
    } else if (draggingDimension && onDimensionMove && dimensionDragStart !== null) {
      const { x } = getMousePosition(evt);
      const newOffset = dimensionOffsets[draggingDimension] + (x - dimensionDragStart);
      onDimensionMove(draggingDimension, newOffset);
      setDimensionDragStart(x);
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setIsPanning(false);
    setPanStart(null);
    setDraggingDimension(null);
    setDimensionDragStart(null);
  };

  // Calculate Group Dimensions
  const totalGroupWidth = displayCount === 1
    ? dimensions.width
    : (dimensions.width * 2) + gap;

  // Calculate critical vertical positions (in mm)
  let tvBottomY_mm = 0;
  let tvCenterY_mm = 0;
  let tvTopY_mm = 0;

  if (specs.referencePoint === 'bottom') {
    tvBottomY_mm = specs.afflValue;
    tvCenterY_mm = specs.afflValue + (dimensions.height / 2);
    tvTopY_mm = specs.afflValue + dimensions.height;
  } else {
    tvCenterY_mm = specs.afflValue;
    tvBottomY_mm = specs.afflValue - (dimensions.height / 2);
    tvTopY_mm = specs.afflValue + (dimensions.height / 2);
  }

  // Convert to SVG Coordinates
  const svgFloorY = viewHeight;
  const svgTvBottomY = viewHeight - tvBottomY_mm;
  const svgTvTopY = viewHeight - tvTopY_mm;
  const svgTvCenterY = viewHeight - tvCenterY_mm;

  // Horizontal Positioning (Centered on Wall)
  const groupCenterX = viewWidth / 2;
  const groupLeftX = groupCenterX - (totalGroupWidth / 2);
  const groupRightX = groupCenterX + (totalGroupWidth / 2);

  // Renderer for Chief Fusion Series (LSM1U / MSM1U) Wireframe
  const renderFusionGeometry = (width: number, height: number, isGhost: boolean) => {
    const strokeColor = isGhost ? COLORS.ghost : COLORS.slate800;
    const strokeWidth = 2;
    const fill = "none";
    const opacity = isGhost ? 0.3 : 1;

    const uprightColWidth = 76;
    const uprightCapWidth = 121;
    const capHeight = 55;

    const railHeight = 38;
    const railYTop = height * 0.20;
    const railYBot = height * 0.80 - railHeight;

    const uprightHeight = height;
    const uprightXOffset =
      width > 1000 ? 300 : // XSM1U (wider spacing for larger rail)
        width > 700 ? 200 :  // LSM1U
          150;                  // MSM1U
    const Upright = ({ x }: { x: number }) => {
      const flareOffset = (uprightCapWidth - uprightColWidth) / 2;
      return (
        <g transform={`translate(${x}, 0)`}>
          {/* Main Channel */}
          <rect
            x={flareOffset}
            y={capHeight}
            width={uprightColWidth}
            height={uprightHeight - (capHeight * 2)}
            fill={fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />

          {/* Top Housing */}
          <path
            d={`M${flareOffset},${capHeight} L0,${capHeight} L0,10 L${10},0 L${uprightCapWidth - 10},0 L${uprightCapWidth},10 L${uprightCapWidth},${capHeight} L${uprightCapWidth - flareOffset},${capHeight} Z`}
            fill={fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <circle cx={uprightCapWidth / 2} cy={capHeight / 2} r={10} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
          <rect x={uprightCapWidth / 2 - 15} y={15} width={30} height={10} rx={5} stroke={strokeColor} fill="none" />

          {/* Bottom Housing */}
          <path
            d={`M${flareOffset},${uprightHeight - capHeight} L0,${uprightHeight - capHeight} L0,${uprightHeight - 10} L${10},${uprightHeight} L${uprightCapWidth - 10},${uprightHeight - capHeight} L${uprightCapWidth - flareOffset},${uprightHeight - capHeight} Z`}
            fill={fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <circle cx={uprightCapWidth / 2} cy={uprightHeight - capHeight / 2} r={10} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
          <rect x={uprightCapWidth / 2 - 15} y={uprightHeight - 25} width={30} height={10} rx={5} stroke={strokeColor} fill="none" />

          {/* VESA Slots - Dynamically sized based on upright height */}
          {Array.from({ length: Math.floor((uprightHeight - capHeight * 2 - 40) / 50) }).map((_, i) => (
            <rect
              key={i}
              x={flareOffset + 20}
              y={capHeight + 30 + (i * 50)}
              width={uprightColWidth - 40}
              height={35}
              rx={8}
              stroke={strokeColor}
              strokeWidth={1}
              fill="none"
            />
          ))}

          {/* Pull Cords */}
          {!isGhost && (
            <>
              <line x1={uprightCapWidth / 2} y1={uprightHeight} x2={uprightCapWidth / 2} y2={uprightHeight + 120} stroke={strokeColor} strokeWidth="2" strokeDasharray="3,2" />
              <rect x={uprightCapWidth / 2 - 8} y={uprightHeight + 120} width={16} height={28} rx={4} fill={fill} stroke={strokeColor} strokeWidth={2} />
            </>
          )}
        </g>
      );
    };

    return (
      <g opacity={opacity}>
        <rect x={0} y={railYTop} width={width} height={railHeight} rx={2} fill={fill} stroke={strokeColor} strokeWidth={strokeWidth} />
        <rect x={0} y={railYBot} width={width} height={railHeight} rx={2} fill={fill} stroke={strokeColor} strokeWidth={strokeWidth} />
        <line x1={100} y1={railYTop + railHeight / 2} x2={width - 100} y2={railYTop + railHeight / 2} stroke={strokeColor} strokeWidth={1} strokeDasharray="50, 50" />
        <line x1={100} y1={railYBot + railHeight / 2} x2={width - 100} y2={railYBot + railHeight / 2} stroke={strokeColor} strokeWidth={1} strokeDasharray="50, 50" />
        <Upright x={width / 2 - uprightXOffset - (uprightCapWidth / 2)} />
        <Upright x={width / 2 + uprightXOffset - (uprightCapWidth / 2)} />
      </g>
    );
  };

  const renderSingleDisplay = (offsetX: number) => {
    // Bracket Positioning (Centered behind display)
    const bracketTopY = svgTvCenterY - (bracket.height / 2);
    const bracketLeftX = (dimensions.width / 2) - (bracket.width / 2);

    const displayFill = isBacking ? COLORS.white : COLORS.slate200;
    const displayFillOpacity = isBacking ? 0.2 : 1;
    const displayStroke = isBacking ? COLORS.slate900 : COLORS.slate800;
    const displayStrokeWidth = isBacking ? 6 : 4;
    const displayDash = isBacking ? '12,12' : 'none';

    return (
      <g transform={`translate(${offsetX}, 0)`}>

        {/* Mounting Bracket Layer */}
        {bracket.id !== 'none' && (
          <g transform={`translate(${bracketLeftX}, ${bracketTopY})`}>
            {bracket.id === 'chief-lsm1u' || bracket.id === 'chief-msm1u' || bracket.id === 'chief-xsm1u' ? (
              renderFusionGeometry(bracket.width, bracket.height, !isBacking)
            ) : (
              <rect
                x={0}
                y={0}
                width={bracket.width}
                height={bracket.height}
                fill={isBacking ? COLORS.slate300 : "none"}
                stroke={isBacking ? COLORS.slate800 : COLORS.slate400}
                strokeWidth={4}
                strokeDasharray={isBacking ? "none" : "12, 12"}
                rx="2"
              />
            )}

            {/* Center Line */}
            <line
              x1={bracket.width / 2}
              y1={-20}
              x2={bracket.width / 2}
              y2={bracket.height + 20}
              stroke={isBacking ? COLORS.red500 : COLORS.slate300}
              strokeWidth="2"
              strokeDasharray="8,8"
            />

            {bracket.id !== 'chief-lsm1u' && bracket.id !== 'chief-msm1u' && (
              <text
                x={bracket.width / 2}
                y={bracket.height / 2}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={isBacking ? COLORS.slate800 : COLORS.slate400}
                style={{ fontSize: '24px', fontFamily: FONTS.mono, fontWeight: 'bold' }}
              >
                {bracket.label}
              </text>
            )}

            {/* Bracket Dimensions (Only in Backing View) */}
            {isBacking && (
              <>
                <DimensionLine x1={0} y1={0} x2={bracket.width} y2={0} label={`${bracket.width}mm`} offset={-120} vertical={false} />
                <DimensionLine x1={bracket.width} y1={0} x2={bracket.width} y2={bracket.height} label={`${bracket.height}mm`} offset={50} vertical={true} />
              </>
            )}
          </g>
        )}

        {/* Display Layer */}
        <rect
          x={0}
          y={svgTvTopY}
          width={dimensions.width}
          height={dimensions.height}
          fill={displayFill}
          fillOpacity={displayFillOpacity}
          stroke={displayStroke}
          strokeWidth={displayStrokeWidth}
          strokeDasharray={displayDash}
          rx="4"
        />

        {/* Screen Bezel & Glare - Only in Front View */}
        {!isBacking && (
          <>
            <rect
              x={10}
              y={svgTvTopY + 10}
              width={Math.max(0, dimensions.width - 20)}
              height={Math.max(0, dimensions.height - 20)}
              fill={COLORS.slate900}
            />
            <path
              d={`M 10 ${svgTvTopY + 10} L ${10 + (dimensions.width * 0.4)} ${svgTvTopY + 10} L 10 ${svgTvTopY + 10 + (dimensions.height * 0.6)} Z`}
              fill="white"
              opacity="0.05"
            />
          </>
        )}
      </g>
    );
  };

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-inner border border-slate-200 p-4 ${className}`}>
      <svg
        ref={svgRef}
        id={id}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMax meet"
        className="w-full h-full max-h-[80vh] bg-grid-pattern border border-slate-100"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        onMouseDown={handleBackgroundMouseDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : draggingId ? 'default' : 'grab' }}
      >
        <title id={`${id}-title`}>
          {isBacking ? 'Mounting Detail View' : 'Display Elevation View'}
        </title>
        <desc id={`${id}-desc`}>
          Technical drawing showing {displayCount === 2 ? 'dual' : 'single'} display installation at {Math.round(tvCenterY_mm)}mm above finished floor level.
          Display dimensions: {Math.round(dimensions.width)}mm wide by {Math.round(dimensions.height)}mm tall.
        </desc>
        {/* Wall & Floor */}
        <line x1="0" y1={svgFloorY} x2={viewWidth} y2={svgFloorY} stroke={COLORS.slate800} strokeWidth="12" />
        <text
          x="40"
          y={svgFloorY - 40}
          fill={COLORS.slate800}
          style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: FONTS.sans }}
        >
          FFL (Finished Floor Level)
        </text>

        {/* Guides Layer (Behind displays) */}
        <Guides
          viewWidth={viewWidth}
          viewHeight={viewHeight}
          floorY={svgFloorY}
          showGuides={showGuides}
          showCamera={showCamera}
          cameraPosition={cameraPosition}
          cameraInverted={cameraInverted}
          displayTopY={svgTvTopY}
          displayBottomY={svgTvBottomY}
          groupCenterX={groupCenterX}
        />

        {isBacking && flushboxes.map((box, index) => (
          <FlushboxObject
            key={box.id}
            box={box}
            viewHeight={viewHeight}
            isDragging={draggingId === box.id}
            onMouseDown={(e) => handleMouseDown(e, box.id)}
            index={index}
          />
        ))}

        {/* Displays */}
        {displayCount === 1 ? (
          renderSingleDisplay(groupLeftX)
        ) : (
          <>
            {renderSingleDisplay(groupLeftX)}
            {renderSingleDisplay(groupLeftX + dimensions.width + gap)}
          </>
        )}

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

        {/* Dimensions: Total Width */}
        <DimensionLine x1={groupLeftX} y1={svgTvTopY} x2={groupRightX} y2={svgTvTopY} label={`${Math.round(totalGroupWidth)}mm`} offset={-180} vertical={false} />

        {/* Dimensions: Display Height (Only Front View or Reference) */}
        {!isBacking && (
          <DimensionLine x1={groupRightX} y1={svgTvTopY} x2={groupRightX} y2={svgTvBottomY} label={`${Math.round(dimensions.height)}mm`} offset={120} vertical={true} />
        )}

        {/* Dimensions: Mounting Heights */}
        <g>
          <line x1={groupLeftX} y1={svgTvCenterY} x2={groupLeftX + dimensionOffsets.center} y2={svgTvCenterY} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
          <DimensionLine
            x1={groupLeftX + dimensionOffsets.center + 50}
            y1={svgFloorY}
            x2={groupLeftX + dimensionOffsets.center + 50}
            y2={svgTvCenterY}
            label={`AFFL (Center): ${Math.round(tvCenterY_mm)}mm`}
            offset={0}
            vertical={true}
            onMouseDown={(e) => handleDimensionMouseDown(e, 'center')}
            isDragging={draggingDimension === 'center'}
          />
        </g>

        <g>
          <line x1={groupLeftX} y1={svgTvBottomY} x2={groupLeftX + dimensionOffsets.bottom} y2={svgTvBottomY} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
          <DimensionLine
            x1={groupLeftX + dimensionOffsets.bottom + 50}
            y1={svgFloorY}
            x2={groupLeftX + dimensionOffsets.bottom + 50}
            y2={svgTvBottomY}
            label={`AFFL (Bottom): ${Math.round(tvBottomY_mm)}mm`}
            offset={0}
            vertical={true}
            onMouseDown={(e) => handleDimensionMouseDown(e, 'bottom')}
            isDragging={draggingDimension === 'bottom'}
          />
        </g>

        <g>
          <line x1={groupLeftX} y1={svgTvTopY} x2={groupLeftX + dimensionOffsets.top} y2={svgTvTopY} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
          <DimensionLine
            x1={groupLeftX + dimensionOffsets.top + 50}
            y1={svgFloorY}
            x2={groupLeftX + dimensionOffsets.top + 50}
            y2={svgTvTopY}
            label={`AFFL (Top): ${Math.round(tvTopY_mm)}mm`}
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
