
import React, { useEffect } from 'react';
import { X, Bell, CheckCircle, MessageSquare, Sparkles, Info } from 'lucide-react';
import { AppNotification, Language } from '../types.ts';

interface ToastNotificationProps {
  toast: AppNotification | null;
  onClose: () => void;
  language: Language;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose, language }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'update': return <Sparkles className="w-4 h-4 text-amber-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const isRtl = language === 'ar';

  return (
    <div className={`fixed top-4 ${isRtl ? 'left-4' : 'right-4'} z-[2000] animate-in slide-in-from-top-4 fade-in duration-300`}>
      <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center gap-3 w-[260px] md:w-[300px] relative overflow-hidden group">
        {/* Progress bar timer */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 animate-[progress_5s_linear_forwards]"></div>
        
        <div className={`shrink-0 p-2 rounded-xl ${toast.type === 'message' ? 'bg-indigo-500/10' : 'bg-slate-100 dark:bg-white/5'} flex items-center justify-center`}>
          {getIcon()}
        </div>

        <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h4 className="text-[11px] font-black text-slate-900 dark:text-white mb-0.5 truncate">{toast.title}</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight line-clamp-1">{toast.description}</p>
        </div>

        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;
