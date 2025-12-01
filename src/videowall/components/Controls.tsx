import React, { useEffect, useState } from 'react';
import { WallConfiguration, ViewMode, MountingReference, MountingSystemType, DisplayPreset } from '../types';
import { DEFAULT_CONFIG, DISPLAY_PRESETS } from '../constants';
import { Settings, Monitor, Grid, Ruler, Eye, Box, ArrowUpDown, Settings2 } from 'lucide-react';

interface ControlsProps {
  config: WallConfiguration;
  onChange: (config: WallConfiguration) => void;

  onAddFlushbox: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  roomDimensions: { width: number; height: number };
  onRoomDimensionsChange: (dims: { width: number; height: number }) => void;
  warnings?: { width: boolean; height: boolean };
}

// Helper component to handle numeric input state nicely
const BufferedNumberInput = ({
  value,
  onChange,
  float = false,
  className,
  ...props
}: {
  value: number;
  onChange: (val: number) => void;
  float?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => {

  const [strVal, setStrVal] = useState(isNaN(value) ? '' : value.toString());

  useEffect(() => {
    const currentParsed = float ? parseFloat(strVal) : parseInt(strVal, 10);
    const propVal = value;

    const mismatch = propVal !== currentParsed && !(isNaN(propVal) && isNaN(currentParsed));

    if (mismatch) {
      setStrVal(isNaN(propVal) ? '' : propVal.toString());
    }
  }, [value, float, strVal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setStrVal(newVal);

    if (newVal === '') {
      onChange(NaN);
      return;
    }

    const parsed = float ? parseFloat(newVal) : parseInt(newVal, 10);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <input
      type="number"
      className={className}
      value={strVal}
      onChange={handleChange}
      {...props}
    />
  );
};

export const Controls: React.FC<ControlsProps> = ({
  config,
  onChange,

  onAddFlushbox,
  showGuides,
  onToggleGuides,
  roomDimensions,
  onRoomDimensionsChange,
  warnings
}) => {

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    const preset = DISPLAY_PRESETS.find(p => p.id === presetId);
    if (preset) {
      onChange({ ...config, display: { ...preset } });
    }
  };

  const handleDisplayDimChange = (field: keyof DisplayPreset, value: number) => {
    onChange({
      ...config,
      display: {
        ...config.display,
        id: 'custom',
        label: 'Custom Size',
        [field]: value
      }
    });
  };

  const handleChange = (field: keyof WallConfiguration, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const inputClass = "w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all";

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 overflow-y-auto w-96 flex-shrink-0 shadow-xl z-20">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Monitor className="w-6 h-6 text-blue-600" />
          VideoWall Arch
        </h1>
        <p className="text-sm text-slate-500 mt-1">Elevation Calculator & Visualizer</p>
      </div>



      <div className="flex-1 p-6 space-y-8">

        {/* Mounting System Selection */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold pb-2 border-b border-slate-100">
            <Box className="w-4 h-4" />
            <h3>Mounting System</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">System Type</label>
            <select
              value={config.mountingSystem}
              onChange={(e) => handleChange('mountingSystem', e.target.value)}
              className={inputClass}
            >
              <option value={MountingSystemType.VOGELS_CONNECT_IT}>Vogel's Connect-it</option>
            </select>
          </div>
        </section>

        {/* Display Specs */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold pb-2 border-b border-slate-100">
            <Settings2 className="w-4 h-4" />
            <h3>Display Specifications</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Preset Model</label>
            <select
              value={config.display.id === 'custom' ? 'custom' : config.display.id}
              onChange={handlePresetChange}
              className={inputClass}
            >
              {DISPLAY_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Width (mm)</label>
              <BufferedNumberInput
                float
                value={config.display.width}
                onChange={(val) => handleDisplayDimChange('width', val)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Height (mm)</label>
              <BufferedNumberInput
                float
                value={config.display.height}
                onChange={(val) => handleDisplayDimChange('height', val)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Depth (mm)</label>
              <BufferedNumberInput
                float
                value={config.display.depth}
                onChange={(val) => handleDisplayDimChange('depth', val)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
              <BufferedNumberInput
                float
                value={config.display.weight}
                onChange={(val) => handleDisplayDimChange('weight', val)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Wall Layout */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold pb-2 border-b border-slate-100">
            <Grid className="w-4 h-4" />
            <h3>Array Configuration</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Columns (W)</label>
              <BufferedNumberInput
                value={config.cols}
                onChange={(val) => handleChange('cols', val)}
                min="1" max="20"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rows (H)</label>
              <BufferedNumberInput
                value={config.rows}
                onChange={(val) => handleChange('rows', val)}
                min="1" max="20"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bezel Gap (mm)</label>
            <BufferedNumberInput
              float
              step="0.1"
              value={config.gap}
              onChange={(val) => handleChange('gap', val)}
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-1">Total combined gap between active areas</p>
          </div>
        </section>

        {/* Mounting */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold pb-2 border-b border-slate-100">
            <ArrowUpDown className="w-4 h-4" />
            <h3>Installation Height</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reference Point</label>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="text-blue-600 focus:ring-blue-600 cursor-pointer"
                  name="mountRef"
                  checked={config.mountingReference === MountingReference.FLOOR_TO_BOTTOM}
                  onChange={() => handleChange('mountingReference', MountingReference.FLOOR_TO_BOTTOM)}
                />
                <span className="ml-2 text-sm text-slate-600">AFFL to Bottom Edge</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="text-blue-600 focus:ring-blue-600 cursor-pointer"
                  name="mountRef"
                  checked={config.mountingReference === MountingReference.FLOOR_TO_CENTER}
                  onChange={() => handleChange('mountingReference', MountingReference.FLOOR_TO_CENTER)}
                />
                <span className="ml-2 text-sm text-slate-600">AFFL to Wall Center</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="text-blue-600 focus:ring-blue-600 cursor-pointer"
                  name="mountRef"
                  checked={config.mountingReference === MountingReference.FLOOR_TO_TOP}
                  onChange={() => handleChange('mountingReference', MountingReference.FLOOR_TO_TOP)}
                />
                <span className="ml-2 text-sm text-slate-600">AFFL to Top Edge</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Height Value (mm)</label>
            <BufferedNumberInput
              float
              value={config.mountingValue}
              onChange={(val) => handleChange('mountingValue', val)}
              className={inputClass}
            />
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Room Dimensions Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold pb-2 border-b border-slate-100">
            <Ruler className="w-4 h-4" />
            <h3>Room Dimensions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${warnings?.width ? 'text-red-600' : 'text-slate-700'}`}>
                Wall Width (mm) {warnings?.width && '(Too Small)'}
              </label>
              <BufferedNumberInput
                float
                value={roomDimensions.width}
                onChange={(val) => onRoomDimensionsChange({ ...roomDimensions, width: val })}
                className={`${inputClass} ${warnings?.width ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50' : ''}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${warnings?.height ? 'text-red-600' : 'text-slate-700'}`}>
                Ceiling Ht (mm) {warnings?.height && '(Too Small)'}
              </label>
              <BufferedNumberInput
                float
                value={roomDimensions.height}
                onChange={(val) => onRoomDimensionsChange({ ...roomDimensions, height: val })}
                className={`${inputClass} ${warnings?.height ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50' : ''}`}
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Extras Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Settings className="w-5 h-5" />
            <h2 className="font-bold text-lg">Extras</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={onToggleGuides}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${showGuides
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Eye size={16} />
                Show Eye Levels
              </span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${showGuides ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showGuides ? 'left-4.5' : 'left-0.5'}`} style={{ left: showGuides ? '18px' : '2px' }} />
              </div>
            </button>

            <button
              onClick={onAddFlushbox}
              className="w-full py-2 px-4 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2"
            >
              <Box size={16} />
              Add Flushbox
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};