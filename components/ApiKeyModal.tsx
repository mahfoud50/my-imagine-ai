
import React from 'react';
import { ShieldAlert, ExternalLink, Zap } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface ApiKeyModalProps {
  isOpen: boolean;
  // Fix: changed types from void to () => void to allow passing functions
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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 leading-tight">{t.choosePaidKey}</h2>
          <p className="text-slate-500 text-sm mb-4 px-4">{t.noActiveProject}</p>
          
          {/* Fix: Added mandatory link to billing documentation for Gemini API */}
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 text-xs font-bold hover:underline mb-8 block"
          >
            {language === 'ar' ? 'اطلع على وثائق الفوترة وGemini API' : 'Learn more about Gemini API billing documentation'}
          </a>

          <div className="flex flex-col gap-3">
            {/* Fix: onConfirm, onSimulateUpgrade and onClose are now correctly typed as functions */}
            <button onClick={onConfirm} className="w-full py-4 bg-rose-500 text-white rounded-xl font-black hover:bg-rose-600 transition-all shadow-lg flex items-center justify-center gap-2">
              {t.goProjects} <ExternalLink className="w-4 h-4" />
            </button>
            <button onClick={onSimulateUpgrade} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 fill-current" /> {t.simulateUpgrade}
            </button>
            <button onClick={onClose} className="w-full py-4 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-all">
              {t.cancel}
            </button>
          </div>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black">{t.securityProtocol}</p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
