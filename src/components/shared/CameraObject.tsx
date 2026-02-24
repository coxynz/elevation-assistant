import React from 'react';
import { SVG_COLORS as COLORS } from '../../constants/svgStyles';

interface CameraObjectProps {
    x: number;
    y: number;
    inverted?: boolean;
}

/**
 * Crestron 1 Beyond P12 PTZ Camera — Front-view SVG wireframe.
 * 226mm W × 166mm H. Traced from the official front-view technical drawing.
 */
export const CameraObject: React.FC<CameraObjectProps> = ({
    x,
    y,
    inverted = false
}) => {
    const W = 226;
    const H = 166;
    const stroke = COLORS.slate800;
    const sw = 2.5;

    // ── Layout zones ──
    const baseH = 22;
    const baseY = H - baseH;

    // Lens center
    const cx = W / 2;
    const cy = 62;

    // Transform for inversion
    const transform = inverted
        ? `translate(${x}, ${y}) scale(1, -1) translate(0, ${-H})`
        : `translate(${x}, ${y})`;

    return (
        <g transform={transform}>
            {/* ── Camera head body (organic rounded shape) ── */}
            <path
                d={`
                    M 62,${baseY}
                    L 62,100
                    C 62,46  42,12  ${cx - 30},8
                    Q ${cx},2  ${cx + 30},8
                    C ${W - 42},12  ${W - 62},46  ${W - 62},100
                    L ${W - 62},${baseY}
                `}
                fill="none"
                stroke={stroke}
                strokeWidth={sw}
                strokeLinejoin="round"
            />

            {/* ── Left yoke arm ── */}
            <path
                d={`
                    M 30,${baseY}
                    L 30,90
                    C 30,36  44,10  72,10
                `}
                fill="none"
                stroke={stroke}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d={`
                    M 48,${baseY}
                    L 48,88
                    C 48,44  56,18  78,16
                `}
                fill="none"
                stroke={stroke}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Left arm top cap */}
            <path d="M 72,10 Q 75,13 78,16" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />

            {/* ── Right yoke arm (mirrored) ── */}
            <path
                d={`
                    M ${W - 30},${baseY}
                    L ${W - 30},90
                    C ${W - 30},36  ${W - 44},10  ${W - 72},10
                `}
                fill="none"
                stroke={stroke}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d={`
                    M ${W - 48},${baseY}
                    L ${W - 48},88
                    C ${W - 48},44  ${W - 56},18  ${W - 78},16
                `}
                fill="none"
                stroke={stroke}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Right arm top cap */}
            <path d={`M ${W - 72},10 Q ${W - 75},13 ${W - 78},16`} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />

            {/* Pivot screws */}
            <circle cx={39} cy={baseY - 8} r={3} fill={stroke} />
            <circle cx={W - 39} cy={baseY - 8} r={3} fill={stroke} />

            {/* ── Base bar ── */}
            <rect
                x={2} y={baseY} width={W - 4} height={baseH}
                rx={5} fill="none" stroke={stroke} strokeWidth={sw}
            />
            <line
                x1={45} y1={baseY + baseH * 0.5}
                x2={W - 45} y2={baseY + baseH * 0.5}
                stroke={stroke} strokeWidth={1} opacity={0.3}
            />

            {/* ── Lens rings ── */}
            <circle cx={cx} cy={cy} r={44} fill="none" stroke={stroke} strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={34} fill="none" stroke={stroke} strokeWidth={1.5} />
            <circle cx={cx} cy={cy} r={21} fill={COLORS.slate200} stroke={stroke} strokeWidth={1.5} />
            <circle cx={cx} cy={cy} r={8} fill={COLORS.slate800} />

            {/* ── IR LEDs ── */}
            {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i * 20) * (Math.PI / 180);
                const r = 39;
                return (
                    <circle
                        key={i}
                        cx={cx + r * Math.cos(angle)}
                        cy={cy + r * Math.sin(angle)}
                        r={1.5}
                        fill={stroke}
                        opacity={0.2}
                    />
                );
            })}

            {/* Status LED */}
            <circle cx={16} cy={baseY + baseH / 2} r={2} fill={COLORS.green500} opacity={0.6} />
        </g>
    );
};
