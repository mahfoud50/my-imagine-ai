
import React, { useState, useRef, useEffect, memo } from 'react';
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

  const isStoryActive = siteConfig?.global_story?.active;

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

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStoryActive && onOpenStory) {
      onOpenStory();
    } else {
      setIsProfileOpen(!isProfileOpen);
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
    <header className="h-16 md:h-20 bg-[#0f172a] border-b border-white/5 flex items-center justify-between px-2 md:px-8 z-[100] shadow-2xl relative shrink-0">
      <div className="flex items-center gap-1.5 md:gap-4 overflow-hidden">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-300 hover:bg-white/10 hover:text-[#00d2ff] rounded-lg transition-all border border-white/5 active:scale-90"
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <div className="flex items-center gap-2 md:gap-4 truncate">
          {siteConfig?.site_logo && !logoError ? (
            <img 
              src={siteConfig.site_logo} 
              alt="Logo" 
              className="w-auto object-contain transition-all hover:scale-105"
              style={{ 
                height: `${(siteConfig.site_logo_scale || 1) * 20}px`, 
                maxHeight: '36px',
                minHeight: '14px'
              }}
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-[10px] md:text-xl font-black text-white tracking-widest font-sans whitespace-nowrap">
              IMAGINE <span className="text-[#00d2ff]">AI</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-4">
        <button 
          onClick={onUpgrade}
          className="flex items-center justify-center w-8 h-8 md:w-auto md:px-4 md:py-2 bg-indigo-600 text-white rounded-lg md:rounded-xl shadow-lg hover:bg-indigo-700 transition-all font-black text-[10px] md:text-xs uppercase active:scale-95 shrink-0"
        >
          <Key className="w-3.5 h-3.5 md:w-5 md:h-5" />
          <span className="hidden lg:inline ml-2">{t.upgrade}</span>
        </button>

        <button 
          onClick={onToggleLang}
          className="flex items-center justify-center w-8 h-8 md:w-auto md:px-3 md:py-2 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl transition-all border border-white/5 text-slate-300 text-[10px] md:text-xs font-black uppercase active:scale-95 shrink-0"
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="hidden md:inline ml-2">{language === 'ar' ? 'EN' : 'AR'}</span>
        </button>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 md:p-2.5 hover:bg-white/5 rounded-lg md:rounded-xl transition-all relative group border border-transparent"
          >
            <Bell className={`w-4 h-4 md:w-6 md:h-6 transition-colors ${isNotificationsOpen ? 'text-[#00d2ff]' : 'text-slate-400'}`} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 border border-[#0f172a] rounded-full"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className={`fixed md:absolute top-16 md:top-[calc(100%+12px)] ${language === 'ar' ? 'left-2' : 'right-2'} w-[calc(100vw-16px)] md:w-80 bg-[#1e293b] rounded-xl md:rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 z-[110]`}>
              <div className="p-3 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
                <button onClick={onMarkAllRead} className="text-[9px] font-black text-indigo-400 uppercase">{t.markAllRead}</button>
                <h3 className="text-xs font-black text-white">{t.notifications}</h3>
              </div>
              <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">{t.noNotifications}</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-all">
                       <div className="flex gap-2.5">
                          <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">{getNotifIcon(notif.type)}</div>
                          <div className="flex-1 min-w-0 text-right">
                             <h4 className="text-[10px] font-black text-white mb-0.5 truncate">{notif.title}</h4>
                             <p className="text-[8px] text-slate-400 leading-tight mb-1">{notif.description}</p>
                             <div className="flex items-center justify-end gap-1 text-[7px] text-slate-500"><Clock className="w-2 h-2" />{getTimeAgo(notif.time)}</div>
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-3 relative" ref={dropdownRef}>
          <div 
            onClick={handleAvatarClick}
            className={`relative p-0.5 rounded-full cursor-pointer shrink-0 ${isStoryActive ? 'bg-rose-600' : ''}`}
          >
            <div className="rounded-full bg-[#0f172a] p-0.5">
              <img 
                src={user?.profilePic || `https://i.pravatar.cc/150?u=${user?.name}`} 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-[#00d2ff] object-cover" 
                alt="Avatar"
              />
            </div>
          </div>

          <div className="hidden lg:flex flex-col profile-name">
            <span className="text-[11px] font-bold text-slate-200 truncate max-w-[80px]">{user?.name}</span>
            <span className="text-[9px] font-black text-[#00d2ff]">{credits} {t.points}</span>
          </div>

          {isProfileOpen && (
            <div className={`absolute top-[calc(100%+12px)] ${language === 'ar' ? 'left-0' : 'right-0'} w-48 md:w-56 bg-[#1e293b] rounded-xl md:rounded-[1.5rem] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-3 z-[110]`}>
              <div className="p-3 md:p-4 bg-slate-800/30 border-b border-white/5">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{language === 'ar' ? 'حسابك' : 'Account'}</p>
                 <p className="text-[11px] font-bold text-white truncate">{user?.name}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                {user?.isAdmin && (
                  <button onClick={() => handleAction(onAdmin)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-2.5 px-3 py-2 text-[10px] text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all font-black`}>
                    <span>{t.adminPanel}</span>
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => handleAction(onProfile)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-2.5 px-3 py-2 text-[10px] text-slate-300 hover:bg-white/5 rounded-lg transition-all font-bold`}>
                  <span>{t.profile}</span>
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                </button>
                <button onClick={() => handleAction(onSettings)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-2.5 px-3 py-2 text-[10px] text-slate-300 hover:bg-white/5 rounded-lg transition-all font-bold`}>
                  <span>{t.settings}</span>
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <div className="h-px bg-white/5 mx-2 my-1"></div>
                <button onClick={() => handleAction(onLogout)} className={`w-full flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-2.5 px-3 py-2 text-[10px] text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all font-black`}>
                  <span>{t.logout}</span>
                  <LogOut className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
