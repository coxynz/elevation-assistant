import React from 'react';
import { SVG_COLORS as COLORS, SVG_FONTS as FONTS } from '../../constants/svgStyles';

interface GuidesProps {
    viewWidth: number;
    viewHeight: number;
    showGuides: boolean;
    showCamera: boolean;
    cameraPosition: 'top' | 'bottom';
    displayTopY: number;
    displayBottomY: number;
    groupCenterX: number;
}

export const Guides: React.FC<GuidesProps> = ({
    viewWidth,
    viewHeight,
    showGuides,
    showCamera,
    cameraPosition,
    displayTopY,
    displayBottomY,
    groupCenterX
}) => {
    const renderEyeLevels = () => {
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

    const renderCamera = () => {
        if (!showCamera) return null;

        // Calculate camera position based on display and camera mount position
        let camY: number;
        const camWidth = 200;
        const camH = 60;
        const camX = groupCenterX - (camWidth / 2);

        if (cameraPosition === 'bottom') {
            // Camera flush below display (no gap)
            camY = displayBottomY + (camH / 2);
        } else {
            // Camera flush above display (no gap)
            camY = displayTopY - (camH / 2);
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
        <g>
            {renderEyeLevels()}
            {renderCamera()}
        </g>
    );
};
