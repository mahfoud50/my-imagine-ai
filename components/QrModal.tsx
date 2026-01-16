
import React, { useState } from 'react';
import { X, QrCode, Link as LinkIcon, Sparkles, Wand2 } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (url: string) => void;
  language: Language;
  isGenerating: boolean;
}

const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, onGenerate, language, isGenerating }) => {
  const [url, setUrl] = useState('');
  const t = translations[language];
  const isRtl = language === 'ar';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onGenerate(url.trim());
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative animate-in zoom-in-95 duration-300 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <button onClick={onClose} className={`absolute top-5 ${isRtl ? 'left-5' : 'right-5'} p-2 text-slate-400 hover:text-rose-500 transition-all z-10 hover:rotate-90`}>
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-4 floating-item">
              <QrCode className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.qrCode}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.qrCodeDesc}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-slate-400 group-focus-within:text-indigo-500 transition-colors`}>
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input 
                  type="url"
                  required
                  autoFocus
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://google.com"
                  className={`w-full p-4 ${isRtl ? 'pr-12' : 'pl-12'} bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs font-bold dark:text-white shadow-inner`}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!url.trim() || isGenerating}
              className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${!url.trim() || isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'}`}
            >
              <Sparkles className="w-4 h-4" />
              {isRtl ? 'توليد الرمز الآن' : 'GENERATE QR'}
            </button>
          </form>
          
          <p className="mt-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center opacity-50">
            High-Resolution Vector Output
          </p>
        </div>
      </div>
    </div>
  );
};

export default QrModal;
