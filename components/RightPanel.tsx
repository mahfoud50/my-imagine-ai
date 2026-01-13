
import React, { useState } from 'react';
import { History as HistoryIcon, Trash2, Clock, Download, Edit3, Sparkles, Wand2, X, Maximize2 } from 'lucide-react';
import { HistoryItem, Language } from '../types.ts';
import { translations } from '../translations.ts';

interface RightPanelProps {
  isOpen: boolean;
  history: HistoryItem[];
  onSelect: (url: string) => void;
  onDelete: (id: string) => void;
  language: Language;
  onClose: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ isOpen, history, onSelect, onDelete, language, onClose }) => {
  const t = translations[language];
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const handleDownload = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ImagineAI-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isRtl = language === 'ar';

  return (
    <aside className={`
      fixed lg:relative inset-y-0 ${isRtl ? 'left-0' : 'right-0'} 
      w-80 max-w-[85vw] h-full lg:h-[calc(100vh-5rem)] 
      bg-white dark:bg-slate-900 border-x lg:border dark:border-white/5 
      lg:m-4 lg:rounded-[2.5rem] flex flex-col h-full 
      shadow-2xl z-[60] transition-transform duration-500 ease-in-out
      ${isOpen ? 'translate-x-0' : (isRtl ? '-translate-x-full' : 'translate-x-full')}
      lg:translate-x-0 ${!isOpen && 'lg:hidden'}
    `}>
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 truncate tracking-tight uppercase">{t.history}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-rose-500 hover:text-white transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 space-y-4 opacity-40">
            <HistoryIcon className="w-10 h-10 text-slate-400" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.noHistory}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {history.map((item) => (
              <div 
                key={item.id}
                className="group relative bg-white dark:bg-slate-800 border dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => onSelect(item.imageUrl)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setExpandedImage(item.imageUrl); }} className="p-2 bg-white text-slate-900 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><Maximize2 className="w-4 h-4" /></button>
                    <button onClick={(e) => handleDownload(e, item.imageUrl)} className="p-2 bg-white text-slate-900 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><Download className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 bg-white text-slate-900 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-3 border-t dark:border-white/5">
                  <p className={`text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{item.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {expandedImage && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
          <img src={expandedImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10" alt="" />
          <button className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-xl"><X className="w-6 h-6" /></button>
        </div>
      )}
    </aside>
  );
};

export default RightPanel;
