
import React, { memo } from 'react';
import { 
  Upload, X, Zap, Layout, 
  Loader2 as LoaderIcon, Sparkles, AlertCircle, Rocket
} from 'lucide-react';
import { GenerationSettings, Language, ModelStrategy } from '../types.ts';
import { translations } from '../translations.ts';

interface SidebarProps {
  isOpen: boolean;
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  onGenerate: () => void;
  onUpload?: (dataUrl: string) => void;
  isGenerating: boolean;
  language: Language;
  onClose: () => void;
  modelStrategy: ModelStrategy;
  setModelStrategy: (strategy: ModelStrategy) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, settings, setSettings, onGenerate, onUpload, isGenerating, language,
  onClose, modelStrategy, setModelStrategy
}) => {
  const t = translations[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من حجم الملف (الحد الأقصى 5MB لتجنب بطء المتصفح)
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'ar' ? 'حجم الملف كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت.' : 'File is too large. Please select an image under 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const dataUrl = event.target?.result as string;
          if (onUpload) onUpload(dataUrl);
          else setSettings(prev => ({ ...prev, uploadedImage: dataUrl }));
        } catch (err) {
          console.error("FileReader error:", err);
        }
      };
      reader.onerror = () => {
        console.error("Failed to read file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onGenerate();
    }
  };

  const isRtl = language === 'ar';

  const aspectRatios = [
    { label: '1:1', value: '1:1' },
    { label: '16:9', value: '16:9' },
    { label: '9:16', value: '9:16' },
    { label: '4:3', value: '4:3' },
    { label: '3:4', value: '3:4' },
  ];

  return (
    <aside className={`
      fixed lg:relative inset-y-0 ${isRtl ? 'right-0' : 'left-0'} 
      h-full lg:h-[calc(100vh-5rem)] 
      bg-white dark:bg-slate-900 backdrop-blur-2xl border-x lg:border dark:border-white/5 
      lg:m-4 lg:rounded-[2.5rem] flex flex-col overflow-hidden 
      shadow-2xl z-[60] transition-all duration-500 ease-in-out
      ${isOpen 
        ? 'w-80 md:w-96 opacity-100 translate-x-0 pointer-events-auto' 
        : `w-0 opacity-0 pointer-events-none ${isRtl ? 'translate-x-full' : '-translate-x-full'}`
      }
    `}>
      <div className="flex items-center justify-between p-6 border-b dark:border-white/5 shrink-0">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-indigo-600 rounded-lg">
            <Zap className="w-4 h-4 text-white fill-current" />
           </div>
           <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">{isRtl ? 'إعدادات الإبداع' : 'CREATIVE STUDIO'}</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        <section className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">{t.modelStrategy}</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border dark:border-white/5">
             <button 
                onClick={() => setModelStrategy('fast')}
                className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${modelStrategy === 'fast' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
             >
                <Rocket className="w-3 h-3" /> {t.stratFast}
             </button>
             <button 
                onClick={() => setModelStrategy('accurate')}
                className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${modelStrategy === 'accurate' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
             >
                <Sparkles className="w-3 h-3" /> {t.stratAccurate}
             </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20">1</div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.uploadRef}</h3>
          </div>
          <div className="relative border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-2 hover:border-indigo-500 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 group">
            {settings.uploadedImage ? (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img src={settings.uploadedImage} className="w-full h-full object-cover" alt="Ref" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSettings(prev => ({ ...prev, uploadedImage: null }));
                  }} 
                  className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-8 cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors mb-2" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'تغيير الملابس/تعديل صورة' : 'IMAGE-TO-IMAGE'}</span>
              </label>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-amber-500/20">2</div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.aspectRatio}</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => setSettings(prev => ({ ...prev, aspectRatio: ratio.value }))}
                className={`p-2 flex flex-col items-center gap-1 rounded-xl border transition-all ${
                  settings.aspectRatio === ratio.value 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-400 hover:border-indigo-500/50'
                }`}
              >
                <Layout className="w-4 h-4" />
                <span className="text-[8px] font-black">{ratio.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rose-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-rose-500/20">3</div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.promptLabel}</h3>
            </div>
          </div>
          <textarea
            className={`w-full h-32 lg:h-40 p-5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none resize-none dark:text-white font-medium transition-all ${isRtl ? 'text-right' : 'text-left'}`}
            placeholder={t.promptPlaceholder}
            value={settings.prompt}
            onKeyDown={handleKeyDown}
            onChange={(e) => setSettings(prev => ({ ...prev, prompt: e.target.value }))}
          />
        </section>
      </div>

      <div className="p-6 border-t dark:border-white/5 bg-white dark:bg-slate-900 lg:bg-transparent shrink-0">
        <button 
          onClick={onGenerate} 
          disabled={isGenerating || !settings.prompt.trim()} 
          className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${isGenerating || !settings.prompt.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white hover:shadow-indigo-500/25'}`}
        >
          {isGenerating ? <LoaderIcon className="w-5 h-5 animate-spin" /> : (modelStrategy === 'fast' ? <Rocket className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />)}
          {isGenerating ? t.generating : (modelStrategy === 'fast' ? `${t.generate} (Turbo)` : t.generate)}
        </button>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
