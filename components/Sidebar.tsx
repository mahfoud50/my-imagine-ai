
import React from 'react';
import { 
  Upload, X, Zap, MessageSquare, 
  Loader2 as LoaderIcon
} from 'lucide-react';
import { GenerationSettings, Language, GenerationType } from '../types.ts';
import { translations } from '../translations.ts';

interface SidebarProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  onGenerate: () => void;
  isGenerating: boolean;
  language: Language;
  onClose?: () => void;
  onOpenApiKey?: () => void;
  onLogout?: () => void;
  // Added onQuickAction prop to match App.tsx usage
  onQuickAction?: (type: GenerationType, customPrompt?: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  settings, setSettings, onGenerate, isGenerating, language,
  onClose, onOpenApiKey, onLogout, onQuickAction
}) => {
  const t = translations[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSettings(prev => ({ ...prev, uploadedImage: event.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-80 max-w-[90vw] m-6 h-[calc(100vh-3rem)] bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border dark:border-white/5 rounded-[3rem] flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] shadow-indigo-500/5 relative z-50 transition-all duration-500">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Step 1: Prompt */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-rose-500/20">1</div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.promptLabel}</h3>
          </div>
          <div className="relative group">
            <textarea
              className={`w-full h-48 p-5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none resize-none dark:text-white font-medium transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
              placeholder={t.promptPlaceholder}
              value={settings.prompt}
              onChange={(e) => setSettings(prev => ({ ...prev, prompt: e.target.value }))}
            />
            <MessageSquare className={`absolute bottom-4 ${language === 'ar' ? 'left-4' : 'right-4'} w-4 h-4 text-slate-300 group-focus-within:text-rose-500 transition-colors`} />
          </div>
        </section>

        {/* Step 2: Upload Reference */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20">2</div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.uploadRef}</h3>
          </div>
          <div className="relative border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-2 hover:border-indigo-500 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 group">
            {settings.uploadedImage ? (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img src={settings.uploadedImage} className="w-full h-full object-cover" alt="Ref" />
                <button onClick={() => setSettings(prev => ({ ...prev, uploadedImage: null }))} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-10 cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors mb-2" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'اختر صورة مرجعية' : 'CHOOSE REFERENCE'}</span>
              </label>
            )}
          </div>
        </section>

        {/* Space reserved for clarity */}
        <div className="h-10"></div>
      </div>

      {/* Primary Action Section - Background and border removed as requested */}
      <div className="p-6 rounded-b-[3rem]">
        <button 
          onClick={onGenerate} 
          disabled={isGenerating} 
          className={`w-full py-6 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${isGenerating ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-rose-500/20'}`}
        >
          {isGenerating ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
          {isGenerating ? t.generating : t.generate}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
