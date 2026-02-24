import React from 'react';
import { SVG_COLORS as COLORS, SVG_FONTS as FONTS } from '../../constants/svgStyles';
import { CAMERA_PHYSICAL_WIDTH, CAMERA_PHYSICAL_HEIGHT, CAMERA_DISPLAY_GAP } from '../../constants';
import { CameraObject } from './CameraObject';

interface GuidesProps {
    viewWidth: number;
    viewHeight: number;
    floorY?: number;
    showGuides: boolean;
    showCamera: boolean;
    cameraPosition: 'top' | 'bottom';
    cameraInverted: boolean;
    displayTopY: number;
    displayBottomY: number;
    groupCenterX: number;
}

export const Guides: React.FC<GuidesProps> = ({
    viewWidth,
    viewHeight,
    floorY,
    showGuides,
    showCamera,
    cameraPosition,
    cameraInverted,
    displayTopY,
    displayBottomY,
    groupCenterX
}) => {
    const renderEyeLevels = () => {
        if (!showGuides) return null;
        const floor = floorY ?? viewHeight;
        const seatedY = floor - 1200;
        const standingY = floor - 1500;
        const style = { fontSize: '24px', fontFamily: FONTS.sans, fill: COLORS.blue500 };

        return (
            <g>
                {/* Seated Eye Level */}
                <line x1={0} y1={seatedY} x2={viewWidth} y2={seatedY} stroke={COLORS.blue500} strokeWidth="2" strokeDasharray="10,10" opacity="0.6" />
                <text x={viewWidth - 20} y={seatedY - 10} textAnchor="end" style={style}>Seated Eye Level (1200mm)</text>

                {/* Standing Eye Level */}
                <line x1={0} y1={standingY} x2={viewWidth} y2={standingY} stroke={COLORS.blue500} strokeWidth="2" strokeDasharray="10,10" opacity="0.6" />
                <text x={viewWidth - 20} y={standingY - 10} textAnchor="end" style={style}>Standing Eye Level (1500mm)</text>
            </g>
        );
    };

    const renderCamera = () => {
        if (!showCamera) return null;

        const camW = CAMERA_PHYSICAL_WIDTH;
        const camH = CAMERA_PHYSICAL_HEIGHT;
        const gap = CAMERA_DISPLAY_GAP;

        // Camera X: centered on the display group
        const camX = groupCenterX - (camW / 2);

        // Camera Y (top edge of camera bounding box)
        let camTopY: number;
        if (cameraPosition === 'bottom') {
            camTopY = displayBottomY + gap;
        } else {
            camTopY = displayTopY - gap - camH;
        }

        // Center Y of camera for the guide line and label
        const camCenterY = camTopY + (camH / 2);
        const camHeightMm = viewHeight - camCenterY;

        return (
            <g>
                {/* Guide line at camera center */}
                <line
                    x1={0}
                    y1={camCenterY}
                    x2={viewWidth}
                    y2={camCenterY}
                    stroke={COLORS.green500}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.5"
                />

                {/* Camera SVG wireframe */}
                <CameraObject
                    x={camX}
                    y={camTopY}
                    inverted={cameraInverted}
                />

                {/* Label */}
                <text
                    x={camX + camW + 20}
                    y={camCenterY}
                    alignmentBaseline="middle"
                    fill={COLORS.green500}
                    style={{ fontSize: '24px', fontFamily: FONTS.sans }}
                >
                    IV-CAM-P12-B ({Math.round(camHeightMm)}mm, {cameraPosition}{cameraInverted ? ', inverted' : ''})
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
