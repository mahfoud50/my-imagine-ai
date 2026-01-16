
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Maximize2, Download, Eraser, Sparkles, History,
  Loader2, Scissors, X, Palette, Wind, Smile, Zap as ZapIcon, 
  Wand2, Shirt, Eye, PenTool, Mic2, Layers, User as UserIcon,
  Terminal, QrCode, AlertCircle, Scan
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
  onChangeHairStyle?: () => void;
  onCreateLogo?: () => void;
  onTextToSpeech?: () => void;
  onToggleGallery?: () => void;
  onGenerateImage?: () => void;
  onImageToVector?: () => void;
  onTextToCode?: () => void;
  onQrCode?: () => void;
  onDecodeQr?: () => void;
  onCancelGeneration?: () => void; 
}

const MainPreview: React.FC<MainPreviewProps> = ({ 
  imageUrl, originalImageUrl, isGenerating, loadingStep = 0, prompt, language,
  isSidebarOpen, isGalleryOpen,
  onRemoveBackground, onUpscale, onRemoveWatermark, onColorize,
  onMagicEraser, onCartoonize, onRestore, onSmartEdit, onVirtualTryOn, onAddSunglasses, onChangeHairStyle, onCreateLogo,
  onTextToSpeech, onToggleGallery, onGenerateImage, onImageToVector, onTextToCode, onQrCode, onDecodeQr, onCancelGeneration
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const t = translations[language];
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
    { id: 1, name: t.logoCreation, icon: <PenTool className="w-5 h-5" />, action: onCreateLogo, color: 'bg-sky-500', desc: 'Create AI Logo' },
    { id: 18, name: t.qrDecoder, icon: <Scan className="w-5 h-5" />, action: onDecodeQr, color: 'bg-sky-600', desc: t.qrDecoderDesc },
    { id: 16, name: t.textToCode, icon: <Terminal className="w-5 h-5" />, action: onTextToCode, color: 'bg-amber-600', desc: t.textToCodeDesc },
    { id: 17, name: t.qrCode, icon: <QrCode className="w-5 h-5" />, action: onQrCode, color: 'bg-sky-700', desc: t.qrCodeDesc },
    { id: 2, name: t.textToSpeech, icon: <Mic2 className="w-5 h-5" />, action: onTextToSpeech, color: 'bg-sky-600', desc: 'Text to Voice' },
    { id: 14, name: t.imageToVector, icon: <Layers className="w-5 h-5" />, action: onImageToVector, color: 'bg-teal-600', desc: t.imageToVectorDesc },
    { id: 3, name: t.smartEdit, icon: <Wand2 className="w-5 h-5" />, action: onSmartEdit, color: 'bg-purple-600', desc: 'AI Image Edit' },
    { id: 15, name: t.changeHairStyle, icon: <UserIcon className="w-5 h-5" />, action: onChangeHairStyle, color: 'bg-amber-600', desc: t.hairStyleDesc },
    { id: 4, name: t.removeBg, icon: <Eraser className="w-5 h-5" />, action: onRemoveBackground, color: 'bg-rose-500', desc: 'BG Removal' },
    { id: 5, name: t.upscale, icon: <Maximize2 className="w-5 h-5" />, action: onUpscale, color: 'bg-emerald-500', desc: '4K Upscale' },
    { id: 6, name: t.virtualTryOn, icon: <Shirt className="w-5 h-5" />, action: onVirtualTryOn, color: 'bg-sky-500', desc: 'Cloth Swap' },
    { id: 7, name: t.addSunglasses, icon: <Eye className="w-5 h-5" />, action: onAddSunglasses, color: 'bg-amber-500', desc: 'AI Shades' },
    { id: 8, name: t.removeWatermark, icon: <Scissors className="w-5 h-5" />, action: onRemoveWatermark, color: 'bg-orange-500', desc: 'Clean Image' },
    { id: 9, name: t.colorize, icon: <Palette className="w-5 h-5" />, action: onColorize, color: 'bg-sky-500', desc: 'Add Color' },
    { id: 10, name: t.magicEraser, icon: <Wind className="w-5 h-5" />, action: onMagicEraser, color: 'bg-rose-600', desc: 'Object Eraser' },
    { id: 11, name: t.cartoonize, icon: <Smile className="w-5 h-5" />, action: onCartoonize, color: 'bg-emerald-600', desc: 'To 3D Cartoon' },
    { id: 12, name: t.restore, icon: <Sparkles className="w-5 h-5" />, action: onRestore, color: 'bg-amber-600', desc: 'Photo Repair' },
    { id: 13, name: t.generate, icon: <ZapIcon className="w-5 h-5" />, action: onGenerateImage, color: 'bg-sky-700', desc: 'Text to Art' }
  ], [t, onCreateLogo, onDecodeQr, onTextToCode, onQrCode, onTextToSpeech, onSmartEdit, onRemoveBackground, onUpscale, onVirtualTryOn, onAddSunglasses, onChangeHairStyle, onRemoveWatermark, onColorize, onMagicEraser, onCartoonize, onRestore, onGenerateImage, onImageToVector]);

  return (
    <main className="flex-1 bg-[#f8fafc] dark:bg-[#020617] flex flex-col items-center p-4 lg:p-8 overflow-y-auto custom-scrollbar w-full transition-all duration-300">
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500 rounded-2xl shadow-xl shadow-sky-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">IMAGINE <span className="text-sky-500">PRO</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isRtl ? 'بوابة الإبداع الذكي' : 'SMART CREATIVE STUDIO'}</p>
          </div>
        </div>
        <button onClick={onToggleGallery} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 rounded-xl border dark:border-white/5 shadow-sm text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-sky-500 hover:text-white transition-all">
          <History className="w-4 h-4" /> {t.history}
        </button>
      </div>

      <div className="w-full max-w-6xl relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border dark:border-white/5 overflow-hidden">
        <div className={`w-full aspect-square sm:aspect-video flex items-center justify-center bg-slate-50 dark:bg-slate-950/40 relative overflow-hidden group`}>
          {imageUrl ? (
            <div className="w-full h-full relative">
              <img src={imageUrl} className={`w-full h-full object-contain cursor-zoom-in transition-all duration-700 ${isGenerating ? 'opacity-20 blur-2xl scale-105' : 'opacity-100 scale-100'}`} alt="Result" onClick={() => setIsFullscreen(true)} />
              {!isGenerating && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={handleDownload} className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-[10px] hover:text-sky-500"><Download className="w-4 h-4" /> {t.saveWork}</button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-white/10" />
                  <button onClick={() => setIsFullscreen(true)} className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-[10px] hover:text-sky-500"><Maximize2 className="w-4 h-4" /> {t.viewResult}</button>
                </div>
              )}
            </div>
          ) : !isGenerating ? (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200 dark:border-white/10">
                <Wand2 className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'ابدأ سحرك بكتابة وصف في القائمة الجانبية' : 'START MAGIC BY WRITING IN SIDEBAR'}</p>
            </div>
          ) : null}

          {isGenerating && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
               <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border dark:border-white/10 max-w-sm w-full mx-4 text-center animate-in zoom-in-95 duration-300 transform scale-100 relative">
                  
                  <button 
                    onClick={onCancelGeneration}
                    className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white rounded-xl transition-all z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-sky-500 rounded-[2rem] flex items-center justify-center shadow-2xl animate-bounce">
                     <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                       {isRtl ? 'يتم التحميل' : 'Loading...'}
                    </h3>
                    
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center gap-2">
                       <AlertCircle className="w-6 h-6 text-rose-500 animate-pulse" />
                       <p className="text-[10px] font-black text-rose-500 leading-tight uppercase tracking-wider">
                          There was an unexpected error. Finish what you were doing.
                       </p>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-sky-500 animate-[progress_10s_linear_forwards] w-0"></div>
                    </div>
                    
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] animate-pulse">
                      {t.loadingMessages[loadingStep]}
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-max-6xl mt-10 md:mt-16 pb-20">
        <div className="flex items-center gap-3 mb-8 md:mb-10 px-4">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg"><ZapIcon className="w-5 h-5 text-white" /></div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{isRtl ? 'مختبر الأدوات الذكية' : 'AI SMART TOOLS LAB'}</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 px-4">
          {smartTools.map(tool => (
            <button 
              key={tool.id} 
              onClick={tool.action}
              className="group flex flex-col items-center justify-center p-4 md:p-8 bg-white dark:bg-slate-800 border dark:border-white/5 rounded-2xl md:rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className={`w-11 h-11 md:w-14 md:h-14 ${tool.color} text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                {tool.icon}
              </div>
              <span className="text-[10px] md:text-xs font-black text-slate-800 dark:text-white text-center mb-0.5 md:mb-1 uppercase tracking-tight">{tool.name}</span>
              <span className="text-[8px] md:text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest leading-tight">{tool.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {isFullscreen && imageUrl && (
        <div className="fixed inset-0 z-[2500] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8" onClick={() => setIsFullscreen(false)}>
          <img src={imageUrl} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border border-white/10" alt="Full" />
          <button className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-2xl hover:bg-rose-600 transition-all"><X className="w-8 h-8" /></button>
        </div>
      )}

      <style>{`
        @keyframes progress { from { width: 0%; } to { width: 98%; } }
      `}</style>
    </main>
  );
};

export default MainPreview;