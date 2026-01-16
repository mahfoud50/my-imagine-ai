
import React, { useState } from 'react';
import { X, Mic2, Play, Loader2, Music, CheckCircle } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface SpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (text: string, voice: string) => void;
  language: Language;
  isGenerating: boolean;
}

const SpeechModal: React.FC<SpeechModalProps> = ({ isOpen, onClose, onGenerate, language, isGenerating }) => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const t = translations[language];

  if (!isOpen) return null;

  const voices = [
    { id: 'Kore', name: 'Kore (Balanced)', type: 'Neutral' },
    { id: 'Zephyr', name: 'Zephyr (Deep)', type: 'Masculine' },
    { id: 'Puck', name: 'Puck (Youthful)', type: 'Energetic' },
    { id: 'Charon', name: 'Charon (Wisdom)', type: 'Mature' },
    { id: 'Fenrir', name: 'Fenrir (Vibrant)', type: 'Modern' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onGenerate(text, selectedVoice);
    }
  };

  const isRtl = language === 'ar';

  return (
    <div 
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} p-2 text-slate-400 hover:text-rose-500 transition-all`}>
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Mic2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.ttsTitle}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isRtl ? 'بواسطة Gemini AI' : 'Powered by Gemini AI'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'النص المراد تحويله' : 'Text to convert'}
              </label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.ttsPlaceholder}
                className={`w-full h-32 p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none dark:text-white font-medium transition-all ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            <div className="space-y-3">
              <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t.ttsVoice}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {voices.map(voice => (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-3 rounded-xl border text-[10px] font-black transition-all flex flex-col items-center gap-1 ${selectedVoice === voice.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500 hover:border-indigo-500/30'}`}
                  >
                    <Music className={`w-3.5 h-3.5 ${selectedVoice === voice.id ? 'text-white' : 'text-indigo-500'}`} />
                    <span>{voice.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isGenerating || !text.trim()} 
              className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${isGenerating || !text.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'}`}
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              {isGenerating ? (isRtl ? 'جاري التوليد...' : 'Generating...') : t.ttsGenerate}
            </button>
          </form>

          {isGenerating && (
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-500/20 animate-pulse">
               <p className="text-[10px] font-black text-indigo-600 text-center uppercase tracking-widest">{t.ttsPlaying}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechModal;
