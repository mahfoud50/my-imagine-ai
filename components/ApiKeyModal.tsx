
import React from 'react';
import { ShieldAlert, ExternalLink, Zap, X, Check } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (key: string) => void;
  language: Language;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onConfirm, language }) => {
  const [inputKey, setInputKey] = React.useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (inputKey.length < 10) return;
    localStorage.setItem('user_api_key', inputKey);
    onConfirm(inputKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-all">
          <X className="w-6 h-6" />
        </button>

        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
            {language === 'ar' ? 'تخصيص المفتاح البرمجي' : 'Custom API Key'}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 px-4 leading-relaxed">
            {language === 'ar' 
              ? 'يمكنك استخدام مفتاحك الخاص للحصول على سرعة أعلى، أو الاستمرار باستخدام مفتاح المنصة الافتراضي.' 
              : 'You can use your private key for faster generation, or continue with the default platform key.'}
          </p>

          <input 
            type="password" 
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="AIzaSy..." 
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl mb-6 text-center font-mono text-sm outline-none focus:border-indigo-500 transition-all dark:text-white shadow-inner"
          />

          <div className="grid grid-cols-1 gap-3">
            <button onClick={handleSave} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20">
              <Check className="w-5 h-5" /> {language === 'ar' ? 'حفظ المفتاح وتفعيل' : 'Save & Activate'}
            </button>
            
            <button onClick={onClose} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm">
              {language === 'ar' ? 'استخدام المفتاح الافتراضي' : 'Use Default Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
