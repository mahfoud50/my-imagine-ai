
import React, { useState } from 'react';
import { History as HistoryIcon, Trash2, Clock, Crown, Download, Edit3, Sparkles, Wand2, X, Maximize2 } from 'lucide-react';
import { HistoryItem, Language } from '../types.ts';
import { translations } from '../translations.ts';

interface RightPanelProps {
  history: HistoryItem[];
  onSelect: (url: string) => void;
  onDelete: (id: string) => void;
  language: Language;
  onClose?: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ history, onSelect, onDelete, language, onClose }) => {
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

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Edited': return <Edit3 className="w-3 h-3" />;
      case 'Upscaled': return <Sparkles className="w-3 h-3" />;
      case 'Cleaned': return <Wand2 className="w-3 h-3" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Edited': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Upscaled': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cleaned': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <aside className="w-72 lg:w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-l dark:border-white/5 flex flex-col h-full transform transition-all duration-700 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 truncate tracking-tight uppercase">{t.history}</h3>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black bg-indigo-600 dark:bg-indigo-500 px-2 py-0.5 rounded text-white shadow-lg">{history.length}</span>
           <button onClick={onClose} className="lg:hidden p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Responsive Moving Gallery Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 space-y-6 opacity-40">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center animate-bounce">
              <HistoryIcon className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] leading-relaxed">{t.noHistory}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {history.map((item, idx) => (
              <div 
                key={item.id}
                className={`group relative bg-white dark:bg-slate-800 border dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-3 transition-all duration-500 cursor-pointer floating-item stagger-${(idx % 3) + 1}`}
                onClick={() => setExpandedImage(item.imageUrl)}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={item.imageUrl} 
                    loading="lazy" 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-125" 
                    alt="Gallery Item" 
                  />
                  
                  {/* Floating Action Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 backdrop-blur-[6px]">
                    <div className="flex gap-2 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setExpandedImage(item.imageUrl); }}
                        className="p-3 bg-white text-slate-900 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-90"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => handleDownload(e, item.imageUrl)}
                        className="p-3 bg-white text-slate-900 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-2xl active:scale-90"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="p-3 bg-white text-slate-900 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-2xl active:scale-90"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className={`absolute bottom-3 ${language === 'ar' ? 'right-3' : 'left-3'} z-10 flex gap-1.5`}>
                     <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1.5 border shadow-2xl backdrop-blur-md ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)} {item.type}
                     </div>
                  </div>
                </div>
                
                <div className="p-4 border-t dark:border-white/5 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
                  <p className={`text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-bold mb-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between border-t dark:border-white/5 pt-3">
                    <div className="flex items-center gap-1.5 opacity-60">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span className="text-[9px] text-slate-400 font-black">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-slate-100 dark:bg-slate-700 text-slate-500 border dark:border-white/5">
                      {item.model}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responsive Indicator */}
      <div className="p-5 border-t dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
          <span>{language === 'ar' ? 'سعة التخزين المحلي' : 'Local Storage Cap'}</span>
          <span className="text-indigo-500">{history.length}/20</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${Math.min(100, (history.length / 20) * 100)}%` }} />
        </div>
      </div>

      {/* Expanded Lightbox with Scaling Background */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[1000] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-4 md:p-12 animate-in fade-in duration-500 cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          {/* Controls */}
          <div className={`absolute top-8 ${language === 'ar' ? 'left-8' : 'right-8'} flex gap-4 z-[1001]`}>
             <button 
              onClick={(e) => { e.stopPropagation(); handleDownload(e, expandedImage); }}
              className="p-4 bg-white/10 text-white rounded-3xl hover:bg-indigo-600 transition-all border border-white/10 flex items-center gap-3 font-black text-sm backdrop-blur-md"
             >
               <Download className="w-5 h-5" /> <span className="hidden sm:inline">{language === 'ar' ? 'تحميل' : 'Download'}</span>
             </button>
             <button 
              onClick={() => setExpandedImage(null)}
              className="p-4 bg-rose-500 text-white rounded-3xl hover:bg-rose-600 transition-all shadow-2xl flex items-center justify-center border border-rose-400/20"
             >
               <X className="w-6 h-6" />
             </button>
          </div>
          
          <div 
            className="relative max-w-full max-h-full flex flex-col items-center justify-center cursor-default gap-8 p-4 group"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Animated Glow behind the image */}
              <div className="absolute -inset-10 bg-indigo-500/30 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              <img 
                src={expandedImage} 
                className="max-w-[95vw] max-h-[80vh] object-contain rounded-[2.5rem] md:rounded-[4rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-90 duration-700 relative z-10" 
                alt="Expanded Preview" 
              />
            </div>
            
            <div className="bg-white/5 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 text-white text-[10px] md:text-xs font-black tracking-[0.4em] uppercase flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-10 duration-1000">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              Imagine AI Visual Masterpiece
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightPanel;
