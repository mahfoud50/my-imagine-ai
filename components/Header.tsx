
import React, { useState, useRef, useEffect } from 'react';
import { User, Settings as SettingsIcon, Bell, Key, LogOut, ChevronDown, CheckCircle, Clock, Sparkles, X, Languages, Menu, Zap, MessageSquare } from 'lucide-react';
import { Language, AppNotification, SiteConfig } from '../types.ts';
import { translations } from '../translations.ts';

interface HeaderProps {
  credits: number;
  user: { name: string; username?: string; profilePic?: string; story?: { isNew: boolean } } | null;
  isPaid?: boolean;
  language: Language;
  siteConfig?: SiteConfig;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onToggleLang: () => void;
  onUpgrade?: () => void;
  onProfile?: () => void;
  onCredits?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  credits, user, isPaid, language, siteConfig, notifications, onMarkAllRead, 
  onToggleLang, onUpgrade, onProfile, onCredits, onSettings, onLogout, onToggleSidebar 
}) => {
  const t = translations[language];
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const hasUnread = notifications.some(n => !n.isRead);
  
  // Logic to show story ring: Either a new personal story OR a new global story from CEO
  const lastGlobalId = localStorage.getItem('last_seen_global_story_id');
  const hasNewGlobalStory = siteConfig?.global_story?.active && siteConfig.global_story.id !== lastGlobalId;
  const hasNewPersonalStory = user?.story?.isNew;
  const hasNewStory = hasNewGlobalStory || hasNewPersonalStory;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (callback?: () => void) => {
    if (callback) callback();
    setIsProfileOpen(false);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'update': return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTimeAgo = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diff < 60) return language === 'ar' ? 'الآن' : 'just now';
    if (diff < 3600) return language === 'ar' ? `منذ ${Math.floor(diff/60)} د` : `${Math.floor(diff/60)}m ago`;
    return language === 'ar' ? 'اليوم' : 'Today';
  };

  return (
    <header className="h-20 bg-[#0f172a] border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-[60] shadow-2xl relative">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-300 hover:bg-white/5 rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex flex-col">
          <span className="text-[18px] md:text-[24px] font-bold text-white tracking-[1px] md:tracking-[2px] font-sans whitespace-nowrap">
            IMAGINE <span className="text-[#00d2ff]" style={{ textShadow: '0 0 8px rgba(0, 210, 255, 0.6)' }}>AI</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <button 
          onClick={onUpgrade}
          className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest active:scale-95"
        >
          <Key className="w-4 h-4 md:w-5 md:h-5" />
          <span>{t.upgrade}</span>
        </button>

        <button 
          onClick={onToggleLang}
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-slate-300 text-xs font-black uppercase tracking-widest"
        >
          <Languages className="w-4 h-4" />
          <span>{t.language}</span>
        </button>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 md:p-2.5 hover:bg-white/5 rounded-xl transition-all relative group border border-transparent hover:border-white/10"
          >
            <Bell className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${isNotificationsOpen ? 'text-[#00d2ff]' : 'text-slate-400 group-hover:text-[#00d2ff]'}`} />
            {hasUnread && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-rose-500 border-2 border-[#0f172a] rounded-full animate-pulse"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className={`absolute top-[calc(100%+12px)] ${language === 'ar' ? 'left-0' : 'right-0'} w-[300px] md:w-96 bg-[#1e293b] rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[100] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
                <button onClick={onMarkAllRead} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">{t.markAllRead}</button>
                <h3 className="text-sm font-black text-white">{t.notifications}</h3>
              </div>
              <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 text-xs">{t.noNotifications}</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all relative group/item ${!notif.isRead ? 'bg-indigo-500/5' : ''}`}>
                       <div className="flex gap-3">
                          <div className={`shrink-0 w-8 h-8 rounded-lg ${!notif.isRead ? 'bg-indigo-500/20' : 'bg-white/5'} flex items-center justify-center`}>{getNotifIcon(notif.type)}</div>
                          <div className="flex-1 min-w-0">
                             <h4 className="text-xs font-black text-white mb-1 truncate">{notif.title}</h4>
                             <p className="text-[10px] text-slate-400 leading-tight mb-1">{notif.description}</p>
                             <div className="flex items-center gap-1 text-[9px] text-slate-500"><Clock className="w-2.5 h-2.5" />{getTimeAgo(notif.time)}</div>
                          </div>
                          {!notif.isRead && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-2"></div>}
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu Container */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={onProfile}>
            <div className={`relative p-1 rounded-full transition-all duration-500 ${hasNewStory ? 'bg-rose-600 animate-spin-slow p-[3px]' : ''}`}>
              <div className={`rounded-full bg-[#0f172a] p-0.5`}>
                <img 
                  src={user?.profilePic || "https://i.pravatar.cc/40"} 
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 p-0.5 group-hover:scale-105 transition-transform shadow-sm object-cover border-[#00d2ff]`} 
                  alt="Avatar"
                />
              </div>
              {hasNewStory && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full flex items-center justify-center border-2 border-[#0f172a] animate-bounce">
                   <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div className={`hidden md:flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`}>
              <span className="text-sm font-bold text-slate-200 leading-tight truncate max-w-[100px]">{user?.name}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full w-fit flex items-center gap-1 bg-emerald-500/20 text-emerald-400`}>
                {credits > 0 ? `${credits} ${t.points}` : t.free}
              </span>
            </div>
            {!hasNewStory && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }}
                className="p-1 hover:bg-white/5 rounded-lg transition-all"
              >
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Floating Dropdown Menu - Small & Compact Design */}
          {isProfileOpen && (
            <div className={`absolute top-[calc(100%+15px)] ${language === 'ar' ? 'left-0 md:left-2' : 'right-0 md:right-2'} w-56 md:w-64 bg-[#1e293b] rounded-[1.75rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300 z-[100] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="p-3 bg-slate-800/30 border-b border-white/5">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 mb-1">{language === 'ar' ? 'حسابك' : 'Your Account'}</p>
                 <div className="px-1">
                    <p className="text-xs font-black text-white truncate">{user?.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono truncate">{user?.username || 'user_id'}</p>
                 </div>
              </div>
              <div className="p-2 space-y-0.5">
                <button onClick={() => handleAction(onProfile)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-3 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 rounded-xl transition-all group`}>
                   <span className="font-bold group-hover:text-white transition-colors">{t.profile}</span>
                   <User className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => handleAction(onSettings)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-3 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 rounded-xl transition-all group`}>
                   <span className="font-bold group-hover:text-white transition-colors">{t.settings}</span>
                   <SettingsIcon className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-45 transition-transform" />
                </button>
                <div className="h-px bg-white/5 mx-3 my-1"></div>
                <button onClick={() => handleAction(onUpgrade)} className="w-full py-3 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl mb-1 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                   <Key className="w-3.5 h-3.5" /> 
                   {t.upgrade}
                </button>
                <button onClick={() => handleAction(onLogout)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-3 px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-bold group`}>
                   <span className="group-hover:text-rose-300 transition-colors">{t.logout}</span>
                   <LogOut className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
