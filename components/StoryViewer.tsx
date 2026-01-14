
import React, { useEffect, useState, useRef } from 'react';
import { X, Sparkles, Send, Heart, Share2, CheckCircle, MessageCircle, Volume2, VolumeX, Music } from 'lucide-react';
import { Language, SiteConfig } from '../types.ts';

interface StoryViewerProps {
  story: { id: string; image?: string; video?: string; audio?: string; message: string; timestamp: number };
  onClose: () => void;
  language: Language;
  siteConfig: SiteConfig;
  onSendMessage?: (content: string) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose, language, siteConfig, onSendMessage }) => {
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const lastTap = useRef<number>(0);
  const isRtl = language === 'ar';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => setIsMuted(true));
    }
    if (videoRef.current) {
      videoRef.current.play().catch(() => setIsMuted(true));
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (isPaused) {
      audioRef.current?.pause();
      videoRef.current?.pause();
      return;
    } else {
      audioRef.current?.play().catch(() => {});
      videoRef.current?.play().catch(() => {});
    }

    const duration = 10000; 
    const intervalTime = 50; 
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose(); 
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onClose, isPaused]);

  const triggerFeedback = (text: string) => {
    setFeedbackText(text);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const handleSendComment = () => {
    if (!comment.trim() || !onSendMessage) return;
    const fullMsg = isRtl ? `💬 تعليق على الستوري: ${comment}` : `💬 Story Comment: ${comment}`;
    onSendMessage(fullMsg);
    setComment('');
    triggerFeedback(isRtl ? 'تم إرسال تعليقك' : 'Comment Sent');
    setIsPaused(false);
  };

  const handleLike = () => {
    if (!liked && onSendMessage) {
      onSendMessage(isRtl ? '❤️ أعجبني الستوري الخاص بك' : '❤️ Liked your story');
    }
    setLiked(!liked);
    if (!liked) triggerFeedback(isRtl ? 'تم الإعجاب' : 'Liked');
  };

  const handleShare = () => {
    if (onSendMessage) {
      onSendMessage(isRtl ? '🔗 قام المستخدم بمشاركة الستوري الخاص بك' : '🔗 User shared your story');
    }
    triggerFeedback(isRtl ? 'تمت المشاركة' : 'Shared');
  };

  const handleDoubleTap = (now: number) => {
    if (now - lastTap.current < 300) {
      if (!liked) handleLike();
      setShowBigHeart(true);
      setTimeout(() => setShowBigHeart(false), 800);
    }
    lastTap.current = now;
  };

  const focusComment = () => {
    setIsPaused(true);
    commentInputRef.current?.focus();
  };

  return (
    <div 
      className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-500 cursor-pointer"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => !commentInputRef.current?.matches(':focus') && setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => !commentInputRef.current?.matches(':focus') && setIsPaused(false)}
      onClick={onClose} // الخروج عند الضغط على أي مكان في الخلفية
    >
      {story.audio && <audio ref={audioRef} src={story.audio} loop />}
      
      <div 
        className="w-full max-w-lg h-full md:h-[850px] relative bg-slate-900 md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col border border-white/5 cursor-default"
        onClick={(e) => {
          e.stopPropagation(); // منع إغلاق الستوري عند الضغط داخل البطاقة نفسها
          handleDoubleTap(Date.now());
        }}
      >
        
        {/* Progress Bars */}
        <div className="absolute top-4 left-0 w-full px-4 flex gap-1.5 z-[70]">
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-75 ease-linear shadow-[0_0_8px_white]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-8 left-0 w-full px-6 flex items-center justify-between z-[70]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl border-2 border-indigo-500 p-0.5 bg-black/40 backdrop-blur-md">
               <img src={siteConfig.manager_pic} className="w-full h-full object-cover rounded-xl" alt="Manager" />
            </div>
            <div className="drop-shadow-lg">
               <h4 className="text-white text-xs font-black uppercase tracking-widest">{siteConfig.manager_name}</h4>
               <div className="flex items-center gap-2">
                 <p className="text-[10px] text-indigo-400 font-black">{isRtl ? 'تحديث المدير' : 'Manager Update'}</p>
                 {(story.audio || story.video) && !isMuted && (
                   <div className="flex items-center gap-0.5 h-2">
                      <div className="w-0.5 bg-indigo-400 animate-[soundWave_0.6s_ease-in-out_infinite] h-full"></div>
                      <div className="w-0.5 bg-indigo-400 animate-[soundWave_0.8s_ease-in-out_infinite_0.1s] h-1/2"></div>
                      <div className="w-0.5 bg-indigo-400 animate-[soundWave_0.5s_ease-in-out_infinite_0.2s] h-3/4"></div>
                   </div>
                 )}
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {(story.audio || story.video) && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-xl transition-all border border-white/10"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="p-2 bg-white/10 hover:bg-rose-500 text-white rounded-xl backdrop-blur-xl transition-all border border-white/10 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
           {story.video ? (
             <video ref={videoRef} src={story.video} className="w-full h-full object-cover select-none pointer-events-none" playsInline loop />
           ) : story.image ? (
             <img src={story.image} className="w-full h-full object-cover select-none pointer-events-none" alt="Story" />
           ) : (
             <div className="p-10 text-center space-y-4">
                <Sparkles className="w-16 h-16 text-indigo-500 mx-auto animate-pulse" />
                <h2 className="text-xl font-black text-white">{isRtl ? 'محتوى حصري' : 'Exclusive Content'}</h2>
             </div>
           )}

           {showBigHeart && (
             <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-in zoom-in duration-300">
                <Heart className="w-28 h-28 text-rose-500 fill-current drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]" />
             </div>
           )}

           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>

           {/* Side Actions */}
           <div className={`absolute bottom-40 ${isRtl ? 'left-6' : 'right-6'} flex flex-col gap-5 z-[70]`}>
              <button 
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-3xl border border-white/10 transition-all active:scale-150 ${liked ? 'bg-rose-600 border-rose-500 shadow-lg' : 'bg-black/30 hover:bg-white/10'}`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current text-white' : 'text-white'}`} />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); focusComment(); }}
                className="w-12 h-12 rounded-2xl bg-black/30 hover:bg-white/10 flex items-center justify-center backdrop-blur-3xl border border-white/10 transition-all active:scale-90"
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                className="w-12 h-12 rounded-2xl bg-black/30 hover:bg-white/10 flex items-center justify-center backdrop-blur-3xl border border-white/10 transition-all active:scale-90"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
           </div>

           {/* Bottom Content Message */}
           <div className="absolute inset-x-0 bottom-40 px-8 pr-20 pointer-events-none">
              <div className="bg-black/20 backdrop-blur-xl p-5 rounded-[2rem] border border-white/10 shadow-2xl transform animate-in slide-in-from-bottom-5 duration-700">
                 <p className={`text-white text-base font-bold leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
                   {story.message}
                 </p>
              </div>
           </div>
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 w-full p-6 pb-12 bg-gradient-to-t from-black to-transparent flex flex-col gap-4 z-[70]">
           <div className="relative group">
              <input 
                ref={commentInputRef}
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                placeholder={isRtl ? 'أرسل ردك للمدير...' : 'Reply to manager...'}
                className={`w-full h-14 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/10 px-6 text-white text-xs font-bold outline-none focus:border-indigo-500/50 transition-all ${isRtl ? 'text-right pr-6 pl-14' : 'text-left pl-6 pr-14'}`}
              />
              <button 
                onClick={(e) => { e.stopPropagation(); handleSendComment(); }}
                disabled={!comment.trim()}
                className={`absolute ${isRtl ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30`}
              >
                <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
           </div>
           
           <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em] text-center">
             {isRtl ? 'يختفي خلال 10 ثوانٍ • تصل تفاعلاتك للمدير' : 'DISAPPEARS IN 10S • YOUR INTERACTIONS REACH THE CEO'}
           </p>
        </div>

        {showFeedback && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in zoom-in duration-300 z-[100] font-black text-xs uppercase tracking-widest">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            {feedbackText}
          </div>
        )}
      </div>

      <style>{`
        @keyframes soundWave {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
};

export default StoryViewer;
