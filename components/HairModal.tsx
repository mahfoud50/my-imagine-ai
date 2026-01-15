
import React, { useState } from 'react';
import { X, Scissors, Check, User as UserIcon, Wand2 } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface HairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (hairPrompt: string) => void;
  language: Language;
}

const HairModal: React.FC<HairModalProps> = ({ isOpen, onClose, onApply, language }) => {
  const t = translations[language];
  const [selectedStyle, setSelectedStyle] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  if (!isOpen) return null;

  const styles = [
    { id: 'long', label: t.hairLong, icon: '💇‍♀️', prompt: 'long flowing hair' },
    { id: 'short', label: t.hairShort, icon: '💇‍♂️', prompt: 'short stylish haircut' },
    { id: 'curly', label: t.hairCurly, icon: '🌀', prompt: 'curly textured hair' },
    { id: 'fade', label: t.hairFade, icon: '📐', prompt: 'modern fade haircut' },
    { id: 'blonde', label: t.hairBlonde, icon: '✨', prompt: 'smooth blonde hair' },
    { id: 'bald', label: t.hairBald, icon: '🥚', prompt: 'completely bald head' },
  ];

  const handleApply = () => {
    const finalPrompt = customPrompt.trim() || selectedStyle;
    if (finalPrompt) {
      onApply(finalPrompt);
      onClose();
    }
  };

  const isRtl = language === 'ar';

  return (
    <div className="fixed inset-0 z-[3500] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border dark:border-white/10 overflow-hidden relative">
        <button onClick={onClose} className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} p-2 text-slate-400 hover:text-rose-500 transition-all`}>
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.hairStylesTitle}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.hairStyleDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {styles.map(style => (
              <button
                key={style.id}
                onClick={() => {
                  setSelectedStyle(style.prompt);
                  setCustomPrompt('');
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${selectedStyle === style.prompt ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:border-amber-500/30'}`}
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">{style.icon}</span>
                <span className="text-[10px] font-black uppercase">{style.label}</span>
                {selectedStyle === style.prompt && <div className="absolute top-2 right-2"><Check className="w-3 h-3 text-white" /></div>}
              </button>
            ))}
          </div>

          <div className="space-y-4">
             <div className="relative">
                <input 
                  type="text" 
                  value={customPrompt}
                  onChange={(e) => {
                    setCustomPrompt(e.target.value);
                    setSelectedStyle('');
                  }}
                  placeholder={t.promptPlaceholder}
                  className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-white/5 rounded-2xl outline-none focus:border-amber-500 transition-all text-xs font-bold dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}
                />
                <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} text-slate-400`}>
                   <Wand2 className="w-4 h-4" />
                </div>
             </div>

             <button 
               onClick={handleApply}
               disabled={!selectedStyle && !customPrompt.trim()}
               className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${!selectedStyle && !customPrompt.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-500/20'}`}
             >
               <Scissors className="w-4 h-4" />
               {t.applyHair}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HairModal;
