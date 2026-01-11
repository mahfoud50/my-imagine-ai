
import React from 'react';
import { 
  Upload, X, Zap, MessageSquare, 
  Key, LogOut, Loader2 as LoaderIcon
} from 'lucide-react';
import { GenerationSettings, Language } from '../types.ts';
import { translations } from '../translations.ts';

interface SidebarProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  onGenerate: () => void;
  isGenerating: boolean;
  language: Language;
  onClose?: () => void;
  onQuickAction?: (action: 'Cleaned' | 'Upscaled' | 'WatermarkRemoved') => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenApiKey?: () => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  settings, setSettings, onGenerate, isGenerating, language, onClose, onQuickAction,
  onOpenApiKey, onLogout
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
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Step 1: Description */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-500/20">1</div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.promptLabel}</h3>
          </div>
          <div className="relative group">
            <textarea
              className={`w-full h-40 p-5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none dark:text-white font-medium transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
              placeholder={t.promptPlaceholder}
              value={settings.prompt}
              onChange={(e) => setSettings(prev => ({ ...prev, prompt: e.target.value }))}
            />
            <MessageSquare className={`absolute bottom-4 ${language === 'ar' ? 'left-4' : 'right-4'} w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors`} />
          </div>
        </section>

        {/* Step 2: Reference Image */}
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
              <label className="flex flex-col items-center justify-center py-8 cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                <Zap className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors mb-2" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'اختر ملفاً' : 'CHOOSE FILE'}</span>
              </label>
            )}
          </div>
        </section>

        {/* Configuration */}
        <section className="space-y-6 pt-4 border-t dark:border-white/5">
          <div className="space-y-3">
            <h4 className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.aspectRatio}</h4>
            <div className="grid grid-cols-4 gap-2">
              {['1:1', '4:3', '16:9', '9:16'].map(ratio => (
                <button key={ratio} onClick={() => setSettings(prev => ({ ...prev, aspectRatio: ratio }))} className={`py-2 text-[10px] font-black rounded-lg border transition-all ${settings.aspectRatio === ratio ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500'}`}>
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Section: Actions & Account */}
      <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t dark:border-white/5 space-y-4 rounded-b-[3rem]">
        <button 
          onClick={onGenerate} 
          disabled={isGenerating} 
          className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${isGenerating ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {isGenerating ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
          {isGenerating ? t.generating : t.generate}
        </button>

        {/* Minimal User Access (Only API Key and Logout) */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onOpenApiKey}
            className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 border dark:border-white/5 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all group"
          >
            <Key className="w-3.5 h-3.5 group-hover:-rotate-12 transition-transform" /> {t.upgrade}
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 p-3 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-xl text-[10px] font-black hover:bg-rose-600 hover:text-white transition-all group"
          >
            <LogOut className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} /> {t.logout}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
