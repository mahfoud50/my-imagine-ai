
import React, { useState, useRef } from 'react';
import { X, Scan, Upload, Loader2, Link as LinkIcon, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface QrDecoderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecode: (imageData: string) => Promise<string>;
  language: Language;
}

const QrDecoderModal: React.FC<QrDecoderModalProps> = ({ isOpen, onClose, onDecode, language }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[language];
  const isRtl = language === 'ar';

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDecode = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    try {
      const decodedText = await onDecode(selectedImage);
      setResult(decodedText);
    } catch (e) {
      setResult(isRtl ? "تعذر قراءة الكود. يرجى التأكد من وضوح الصورة." : "Could not read code. Please ensure image is clear.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border dark:border-white/10 overflow-hidden relative animate-in zoom-in-95 duration-300 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} p-2 text-slate-400 hover:text-rose-500 transition-all z-10`}>
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <Scan className="w-6 h-6" />
            </div>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.qrDecoderTitle}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.qrDecoderDesc}</p>
            </div>
          </div>

          <div className="space-y-6">
            {!selectedImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.qrDecoderPlaceholder}</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden border dark:border-white/10 group">
                  <img src={selectedImage} className="w-full h-full object-contain bg-slate-50 dark:bg-slate-950" alt="To Decode" />
                  <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {!result && (
                  <button 
                    onClick={handleDecode}
                    disabled={isProcessing}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                    {isProcessing ? (isRtl ? 'جاري التحليل...' : 'Analyzing...') : (isRtl ? 'تحليل الصورة الآن' : 'START ANALYZING')}
                  </button>
                )}
              </div>
            )}

            {result && (
              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-500/20 rounded-[2rem] p-6 animate-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-2 mb-4">
                    <LinkIcon className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{isRtl ? 'الرابط المكتشف' : 'Detected Content'}</span>
                 </div>
                 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6 break-all line-clamp-4 leading-relaxed bg-white/50 dark:bg-black/20 p-4 rounded-xl">
                   {result}
                 </p>
                 <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="flex-1 py-3 bg-white dark:bg-slate-800 border dark:border-white/5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-all dark:text-white"
                    >
                      {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? (isRtl ? 'تم النسخ' : 'COPIED') : (isRtl ? 'نسخ' : 'COPY')}
                    </button>
                    {result.startsWith('http') && (
                      <a 
                        href={result} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {isRtl ? 'فتح' : 'OPEN'}
                      </a>
                    )}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrDecoderModal;
