
import React, { useState, useRef } from 'react';
import { ImageDataState, ResizeSettings, ImageFormat, GeminiSuggestion } from './types';
import { getFileMetadata, resizeImage } from './services/imageProcessor';
import { getSmartSuggestions } from './services/geminiService';
import { ResizeControls } from './components/ResizeControls';

const App: React.FC = () => {
  const [image, setImage] = useState<ImageDataState | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMode, setProcessMode] = useState<'server' | 'client' | null>(null);
  const [suggestions, setSuggestions] = useState<GeminiSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [settings, setSettings] = useState<ResizeSettings>({
    width: 0,
    height: 0,
    maintainAspectRatio: true,
    quality: 0.8,
    format: ImageFormat.JPEG
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large! Please choose an image under 15MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const metadata = await getFileMetadata(file);

    setImage({
      file,
      previewUrl,
      originalDimensions: { width: metadata.width, height: metadata.height },
      currentDimensions: { width: metadata.width, height: metadata.height },
      aspectRatio: metadata.aspectRatio,
      format: file.type as ImageFormat
    });

    setSettings(prev => ({
      ...prev,
      width: metadata.width,
      height: metadata.height,
      format: file.type.includes('png') ? ImageFormat.PNG : ImageFormat.JPEG
    }));

    setResizedUrl(null);
    setProcessMode(null);
    setSuggestions([]);

    setIsAiLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const aiSuggestions = await getSmartSuggestions(base64String, file.type);
      setSuggestions(aiSuggestions);
      setIsAiLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleResize = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const result = await resizeImage(image.previewUrl, settings, image.file);
      setResizedUrl(result.url);
      setProcessMode(result.mode);
    } catch (error) {
      console.error(error);
      alert("Resize failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resizedUrl) return;
    const link = document.createElement('a');
    const ext = settings.format.split('/')[1];
    link.download = `resized-image-${Date.now()}.${ext}`;
    link.href = resizedUrl;
    link.click();
  };

  const applySuggestion = (s: GeminiSuggestion) => {
    setSettings(prev => ({
      ...prev,
      width: s.width,
      height: s.height,
      maintainAspectRatio: false
    }));
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-white">PixelPerfect <span className="text-indigo-400">Pro</span></h1>
              <p className="text-xs text-slate-400 font-medium">Full-Stack AI Image Resizer</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
               <div className={`w-2 h-2 rounded-full ${processMode === 'server' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-600'}`}></div>
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Backend Node</span>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              New Project
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {!image ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-6 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent leading-tight">
                High Performance Image Resizing.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Professional tools for creators. Powered by a Python backend for precision Lanczos resampling and Gemini AI for smart aspect ratio suggestions.
              </p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-xl aspect-[16/9] border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-6 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all cursor-pointer group bg-slate-800/20"
            >
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-slate-400 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white mb-1">Click to browse or drop image</p>
                <p className="text-sm text-slate-500">Supports PNG, JPG, WebP (Max 15MB)</p>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-6">
              <ResizeControls settings={settings} setSettings={setSettings} onResize={handleResize} isProcessing={isProcessing} aspectRatio={image.aspectRatio} />
              
              <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.464 15.464a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1z" /></svg>
                    AI Suggestions
                  </h4>
                  {isAiLoading && <div className="animate-pulse w-2 h-2 rounded-full bg-indigo-500"></div>}
                </div>
                <div className="space-y-3">
                  {isAiLoading ? [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse"></div>) : suggestions.map((s, idx) => (
                    <button key={idx} onClick={() => applySuggestion(s)} className="w-full text-left bg-slate-800/40 hover:bg-slate-800 border border-slate-700 p-3 rounded-xl transition-all group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold text-white group-hover:text-indigo-400">{s.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{s.width}x{s.height}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{s.reason}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => { setImage(null); setResizedUrl(null); }} className="w-full py-3 text-slate-400 hover:text-white text-sm font-medium border border-transparent hover:border-slate-800 rounded-xl transition-all">Start over</button>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="flex border-b border-slate-800 bg-slate-900/50">
                  <button className="py-4 px-8 text-sm font-semibold border-b-2 border-indigo-500 bg-indigo-500/5 text-white">Editor Canvas</button>
                  <div className="flex-1 py-4 px-6 text-[10px] text-slate-500 flex items-center justify-end gap-4 font-mono">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> SRC: {image.originalDimensions.width}x{image.originalDimensions.height}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> OUT: {settings.width}x{settings.height}</span>
                  </div>
                </div>

                <div className="p-8 flex flex-col items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]">
                  <div className="relative group max-w-full">
                    <img src={resizedUrl || image.previewUrl} alt="Preview" className="max-h-[65vh] object-contain shadow-2xl rounded-lg transition-all duration-700 ease-out" style={{ width: resizedUrl ? `${settings.width}px` : 'auto', maxWidth: '100%' }} />
                    {!resizedUrl && <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none rounded-lg border-2 border-indigo-500/20"></div>}
                  </div>

                  {resizedUrl && (
                    <div className="mt-10 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          Ready for Download
                        </div>
                        <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border ${processMode === 'server' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {processMode === 'server' ? 'HQ Server Resampled' : 'Client-Side Canvas'}
                        </div>
                      </div>
                      <button onClick={handleDownload} className="bg-white hover:bg-slate-100 text-slate-900 px-12 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Resized File
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[ {l: 'Format', v: `.${image.file.name.split('.').pop()?.toUpperCase()}`}, {l: 'Aspect Ratio', v: `${image.aspectRatio.toFixed(2)}:1`}, {l: 'Backend Status', v: processMode ? 'Connected' : 'Local Only'} ].map((item, i) => (
                  <div key={i} className="bg-slate-800/30 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{item.l}</p>
                    <p className="text-lg font-bold text-white">{item.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-800/50 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs">© 2024 PixelPerfect Pro. Hybrid Full-Stack Architecture.</p>
          <div className="flex gap-6 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
