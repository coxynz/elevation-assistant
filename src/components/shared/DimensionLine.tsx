import React from 'react';
import { SVG_COLORS as COLORS, SVG_FONTS as FONTS } from '../../constants/svgStyles';

interface DimensionLineProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label: string;
    offset?: number;
    vertical?: boolean;
    onMouseDown?: (e: React.MouseEvent) => void;
    isDragging?: boolean;
    color?: string;
}

export const DimensionLine: React.FC<DimensionLineProps> = ({
    x1,
    y1,
    x2,
    y2,
    label,
    offset = 0,
    vertical = false,
    onMouseDown,
    isDragging = false,
    color = COLORS.slate800
}) => {
    const tickSize = 60;
    const textOffset = 70;
    const style = {
        fontFamily: FONTS.mono,
        fontSize: '36px',
        fontWeight: 500,
        fill: color,
        cursor: onMouseDown ? (isDragging ? 'grabbing' : 'grab') : 'default'
    };

    if (vertical) {
        const lineX = x1 + offset;
        return (
            <g onMouseDown={onMouseDown} style={{ cursor: style.cursor }}>
                {/* Dashed extension lines if offset is significant */}
                {Math.abs(offset) > 0 && (
                    <>
                        <line x1={x1} y1={y1} x2={lineX} y2={y1} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
                        <line x1={x2} y1={y2} x2={lineX} y2={y2} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
                    </>
                )}

                <line x1={lineX} y1={y1} x2={lineX} y2={y2} stroke={color} strokeWidth="3" />
                <line x1={lineX - tickSize / 2} y1={y1} x2={lineX + tickSize / 2} y2={y1} stroke={color} strokeWidth="3" />
                <line x1={lineX - tickSize / 2} y1={y2} x2={lineX + tickSize / 2} y2={y2} stroke={color} strokeWidth="3" />
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
            <g onMouseDown={onMouseDown} style={{ cursor: style.cursor }}>
                {/* Dashed extension lines if offset is significant */}
                {Math.abs(offset) > 0 && (
                    <>
                        <line x1={x1} y1={y1} x2={x1} y2={lineY} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
                        <line x1={x2} y1={y2} x2={x2} y2={lineY} stroke={COLORS.slate400} strokeDasharray="15,15" strokeWidth="2" />
                    </>
                )}

                <line x1={x1} y1={lineY} x2={x2} y2={lineY} stroke={color} strokeWidth="3" />
                <line x1={x1} y1={lineY - tickSize / 2} x2={x1} y2={lineY + tickSize / 2} stroke={color} strokeWidth="3" />
                <line x1={x2} y1={lineY - tickSize / 2} x2={x2} y2={lineY + tickSize / 2} stroke={color} strokeWidth="3" />
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
