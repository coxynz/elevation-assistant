import React from 'react';
import { Monitor, Grid3X3 } from 'lucide-react';

interface SplashScreenProps {
    onSelectMode: (mode: 'standard' | 'videowall') => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onSelectMode }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Elevation Architect
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Select your workspace to begin
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Standard Display Option */}
                    <button
                        onClick={() => onSelectMode('standard')}
                        className="group relative bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                <Monitor className="w-8 h-8 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-3">
                                Standard Display
                            </h2>
                            <p className="text-slate-400 leading-relaxed">
                                Configure single display elevations with precise mounting heights, camera positions, and detailed dimensions.
                            </p>
                        </div>
                    </button>

                    {/* Video Wall Option */}
                    <button
                        onClick={() => onSelectMode('videowall')}
                        className="group relative bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-purple-500/50 rounded-2xl p-8 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                                <Grid3X3 className="w-8 h-8 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-3">
                                Video Wall
                            </h2>
                            <p className="text-slate-400 leading-relaxed">
                                Design complex video wall arrays with automatic calculations for dimensions, power requirements, and mounting points.
                            </p>
                        </div>
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-500 text-sm">
                        v0.1.0 • Elevation Assistant Suite
                    </p>
                </div>
            </div>
        </div>
    );
};
