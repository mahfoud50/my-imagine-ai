
import React from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  language: Language;
  toolName: string;
  toolIcon: React.ReactNode;
  toolColor: string;
  currentImage: string | null;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, language, toolName, toolIcon, toolColor, currentImage }) => {
  const t = translations[language];
  const isRtl = language === 'ar';

  if (!isOpen) return null;

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
            <div className={`w-14 h-14 ${toolColor} text-white rounded-2xl flex items-center justify-center shadow-xl mb-4`}>
              {toolIcon}
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{toolName}</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              {isRtl ? 'تأكيد العملية على الصورة الحالية' : 'Confirm action on current image'}
            </p>
          </div>

          <div className="mb-8 rounded-2xl overflow-hidden border dark:border-white/10 aspect-video bg-slate-50 dark:bg-slate-950">
            {currentImage ? (
              <img src={currentImage} className="w-full h-full object-cover opacity-50" alt="Current" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6">
                 <AlertCircle className="w-8 h-8 text-rose-500" />
                 <p className="text-[10px] font-black text-rose-500 uppercase">{isRtl ? 'لا توجد صورة مرجعية' : 'No reference image'}</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => { onConfirm(); onClose(); }}
            disabled={!currentImage}
            className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${!currentImage ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : `${toolColor} text-white hover:brightness-110 shadow-indigo-500/30`}`}
          >
            <Check className="w-4 h-4" />
            {isRtl ? 'بدء المعالجة الآن' : 'START PROCESSING NOW'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
