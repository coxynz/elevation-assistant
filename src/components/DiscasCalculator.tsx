import React, { useState } from 'react';
import { Calculator, ArrowRightLeft, Info } from 'lucide-react';

type CalcMode = 'distance-to-size' | 'size-to-distance';
type ContentType = 'basic' | 'analytical';

export const DiscasCalculator: React.FC = () => {
    const [mode, setMode] = useState<CalcMode>('distance-to-size');
    const [contentType, setContentType] = useState<ContentType>('basic');
    const [inputValue, setInputValue] = useState<number>(5000); // Default 5m distance or 65" size

    // Constants based on AVIXA DISCAS
    // Basic Decision Making: Distance <= 6 * Image Height
    // Analytical Decision Making: Distance <= 4 * Image Height
    const FACTOR_BASIC = 6;
    const FACTOR_ANALYTICAL = 4;

    const calculateResult = () => {
        const factor = contentType === 'basic' ? FACTOR_BASIC : FACTOR_ANALYTICAL;

        if (mode === 'distance-to-size') {
            // Input is Viewing Distance (mm)
            // Formula: Image Height = Distance / Factor
            const minImageHeight = inputValue / factor;
            // Approx Diagonal (assuming 16:9) = Height / 0.49
            const minDiagonalMm = minImageHeight / 0.4903;
            const minDiagonalInch = minDiagonalMm / 25.4;

            return {
                label: 'Min Display Size',
                primary: `${Math.ceil(minDiagonalInch)}"`,
                secondary: `Height: ${Math.round(minImageHeight)}mm`
            };
        } else {
            // Input is Diagonal Size (inches)
            // Formula: Max Distance = Image Height * Factor
            const heightMm = (inputValue * 25.4) * 0.4903;
            const maxDistanceMm = heightMm * factor;

            return {
                label: 'Max Viewing Distance',
                primary: `${(maxDistanceMm / 1000).toFixed(1)}m`,
                secondary: `${Math.round(maxDistanceMm)}mm`
            };
        }
    };

    const result = calculateResult();

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Calculator size={16} className="text-blueprint-600" />
                <h3 className="text-sm font-semibold text-slate-800">DISCAS Calculator</h3>
            </div>

            <div className="p-4 space-y-4">
                {/* Mode Toggle */}
                <div className="flex rounded-md shadow-sm border border-slate-300 overflow-hidden">
                    <button
                        onClick={() => setMode('distance-to-size')}
                        className={`flex-1 px-2 py-1.5 text-[10px] font-medium transition-colors ${mode === 'distance-to-size' ? 'bg-blueprint-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Dist → Size
                    </button>
                    <div className="w-[1px] bg-slate-300"></div>
                    <button
                        onClick={() => setMode('size-to-distance')}
                        className={`flex-1 px-2 py-1.5 text-[10px] font-medium transition-colors ${mode === 'size-to-distance' ? 'bg-blueprint-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Size → Dist
                    </button>
                </div>

                {/* Content Type */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Content Type</label>
                    <select
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value as ContentType)}
                        className="w-full rounded-md border-slate-300 text-xs p-1.5 bg-white text-slate-900"
                    >
                        <option value="basic">Basic (Video, PPT)</option>
                        <option value="analytical">Analytical (Excel, CAD)</option>
                    </select>
                </div>

                {/* Input */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                        {mode === 'distance-to-size' ? 'Furthest Viewer (mm)' : 'Display Diagonal (inch)'}
                    </label>
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(Number(e.target.value))}
                        className="w-full rounded-md border-slate-300 border p-2 text-sm font-mono text-slate-900"
                    />
                </div>

                {/* Result */}
                <div className="bg-blueprint-50 rounded-md p-3 border border-blueprint-100 text-center">
                    <div className="text-xs text-blueprint-600 font-medium uppercase tracking-wider mb-1">{result.label}</div>
                    <div className="text-2xl font-bold text-blueprint-900">{result.primary}</div>
                    <div className="text-xs text-blueprint-400 mt-1">{result.secondary}</div>
                </div>

                <div className="flex gap-2 items-start text-[10px] text-slate-400 italic">
                    <Info size={12} className="mt-0.5 flex-none" />
                    <p>Based on AVIXA DISCAS V202.01:2016 standard for 2D image size.</p>
                </div>
            </div>
        </div>
    );
};
