
import React from 'react';

import {

Upload, X, Zap, MessageSquare,

Loader2 as LoaderIcon, HelpCircle, ChevronLeft, ChevronRight

} from 'lucide-react';

import { GenerationSettings, Language, GenerationType } from '../types.ts';

import { translations } from '../translations.ts';

interface SidebarProps {

isOpen: boolean;

settings: GenerationSettings;

setSettings: React.Dispatch<React.SetStateAction>;

onGenerate: () => void;

onUpload?: (dataUrl: string) => void;

isGenerating: boolean;

language: Language;

onClose: () => void;

onOpenApiKey?: () => void;

onLogout?: () => void;

onQuickAction?: (type: GenerationType, customPrompt?: string) => void;

showTooltips?: boolean;

}

const Sidebar: React.FC = ({

isOpen, settings, setSettings, onGenerate, onUpload, isGenerating, language,

onClose, onOpenApiKey, onLogout, onQuickAction, showTooltips

}) => {

const t = translations[language];

const handleFileChange = (e: React.ChangeEvent) => {

const file = e.target.files?.\[0\]; if (file) { const reader = new FileReader(); reader.onload = (event) => { const dataUrl = event.target?.result as string; if (onUpload) onUpload(dataUrl); else setSettings(prev => ({ ...prev, uploadedImage: dataUrl })); }; reader.readAsDataURL(file); }
};

const handleKeyDown = (e: React.KeyboardEvent) => {

if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { onGenerate(); }
};

const isRtl = language === 'ar';

return (

<aside className={\` fixed lg:relative inset-y-0 ${isRtl ? 'right-0' : 'left-0'} w-80 max-w-\[85vw\] h-full lg:h-\[calc(100vh-5rem)\] bg-white dark:bg-slate-900 backdrop-blur-2xl border-x lg:border dark:border-white/5 lg:m-4 lg:rounded-\[2.5rem\] flex flex-col overflow-hidden shadow-2xl z-\[60\] transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0 opacity-100' : (isRtl ? 'translate-x-full opacity-0 pointer-events-none' : '-translate-x-full opacity-0 pointer-events-none')} ${!isOpen ? 'w-0 m-0 border-0' : 'w-80'} \`}> {/\* Header for Mobile/Sidebar control \*/} <div className="flex items-center justify-between p-6 border-b dark:border-white/5"> <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">{t.promptLabel}</h3> <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"> <X className="w-5 h-5 text-slate-400" /> </button> </div> <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8"> {/\* Step 1: Prompt \*/} <section className="space-y-4"> <div className="flex items-center justify-between"> <div className="flex items-center gap-3"> <div className="w-8 h-8 bg-rose-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-rose-500/20">1</div> <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.promptLabel}</h3> </div> <span className="text-\[10px\] text-slate-400 font-bold uppercase tracking-tighter opacity-50">Ctrl+Enter</span> </div> <div className="relative group"> <textarea className={\`w-full h-40 lg:h-48 p-5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none resize-none dark:text-white font-medium transition-all ${language === 'ar' ? 'text-right' : 'text-left'}\`} placeholder={t.promptPlaceholder} value={settings.prompt} onKeyDown={handleKeyDown} onChange={(e) => setSettings(prev => ({ ...prev, prompt: e.target.value }))} /> </div> </section> {/\* Step 2: Upload Reference \*/} <section className="space-y-4"> <div className="flex items-center justify-between"> <div className="flex items-center gap-3"> <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20">2</div> <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.uploadRef}</h3> </div> </div> <div className="relative border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-2 hover:border-indigo-500 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 group"> {settings.uploadedImage ? ( <div className="relative aspect-video rounded-xl overflow-hidden"> <img src={settings.uploadedImage} className="w-full h-full object-cover" alt="Ref" /> <button onClick={(e) => { e.stopPropagation(); setSettings(prev => ({ ...prev, uploadedImage: null })); }} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform" > <X className="w-4 h-4" /> </button> </div> ) : ( <label className="flex flex-col items-center justify-center py-8 lg:py-10 cursor-pointer"> <input type="file" className="hidden" onChange={handleFileChange} accept="image/\*" /> <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors mb-2" /> <span className="text-\[10px\] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'اختر صورة مرجعية' : 'CHOOSE REFERENCE'}</span> </label> )} </div> </section> </div> <div className="p-6 border-t dark:border-white/5 bg-white dark:bg-slate-900 lg:bg-transparent"> <button onClick={onGenerate} disabled={isGenerating || !settings.prompt.trim()} className={\`w-full py-5 lg:py-6 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${isGenerating || !settings.prompt.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-rose-500/20'}\`} > {isGenerating ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />} {isGenerating ? t.generating : t.generate} </button> </div> </aside>
);

};

export default Sidebar;

