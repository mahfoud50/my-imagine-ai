
import React from 'react';
import { ShieldAlert, ExternalLink, Zap } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSimulateUpgrade: () => void;
  language: Language;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onConfirm, onSimulateUpgrade, language }) => {
  const t = translations[language];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm md:max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8 text-center">
          <div className="w-14 h-14 md:w-20 md:h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <ShieldAlert className="w-7 h-7 md:w-10 md:h-10 text-rose-500" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 leading-tight">{t.choosePaidKey}</h2>
          <p className="text-slate-500 text-[11px] md:text-sm mb-3 px-2 md:px-4">{t.noActiveProject}</p>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 text-[10px] md:text-xs font-bold hover:underline mb-6 md:mb-8 block"
          >
            {language === 'ar' ? 'اطلع على وثائق الفوترة وGemini API' : 'Learn more about Gemini API billing documentation'}
          </a>

          <div className="flex flex-col gap-2.5">
            <button onClick={onConfirm} className="w-full py-3.5 md:py-4 bg-rose-500 text-white rounded-xl font-black text-[11px] md:text-sm hover:bg-rose-600 transition-all shadow-lg flex items-center justify-center gap-2">
              {t.goProjects} <ExternalLink className="w-4 h-4" />
            </button>
            <button onClick={onSimulateUpgrade} className="w-full py-3.5 md:py-4 bg-indigo-600 text-white rounded-xl font-black text-[11px] md:text-sm hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 fill-current" /> {t.simulateUpgrade}
            </button>
            <button onClick={onClose} className="w-full py-3 md:py-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-[11px] md:text-sm hover:bg-slate-200 transition-all">
              {t.cancel}
            </button>
          </div>
        </div>
        <div className="bg-slate-50 p-3 md:p-4 border-t border-slate-100 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
          <p className="text-[9px] md:text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black">{t.securityProtocol}</p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
