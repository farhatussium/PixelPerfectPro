
import React, { useState, useRef, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { ImageDataState, ResizeSettings, ImageFormat, GeminiSuggestion, CropArea } from './types';
import { getFileMetadata, resizeImage } from './services/imageProcessor';
import { getSmartSuggestions, editImageWithAi } from './services/geminiService';
import { ResizeControls } from './components/ResizeControls';

const App: React.FC = () => {
  const [image, setImage] = useState<ImageDataState | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMode, setProcessMode] = useState<'server' | 'client' | null>(null);
  const [suggestions, setSuggestions] = useState<GeminiSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Cropper State
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [settings, setSettings] = useState<ResizeSettings>({
    width: 0,
    height: 0,
    maintainAspectRatio: true,
    quality: 0.9,
    format: ImageFormat.JPEG,
    crop: undefined
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImageState = async (file: File | Blob, url: string) => {
    const metadata = await getFileMetadata(file as File);
    const newFile = file instanceof File ? file : new File([file], "ai-edit.png", { type: 'image/png' });

    setImage({
      file: newFile,
      previewUrl: url,
      originalDimensions: { width: metadata.width, height: metadata.height },
      currentDimensions: { width: metadata.width, height: metadata.height },
      aspectRatio: metadata.aspectRatio,
      format: newFile.type as ImageFormat
    });

    setSettings(prev => ({
      ...prev,
      width: metadata.width,
      height: metadata.height,
      format: newFile.type.includes('png') ? ImageFormat.PNG : ImageFormat.JPEG,
      crop: undefined
    }));

    setResizedUrl(null);
    setProcessMode(null);
    setIsCropping(false);

    setIsAiLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const aiSuggestions = await getSmartSuggestions(base64String, newFile.type);
      setSuggestions(aiSuggestions);
      setIsAiLoading(false);
    };
    reader.readAsDataURL(newFile);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    await updateImageState(file, previewUrl);
  };

  const handleMagicEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !editPrompt.trim() || isEditing) return;

    setIsEditing(true);
    try {
      // Use the current preview (or resized version) as the base for the edit
      const currentImageToEdit = resizedUrl || image.previewUrl;
      const editedBase64 = await editImageWithAi(currentImageToEdit, image.format, editPrompt);
      
      const res = await fetch(editedBase64);
      const blob = await res.blob();
      const newUrl = URL.createObjectURL(blob);
      
      await updateImageState(blob, newUrl);
      setEditPrompt('');
    } catch (error) {
      console.error(error);
      alert("AI Edit failed. Please try a different prompt.");
    } finally {
      setIsEditing(false);
    }
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

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyCrop = () => {
    if (croppedAreaPixels && image) {
      setSettings(prev => ({
        ...prev,
        width: Math.round(croppedAreaPixels.width),
        height: Math.round(croppedAreaPixels.height),
        crop: {
          x: croppedAreaPixels.x,
          y: croppedAreaPixels.y,
          width: croppedAreaPixels.width,
          height: croppedAreaPixels.height
        }
      }));
      setIsCropping(false);
      setResizedUrl(null);
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
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600 rounded-full blur-[150px]"></div>
      </div>

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
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">AI Multimedia Engine v2.5</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              New Project
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-8 py-10">
        {!image ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in duration-700 text-center">
            <div className="mb-16 max-w-3xl">
              <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
                Intelligent Media Optimization
              </div>
              <h2 className="text-6xl lg:text-8xl font-display font-extrabold mb-8 text-white tracking-tighter">
                Refine your visuals with <span className="accent-text">AI precision.</span>
              </h2>
            </div>

            <div onClick={() => fileInputRef.current?.click()} className="w-full max-w-2xl relative group cursor-pointer">
              <div className="absolute -inset-1 bg-accent rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[16/9] glass rounded-[2.5rem] flex flex-col items-center justify-center gap-8 group-hover:bg-slate-900/40 transition-all border-dashed border-2 border-slate-700">
                <div className="w-24 h-24 rounded-3xl bg-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-center px-6">
                  <p className="text-2xl font-bold text-white mb-2 tracking-tight">Import Artwork</p>
                  <p className="text-sm text-slate-500 font-medium">RAW, PNG or JPG (Up to 25MB)</p>
                </div>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr_320px] gap-8 animate-in slide-in-from-bottom-10 duration-700">
            
            <aside className="space-y-6">
              <div className="glass rounded-3xl p-5 border-l-4 border-l-indigo-500 mb-6 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Canvas Control</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{settings.crop ? 'Selection Active' : 'Full View'}</p>
                </div>
                <button 
                  onClick={() => setIsCropping(!isCropping)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isCropping ? 'bg-fuchsia-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {isCropping ? 'Exit Crop' : 'Edit Crop'}
                </button>
              </div>

              {!isCropping && (
                <ResizeControls settings={settings} setSettings={setSettings} onResize={handleResize} isProcessing={isProcessing} aspectRatio={settings.crop ? settings.crop.width / settings.crop.height : image.aspectRatio} />
              )}
              
              <div className="glass rounded-3xl p-5">
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  {processMode === 'server' ? 'Remote Python engine active. High-fidelity Lanczos sampling.' : 'Local GPU acceleration active for real-time adjustments.'}
                </p>
              </div>
            </aside>

            <section className="space-y-6 relative">
              <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-950 flex flex-col h-full min-h-[700px]">
                <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isEditing ? 'bg-fuchsia-500 animate-ping' : 'bg-indigo-500'}`}></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      {isCropping ? 'Cropping' : isEditing ? 'AI Reimagining...' : 'Master Preview'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                    <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800">RATIO: {(settings.crop ? settings.crop.width / settings.crop.height : image.aspectRatio).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex-1 relative flex flex-col items-center justify-center p-12 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-95">
                  {isCropping ? (
                    <div className="w-full h-full min-h-[500px] relative">
                      <Cropper
                        image={image.previewUrl}
                        crop={crop}
                        zoom={zoom}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                      />
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 glass p-4 rounded-2xl border-indigo-500/30">
                        <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-32 h-1 bg-slate-800 rounded-full appearance-none accent-indigo-500" />
                        <button onClick={applyCrop} className="bg-accent text-white px-6 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform">Confirm</button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group p-2 glass rounded-2xl shadow-inner-2xl transition-all duration-700">
                      <img 
                        src={resizedUrl || image.previewUrl} 
                        alt="Preview" 
                        className={`max-h-[60vh] object-contain shadow-2xl rounded-xl transition-all duration-700 ${isEditing ? 'blur-sm grayscale opacity-50 scale-95' : ''}`} 
                        style={{ width: resizedUrl ? `${settings.width}px` : 'auto', maxWidth: '100%' }} 
                      />
                      {isEditing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
                           <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                           <p className="text-xs font-bold tracking-widest uppercase animate-pulse">Generative Editing Active</p>
                        </div>
                      )}
                      {!resizedUrl && !isEditing && <div className="absolute inset-0 bg-accent/5 pointer-events-none rounded-xl border-2 border-indigo-500/20 animate-pulse"></div>}
                    </div>
                  )}

                  {resizedUrl && !isCropping && !isEditing && (
                    <div className="mt-12 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <button 
                        onClick={handleDownload} 
                        className="bg-white hover:bg-slate-100 text-slate-950 px-16 py-5 rounded-[2rem] font-bold flex items-center gap-4 shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all transform hover:-translate-y-2 active:scale-95 group"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="text-lg">Download Studio Export</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              {/* MAGIC LAB SECTION */}
              <div className="glass rounded-3xl p-6 border-t border-indigo-500/30 shadow-[0_10px_30px_rgba(99,102,241,0.1)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></div>
                  <h4 className="text-[10px] font-bold text-slate-100 uppercase tracking-[0.2em]">Magic Lab</h4>
                </div>
                <form onSubmit={handleMagicEdit} className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g. 'Add a vintage polaroid filter' or 'Make it a digital illustration'..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isEditing || !editPrompt.trim()}
                    className="w-full py-3 bg-accent text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEditing ? 'Painting...' : 'Run Magic Command'}
                  </button>
                </form>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Retro filter", "Cyberpunk vibes", "Oil painting"].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setEditPrompt(`Add a ${tag}`)}
                      className="text-[9px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-3xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    AI Analysis
                  </h4>
                  {isAiLoading && (
                    <div className="flex gap-1 animate-pulse">
                      <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {isAiLoading ? (
                    [1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse"></div>
                    ))
                  ) : suggestions.length > 0 ? (
                    suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => applySuggestion(s)}
                        className="w-full text-left bg-slate-950 hover:bg-slate-900 border border-slate-800 p-4 rounded-2xl transition-all group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[11px] font-bold text-slate-200 uppercase group-hover:text-indigo-400 tracking-wide">{s.label}</span>
                          <span className="text-[9px] font-mono text-slate-600">{s.width}x{s.height}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium italic">"{s.reason}"</p>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-6">
                       <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Metadata Ready</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => { setImage(null); setResizedUrl(null); }} 
                className="w-full py-4 text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] border border-slate-800/50 rounded-2xl transition-all hover:bg-red-500/10 hover:border-red-500/30"
              >
                Reset Studio
              </button>
            </aside>
          </div>
        )}
      </main>

      <footer className="glass border-t border-slate-800/50 py-3 px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${processMode ? 'bg-green-500' : 'bg-slate-700'}`}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {processMode ? 'Engine Optimized' : 'Ready'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">GPU-ACCELERATED</span>
          </div>
          <div className="text-[10px] text-slate-600 font-bold">GEMINI 2.5 INTEGRATED</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
