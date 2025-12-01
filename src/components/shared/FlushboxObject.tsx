import React from 'react';
import { SVG_COLORS as COLORS, SVG_FONTS as FONTS } from '../../constants/svgStyles';
import { Flushbox } from '../../types';

interface FlushboxObjectProps {
    box: Flushbox;
    viewHeight: number;
    isDragging: boolean;
    onMouseDown: (e: React.MouseEvent, id: string) => void;
    index: number;
}

export const FlushboxObject: React.FC<FlushboxObjectProps> = ({
    box,
    viewHeight,
    isDragging,
    onMouseDown,
    index
}) => {
    const elevation = Math.round(viewHeight - (box.y + (box.height / 2)));
    // Calculate stepped offset for dimension lines to avoid overlaps
    const dimensionOffset = -80 - (index * 150); // Each flushbox steps out 150mm

    return (
        <g
            transform={`translate(${box.x}, ${box.y})`}
            onMouseDown={(e) => onMouseDown(e, box.id)}
            onTouchStart={(e) => onMouseDown(e as any, box.id)}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {/* Box */}
            <rect
                width={box.width}
                height={box.height}
                fill={COLORS.white}
                stroke={COLORS.orange500}
                strokeWidth="2"
                rx="4"
            />

            {/* Label */}
            <text
                x={box.width / 2}
                y={box.height / 2}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={COLORS.orange500}
                style={{ fontSize: '20px', fontFamily: FONTS.mono, fontWeight: 'bold', pointerEvents: 'none' }}
            >
                {box.label}
            </text>

            {/* Dimension line from floor to flushbox center */}
            <g pointerEvents="none">
                {/* Horizontal leader line from box to dimension line */}
                <line
                    x1={box.width / 2}
                    y1={box.height / 2}
                    x2={box.width / 2 + dimensionOffset}
                    y2={box.height / 2}
                    stroke={COLORS.orange500}
                    strokeWidth="2"
                    strokeDasharray="8,8"
                />
                {/* Dimension line from floor to flushbox center */}
                <line
                    x1={box.width / 2 + dimensionOffset}
                    y1={viewHeight - box.y}
                    x2={box.width / 2 + dimensionOffset}
                    y2={box.height / 2}
                    stroke={COLORS.orange500}
                    strokeWidth="3"
                />
                {/* Top tick mark */}
                <line
                    x1={box.width / 2 + dimensionOffset - 30}
                    y1={box.height / 2}
                    x2={box.width / 2 + dimensionOffset + 30}
                    y2={box.height / 2}
                    stroke={COLORS.orange500}
                    strokeWidth="3"
                />
                {/* Bottom tick mark */}
                <line
                    x1={box.width / 2 + dimensionOffset - 30}
                    y1={viewHeight - box.y}
                    x2={box.width / 2 + dimensionOffset + 30}
                    y2={viewHeight - box.y}
                    stroke={COLORS.orange500}
                    strokeWidth="3"
                />
                {/* Dimension text */}
                <text
                    x={box.width / 2 + dimensionOffset - 35}
                    y={(box.height / 2 + (viewHeight - box.y)) / 2}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill={COLORS.orange500}
                    style={{ fontSize: '24px', fontFamily: FONTS.mono, fontWeight: 500 }}
                    transform={`rotate(-90 ${box.width / 2 + dimensionOffset - 35} ${(box.height / 2 + (viewHeight - box.y)) / 2})`}
                >
                    AFFL (Center): {elevation}mm
                </text>
            </g>
        </g>
    );
};
