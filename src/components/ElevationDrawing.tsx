
import React from 'react';
import { DisplayDimensions, InstallationSpecs, ScenarioType, MountingBracket, ViewMode, CameraPosition } from '../types';
import { DUAL_SCREEN_GAP } from '../constants';
import { SVG_COLORS as COLORS, SVG_FONTS as FONTS } from '../constants/svgStyles';

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
  id,
  className = ""
}) => {
  // Coordinate system: SVG 0,0 is Top-Left.
  const viewWidth = wallWidth;
  const viewHeight = wallHeight;
  const gap = DUAL_SCREEN_GAP;
  const isBacking = viewMode === 'backing';

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

  // Helper for ticks
  const renderDimension = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    label: string,
    offset: number = 0,
    vertical: boolean = false
  ) => {
    const tickSize = 60;
    const textOffset = 70;
    const style = {
      fontFamily: FONTS.mono,
      fontSize: '36px',
      fontWeight: 500,
      fill: COLORS.slate800
    };

    if (vertical) {
      const lineX = x1 + offset;
      return (
        <g>
          <line x1={lineX} y1={y1} x2={lineX} y2={y2} stroke={COLORS.slate800} strokeWidth="3" />
          <line x1={lineX - tickSize / 2} y1={y1} x2={lineX + tickSize / 2} y2={y1} stroke={COLORS.slate800} strokeWidth="3" />
          <line x1={lineX - tickSize / 2} y1={y2} x2={lineX + tickSize / 2} y2={y2} stroke={COLORS.slate800} strokeWidth="3" />
          <text
            x={lineX + textOffset}
            y={(y1 + y2) / 2}
            textAnchor="middle"
            alignmentBaseline="middle"
            style={style}
            transform={`rotate(-90 ${lineX + textOffset} ${(y1 + y2) / 2})`}
          >
            {label}
          </text>
        </g>
      );
    } else {
      const lineY = y1 + offset;
      return (
        <g>
          <line x1={x1} y1={lineY} x2={x2} y2={lineY} stroke={COLORS.slate800} strokeWidth="3" />
          <line x1={x1} y1={lineY - tickSize / 2} x2={x1} y2={lineY + tickSize / 2} stroke={COLORS.slate800} strokeWidth="3" />
          <line x1={x2} y1={lineY - tickSize / 2} x2={x2} y2={lineY + tickSize / 2} stroke={COLORS.slate800} strokeWidth="3" />
          <text
            x={(x1 + x2) / 2}
            y={lineY - textOffset / 2}
            textAnchor="middle"
            style={style}
          >
            {label}
          </text>
        </g>
      );
    }
  };

  // Renderer for Chief LSM1U Wireframe
  const renderLSM1UGeometry = (width: number, height: number, isGhost: boolean) => {
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
    const uprightXOffset = 200;

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
            d={`M${flareOffset},${uprightHeight - capHeight} L0,${uprightHeight - capHeight} L0,${uprightHeight - 10} L${10},${uprightHeight} L${uprightCapWidth - 10},${uprightHeight} L${uprightCapWidth - 10},${uprightHeight - capHeight} L${uprightCapWidth - flareOffset},${uprightHeight - capHeight} Z`}
            fill={fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <circle cx={uprightCapWidth / 2} cy={uprightHeight - capHeight / 2} r={10} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
          <rect x={uprightCapWidth / 2 - 15} y={uprightHeight - 25} width={30} height={10} rx={5} stroke={strokeColor} fill="none" />

          {/* VESA Slots */}
          {Array.from({ length: 5 }).map((_, i) => (
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
    const displayStroke = isBacking ? COLORS.slate400 : COLORS.slate800;
    const displayStrokeWidth = 4;
    const displayDash = isBacking ? '12,12' : 'none';

    return (
      <g transform={`translate(${offsetX}, 0)`}>

        {/* Mounting Bracket Layer */}
        {bracket.id !== 'none' && (
          <g transform={`translate(${bracketLeftX}, ${bracketTopY})`}>
            {bracket.id === 'chief-lsm1u' ? (
              renderLSM1UGeometry(bracket.width, bracket.height, !isBacking)
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

            {bracket.id !== 'chief-lsm1u' && (
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
                {renderDimension(0, 0, bracket.width, 0, `${bracket.width}mm`, -50, false)}
                {renderDimension(bracket.width, 0, bracket.width, bracket.height, `${bracket.height}mm`, 50, true)}
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

  // Render Guides
  const renderGuides = () => {
    if (!showGuides) return null;
    const seatedY = viewHeight - 1200;
    const standingY = viewHeight - 1500;
    const style = { fontSize: '24px', fontFamily: FONTS.sans, fill: COLORS.blue500 };

    return (
      <g>
        {/* Seated Eye Level */}
        <line x1={0} y1={seatedY} x2={viewWidth} y2={seatedY} stroke={COLORS.blue500} strokeWidth="2" strokeDasharray="10,10" opacity="0.6" />
        <text x={20} y={seatedY - 10} style={style}>Seated Eye Level (1200mm)</text>

        {/* Standing Eye Level */}
        <line x1={0} y1={standingY} x2={viewWidth} y2={standingY} stroke={COLORS.blue500} strokeWidth="2" strokeDasharray="10,10" opacity="0.6" />
        <text x={20} y={standingY - 10} style={style}>Standing Eye Level (1500mm)</text>
      </g>
    );
  };

  // Render Camera
  const renderCamera = () => {
    if (!showCamera) return null;

    // Calculate camera position based on display and camera mount position
    let camY: number;
    const camWidth = 200;
    const camH = 60;
    const camX = groupCenterX - (camWidth / 2);

    if (cameraPosition === 'bottom') {
      // Camera flush below display (no gap)
      camY = svgTvBottomY + (camH / 2);
    } else {
      // Camera flush above display (no gap)
      camY = svgTvTopY - (camH / 2);
    }

    const camHeightMm = viewHeight - camY;

    return (
      <g>
        <line x1={0} y1={camY} x2={viewWidth} y2={camY} stroke={COLORS.green500} strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
        <rect x={camX} y={camY - (camH / 2)} width={camWidth} height={camH} rx={4} fill={COLORS.slate800} />
        <circle cx={groupCenterX} cy={camY} r={15} fill="#333" stroke="white" strokeWidth="2" />
        <text x={camX + camWidth + 20} y={camY} alignmentBaseline="middle" fill={COLORS.green500} style={{ fontSize: '24px', fontFamily: FONTS.sans }}>
          VC Camera ({Math.round(camHeightMm)}mm, {cameraPosition})
        </text>
      </g>
    );
  };

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-inner border border-slate-200 p-4 ${className}`}>
      <svg
        id={id}
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="xMidYMax meet"
        className="w-full h-full max-h-[80vh] bg-grid-pattern border border-slate-100"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
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
        {renderGuides()}
        {renderCamera()}

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
        {renderDimension(groupLeftX, svgTvTopY, groupRightX, svgTvTopY, `${Math.round(totalGroupWidth)}mm`, -180, false)}

        {/* Dimensions: Display Height (Only Front View or Reference) */}
        {!isBacking && renderDimension(groupRightX, svgTvTopY, groupRightX, svgTvBottomY, `${Math.round(dimensions.height)}mm`, 120, true)}

        {/* Dimensions: Mounting Heights */}
        <line x1={groupLeftX} y1={svgTvCenterY} x2={groupLeftX - 350} y2={svgTvCenterY} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
        {renderDimension(groupLeftX - 300, svgFloorY, groupLeftX - 300, svgTvCenterY, `AFFL (Center): ${Math.round(tvCenterY_mm)}mm`, 0, true)}

        <line x1={groupLeftX} y1={svgTvBottomY} x2={groupLeftX - 600} y2={svgTvBottomY} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
        {renderDimension(groupLeftX - 550, svgFloorY, groupLeftX - 550, svgTvBottomY, `AFFL (Bottom): ${Math.round(tvBottomY_mm)}mm`, 0, true)}

        {/* Title Block */}
        <g transform={`translate(${viewWidth - 1100}, ${viewHeight - 500})`}>
          <rect width="1050" height="450" fill="white" stroke={COLORS.slate800} strokeWidth="4" fillOpacity="0.95" />
          <rect width="1050" height="80" fill={isBacking ? COLORS.slate300 : COLORS.slate800} />

          <text
            x="525" y="55"
            textAnchor="middle"
            fill={isBacking ? COLORS.slate900 : COLORS.white}
            style={{ fontSize: '40px', fontWeight: 'bold', fontFamily: FONTS.sans }}
          >
            {isBacking ? 'MOUNTING DETAIL' : 'DISPLAY ELEVATION'}
          </text>

          <g transform="translate(50, 150)">
            <text y="0" fill={COLORS.slate500} style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: FONTS.mono }}>MODEL:</text>
            <text x="320" y="0" fill={COLORS.slate800} style={{ fontSize: '32px', fontFamily: FONTS.mono }}>{dimensions.name || 'Custom Display'}</text>

            <text y="70" fill={COLORS.slate500} style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: FONTS.mono }}>CONFIG:</text>
            <text x="320" y="70" fill={COLORS.slate800} style={{ fontSize: '32px', fontFamily: FONTS.mono, textTransform: 'uppercase' }}>{displayCount === 2 ? 'DUAL SCREEN' : 'SINGLE DISPLAY'}</text>

            <text y="140" fill={COLORS.slate500} style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: FONTS.mono }}>MOUNT:</text>
            <text x="320" y="140" fill={COLORS.slate800} style={{ fontSize: '32px', fontFamily: FONTS.mono }}>{bracket.modelName || 'Direct Wall'}</text>

            <text y="210" fill={COLORS.slate500} style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: FONTS.mono }}>ALIGNMENT:</text>
            <text x="320" y="210" fill={COLORS.slate800} style={{ fontSize: '32px', fontFamily: FONTS.mono, textTransform: 'uppercase' }}>{specs.referencePoint}</text>

            <text y="280" fill={COLORS.slate500} style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: FONTS.mono }}>MOUNTING:</text>
            <text x="320" y="280" fill={COLORS.slate800} style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: FONTS.mono, textTransform: 'uppercase' }}>{specs.afflValue}mm AFFL</text>
          </g>
        </g>
      </svg>
    </div>
  );
};
