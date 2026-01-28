
import React from 'react';
import { ResizeSettings, ImageFormat } from '../types';

interface ResizeControlsProps {
  settings: ResizeSettings;
  setSettings: React.Dispatch<React.SetStateAction<ResizeSettings>>;
  onResize: () => void;
  isProcessing: boolean;
  aspectRatio: number;
}

export const ResizeControls: React.FC<ResizeControlsProps> = ({
  settings,
  setSettings,
  onResize,
  isProcessing,
  aspectRatio
}) => {
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value) || 0;
    if (settings.maintainAspectRatio) {
      setSettings(prev => ({ ...prev, width, height: Math.round(width / aspectRatio) }));
    } else {
      setSettings(prev => ({ ...prev, width }));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const height = parseInt(e.target.value) || 0;
    if (settings.maintainAspectRatio) {
      setSettings(prev => ({ ...prev, height, width: Math.round(height * aspectRatio) }));
    } else {
      setSettings(prev => ({ ...prev, height }));
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Resizing Configuration
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Width (px)</label>
          <input
            type="number"
            value={settings.width}
            onChange={handleWidthChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Height (px)</label>
          <input
            type="number"
            value={settings.height}
            onChange={handleHeightChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 py-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.maintainAspectRatio}
            onChange={(e) => setSettings(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          <span className="ml-3 text-sm font-medium text-slate-300">Lock Aspect Ratio</span>
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Format</label>
        <select
          value={settings.format}
          onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as ImageFormat }))}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value={ImageFormat.JPEG}>JPEG</option>
          <option value={ImageFormat.PNG}>PNG</option>
          <option value={ImageFormat.WEBP}>WEBP</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quality</label>
          <span className="text-xs font-bold text-indigo-400">{Math.round(settings.quality * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={settings.quality}
          onChange={(e) => setSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      <button
        onClick={onResize}
        disabled={isProcessing}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
          isProcessing 
            ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'
        }`}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Resize & Optimize
          </>
        )}
      </button>
    </div>
  );
};
