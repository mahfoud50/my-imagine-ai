
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Maximize2, Download, Layers, Eraser, Sparkles, History,
  Loader2, Scissors, X, Palette, Wind, Smile, Zap as ZapIcon, 
  Wand2, ChevronRight, Brush, Image as ImageIcon, Shirt, Eye, PenTool, Mic2
} from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface MainPreviewProps {
  imageUrl: string | null;
  originalImageUrl?: string | null;
  isGenerating: boolean;
  loadingStep?: number;
  prompt: string;
  language: Language;
  isSidebarOpen?: boolean;
  isGalleryOpen?: boolean;
  onRemoveBackground?: () => void;
  onUpscale?: () => void;
  onRemoveWatermark?: () => void;
  onColorize?: () => void;
  onMagicEraser?: () => void;
  onCartoonize?: () => void;
  onRestore?: () => void;
  onSmartEdit?: () => void;
  onVirtualTryOn?: () => void;
  onAddSunglasses?: () => void;
  onCreateLogo?: () => void;
  onTextToSpeech?: () => void;
  onToggleGallery?: () => void;
}

const MainPreview: React.FC<MainPreviewProps> = ({ 
  imageUrl, originalImageUrl, isGenerating, loadingStep = 0, prompt, language,
  isSidebarOpen, isGalleryOpen,
  onRemoveBackground, onUpscale, onRemoveWatermark, onColorize,
  onMagicEraser, onCartoonize, onRestore, onSmartEdit, onVirtualTryOn, onAddSunglasses, onCreateLogo,
  onTextToSpeech, onToggleGallery
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const t = translations[language];
  const isCompact = useMemo(() => isSidebarOpen || isGalleryOpen, [isSidebarOpen, isGalleryOpen]);
  const isRtl = language === 'ar';

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ImagineAI-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const smartTools = useMemo(() => [
    { id: 1, name: t.logoCreation, tag: 'PRO', action: onCreateLogo, image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400', icon: <PenTool className="w-4 h-4" />, color: 'bg-blue-600' },
    { id: 2, name: t.textToSpeech, tag: 'VOICE', action: onTextToSpeech, image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400', icon: <Mic2 className="w-4 h-4" />, color: 'bg-indigo-600' },
    { id: 3, name: t.smartEdit, tag: 'AI', action: onSmartEdit, image: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=400', icon: <Wand2 className="w-4 h-4" />, color: 'bg-indigo-600' },
    { id: 4, name: t.removeBg, tag: 'FAST', action: onRemoveBackground, image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400', icon: <Eraser className="w-4 h-4" />, color: 'bg-rose-500' },
    { id: 5, name: t.upscale, tag: '4K', action: onUpscale, image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=400', icon: <Maximize2 className="w-4 h-4" />, color: 'bg-emerald-500' },
    { id: 6, name: t.virtualTryOn, tag: 'FASHION', action: onVirtualTryOn, image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400', icon: <Shirt className="w-4 h-4" />, color: 'bg-indigo-500' },
    { id: 7, name: t.addSunglasses, tag: 'VIBE', action: onAddSunglasses, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', icon: <Eye className="w-4 h-4" />, color: 'bg-amber-500' },
    { id: 8, name: t.removeWatermark, tag: 'CLEAN', action: onRemoveWatermark, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', icon: <Scissors className="w-4 h-4" />, color: 'bg-amber-500' },
    { id: 9, name: t.colorize, tag: 'REPAIR', action: onColorize, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', icon: <Palette className="w-4 h-4" />, color: 'bg-indigo-500' },
    { id: 10, name: t.magicEraser, tag: 'FIX', action: onMagicEraser, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400', icon: <Wind className="w-4 h-4" />, color: 'bg-rose-500' },
    { id: 11, name: t.cartoonize, tag: 'ART', action: onCartoonize, image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400', icon: <Smile className="w-4 h-4" />, color: 'bg-emerald-500' },
    { id: 12, name: t.restore, tag: 'RETRO', action: onRestore, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', icon: <ZapIcon className="w-4 h-4" />, color: 'bg-amber-500' }
  ], [t, onRemoveBackground, onUpscale, onRemoveWatermark, onColorize, onMagicEraser, onCartoonize, onRestore, onSmartEdit, onVirtualTryOn, onAddSunglasses, onCreateLogo, onTextToSpeech]);

  return (
    <main className="flex-1 bg-[#f8fafc] dark:bg-[#020617] flex flex-col items-center p-4 lg:p-8 overflow-y-auto custom-scrollbar w-full transition-all duration-300">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 lg:mb-8 gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="p-2 lg:p-3 bg-indigo-600 rounded-xl shadow-lg shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white truncate">Imagine AI <span className="text-indigo-600">Pro</span></h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{isRtl ? 'بوابة الإبداع اللامحدود' : 'Gateway to Infinite Creativity'}</p>
          </div>
        </div>
        <button onClick={onToggleGallery} className={`p-2 lg:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-white/5 text-slate-600 dark:text-slate-300 flex items-center gap-2 font-black text-[10px] lg:text-xs transition-all ${isGalleryOpen ? 'bg-indigo-600 text-white border-indigo-500' : ''}`}>
          <History className="w-4 h-4" /> <span className="hidden sm:inline">{t.history}</span>
        </button>
      </div>

      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl border dark:border-white/5 overflow-hidden relative">
        <div className={`w-full ${isCompact ? 'aspect-[4/3]' : 'aspect-square sm:aspect-video'} bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-center relative overflow-hidden group transition-all duration-500`}>
          {imageUrl ? (
            <div className="w-full h-full relative">
              <img src={imageUrl} className={`w-full h-full object-contain cursor-zoom-in transition-all duration-700 ${isGenerating ? 'opacity-20 blur-2xl scale-105' : 'opacity-100 scale-100'}`} alt="Result" onClick={() => setIsFullscreen(true)} />
              {!isGenerating && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={handleDownload} className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-[10px] hover:text-indigo-600"><Download className="w-4 h-4" /> {t.saveWork}</button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-white/10" />
                  <button onClick={() => setIsFullscreen(true)} className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-[10px] hover:text-indigo-600"><Maximize2 className="w-4 h-4" /> {t.viewResult}</button>
                </div>
              )}
            </div>
          ) : !isGenerating ? (
            <div className="text-center p-8 animate-in fade-in zoom-in duration-700">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-white/10"><Wand2 className="w-10 h-10 text-slate-300" /></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'بانتظار وصفك الإبداعي' : 'Waiting for your creative prompt'}</p>
            </div>
          ) : null}

          {isGenerating && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/80 backdrop-blur-3xl animate-in fade-in">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl animate-pulse"><Loader2 className="w-10 h-10 text-white animate-spin" /></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center animate-bounce"><Sparkles className="w-4 h-4" /></div>
              </div>
              <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white mb-2">{t.loadingMessages[loadingStep]}</h3>
              <div className="w-64 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mt-4"><div className="h-full bg-indigo-600 animate-[progress_15s_linear_forwards]" style={{ width: '0%' }}></div></div>
            </div>
          )}
        </div>

        {imageUrl && !isGenerating && (
          <div className="p-4 lg:p-8 border-t dark:border-white/5 bg-white dark:bg-slate-900">
            <div className={`grid gap-4 ${isCompact ? 'grid-cols-5 gap-2' : 'grid-cols-2 md:grid-cols-5'}`}>
                {[
                  { id: 'rem', name: t.removeBg, icon: <Eraser className="w-4 h-4" />, color: 'bg-rose-500', action: onRemoveBackground },
                  { id: 'try', name: t.virtualTryOn, icon: <Shirt className="w-4 h-4" />, color: 'bg-indigo-500', action: onVirtualTryOn },
                  { id: 'sun', name: t.addSunglasses, icon: <Eye className="w-4 h-4" />, color: 'bg-amber-500', action: onAddSunglasses },
                  { id: 'up', name: t.upscale, icon: <Maximize2 className="w-4 h-4" />, color: 'bg-emerald-500', action: onUpscale },
                  { id: 'logo', name: t.logoCreation, icon: <PenTool className="w-4 h-4" />, color: 'bg-blue-600', action: onCreateLogo }
                ].map(tool => (
                  <button key={tool.id} onClick={tool.action} className={`flex items-center transition-all active:scale-95 ${isCompact ? 'flex-col gap-1 p-0' : 'gap-3 p-3 bg-slate-50 dark:bg-slate-800 border dark:border-white/5 rounded-xl hover:bg-white dark:hover:bg-slate-700'}`}>
                    <div className={`${tool.color} text-white shadow-lg p-2.5 rounded-xl`}>{tool.icon}</div>
                    <span className={`text-[10px] font-black text-slate-800 dark:text-white whitespace-nowrap ${isCompact ? 'hidden' : 'block'}`}>{tool.name}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 w-full max-w-6xl pb-20">
        <div className="flex items-center gap-4 mb-8 px-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0"><Sparkles className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">{isRtl ? 'الأدوات الذكية المتقدمة' : 'Advanced Smart Tools'}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isRtl ? 'تقنيات Imagine AI المتطورة' : 'Cutting-edge Imagine AI Technologies'}</p>
          </div>
        </div>
        
        <div className={`grid gap-4 px-4 transition-all duration-500 ${isCompact ? 'grid-cols-4 sm:grid-cols-4 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'}`}>
          {smartTools.map(tool => (
            <div key={tool.id} onClick={tool.action} className={`group relative overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-800 border dark:border-white/5 ${isCompact ? 'w-16 h-16 lg:w-20 lg:h-20 rounded-full mx-auto' : 'rounded-[2rem] h-64'}`}>
              {!isCompact ? (
                <>
                  <img src={tool.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-30 group-hover:opacity-100" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                    <span className="px-2 py-0.5 bg-indigo-600/90 rounded-full text-[8px] font-black text-white uppercase mb-2 inline-block w-fit">{tool.tag}</span>
                    <h5 className="text-white text-sm font-black mb-3 flex items-center gap-2"><span className={`p-1.5 rounded-lg ${tool.color} shadow-lg`}>{tool.icon}</span>{tool.name}</h5>
                    <button className="w-full py-2.5 bg-white text-slate-900 text-[9px] font-black rounded-xl hover:bg-indigo-600 hover:text-white transition-all">TRY TOOL</button>
                  </div>
                </>
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${tool.color} text-white transition-all hover:scale-110`}>
                   {tool.icon}
                   <span className="hidden group-hover:block absolute -bottom-8 bg-slate-900 text-white text-[8px] px-2 py-1 rounded-md whitespace-nowrap z-50">{tool.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isFullscreen && imageUrl && (
        <div className="fixed inset-0 z-[2500] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 lg:p-12 animate-in zoom-in duration-300" onClick={() => setIsFullscreen(false)}>
          <img src={imageUrl} className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl border border-white/10" alt="Full" />
          <button className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-2xl hover:bg-rose-500 transition-all"><X className="w-8 h-8" /></button>
        </div>
      )}

      <style>{`
        @keyframes progress { from { width: 0%; } to { width: 98%; } }
      `}</style>
    </main>
  );
};

export default MainPreview;
