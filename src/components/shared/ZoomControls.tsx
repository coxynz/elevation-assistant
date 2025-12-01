import React from 'react';

interface ZoomControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    zoomLevel: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
    onZoomIn,
    onZoomOut,
    onReset,
    zoomLevel
}) => {
    return (
        <div className="absolute bottom-4 left-8 flex flex-col gap-2">
            <button
                onClick={onZoomIn}
                className="w-10 h-10 bg-white/90 backdrop-blur border border-slate-200 rounded-md shadow-sm hover:bg-white transition-colors flex items-center justify-center text-slate-700 font-bold text-lg"
                title="Zoom In"
            >
                +
            </button>
            <button
                onClick={onZoomOut}
                className="w-10 h-10 bg-white/90 backdrop-blur border border-slate-200 rounded-md shadow-sm hover:bg-white transition-colors flex items-center justify-center text-slate-700 font-bold text-lg"
                title="Zoom Out"
            >
                −
            </button>
            <button
                onClick={onReset}
                className="w-10 h-10 bg-white/90 backdrop-blur border border-slate-200 rounded-md shadow-sm hover:bg-white transition-colors flex items-center justify-center text-slate-700 text-sm"
                title="Reset View"
            >
                ⟲
            </button>
            <div className="w-10 h-10 bg-white/90 backdrop-blur border border-slate-200 rounded-md shadow-sm flex items-center justify-center text-slate-600 text-[10px] font-mono">
                {Math.round(zoomLevel * 100)}%
            </div>
        </div>
    );
};
