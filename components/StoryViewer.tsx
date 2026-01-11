
import React, { useEffect, useState } from 'react';
import { X, Sparkles, Send, Heart, MessageCircle } from 'lucide-react';
import { Language, SiteConfig } from '../types.ts';

interface StoryViewerProps {
  story: { image: string; message: string; timestamp: number };
  onClose: () => void;
  language: Language;
  siteConfig: SiteConfig;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose, language, siteConfig }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total (50 * 100)
    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center p-0 md:p-10 animate-in fade-in duration-500">
      <div className="w-full max-w-lg h-full md:h-[800px] relative bg-slate-900 md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
        
        {/* شريط التقدم */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/20 z-20">
          <div 
            className="h-full bg-indigo-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* معلومات المدير */}
        <div className="absolute top-6 left-0 w-full px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border-2 border-indigo-500 p-0.5 bg-black/20 backdrop-blur-md">
               <img src={siteConfig.manager_pic} className="w-full h-full object-cover rounded-lg" alt="" />
            </div>
            <div>
               <h4 className="text-white text-xs font-black uppercase tracking-widest">{siteConfig.manager_name}</h4>
               <p className="text-[10px] text-indigo-400 font-bold">{language === 'ar' ? 'رسالة من القيادة' : 'Message from Command'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-rose-500 text-white rounded-xl backdrop-blur-md transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* محتوى الستوري */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-950">
           {story.image ? (
             <img src={story.image} className="w-full h-full object-cover opacity-80" alt="Story" />
           ) : (
             <div className="p-10 text-center space-y-4">
                <Sparkles className="w-16 h-16 text-indigo-500 mx-auto animate-pulse" />
                <h2 className="text-2xl font-black text-white">{language === 'ar' ? 'تحديث إبداعي جديد' : 'New Creative Update'}</h2>
             </div>
           )}

           {/* الطبقة الشفافة للنص */}
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-10">
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl transform translate-y-0 animate-in slide-in-from-bottom-10 duration-1000">
                 <p className={`text-white text-lg font-bold leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                   {story.message}
                 </p>
              </div>
           </div>
        </div>

        {/* التفاعل السفلي */}
        <div className="p-8 bg-black/40 backdrop-blur-md flex items-center gap-4 border-t border-white/5">
           <div className="flex-1 h-12 bg-white/10 rounded-2xl flex items-center px-4 text-white/50 text-xs font-bold">
              {language === 'ar' ? 'تفاعل مع المدير...' : 'React to CEO...'}
           </div>
           <button className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
              <Heart className="w-5 h-5 fill-current" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
