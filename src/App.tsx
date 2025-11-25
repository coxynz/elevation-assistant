
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Download, Ruler, Info, Monitor, LayoutTemplate, BoxSelect, Maximize, Wrench, Scan, ChevronDown, Eye, Video, AlertTriangle } from 'lucide-react';
import { ElevationDrawing } from './components/ElevationDrawing';
import { DiscasCalculator } from './components/DiscasCalculator';
import { DISPLAY_PRESETS, MOUNTING_SCENARIOS, WALL_HEIGHT, WALL_WIDTH, BRACKET_PRESETS } from './constants';
import { DisplayDimensions, InstallationSpecs, ScenarioType, MountingBracket, ViewMode, ValidationWarning, CameraPosition } from './types';


export default function App() {
  // State
  const [dimensions, setDimensions] = useState<DisplayDimensions>(DISPLAY_PRESETS[1].dimensions); // Default to 65"
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DISPLAY_PRESETS[1].id);

  const [mountingScenario, setMountingScenario] = useState<ScenarioType>('meeting-conference');

  // New State: Display Config
  const [displayCount, setDisplayCount] = useState<1 | 2>(1);

  // New State: Bracket
  const [selectedBracket, setSelectedBracket] = useState<MountingBracket>(BRACKET_PRESETS[1]); // Default to Chief LSM1U

  // New State: View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('front');

  // New State: Visual Guides
  const [showGuides, setShowGuides] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('bottom');

  // Export Menu State
  const [showExportMenu, setShowExportMenu] = useState(false);

  // New State: Room Dimensions
  const [roomDimensions, setRoomDimensions] = useState({
    width: WALL_WIDTH,
    height: WALL_HEIGHT
  });

  const [specs, setSpecs] = useState<InstallationSpecs>({
    afflValue: 1350,
    referencePoint: 'center'
  });

  const [warning, setWarning] = useState<ValidationWarning | null>(null);

  // Computed Values for Summary Panel
  const calculatedCenter = specs.referencePoint === 'center'
    ? specs.afflValue
    : specs.afflValue + (dimensions.height / 2);

  const calculatedBottom = specs.referencePoint === 'bottom'
    ? specs.afflValue
    : specs.afflValue - (dimensions.height / 2);

  const calculatedTop = calculatedBottom + dimensions.height;

  // Effects
  // When dimensions change OR scenario changes, if we aren't in manual mode, update the height
  const applyScenarioToSpecs = (scenId: ScenarioType, dims: DisplayDimensions, camPos: CameraPosition = cameraPosition) => {
    const scenario = MOUNTING_SCENARIOS.find(s => s.id === scenId);
    if (scenario && scenId !== 'general') {
      // Special handling for video-conference scenario
      if (scenId === 'video-conference') {
        const CAMERA_HEIGHT = 1100;
        const CAMERA_PHYSICAL_HEIGHT = 60; // Physical height of camera unit

        if (camPos === 'bottom') {
          // Camera flush below display: Display bottom = Camera center + (camera height / 2)
          setSpecs({
            afflValue: CAMERA_HEIGHT + (CAMERA_PHYSICAL_HEIGHT / 2),
            referencePoint: 'bottom'
          });
        } else {
          // Camera flush above display: Display top = Camera center - (camera height / 2)
          const displayTop = CAMERA_HEIGHT - (CAMERA_PHYSICAL_HEIGHT / 2);
          setSpecs({
            afflValue: displayTop - dims.height,
            referencePoint: 'bottom'
          });
        }
        setShowCamera(true);
      } else {
        // Standard scenario calculation
        const target = scenario.calculateTarget(dims.height);
        setSpecs({
          afflValue: target.value,
          referencePoint: target.reference
        });
      }
    }
  };

  // Validation Effect
  useEffect(() => {
    const scenario = MOUNTING_SCENARIOS.find(s => s.id === mountingScenario);
    if (scenario && scenario.validate) {
      const validationResult = scenario.validate(specs.afflValue, dimensions.height, specs.referencePoint);
      setWarning(validationResult);
    } else {
      setWarning(null);
    }
  }, [specs, dimensions, mountingScenario]);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    setSelectedPresetId(presetId);
    if (presetId !== 'custom') {
      const preset = DISPLAY_PRESETS.find(p => p.id === presetId);
      if (preset) {
        setDimensions(preset.dimensions);
        applyScenarioToSpecs(mountingScenario, preset.dimensions);
      }
    }
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newScenario = e.target.value as ScenarioType;
    setMountingScenario(newScenario);
    applyScenarioToSpecs(newScenario, dimensions);
  };

  const handleDimensionChange = (field: keyof DisplayDimensions, value: number) => {
    const newDims = {
      ...dimensions,
      [field]: value,
      name: 'Custom Size'
    };
    setDimensions(newDims);
    setSelectedPresetId('custom');
  };

  const handleSpecChange = (field: keyof InstallationSpecs, value: number | 'center' | 'bottom') => {
    setSpecs(prev => ({ ...prev, [field]: value }));
  };

  const handleBracketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bracket = BRACKET_PRESETS.find(b => b.id === e.target.value);
    if (bracket) setSelectedBracket(bracket);
  };

  const handleCameraPositionChange = (newPosition: CameraPosition) => {
    setCameraPosition(newPosition);
    // If in video-conference mode, recalculate display position
    if (mountingScenario === 'video-conference') {
      applyScenarioToSpecs('video-conference', dimensions, newPosition);
    }
  };



  const handleExportImage = (exportMode: ViewMode) => {
    setShowExportMenu(false);
    const svgId = exportMode === 'front' ? 'export-svg-front' : 'export-svg-backing';
    const svgElement = document.getElementById(svgId);

    if (!svgElement) {
      console.error("Could not find SVG element to export");
      return;
    }

    // Serialize the SVG
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    // Ensure XML namespace
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    // Create Blob
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Increase resolution for better quality
      const scale = 2;
      canvas.width = roomDimensions.width * scale;
      canvas.height = roomDimensions.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, roomDimensions.width, roomDimensions.height);

      const pngUrl = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `elevation-${exportMode}-${dimensions.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const activeScenario = MOUNTING_SCENARIOS.find(s => s.id === mountingScenario);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Hidden Render Instances for Export */}
      <div className="fixed -left-[9999px] invisible">
        <div style={{ width: roomDimensions.width, height: roomDimensions.height }}>
          <ElevationDrawing
            id="export-svg-front"
            dimensions={dimensions}
            specs={specs}
            scenario={mountingScenario}
            wallWidth={roomDimensions.width}
            wallHeight={roomDimensions.height}
            displayCount={displayCount}
            bracket={selectedBracket}
            viewMode="front"
            showGuides={showGuides}
            showCamera={showCamera}
            cameraPosition={cameraPosition}
          />
        </div>
        <div style={{ width: roomDimensions.width, height: roomDimensions.height }}>
          <ElevationDrawing
            id="export-svg-backing"
            dimensions={dimensions}
            specs={specs}
            scenario={mountingScenario}
            wallWidth={roomDimensions.width}
            wallHeight={roomDimensions.height}
            displayCount={displayCount}
            bracket={selectedBracket}
            viewMode="backing"
            showGuides={showGuides}
            showCamera={showCamera}
            cameraPosition={cameraPosition}
          />
        </div>
      </div>

      {/* Header */}
      <header className="flex-none h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blueprint-600 rounded-md text-white">
            <Ruler size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Elevation Architect</h1>
            <p className="text-xs text-slate-500">Corporate & Residential Installation Calculator</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Summary badges */}
          <div className="hidden xl:flex gap-4 text-sm font-medium text-slate-600 mr-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
            <span className="flex flex-col leading-none items-center"><span className="text-[10px] text-slate-400 uppercase">Top</span><strong className="text-slate-900">{Math.round(calculatedTop)}mm</strong></span>
            <span className="text-slate-300">|</span>
            <span className="flex flex-col leading-none items-center"><span className="text-[10px] text-slate-400 uppercase">Center</span><strong className="text-slate-900">{Math.round(calculatedCenter)}mm</strong></span>
            <span className="text-slate-300">|</span>
            <span className="flex flex-col leading-none items-center"><span className="text-[10px] text-slate-400 uppercase">Bottom</span><strong className="text-slate-900">{Math.round(calculatedBottom)}mm</strong></span>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('front')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'front' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Monitor size={14} /> Front View
            </button>
            <button
              onClick={() => setViewMode('backing')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'backing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Scan size={14} /> Mounting View
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium"
            >
              <Download size={16} />
              Export
              <ChevronDown size={14} />
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
                  <button
                    onClick={() => handleExportImage('front')}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Monitor size={14} className="text-slate-400" />
                    Front View (.png)
                  </button>
                  <button
                    onClick={() => handleExportImage('backing')}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <Scan size={14} className="text-slate-400" />
                    Mounting View (.png)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-96 flex-none bg-white border-r border-slate-200 flex flex-col overflow-y-auto z-20 shadow-lg">
          <div className="p-6 space-y-8">

            {/* Section 1: Use Case */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-semibold border-b pb-2">
                <LayoutTemplate size={18} />
                <h2>Installation Scenario</h2>
              </div>

              {/* Room Dims */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Wall Width (mm)</label>
                  <input
                    type="number"
                    value={roomDimensions.width}
                    onChange={(e) => setRoomDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-blueprint-500 focus:border-blueprint-500 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Ceiling Ht (mm)</label>
                  <input
                    type="number"
                    value={roomDimensions.height}
                    onChange={(e) => setRoomDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-blueprint-500 focus:border-blueprint-500 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Environment / Type</label>
                <select
                  value={mountingScenario}
                  onChange={handleScenarioChange}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-blueprint-500 focus:ring-blueprint-500 border p-2 text-sm bg-white text-slate-900"
                >
                  {MOUNTING_SCENARIOS.map(scenario => (
                    <option key={scenario.id} value={scenario.id}>{scenario.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2 italic">
                  {activeScenario?.description}
                </p>
              </div>
            </div>

            {/* Section 2: Display Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-semibold border-b pb-2">
                <Monitor size={18} />
                <h2>Display Specification</h2>
              </div>

              {/* Display Config Toggle */}
              <div className="flex rounded-md shadow-sm border border-slate-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDisplayCount(1)}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${displayCount === 1
                    ? 'bg-blueprint-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <BoxSelect size={14} /> Single
                </button>
                <div className="w-[1px] bg-slate-300"></div>
                <button
                  type="button"
                  onClick={() => setDisplayCount(2)}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${displayCount === 2
                    ? 'bg-blueprint-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <Maximize size={14} /> Dual
                </button>
              </div>

              {/* Presets */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Standard Sizes</label>
                <select
                  value={selectedPresetId}
                  onChange={handlePresetChange}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-blueprint-500 focus:ring-blueprint-500 border p-2 text-sm bg-white text-slate-900"
                >
                  {DISPLAY_PRESETS.map(preset => (
                    <option key={preset.id} value={preset.id}>{preset.label}</option>
                  ))}
                  <option value="custom">Custom Dimensions</option>
                </select>
              </div>

              {/* Bracket Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                  <Wrench size={14} /> Mounting Bracket
                </label>
                <select
                  value={selectedBracket.id}
                  onChange={handleBracketChange}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-blueprint-500 focus:ring-blueprint-500 border p-2 text-sm bg-white text-slate-900"
                >
                  {BRACKET_PRESETS.map(bracket => (
                    <option key={bracket.id} value={bracket.id}>{bracket.label}</option>
                  ))}
                </select>
              </div>



              {/* Manual Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={Math.round(dimensions.width)}
                    onChange={(e) => handleDimensionChange('width', Number(e.target.value))}
                    className="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-blueprint-500 focus:border-blueprint-500 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Height (mm)</label>
                  <input
                    type="number"
                    value={Math.round(dimensions.height)}
                    onChange={(e) => handleDimensionChange('height', Number(e.target.value))}
                    className="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-blueprint-500 focus:border-blueprint-500 bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Installation Specs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-semibold border-b pb-2">
                <Settings size={18} />
                <h2>Manual Adjustments</h2>
              </div>

              {/* Reference Point Toggle */}
              <div className="flex rounded-md shadow-sm border border-slate-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleSpecChange('referencePoint', 'center')}
                  className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${specs.referencePoint === 'center'
                    ? 'bg-blueprint-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  Center Line
                </button>
                <div className="w-[1px] bg-slate-300"></div>
                <button
                  type="button"
                  onClick={() => handleSpecChange('referencePoint', 'bottom')}
                  className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${specs.referencePoint === 'bottom'
                    ? 'bg-blueprint-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  Bottom Edge
                </button>
              </div>

              {/* Height Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Target AFFL (mm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={specs.afflValue}
                    onChange={(e) => handleSpecChange('afflValue', Number(e.target.value))}
                    className="w-full rounded-md border-slate-300 border p-2 pr-12 text-sm focus:ring-blueprint-500 focus:border-blueprint-500 font-bold text-slate-900 bg-white"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-slate-400 text-xs">mm</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Distance from Finished Floor Level (FFL) to the <strong>{specs.referencePoint}</strong> of the display.
                </p>
              </div>

              {/* Quick Info */}
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 flex gap-3 items-start">
                <Info className="text-yellow-600 mt-0.5 flex-none" size={16} />
                <div>
                  <h4 className="text-xs font-bold text-yellow-800 mb-1">Auto-Calculated</h4>
                  <p className="text-[10px] text-yellow-700 leading-relaxed">
                    The current height is optimized for <strong>{activeScenario?.label}</strong>. You can manually override it above.
                  </p>
                </div>
              </div>

              {/* Validation Warning */}
              {warning && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200 flex gap-3 items-start animate-pulse">
                  <AlertTriangle className="text-red-600 mt-0.5 flex-none" size={16} />
                  <div>
                    <h4 className="text-xs font-bold text-red-800 mb-1">Ergonomic Warning</h4>
                    <p className="text-[10px] text-red-700 leading-relaxed">
                      {warning.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Tools */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-semibold border-b pb-2">
                <Ruler size={18} />
                <h2>Tools & Guides</h2>
              </div>

              {/* Visual Toggles */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGuides(!showGuides)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${showGuides ? 'bg-blueprint-50 border-blueprint-200 text-blueprint-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <Eye size={14} /> Eye Levels
                </button>
                <button
                  onClick={() => setShowCamera(!showCamera)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${showCamera ? 'bg-blueprint-50 border-blueprint-200 text-blueprint-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <Video size={14} /> Camera
                </button>
              </div>

              {/* Camera Position Toggle (visible when camera is shown) */}
              {showCamera && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Camera Position</label>
                  <div className="flex rounded-md shadow-sm border border-slate-300 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleCameraPositionChange('bottom')}
                      className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${cameraPosition === 'bottom'
                        ? 'bg-blueprint-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      Below Display
                    </button>
                    <div className="w-[1px] bg-slate-300"></div>
                    <button
                      type="button"
                      onClick={() => handleCameraPositionChange('top')}
                      className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${cameraPosition === 'top'
                        ? 'bg-blueprint-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      Above Display
                    </button>
                  </div>
                </div>
              )}

              {/* Calculator */}
              <DiscasCalculator />
            </div>

          </div>

          <div className="p-6 mt-auto border-t border-slate-200 text-xs text-slate-400 text-center">
            Check manufacturer spec for exact VESA mount positions relative to center.
          </div>
        </aside>

        {/* Main Drawing Area */}
        <section className="flex-1 bg-slate-200/50 p-8 flex flex-col relative">
          <ElevationDrawing
            dimensions={dimensions}
            specs={specs}
            scenario={mountingScenario}
            wallWidth={roomDimensions.width}
            wallHeight={roomDimensions.height}
            displayCount={displayCount}
            bracket={selectedBracket}
            viewMode={viewMode}
            showGuides={showGuides}
            showCamera={showCamera}
            cameraPosition={cameraPosition}
          />

          <div className="absolute bottom-4 right-8 bg-white/90 backdrop-blur border border-slate-200 px-4 py-2 rounded-md shadow-sm text-xs text-slate-500 font-mono">
            View Scale: Auto-Fit (1:1)
          </div>
        </section>
      </main>
    </div>
  );
}
