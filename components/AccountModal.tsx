
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, CreditCard, Settings, CheckCircle2, Zap, 
  Camera, Save, Loader2, Sun, Moon,
  Smartphone, Database, LayoutGrid, Languages, MousePointer2, Shield, Terminal,
  Eye, ShieldCheck, Volume2, Key, Info, ExternalLink, Trash2, ShieldAlert,
  Send, Calendar, MapPin, Briefcase, MessageSquare, Reply, Edit2, ShieldAlert as ShieldIcon,
  CloudLightning, Lock, Globe, RefreshCw, EyeOff, Type, AlignLeft, Activity, HelpCircle
} from 'lucide-react';
import { Language, UserSettings, ThemeMode, FontFamily, FontSize, ImageQuality, ModelStrategy, Message, SiteConfig } from '../types.ts';
import { translations } from '../translations.ts';

export type AccountTab = 'profile' | 'credits' | 'manager' | 'settings';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AccountTab;
  setActiveTab: (tab: AccountTab) => void;
  credits: number;
  user: { name: string; email: string; username?: string; profilePic?: string; isAdmin: boolean } | null;
  onUpdateProfile?: (data: { name: string; username: string; profilePic: string }) => void;
  isPaid?: boolean;
  language: Language;
  userSettings: UserSettings;
  setUserSettings: (settings: Partial<UserSettings>) => void;
  onSendMessage?: (content: string) => void;
  allMessages?: Message[];
  siteConfig: SiteConfig;
  onUpdateSiteConfig?: (config: Partial<SiteConfig>) => void; 
}

const AccountModal: React.FC<AccountModalProps> = ({ 
  isOpen, onClose, activeTab, setActiveTab, credits, user, 
  onUpdateProfile, isPaid, language, userSettings, setUserSettings,
  onSendMessage, allMessages = [], siteConfig, onUpdateSiteConfig
}) => {
  const t = translations[language];
  
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [hasSystemKey, setHasSystemKey] = useState(false);
  const [isEditingManager, setIsEditingManager] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [manualKey, setManualKey] = useState(userSettings.manualApiKey || '');
  
  const [tempManagerData, setTempManagerData] = useState({
    name: siteConfig.manager_name,
    dob: siteConfig.manager_dob,
    location: siteConfig.manager_location,
    pic: siteConfig.manager_pic
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const managerFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTempManagerData({
        name: siteConfig.manager_name,
        dob: siteConfig.manager_dob,
        location: siteConfig.manager_location,
        pic: siteConfig.manager_pic
      });
      
      const checkKey = async () => {
        try {
          const val = await (window as any).aistudio?.hasSelectedApiKey();
          setHasSystemKey(!!val);
        } catch (e) {
          setHasSystemKey(false);
        }
      };
      checkKey();
    }
  }, [isOpen, siteConfig]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username || user.email.split('@')[0]);
      setProfilePic(user.profilePic || `https://i.pravatar.cc/150?u=${user.email}`);
    }
  }, [user, isOpen]);

  const handleOpenAiStudioKey = async () => {
    try {
      await (window as any).aistudio?.openSelectKey();
      setHasSystemKey(true);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to open AI Studio Key dialog", err);
    }
  };

  const handleSaveManualKey = () => {
    setUserSettings({ manualApiKey: manualKey });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSend = () => {
    if (!message.trim() || !onSendMessage) return;
    onSendMessage(message);
    setMessage('');
    setMsgSent(true);
    setTimeout(() => setMsgSent(false), 3000);
  };

  const handleSaveManagerProfile = () => {
    if (onUpdateSiteConfig) {
      onUpdateSiteConfig({
        manager_name: tempManagerData.name,
        manager_dob: tempManagerData.dob,
        manager_location: tempManagerData.location,
        manager_pic: tempManagerData.pic
      });
      setIsEditingManager(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'user' | 'manager') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (target === 'user') setProfilePic(event.target?.result as string);
        else setTempManagerData(prev => ({ ...prev, pic: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      if (onUpdateProfile) onUpdateProfile({ name, username, profilePic });
      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  if (!isOpen) return null;

  const isRtl = language === 'ar';

  const SettingToggle = ({ label, subLabel, value, onToggle, icon: Icon, color }: any) => {
    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-2xl group hover:border-indigo-500/30 transition-all">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm`}>
            <Icon className={`w-4 h-4 ${color || 'text-slate-500'}`} />
          </div>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <p className="text-xs font-black text-slate-700 dark:text-white leading-tight">{label}</p>
            <p className="text-[9px] text-slate-400 font-bold mt-0.5">{subLabel}</p>
          </div>
        </div>
        <button 
          onClick={onToggle}
          className={`w-10 h-6 rounded-full relative transition-all shrink-0 ${value ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${
            value 
              ? (isRtl ? 'right-0.5' : 'left-0.5') 
              : (isRtl ? 'right-4.5' : 'left-4.5')
          }`} />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-[650px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 border dark:border-white/5" onClick={(e) => e.stopPropagation()}>
        
        <aside className="w-full md:w-56 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-white/5 p-6 flex flex-row md:flex-col gap-1 overflow-x-auto shrink-0">
          <div className="hidden md:block mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{t.myAccount}</h2>
          </div>
          <nav className="flex flex-row md:flex-col gap-1 w-full">
            {[
              { id: 'profile', icon: User, label: t.profileTab },
              { id: 'credits', icon: Key, label: t.creditsTab },
              { id: 'manager', icon: Briefcase, label: language === 'ar' ? 'المدير' : 'CEO' },
              { id: 'settings', icon: Settings, label: t.settingsTab }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AccountTab)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar relative">
          <button onClick={onClose} className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} p-1.5 text-slate-400 hover:text-rose-500 transition-all`}><X className="w-6 h-6" /></button>

          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col items-center md:items-start gap-6">
                <div className="relative">
                  <img src={profilePic} className="w-16 h-16 rounded-2xl object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md" alt="Profile" />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-lg shadow-lg hover:scale-110 transition-all"><Camera className="w-3 h-3" /></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'user')} />
                </div>
                
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.fullName}</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full p-3 bg-slate-50 dark:bg-slate-800 border dark:border-white/5 rounded-xl text-xs font-bold dark:text-white ${isRtl ? 'text-right' : 'text-left'}`} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.username}</label>
                      <input type="text" value={username} readOnly className={`w-full p-3 bg-slate-100 dark:bg-slate-800/30 rounded-xl text-slate-400 text-xs font-bold ${isRtl ? 'text-right' : 'text-left'}`} />
                      <p className="text-[8px] text-slate-500 px-1">{isRtl ? '* اسم المستخدم لا يمكن تعديله' : '* Username is permanent'}</p>
                    </div>
                  </div>
                  <button onClick={handleSaveProfile} disabled={isSaving} className="w-full md:w-auto px-8 py-3.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t.saveChanges}
                  </button>
                  {success && <p className="text-emerald-500 text-[10px] font-bold animate-pulse text-center">{t.saveSuccess}</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'credits' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{t.apiSettingsLabel}</p>
                  <h3 className="text-lg font-black">{isRtl ? 'مفتاح التوليد' : 'Generation Key'}</h3>
                  <p className="mt-2 text-[11px] font-medium opacity-80 leading-relaxed">{t.apiKeyInfo}</p>
                  
                  <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col items-center justify-between gap-4">
                    <button 
                      onClick={handleOpenAiStudioKey}
                      className="w-full px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all group"
                    >
                      {hasSystemKey ? <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" /> : <CloudLightning className="w-3 h-3 animate-pulse" />}
                      {hasSystemKey ? (isRtl ? 'تحديث الربط' : 'Update Cloud') : t.goProjects}
                    </button>
                  </div>
               </div>

               <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-white/5 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">{isRtl ? 'إدخال يدوي' : 'Manual Entry'}</h4>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type={showApiKey ? "text" : "password"}
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      placeholder={t.apiKeyPlaceholder}
                      className={`w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-indigo-500 transition-all font-mono text-[11px] dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                    <button 
                      onClick={() => setShowApiKey(!showApiKey)}
                      className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'} p-1.5 text-slate-400 hover:text-indigo-600`}
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button 
                    onClick={handleSaveManualKey}
                    className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-lg font-black text-[10px] flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Save className="w-3.5 h-3.5" /> {t.buyCredits}
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'manager' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <section className="space-y-4 bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-3xl border border-indigo-500/20">
                <div className="flex items-center justify-between">
                   <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4 text-indigo-500" /> {t.managerInfo}
                   </h4>
                   {user?.isAdmin && (
                     <button onClick={() => setIsEditingManager(!isEditingManager)} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">
                        {isEditingManager ? t.cancel : t.smartEdit}
                     </button>
                   )}
                </div>
                
                <div className="flex gap-4 items-center">
                   <img src={isEditingManager ? tempManagerData.pic : siteConfig.manager_pic} className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md" alt="" />
                   <div className="flex-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 space-y-1">
                      {isEditingManager ? (
                        <div className="space-y-2">
                           <input value={tempManagerData.name} onChange={e => setTempManagerData({...tempManagerData, name: e.target.value})} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-[10px]" />
                           <button onClick={handleSaveManagerProfile} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] uppercase font-black">Save</button>
                        </div>
                      ) : (
                        <>
                          <p>{siteConfig.manager_name}</p>
                          <p>{siteConfig.manager_dob}</p>
                          <p className="opacity-60">{siteConfig.manager_location}</p>
                        </>
                      )}
                   </div>
                </div>

                <div className="pt-4 border-t border-indigo-500/10">
                   <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">{t.messageManager}</label>
                   <div className="relative">
                      <textarea 
                        value={message} onChange={e => setMessage(e.target.value)}
                        placeholder={t.messagePlaceholder}
                        className="w-full h-20 p-3 bg-white dark:bg-slate-900 border border-indigo-500/10 rounded-xl outline-none text-[11px] dark:text-white resize-none"
                      />
                      <button onClick={handleSend} className="absolute bottom-2 left-2 md:left-auto md:right-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-black text-[9px] flex items-center gap-1.5 shadow-md">
                         <Send className="w-2.5 h-2.5" /> {t.sendMessage}
                      </button>
                   </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* المظهر العام */}
              <section className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Sun className="w-4 h-4 text-indigo-500" /> {t.appearance}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <SettingToggle label={t.themeLabel} subLabel={userSettings.theme === 'dark' ? t.themeDark : t.themeLight} value={userSettings.theme === 'dark'} onToggle={() => setUserSettings({ theme: userSettings.theme === 'dark' ? 'light' : 'dark' })} icon={userSettings.theme === 'dark' ? Moon : Sun} color="text-amber-500" />
                </div>
              </section>

              {/* تخصيص الخطوط */}
              <section className="space-y-4 pt-4 border-t dark:border-white/5">
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Type className="w-4 h-4 text-indigo-500" /> {t.fontFamilyLabel}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                   {[
                     { id: 'classic', label: t.fontClassic },
                     { id: 'modern', label: t.fontModern },
                     { id: 'comfort', label: t.fontComfort }
                   ].map(font => (
                     <button 
                      key={font.id}
                      onClick={() => setUserSettings({ fontFamily: font.id as FontFamily })}
                      className={`p-3 rounded-xl border text-[10px] font-black transition-all ${userSettings.fontFamily === font.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-indigo-500/30'}`}
                     >
                       {font.label}
                     </button>
                   ))}
                </div>

                <div className="mt-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">{t.fontSizeLabel}</label>
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border dark:border-white/5">
                    {[
                      { id: 'small', label: t.sizeSmall, icon: <AlignLeft className="w-3 h-3" /> },
                      { id: 'medium', label: t.sizeMedium, icon: <AlignLeft className="w-4 h-4" /> },
                      { id: 'large', label: t.sizeLarge, icon: <AlignLeft className="w-5 h-5" /> }
                    ].map(size => (
                      <button 
                        key={size.id}
                        onClick={() => setUserSettings({ fontSize: size.id as FontSize })}
                        className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${userSettings.fontSize === size.id ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                      >
                        {size.icon}
                        <span className="text-[8px] font-black uppercase mt-1">{size.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* سلوك النظام */}
              <section className="space-y-4 pt-4 border-t dark:border-white/5">
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> {t.systemBehavior}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <SettingToggle label={t.tooltips} subLabel={isRtl ? 'توضيح مهام الأدوات عند التمرير' : 'Explain tool tasks on hover'} value={userSettings.showTooltips} onToggle={() => setUserSettings({ showTooltips: !userSettings.showTooltips })} icon={HelpCircle} color="text-indigo-400" />
                  <SettingToggle label={t.autoSave} subLabel={isRtl ? 'حفظ الجلسة تلقائياً وحماية بياناتك' : 'Auto-save session and protect data'} value={userSettings.autoSaveSession} onToggle={() => setUserSettings({ autoSaveSession: !userSettings.autoSaveSession })} icon={Database} color="text-emerald-500" />
                  <SettingToggle label={t.notifSounds} subLabel={t.on} value={userSettings.notificationSounds} onToggle={() => setUserSettings({ notificationSounds: !userSettings.notificationSounds })} icon={Volume2} color="text-indigo-500" />
                </div>
              </section>

              {/* الأمان والخصوصية */}
              <section className="space-y-4 pt-4 border-t dark:border-white/5">
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> {t.securityPrivacy}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <SettingToggle label={t.contentProtect} subLabel={isRtl ? 'تعطيل النسخ والقائمة اليمنى' : 'Disable copy and right-click menu'} value={userSettings.contentProtection} onToggle={() => setUserSettings({ contentProtection: !userSettings.contentProtection })} icon={Lock} color="text-amber-500" />
                  <SettingToggle label={t.privacyMode} subLabel={isRtl ? 'حذف كافة بيانات الجلسة عند الخروج' : 'Delete all session data on logout'} value={userSettings.privacyMode} onToggle={() => setUserSettings({ privacyMode: !userSettings.privacyMode })} icon={EyeOff} color="text-rose-500" />
                </div>
              </section>

              <section className="pt-6 border-t dark:border-white/5">
                 <button className="w-full p-4 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/10 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all">
                    <Trash2 className="w-4 h-4" /> {t.deleteAccount}
                 </button>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AccountModal;
