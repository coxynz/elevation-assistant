import React, { useState } from 'react';
import { Download, ChevronDown, Monitor, Scan } from 'lucide-react';

interface ExportMenuProps {
    onExport: (mode: 'front' | 'backing') => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ onExport }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium"
            >
                <Download size={16} />
                Export
                <ChevronDown size={14} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
                        <button
                            onClick={() => {
                                onExport('front');
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                            <Monitor size={14} className="text-slate-400" />
                            Front View (.png)
                        </button>
                        <button
                            onClick={() => {
                                onExport('backing');
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                        >
                            <Scan size={14} className="text-slate-400" />
                            Mounting View (.png)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
