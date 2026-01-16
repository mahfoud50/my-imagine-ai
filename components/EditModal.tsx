
import React, { useState } from 'react';
import { X, Wand2, Sparkles, Edit3 } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (prompt: string) => void;
  language: Language;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onApply, language }) => {
  const [prompt, setPrompt] = useState('');
  const t = translations[language];
  const isRtl = language === 'ar';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onApply(prompt.trim());
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl border dark:border-white/10 overflow-hidden relative animate-in zoom-in-95 duration-300 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} p-2 text-slate-400 hover:text-rose-500 transition-all z-10`}>
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/20 mb-4">
              <Wand2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.smartEdit}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{isRtl ? 'ما التغيير الذي ترغب به؟' : 'What would you like to change?'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <textarea 
                required
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.promptPlaceholder}
                className={`w-full h-24 p-4 bg-slate-50 dark:bg-slate-800 border dark:border-white/5 rounded-2xl outline-none focus:border-purple-500 transition-all text-xs font-bold dark:text-white resize-none ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            <button 
              type="submit" 
              disabled={!prompt.trim()}
              className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${!prompt.trim() ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/30'}`}
            >
              <Edit3 className="w-4 h-4" />
              {isRtl ? 'تطبيق التعديل' : 'APPLY SMART EDIT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
