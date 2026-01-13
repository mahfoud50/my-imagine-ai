
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Maximize2, Download, Layers, Eraser, Sparkles, History,
  Loader2, Scissors, X, Palette, Wind, Smile, Zap as ZapIcon, 
  Wand2, ChevronRight, Brush, Image as ImageIcon, Shirt, Eye, PenTool
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
  onToggleGallery?: () => void;
}

const MainPreview: React.FC<MainPreviewProps> = ({ 
  imageUrl, originalImageUrl, isGenerating, loadingStep = 0, prompt, language,
  onRemoveBackground, onUpscale, onRemoveWatermark, onColorize,
  onMagicEraser, onCartoonize, onRestore, onSmartEdit, onVirtualTryOn, onAddSunglasses, onCreateLogo,
  onToggleGallery
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const t = translations[language];

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ImagineAI-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isRtl = language === 'ar';

  const smartTools = useMemo(() => [
    { id: 1, name: t.logoCreation, tag: 'Branding', action: onCreateLogo, image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400', icon: <PenTool className="w-4 h-4" />, color: 'bg-blue-600' },
    { id: 2, name: t.smartEdit, tag: 'AI Power', action: onSmartEdit, image: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=400', icon: <Wand2 className="w-4 h-4" />, color: 'bg-indigo-600' },
    { id: 3, name: t.removeBg, tag: 'One-Click', action: onRemoveBackground, image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400', icon: <Eraser className="w-4 h-4" />, color: 'bg-rose-500' },
    { id: 4, name: t.upscale, tag: '4K HD', action: onUpscale, image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=400', icon: <Maximize2 className="w-4 h-4" />, color: 'bg-emerald-500' },
    { id: 5, name: t.virtualTryOn, tag: 'Try clothes', action: onVirtualTryOn, image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400', icon: <Shirt className="w-4 h-4" />, color: 'bg-indigo-500' },
    { id: 6, name: t.addSunglasses, tag: 'Summer Vibes', action: onAddSunglasses, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', icon: <Eye className="w-4 h-4" />, color: 'bg-amber-500' },
    { id: 7, name: t.removeWatermark, tag: 'Clean Content', action: onRemoveWatermark, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', icon: <Scissors className="w-4 h-4" />, color: 'bg-amber-500' },
    { id: 8, name: t.colorize, tag: 'Classic', action: onColorize, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', icon: <Palette className="w-4 h-4" />, color: 'bg-indigo-500' },
    { id: 9, name: t.magicEraser, tag: 'Retouch', action: onMagicEraser, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400', icon: <Wind className="w-4 h-4" />, color: 'bg-rose-500' },
    { id: 10, name: t.cartoonize, tag: '3D Art', action: onCartoonize, image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400', icon: <Smile className="w-4 h-4" />, color: 'bg-emerald-500' },
    { id: 11, name: t.restore, tag: 'Memory Fix', action: onRestore, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', icon: <ZapIcon className="w-4 h-4" />, color: 'bg-amber-500' }
  ], [
    t, onRemoveBackground, onUpscale, onRemoveWatermark, onColorize, 
    onMagicEraser, onCartoonize, onRestore, onSmartEdit, 
    onVirtualTryOn, onAddSunglasses, onCreateLogo
  ]);

  // استخدام مفتاح فريد يعتمد على محتوى الصورة لضمان إعادة رندر React
  const imageDisplayKey = useMemo(() => imageUrl ? `gen-img-${imageUrl.substring(imageUrl.length - 20)}` : 'empty', [imageUrl]);

  return (
    <main className="flex-1 bg-[#f8fafc] dark:bg-[#020617] flex flex-col items-center p-4 lg:p-8 overflow-y-auto custom-scrollbar w-full transition-all duration-300">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 lg:mb-8 gap-4">
        <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
          <div className="p-2 lg:p-3 bg-indigo-600 rounded-xl lg:rounded-2xl shadow-lg shrink-0">
            <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              Imagine AI <span className="text-indigo-600 hidden sm:inline">Professional</span>
            </h1>
            <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{language === 'ar' ? 'مختبر الإبداع البصري' : 'Visual Creativity Lab'}</p>
          </div>
        </div>
        <button onClick={onToggleGallery} className="p-2 lg:p-3 bg-white dark:bg-slate-800 rounded-xl lg:rounded-2xl shadow-sm border dark:border-white/5 text-slate-600 dark:text-slate-300 flex items-center gap-2 font-black text-[10px] lg:text-xs hover:bg-slate-50 shrink-0">
          <History className="w-4 h-4" /> <span className="hidden sm:inline">{t.history}</span>
        </button>
      </div>

      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl border dark:border-white/5 overflow-hidden relative transition-all min-h-[400px]">
        <div className="w-full aspect-square sm:aspect-video lg:min-h-[550px] bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-center relative overflow-hidden group">
          
          {imageUrl && (
            <div className="w-full h-full relative" key={imageDisplayKey}>
              <img 
                src={imageUrl} 
                className={`w-full h-full object-contain cursor-zoom-in transition-all duration-700 image-fade-in ${isGenerating ? 'opacity-20 blur-2xl scale-105' : 'opacity-100 scale-100'}`} 
                alt="Preview" 
                onClick={() => setIsFullscreen(true)} 
              />
              
              {!isGenerating && (
                <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-2 lg:py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-xl lg:rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button onClick={handleDownload} className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-[10px] lg:text-xs hover:text-indigo-600 transition-colors">
                    <Download className="w-4 h-4" /> {t.saveWork}
                  </button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-white/10" />
                  <button onClick={() => setIsFullscreen(true)} className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-[10px] lg:text-xs hover:text-indigo-600 transition-colors">
                    <Maximize2 className="w-4 h-4" /> {t.viewResult}
                  </button>
                </div>
              )}
            </div>
          )}

          {!imageUrl && !isGenerating && (
            <div className="text-center p-8 animate-in fade-in zoom-in duration-700">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200 dark:border-white/10">
                <Wand2 className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{isRtl ? 'بانتظار إبداعك القادم' : 'Waiting for your magic'}</p>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center gap-8 absolute inset-0 z-[100] justify-center bg-white/60 dark:bg-slate-950/80 backdrop-blur-2xl transition-all duration-500 animate-in fade-in">
              <div className="relative">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)] animate-pulse">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              
              <div className="text-center px-10 max-w-md">
                <h3 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  {t.loadingMessages[loadingStep]}
                </h3>
                <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full mt-6 overflow-hidden shadow-inner">
                   <div className="h-full bg-indigo-600 transition-all duration-300 ease-out animate-[progress_15s_linear_forwards]" style={{ width: '0%' }}></div>
                </div>
                <p className="text-[10px] lg:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mt-4 opacity-80">
                  {isRtl ? 'المعالج الذكي يقوم برسم تفاصيلك' : 'AI processor is sketching your details'}
                </p>
              </div>
            </div>
          )}
        </div>

        {imageUrl && !isGenerating && (
          <div className="p-4 lg:p-8 border-t dark:border-white/5 bg-white dark:bg-slate-900 animate-in slide-in-from-bottom-5 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 lg:gap-4">
                {[
                  { id: 'rem', name: t.removeBg, icon: <Eraser className="w-4 h-4 lg:w-5 lg:h-5" />, color: 'bg-rose-500', action: onRemoveBackground },
                  { id: 'try', name: t.virtualTryOn, icon: <Shirt className="w-4 h-4 lg:w-5 lg:h-5" />, color: 'bg-indigo-500', action: onVirtualTryOn },
                  { id: 'sun', name: t.addSunglasses, icon: <Eye className="w-4 h-4 lg:w-5 lg:h-5" />, color: 'bg-amber-500', action: onAddSunglasses },
                  { id: 'up', name: t.upscale, icon: <Maximize2 className="w-4 h-4 lg:w-5 lg:h-5" />, color: 'bg-emerald-500', action: onUpscale },
                  { id: 'logo', name: t.logoCreation, icon: <PenTool className="w-4 h-4 lg:w-5 lg:h-5" />, color: 'bg-blue-600', action: onCreateLogo }
                ].map(tool => (
                  <button key={tool.id} onClick={tool.action} className="flex items-center gap-2 lg:gap-4 p-3 lg:p-4 bg-slate-50 dark:bg-slate-800/40 border dark:border-white/5 rounded-xl lg:rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm hover:shadow-md">
                    <div className={`${tool.color} text-white p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-lg`}>
                      {tool.icon}
                    </div>
                    <span className="text-[10px] lg:text-xs font-black text-slate-800 dark:text-white whitespace-nowrap">{tool.name}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 lg:mt-20 w-full max-w-6xl pb-20">
        <div className="flex items-center justify-between mb-8 lg:mb-12 px-2 lg:px-4">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white dark:bg-slate-800 rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center shadow-xl border dark:border-white/5 shrink-0">
              <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{isRtl ? 'استكشف الأدوات الذكية' : 'Explore Smart Tools'}</h2>
              <p className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">{isRtl ? 'تقنيات Imagine AI بين يديك' : 'The power of Imagine AI at your fingertips'}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-8 px-2 lg:px-4">
          {smartTools.map(tool => (
            <div key={tool.id} onClick={(e) => { e.stopPropagation(); tool.action?.(); }} className="group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-800 border dark:border-white/5 h-56 lg:h-72">
              <img src={tool.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-100" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5 lg:p-7">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-md rounded-full text-[8px] lg:text-[9px] font-black text-white uppercase mb-3 inline-block shadow-lg">{tool.tag}</span>
                  <h5 className="text-white text-xs lg:text-base font-black mb-3 lg:mb-5 flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${tool.color} shadow-lg`}>{tool.icon}</span>
                    {tool.name}
                  </h5>
                  <button className="w-full py-2.5 lg:py-3.5 bg-white text-slate-900 text-[10px] font-black rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
                    {isRtl ? 'تطبيق الأداة' : 'APPLY TOOL'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isFullscreen && imageUrl && (
        <div className="fixed inset-0 z-[2500] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 lg:p-12 animate-in zoom-in duration-300" onClick={() => setIsFullscreen(false)}>
          <img src={imageUrl} className="max-w-full max-h-full object-contain rounded-2xl lg:rounded-[3rem] shadow-2xl border border-white/10" alt="Full" />
          <button className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-2xl hover:bg-rose-500 transition-all backdrop-blur-xl"><X className="w-8 h-8" /></button>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-5 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10">
             <button onClick={handleDownload} className="flex items-center gap-3 text-white font-black hover:text-indigo-400 transition-all uppercase text-xs tracking-widest">
               <Download className="w-5 h-5" /> {t.download}
             </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 98%; }
        }
        .image-fade-in {
          animation: imageIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes imageIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
      `}</style>
    </main>
  );
};

export default MainPreview;
