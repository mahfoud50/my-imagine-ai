
import React, { useState } from 'react';
import { 
  Maximize2, Download, Layers, Eraser, Sparkles, Search, ChevronRight,
  Image as ImageIcon, CheckCircle, Loader2, Scissors, Eye, X, History,
  Wand2, Columns, Palette, Wind, Smile, Zap as ZapIcon, Shirt, Frame, Map,
  PenTool, ArrowDownCircle, MousePointer2, Type, HelpCircle
} from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface MainPreviewProps {
  imageUrl: string | null;
  originalImageUrl?: string | null;
  isGenerating: boolean;
  prompt: string;
  language: Language;
  onRemoveBackground?: () => void;
  onUpscale?: () => void;
  onSmartEdit?: () => void;
  onRemoveWatermark?: () => void;
  onColorize?: () => void;
  onMagicEraser?: () => void;
  onCartoonize?: () => void;
  onRestore?: () => void;
  onSketchToImage?: () => void;
  onVirtualTryOn?: () => void;
  onOutpainting?: () => void;
  onBackgroundChange?: () => void;
  onToggleGallery?: () => void;
  showTooltips?: boolean;
}

const MainPreview: React.FC<MainPreviewProps> = ({ 
  imageUrl, originalImageUrl, isGenerating, prompt, language,
  onRemoveBackground, onUpscale, onSmartEdit, onRemoveWatermark, onColorize,
  onMagicEraser, onCartoonize, onRestore, onSketchToImage, onVirtualTryOn,
  onOutpainting, onBackgroundChange, onToggleGallery, showTooltips
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
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

  const smartTools = [
    { id: 8, name: t.smartEdit, tag: 'Professional', action: onSmartEdit, image: 'https://images.unsplash.com/photo-1675271591211-126ad94e495d?w=400', icon: <Layers className="w-4 h-4" />, color: 'bg-violet-600', descAr: 'تحرير ذكي شامل للصورة', descEn: 'AI Smart holistic edit' },
    { id: 1, name: t.colorize, tag: 'Classic', action: onColorize, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', icon: <Palette className="w-4 h-4" />, color: 'bg-indigo-500', descAr: 'إضافة ألوان واقعية للصور القديمة', descEn: 'Add realistic color to B&W' },
    { id: 2, name: t.magicEraser, tag: 'Clean', action: onMagicEraser, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400', icon: <Wind className="w-4 h-4" />, color: 'bg-rose-500', descAr: 'حذف العناصر غير المرغوبة بذكاء', descEn: 'Remove unwanted objects' },
    { id: 3, name: t.cartoonize, tag: '3D Art', action: onCartoonize, image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400', icon: <Smile className="w-4 h-4" />, color: 'bg-emerald-500', descAr: 'تحويل الصورة لنمط كرتوني ثلاثي الأبعاد', descEn: 'Convert to 3D cartoon style' },
    { id: 4, name: t.restore, tag: 'Fix', action: onRestore, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', icon: <ZapIcon className="w-4 h-4" />, color: 'bg-amber-500', descAr: 'إصلاح التلف وتحسين جودة الوجوه', descEn: 'Fix damage and enhance faces' },
    { id: 5, name: t.removeBg, tag: 'Transparent', action: onRemoveBackground, image: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=400', icon: <Eraser className="w-4 h-4" />, color: 'bg-blue-600', descAr: 'إزالة الخلفية بدقة واحترافية', descEn: 'Precision background removal' },
    { id: 6, name: t.removeWatermark, tag: 'Inpaint', action: onRemoveWatermark, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', icon: <Scissors className="w-4 h-4" />, color: 'bg-cyan-500', descAr: 'إخفاء العلامات المائية والنصوص', descEn: 'Hide watermarks and text' },
    { id: 7, name: t.upscale, tag: 'Ultra HD', action: onUpscale, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400', icon: <Maximize2 className="w-4 h-4" />, color: 'bg-teal-500', descAr: 'تكبير الصورة مع زيادة التفاصيل', descEn: 'Enlarge image with details' }
  ];

  return (
    <main className="flex-1 bg-[#f8fafc] dark:bg-[#020617] flex flex-col items-center p-4 md:p-8 overflow-y-auto custom-scrollbar w-full transition-all duration-300">
      {/* Header Info */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Imagine AI <span className="text-indigo-600">Professional</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{language === 'ar' ? 'مختبر الإبداع البصري' : 'Visual Creativity Lab'}</p>
          </div>
        </div>
        <button onClick={onToggleGallery} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-white/5 text-slate-600 dark:text-slate-300 flex items-center gap-2 font-black text-xs hover:bg-slate-50 transition-all">
          <History className="w-4 h-4" /> {t.history}
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border dark:border-white/5 overflow-hidden relative transition-all duration-500">
        <div className="w-full min-h-[400px] md:min-h-[550px] bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-center relative overflow-hidden group">
          
          {imageUrl && (
            <div className="w-full h-full relative">
              <img 
                src={showOriginal && originalImageUrl ? originalImageUrl : imageUrl} 
                className={`w-full h-full object-contain animate-in fade-in zoom-in-95 duration-500 cursor-zoom-in transition-all ${isGenerating ? 'opacity-30 blur-xl scale-95' : ''}`} 
                alt="Preview" 
                onClick={() => setIsFullscreen(true)} 
              />
              
              {!isGenerating && (
                <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0`}>
                  <button onClick={handleDownload} className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-xs hover:text-indigo-600 transition-colors">
                    <Download className="w-4 h-4" /> {t.saveWork}
                  </button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-white/10" />
                  <button onClick={() => setIsFullscreen(true)} className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-xs hover:text-indigo-600 transition-colors">
                    <Maximize2 className="w-4 h-4" /> {t.viewResult}
                  </button>
                </div>
              )}
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500 absolute inset-0 z-20 justify-center bg-white/10 dark:bg-slate-900/10 backdrop-blur-md">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-2xl">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-900 dark:text-white">{t.processing}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t.processingDesc}</p>
              </div>
            </div>
          )}
        </div>

        {imageUrl && !isGenerating && (
          <div className="p-6 md:p-8 border-t dark:border-white/5 bg-white dark:bg-slate-900 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'rem', name: t.removeBg, icon: <Eraser className="w-5 h-5" />, color: 'bg-rose-500', action: onRemoveBackground, tip: isRtl ? 'إزالة الخلفية والحصول على PNG شفاف' : 'Remove BG for transparent PNG' },
                  { id: 'up', name: t.upscale, icon: <Maximize2 className="w-5 h-5" />, color: 'bg-emerald-500', action: onUpscale, tip: isRtl ? 'رفع جودة الصورة إلى 4K' : 'Upscale image to 4K' },
                  { id: 'wat', name: t.removeWatermark, icon: <Scissors className="w-5 h-5" />, color: 'bg-amber-500', action: onRemoveWatermark, tip: isRtl ? 'إخفاء العلامات المائية المزعجة' : 'Hide annoying watermarks' },
                  { id: 'res', name: t.restore, icon: <ZapIcon className="w-5 h-5" />, color: 'bg-indigo-600', action: onRestore, tip: isRtl ? 'إعادة إحياء الصور القديمة والتالفة' : 'Revive old/damaged photos' }
                ].map(tool => (
                  <div key={tool.id} className="group relative">
                    <button onClick={tool.action} className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 border dark:border-white/5 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all active:scale-95">
                      <div className={`${tool.color} text-white p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                        {tool.icon}
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-white">{tool.name}</span>
                    </button>
                    {showTooltips && (
                      <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-center border border-white/10`}>
                        {tool.tip}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Lab Section */}
      <div className="mt-20 w-full max-w-6xl pb-32">
        <div className="flex items-center justify-between mb-10 px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl border dark:border-white/5">
              <Wand2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{language === 'ar' ? 'مختبر الأدوات الذكية' : 'Smart Tools Lab'}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{language === 'ar' ? 'تقنيات التحرير المتقدمة' : 'Advanced Editing Techniques'}</p>
            </div>
          </div>
          <button className="text-xs font-black text-indigo-600 flex items-center gap-2 group hover:underline">
            {t.viewAll} <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {smartTools.map(tool => (
            <div key={tool.id} className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-800 border dark:border-white/5 h-64">
              <img src={tool.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-100" alt={tool.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-1">{tool.tag}</span>
                  <h5 className="text-white text-sm font-black mb-4 leading-tight">{tool.name}</h5>
                  <button 
                    onClick={(e) => { e.stopPropagation(); tool.action?.(); }}
                    className="w-full py-3 bg-white text-slate-900 text-[10px] font-black rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
                  >
                    {language === 'ar' ? 'تشغيل' : 'RUN'} {tool.icon}
                  </button>
                </div>
              </div>
              <div className={`absolute top-4 right-4 p-2 ${tool.color} text-white rounded-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                 {tool.icon}
              </div>
              {showTooltips && (
                <div className={`absolute top-14 right-4 w-32 p-2 bg-slate-900/90 backdrop-blur-md text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-white/5`}>
                  {isRtl ? tool.descAr : tool.descEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MainPreview;
