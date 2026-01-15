
import React, { useState } from 'react';
import { X, Terminal, Code2, Sparkles, Zap } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  language: Language;
  isGenerating: boolean;
}

const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose, onGenerate, language, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const t = translations[language];
  const isRtl = language === 'ar';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative animate-in zoom-in-95 duration-300">
        {/* Tech decorative element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <button onClick={onClose} className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} p-2 text-slate-400 hover:text-rose-500 transition-all z-10 hover:scale-110`}>
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20 rotate-3">
              <Terminal className="w-6 h-6" />
            </div>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.textToCode}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.textToCodeDesc}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <textarea 
                  required
                  autoFocus
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.enterCodePrompt}
                  className={`w-full h-28 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-3xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-xs font-mono font-bold dark:text-amber-400 shadow-inner resize-none ${isRtl ? 'text-right' : 'text-left'}`}
                />
                <div className={`absolute bottom-4 ${isRtl ? 'left-4' : 'right-4'} text-slate-700 dark:text-amber-900/50`}>
                  <Code2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!prompt.trim() || isGenerating}
              className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${!prompt.trim() || isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-500/30'}`}
            >
              <Zap className="w-4 h-4 fill-current" />
              {isRtl ? 'بدء البرمجة الذكية' : 'GENERATE CODE'}
            </button>
          </form>
          
          <div className="mt-6 flex items-center justify-center gap-4 opacity-40">
             <div className="h-px bg-slate-300 dark:bg-white/10 flex-1"></div>
             <div className="flex gap-1.5">
               <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
               <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
             </div>
             <div className="h-px bg-slate-300 dark:bg-white/10 flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeModal;
