
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
    quality: 0.9,
    format: ImageFormat.JPEG
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("Large file detected. Processing might take a moment.");
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
      alert("Processing error. Try local mode.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resizedUrl) return;
    const link = document.createElement('a');
    const ext = settings.format.split('/')[1];
    link.download = `pixelperfect-${Date.now()}.${ext}`;
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
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/30">
      {/* Dynamic Background Blur */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600 rounded-full blur-[150px]"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-[100] glass px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-lg font-extrabold tracking-tight text-white leading-none">PIXELPERFECT <span className="accent-text">STUDIO</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Professional Intelligence v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Enterprise</a>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              New Project
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-8 py-10">
        {!image ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in duration-700">
            <div className="text-center mb-16 max-w-3xl">
              <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
                Intelligent Media Optimization
              </div>
              <h2 className="text-6xl lg:text-8xl font-display font-extrabold mb-8 text-white tracking-tighter">
                Refine your visuals with <span className="accent-text">AI precision.</span>
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed font-medium">
                The high-fidelity choice for professional creators. Pure Lanczos resampling, Gemini-powered context analysis, and 100% data privacy.
              </p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-2xl relative group cursor-pointer"
            >
              <div className="absolute -inset-1 bg-accent rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[16/9] glass rounded-[2.5rem] flex flex-col items-center justify-center gap-8 group-hover:bg-slate-900/40 transition-all border-dashed border-2 border-slate-700 group-hover:border-indigo-500/50">
                <div className="w-24 h-24 rounded-3xl bg-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white mb-2 tracking-tight">Import Artwork</p>
                  <p className="text-sm text-slate-500 font-medium">Drop your RAW, PNG or JPG (Up to 25MB)</p>
                </div>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr_320px] gap-8 animate-in slide-in-from-bottom-10 duration-700">
            
            {/* Left Column: Config */}
            <aside className="space-y-6">
              <ResizeControls settings={settings} setSettings={setSettings} onResize={handleResize} isProcessing={isProcessing} aspectRatio={image.aspectRatio} />
              
              <div className="glass rounded-3xl p-5 border-l-4 border-l-indigo-500">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Editor Note</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  {processMode === 'server' ? 'Currently using remote Python engine for high-fidelity Lanczos resampling. Results are mathematically superior.' : 'Using local GPU acceleration. Ideal for quick drafts and real-time editing.'}
                </p>
              </div>
            </aside>

            {/* Middle Column: Canvas */}
            <section className="space-y-6">
              <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-950 flex flex-col h-full min-h-[700px]">
                <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Live View</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                    <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800">SOURCE: {image.originalDimensions.width}x{image.originalDimensions.height}</span>
                    <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800">TARGET: {settings.width}x{settings.height}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-95">
                  <div className="relative group p-2 glass rounded-2xl shadow-inner-2xl">
                    <img 
                      src={resizedUrl || image.previewUrl} 
                      alt="Preview" 
                      className="max-h-[60vh] object-contain shadow-2xl rounded-xl transition-all duration-1000 ease-in-out" 
                      style={{ 
                        width: resizedUrl ? `${settings.width}px` : 'auto', 
                        maxWidth: '100%' 
                      }} 
                    />
                    {!resizedUrl && <div className="absolute inset-0 bg-accent/5 pointer-events-none rounded-xl border-2 border-indigo-500/20 animate-pulse"></div>}
                  </div>

                  {resizedUrl && (
                    <div className="mt-12 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500/10 text-green-400 border border-green-500/20 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          Processing Verified
                        </div>
                      </div>
                      <button 
                        onClick={handleDownload} 
                        className="bg-white hover:bg-slate-100 text-slate-950 px-16 py-5 rounded-[2rem] font-bold flex items-center gap-4 shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all transform hover:-translate-y-2 active:scale-95 group"
                      >
                        <svg className="w-6 h-6 group-hover:bounce transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="text-lg">Download Studio Export</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Right Column: AI Insights */}
            <aside className="space-y-6">
              <div className="glass rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-20 h-20 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.464 15.464a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1z" /></svg>
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    AI Analysis
                  </h4>
                  {isAiLoading && (
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {isAiLoading ? (
                    [1, 2, 3, 4].map(i => (
                      <div key={i} className="h-20 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse"></div>
                    ))
                  ) : suggestions.length > 0 ? (
                    suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => applySuggestion(s)}
                        className="w-full text-left bg-slate-950 hover:bg-slate-900 border border-slate-800 p-4 rounded-2xl transition-all group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-indigo-500/5 translate-x-full group-hover:translate-x-0 transition-transform"></div>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <span className="text-[11px] font-bold text-slate-200 uppercase group-hover:text-indigo-400 transition-colors tracking-wide">{s.label}</span>
                          <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-300">{s.width}x{s.height}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic relative z-10">"{s.reason}"</p>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-10">
                       <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Waiting for data...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass rounded-3xl p-6 space-y-4">
                 <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Artwork Statistics</h5>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Original Ratio</span>
                      <span className="text-slate-200 font-mono">{image.aspectRatio.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">File Signature</span>
                      <span className="text-slate-200 font-mono">.{image.file.name.split('.').pop()?.toUpperCase()}</span>
                    </div>
                 </div>
              </div>
              
              <button 
                onClick={() => { setImage(null); setResizedUrl(null); }} 
                className="w-full py-4 text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] border border-slate-800/50 rounded-2xl transition-all hover:bg-slate-900/40"
              >
                Clear Project
              </button>
            </aside>
          </div>
        )}
      </main>

      {/* Modern Status Footer */}
      <footer className="glass border-t border-slate-800/50 py-3 px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${processMode ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {processMode ? 'System Optimal' : 'Engine Idle'}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <span className="text-[10px