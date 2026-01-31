
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
    <div className="glass rounded-3xl p-6 space-y-8 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-slate-100 tracking-tight">Dimensions</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Width</label>
             <span className="text-[10px] font-mono text-slate-400">PX</span>
          </div>
          <input
            type="number"
            value={settings.width}
            onChange={handleWidthChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Height</label>
             <span className="text-[10px] font-mono text-slate-400">PX</span>
          </div>
          <input
            type="number"
            value={settings.height}
            onChange={handleHeightChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800">
            <svg className={`w-4 h-4 ${settings.maintainAspectRatio ? 'text-indigo-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-300">Lock Aspect Ratio</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.maintainAspectRatio}
            onChange={(e) => setSettings(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gradient peer-checked:after:bg-white"></div>
        </label>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Output Format</label>
          <div className="grid grid-cols-3 gap-2">
            {[ImageFormat.JPEG, ImageFormat.PNG, ImageFormat.WEBP].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSettings(prev => ({ ...prev, format: fmt }))}
                className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                  settings.format === fmt 
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                {fmt.split('/')[1].toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Advanced Format Settings */}
        <div className="space-y-3 animate-in fade-in duration-300">
           {settings.format === ImageFormat.JPEG && (
             <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-300">Progressive Scan</span>
                  <span className="text-[9px] text-slate-500 italic leading-none">Improves web loading</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-75">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.progressiveJpeg}
                    onChange={(e) => setSettings(prev => ({ ...prev, progressiveJpeg: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
             </div>
           )}

           {settings.format === ImageFormat.PNG && (
             <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-300">Extreme Optimization</span>
                  <span className="text-[9px] text-slate-500 italic leading-none">Smaller size, slower render</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-75">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.optimizePng}
                    onChange={(e) => setSettings(prev => ({ ...prev, optimizePng: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
             </div>
           )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encoding Quality</label>
            <span className="text-xs font-mono font-bold text-indigo-400">{Math.round(settings.quality * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={settings.quality}
            onChange={(e) => setSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={onResize}
        disabled={isProcessing}
        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 group ${
          isProcessing 
            ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
            : 'bg-accent shadow-xl hover:shadow-indigo-500/20 text-white overflow-hidden relative'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="animate-pulse">Rendering...</span>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10">Export Artwork</span>
            <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin