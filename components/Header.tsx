import React, { useState, useRef, useEffect } from 'react';
import { User, Settings as SettingsIcon, Bell, Key, LogOut, ChevronDown, CheckCircle, Clock, Sparkles, X, Languages, Menu, Zap, MessageSquare, Shield } from 'lucide-react';
import { Language, AppNotification, SiteConfig } from '../types.ts';
import { translations } from '../translations.ts';

interface HeaderProps {
  credits: number;
  user: { name: string; username?: string; profilePic?: string; isAdmin: boolean; story?: { isNew: boolean } } | null;
  isPaid?: boolean;
  language: Language;
  siteConfig?: SiteConfig;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onToggleLang: () => void;
  onUpgrade?: () => void;
  onProfile?: () => void;
  onOpenInbox?: () => void;
  onOpenStory?: () => void; 
  onCredits?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  onAdmin?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  credits, user, isPaid, language, siteConfig, notifications, onMarkAllRead, 
  onToggleLang, onUpgrade, onProfile, onOpenInbox, onOpenStory, onCredits, onSettings, onLogout, onToggleSidebar, onAdmin 
}) => {
  const t = translations[language];
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const hasUnread = notifications.some(n => !n.isRead);
  
  const checkHasNewStory = () => {
    if (!siteConfig?.global_story?.active) return false;
    try {
      const seenStories = JSON.parse(localStorage.getItem('seen_stories') || '[]');
      return !seenStories.includes(siteConfig.global_story.id);
    } catch (e) {
      return true;
    }
  };

  const hasNewStory = checkHasNewStory();

  useEffect(() => {
    setLogoError(false);
  }, [siteConfig?.site_logo]);

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

  const handleProfileClick = () => {
    if (hasNewStory && onOpenStory) {
      onOpenStory();
    } else if (onProfile) {
      onProfile();
    }
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
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 text-slate-300 hover:bg-white/10 hover:text-[#00d2ff] rounded-xl transition-all border border-white/5 active:scale-90"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4">
          {siteConfig?.site_logo && !logoError ? (
            <img 
              src={siteConfig.site_logo} 
              alt="Logo" 
              className="w-auto object-contain transition-all hover:scale-105"
              style={{ 
                height: `${(siteConfig.site_logo_scale || 1) * 32}px`, 
                maxHeight: '60px',
                minHeight: '20px'
              }}
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-[18px] md:text-[24px] font-bold text-white tracking-[1px] md:tracking-[2px] font-sans whitespace-nowrap">
              IMAGINE <span className="text-[#00d2ff]" style={{ textShadow: '0 0 8px rgba(0, 210, 255, 0.6)' }}>AI</span>
            </span>
          )}

          {user?.isAdmin && (
            <div id="teleport-to-header-target" className="hidden lg:flex bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg animate-pulse border border-emerald-400/30 gap-2 items-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              SOVEREIGN OVERRIDE: ONLINE ✅
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <button 
          onClick={onUpgrade}
          className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-indigo-600 text-white rounded-lg md:rounded-xl shadow-lg hover:bg-indigo-700 transition-all font-black text-[10px] md:text-xs uppercase tracking-wider active:scale-95 shrink-0"
        >
          <Key className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">{t.upgrade}</span>
        </button>

        <button 
          onClick={onToggleLang}
          className="flex items-center gap-2 px-2.5 md:px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl transition-all border border-white/5 text-slate-300 text-[10px] md:text-xs font-black uppercase active:scale-95 shrink-0"
        >
          <Languages className="w-4 h-4" />
          <span className="hidden md:inline tracking-widest">{t.language}</span>
          <span className="md:hidden inline">{language === 'ar' ? 'EN' : 'AR'}</span>
        </button>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 md:p-2.5 hover:bg-white/5 rounded-xl transition-all relative group border border-transparent hover:border-white/10"
          >
            <Bell className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${isNotificationsOpen ? 'text-[#00d2ff]' : 'text-slate-400 group-hover:text-[#00d2ff]'}`} />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 md:w-2.5 md:h-2.5 bg-rose-500 border-2 border-[#0f172a] rounded-full animate-pulse"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className={`absolute top-[calc(100%+12px)] ${language === 'ar' ? 'left-0' : 'right-0'} w-[280px] md:w-96 bg-[#1e293b] rounded-[1.5rem] md:rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[100] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
                <button onClick={onMarkAllRead} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">{t.markAllRead}</button>
                <h3 className="text-xs md:text-sm font-black text-white">{t.notifications}</h3>
              </div>
              <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">{t.noNotifications}</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all relative group/item ${!notif.isRead ? 'bg-indigo-500/5' : ''}`}>
                       <div className="flex gap-3">
                          <div className={`shrink-0 w-8 h-8 rounded-lg ${!notif.isRead ? 'bg-indigo-500/20' : 'bg-white/5'} flex items-center justify-center`}>{getNotifIcon(notif.type)}</div>
                          <div className="flex-1 min-w-0">
                             <h4 className="text-[11px] font-black text-white mb-1 truncate">{notif.title}</h4>
                             <p className="text-[9px] text-slate-400 leading-tight mb-1">{notif.description}</p>
                             <div className="flex items-center gap-1 text-[8px] text-slate-500"><Clock className="w-2.5 h-2.5" />{getTimeAgo(notif.time)}</div>
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

        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={handleProfileClick}>
            <div className={`relative p-0.5 rounded-full transition-all duration-500 ${hasNewStory ? 'bg-rose-600 animate-spin-slow p-[2px]' : ''}`}>
              <div className={`rounded-full bg-[#0f172a] p-0.5`}>
                <img 
                  src={user?.profilePic || "https://i.pravatar.cc/40"} 
                  className={`w-7 h-7 md:w-10 md:h-10 rounded-full border border-[#00d2ff] p-0.5 group-hover:scale-105 transition-transform shadow-sm object-cover`} 
                  alt="Avatar"
                />
              </div>
              {hasNewStory && (
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-rose-600 rounded-full flex items-center justify-center border-2 border-[#0f172a] animate-bounce">
                   <Sparkles className="w-2 md:w-2.5 h-2 md:h-2.5 text-white" />
                </div>
              )}
            </div>
            <div className={`hidden sm:flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`}>
              <span className="text-xs md:text-sm font-bold text-slate-200 leading-tight truncate max-w-[80px] md:max-w-[120px]">{user?.name}</span>
              <span className={`text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full w-fit flex items-center gap-1 bg-emerald-500/20 text-emerald-400`}>
                {credits > 0 ? `${credits} ${t.points}` : t.free}
              </span>
            </div>
            {!hasNewStory && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }}
                className="p-1 hover:bg-white/5 rounded-lg transition-all"
              >
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {isProfileOpen && (
            <div className={`absolute top-[calc(100%+15px)] ${language === 'ar' ? 'left-0' : 'right-0'} w-56 md:w-64 bg-[#1e293b] rounded-[1.25rem] md:rounded-[1.75rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300 z-[100] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="p-4 bg-slate-800/30 border-b border-white/5">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 mb-1">{language === 'ar' ? 'حسابك' : 'Your Account'}</p>
                 <div className="px-1">
                    <p className="text-xs font-black text-white truncate">{user?.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono truncate">{user?.username || 'user_id'}</p>
                 </div>
              </div>
              <div className="p-2 space-y-0.5">
                {user?.isAdmin && (
                  <>
                    <button onClick={() => handleAction(onAdmin)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-3 px-3 py-2.5 text-[11px] text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all group font-black`}>
                       <span className="group-hover:text-amber-300 transition-colors">{t.adminPanel}</span>
                       <Shield className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    </button>
                    <button onClick={() => handleAction(onOpenInbox)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-3 px-3 py-2.5 text-[11px] text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all group font-black`}>
                       <span className="group-hover:text-indigo-300 transition-colors">{t.inbox}</span>
                       <MessageSquare className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="h-px bg-white/5 mx-3 my-1"></div>
                  </>
                )}
                <button onClick={() => handleAction(onProfile)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-3 px-3 py-2.5 text-[11px] text-slate-300 hover:bg-white/5 rounded-xl transition-all group`}>
                   <span className="font-bold group-hover:text-white transition-colors">{t.profile}</span>
                   <User className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => handleAction(onSettings)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-3 px-3 py-2.5 text-[11px] text-slate-300 hover:bg-white/5 rounded-xl transition-all group`}>
                   <span className="font-bold group-hover:text-white transition-colors">{t.settings}</span>
                   <SettingsIcon className="w-4 h-4 text-slate-400 group-hover:rotate-45 transition-transform" />
                </button>
                <div className="h-px bg-white/5 mx-3 my-1"></div>
                <button onClick={() => handleAction(onUpgrade)} className="w-full py-3 text-[11px] font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl mb-1 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                   <Key className="w-4 h-4" /> 
                   {t.upgrade}
                </button>
                <button onClick={() => handleAction(onLogout)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-3 px-3 py-2.5 text-[11px] text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-bold group`}>
                   <span className="group-hover:text-rose-300 transition-colors">{t.logout}</span>
                   <LogOut className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
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