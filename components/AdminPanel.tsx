
import React, { useState, useRef, useEffect } from 'react';
import { AdminTab, SiteConfig, Language, Message } from '../types.ts';
import { 
  Code, Shield, Globe, Layout, Save, RefreshCw, Terminal, X, Search,
  Mail, Lock, Cpu, MousePointer2, LayoutTemplate, MessageSquare, Trash2, 
  CheckCircle, Clock, User, Send, Camera, Briefcase, Users, UserX, UserCheck, 
  ShieldAlert, Activity, Image as ImageIcon, Sparkles, Megaphone, Palette, Eye, EyeOff, Key,
  Upload, ToggleLeft, ToggleRight, Fingerprint, MapPin, Calendar, ShieldCheck
} from 'lucide-react';

interface AdminPanelProps {
  config: SiteConfig;
  setConfig: (config: SiteConfig) => void;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  onReplyMessage?: (id: string, reply: string) => void;
  onClose: () => void;
  language: Language;
  currentUser: any;
  setCurrentUser: (user: any) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, setConfig, messages, setMessages, onClose, language }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('MANAGER_PROFILE');
  const [tempConfig, setTempConfig] = useState<SiteConfig>(config);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [adminIdentity, setAdminIdentity] = useState({ email: '', password: '' });
  const [showAdminPass, setShowAdminPass] = useState(false);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [bannedEmails, setBannedEmails] = useState<string[]>([]);
  const storyFileRef = useRef<HTMLInputElement>(null);
  const managerFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = () => {
      const users = JSON.parse(localStorage.getItem('site_verified_users') || '[]');
      const banned = JSON.parse(localStorage.getItem('banned_emails') || '[]');
      const identity = JSON.parse(localStorage.getItem('admin_identity') || '{"email":"Mohammedzarzor26@gmail.com", "password":"Mah7foud23"}');
      setAllUsers(users);
      setBannedEmails(banned);
      setAdminIdentity(identity);
    };
    loadData();
  }, [activeTab]);

  const handleUpdateAdminIdentity = () => {
    localStorage.setItem('admin_identity', JSON.stringify(adminIdentity));
    setUpdateStatus(language === 'ar' ? '✅ تم تحديث بيانات الدخول بنجاح' : '✅ Admin identity updated!');
    setTimeout(() => setUpdateStatus(''), 3000);
  };

  const handleManagerPicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempConfig({
          ...tempConfig,
          manager_pic: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempConfig({
          ...tempConfig,
          site_logo: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleBan = (email: string) => {
    let newBanned = [...bannedEmails];
    if (newBanned.includes(email)) {
      newBanned = newBanned.filter(e => e !== email);
    } else {
      newBanned.push(email);
    }
    setBannedEmails(newBanned);
    localStorage.setItem('banned_emails', JSON.stringify(newBanned));
  };

  const deleteUser = (email: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المستخدم نهائياً؟' : 'Are you sure you want to delete this user?')) return;
    const filtered = allUsers.filter(u => u.email !== email);
    setAllUsers(filtered);
    localStorage.setItem('site_verified_users', JSON.stringify(filtered));
  };

  const handleStoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempConfig({
          ...tempConfig,
          global_story: {
            ...(tempConfig.global_story || { id: '', message: '', active: false, image: '' }),
            image: event.target?.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const publishStory = () => {
    const updatedStory = {
      ...(tempConfig.global_story || { message: '', active: true, image: '' }),
      id: Date.now().toString(),
      active: true
    };
    setTempConfig({ ...tempConfig, global_story: updatedStory });
    setUpdateStatus(language === 'ar' ? '🚀 تم نشر الستوري بنجاح' : '🚀 Story Published!');
    setTimeout(() => setUpdateStatus(''), 3000);
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = 'AIzaSy';
    for (let i = 0; i < 33; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempConfig({ ...tempConfig, global_api_key: result });
  };

  const handleUpdateSystem = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setConfig(tempConfig);
      setIsUpdating(false);
      setUpdateStatus(language === 'ar' ? '✅ تم حفظ الإعدادات بنجاح' : '✅ Settings saved!');
      setTimeout(() => setUpdateStatus(''), 3000);
    }, 800);
  };

  const tabs: { id: AdminTab; icon: any; label: string; labelAr: string; color: string }[] = [
    { id: 'MANAGER_PROFILE', icon: User, label: 'Manager Profile', labelAr: 'بروفايل المدير', color: 'text-indigo-400' },
    { id: 'UX_CONFIG', icon: MousePointer2, label: 'Identity & UI', labelAr: 'هوية الموقع والألوان', color: 'text-orange-500' },
    { id: 'MESSAGES', icon: MessageSquare, label: 'Inbox', labelAr: 'الرسائل', color: 'text-emerald-500' },
    { id: 'API_SETTINGS', icon: Key, label: 'API Management', labelAr: 'مفتاح API العالمي', color: 'text-amber-500' },
    { id: 'USERS', icon: Users, label: 'Users', labelAr: 'المستخدمين', color: 'text-blue-400' },
    { id: 'GLOBAL_STORY', icon: Megaphone, label: 'Global Story', labelAr: 'الستوري العام', color: 'text-rose-500' },
    { id: 'ADMIN_SECURITY', icon: Lock, label: 'Security', labelAr: 'أمان المدير', color: 'text-rose-600' },
    { id: 'GLOBAL_HTML', icon: LayoutTemplate, label: 'HTML', labelAr: 'حقن HTML', color: 'text-indigo-500' },
    { id: 'CSS', icon: Layout, label: 'CSS', labelAr: 'ستايل CSS', color: 'text-pink-500' },
    { id: 'JS', icon: Code, label: 'JS', labelAr: 'سكربت JS', color: 'text-cyan-500' },
    { id: 'SEO', icon: Search, label: 'SEO', labelAr: 'إعدادات SEO', color: 'text-blue-500' },
  ];

  const isRtl = language === 'ar';

  return (
    <div className="fixed inset-0 z-[1000] flex bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="flex w-full h-full overflow-hidden">
        
        <aside className="w-80 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-8 border-b border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Terminal className="w-6 h-6" /></div>
            <h1 className="font-black text-white tracking-tighter uppercase">Admin Core</h1>
          </div>
          <div className="p-6 space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}>
                <tab.icon className={`w-5 h-5 shrink-0 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                <span>{isRtl ? tab.labelAr : tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-24 px-12 border-b border-white/5 flex items-center justify-between bg-slate-900/20">
            <h2 className="text-2xl font-black text-white">{isRtl ? tabs.find(t => t.id === activeTab)?.labelAr : tabs.find(t => t.id === activeTab)?.label}</h2>
            <div className="flex items-center gap-4">
              <button onClick={handleUpdateSystem} disabled={isUpdating} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm flex items-center gap-3 active:scale-95 transition-all">
                {isUpdating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
              </button>
              <button onClick={onClose} className="p-3 bg-white/5 text-white rounded-xl hover:bg-rose-500 transition-all"><X className="w-6 h-6" /></button>
            </div>
          </header>

          <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
            
            {activeTab === 'MANAGER_PROFILE' && (
              <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="p-10 bg-slate-900 border border-white/5 rounded-[3rem] space-y-8">
                          <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                             <Briefcase className="w-5 h-5 text-indigo-400" />
                             {isRtl ? 'بيانات القيادة' : 'Leadership Identity'}
                          </h3>
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'الاسم المعروض' : 'Display Name'}</label>
                                <div className="relative">
                                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                   <input type="text" value={tempConfig.manager_name} onChange={(e) => setTempConfig({...tempConfig, manager_name: e.target.value})} className="w-full py-4 pl-12 pr-6 bg-slate-950 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'تاريخ الميلاد' : 'Date of Birth'}</label>
                                <div className="relative">
                                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                   <input type="text" value={tempConfig.manager_dob} onChange={(e) => setTempConfig({...tempConfig, manager_dob: e.target.value})} className="w-full py-4 pl-12 pr-6 bg-slate-950 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'الموقع الحالي' : 'Current Location'}</label>
                                <div className="relative">
                                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                   <input type="text" value={tempConfig.manager_location} onChange={(e) => setTempConfig({...tempConfig, manager_location: e.target.value})} className="w-full py-4 pl-12 pr-6 bg-slate-950 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all" />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-8">
                       <div className="relative group">
                          <div className="w-64 h-64 rounded-[3rem] overflow-hidden border-8 border-slate-900 shadow-2xl relative">
                             <img src={tempConfig.manager_pic} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Manager Profile" />
                             <div onClick={() => managerFileRef.current?.click()} className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                                <Camera className="w-12 h-12 text-white mb-2" />
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">{isRtl ? 'تغيير الصورة' : 'Change Pic'}</span>
                             </div>
                          </div>
                          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-slate-950 shadow-xl">
                             <ShieldCheck className="w-6 h-6 text-white" />
                          </div>
                          <input type="file" ref={managerFileRef} className="hidden" accept="image/*" onChange={handleManagerPicUpload} />
                       </div>
                       <div className="text-center space-y-2">
                          <h4 className="text-xl font-black text-white">{tempConfig.manager_name}</h4>
                          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">CEO & Chief Architect</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'UX_CONFIG' && (
               <div className="max-w-4xl space-y-10 animate-in slide-in-from-bottom-5">
                  <div className="p-10 bg-slate-900 border border-white/5 rounded-[3rem] space-y-8">
                     <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                        <Palette className="w-5 h-5 text-orange-400" />
                        {isRtl ? 'هوية العلامة التجارية' : 'Brand Identity'}
                     </h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'شعار الموقع (Site Logo)' : 'Site Logo'}</label>
                              <div 
                                onClick={() => logoFileRef.current?.click()}
                                className="w-full h-32 bg-slate-950 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all group overflow-hidden"
                              >
                                {tempConfig.site_logo ? (
                                  <img src={tempConfig.site_logo} className="h-20 w-auto object-contain group-hover:scale-110 transition-transform" />
                                ) : (
                                  <>
                                    <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'رفع شعار' : 'Upload Logo'}</span>
                                  </>
                                )}
                                <input type="file" ref={logoFileRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                              </div>
                           </div>

                           {/* منزلق تكبير الشعار */}
                           <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'تكبير الشعار' : 'Logo Scale'}</label>
                                <span className="text-[10px] font-mono text-indigo-400 font-bold">x{tempConfig.site_logo_scale?.toFixed(2) || '1.00'}</span>
                              </div>
                              <input 
                                type="range" 
                                min="0.5" 
                                max="3.20" 
                                step="0.05"
                                value={tempConfig.site_logo_scale || 1} 
                                onChange={(e) => setTempConfig({...tempConfig, site_logo_scale: parseFloat(e.target.value)})}
                                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'لون التمييز (Accent Color)' : 'Accent Color'}</label>
                              <div className="flex items-center gap-4">
                                 <input type="color" value={tempConfig.ux_accent_color} onChange={(e) => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="w-16 h-16 rounded-2xl bg-transparent border-none cursor-pointer" />
                                 <input type="text" value={tempConfig.ux_accent_color} onChange={(e) => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="flex-1 py-4 px-6 bg-slate-950 border border-white/10 rounded-2xl text-white font-mono" />
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'قوة التمويه (Blur Intensity)' : 'Blur Intensity'}</label>
                              <input type="text" value={tempConfig.ux_blur_intensity} onChange={(e) => setTempConfig({...tempConfig, ux_blur_intensity: e.target.value})} className="w-full py-4 px-6 bg-slate-950 border border-white/10 rounded-2xl text-white font-mono" placeholder="20px" />
                           </div>
                           
                           <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                                {isRtl ? '💡 نصيحة: استخدام شعار بخلفية شفافة (PNG) يعطي أفضل مظهر في الهيدر. يمكنك أيضاً التحكم في حجم الشعار لجعل الهيدر يبدو متوازناً.' : '💡 Tip: Using a transparent logo (PNG) gives the best look in the header. You can also adjust the logo scale to make the header look balanced.'}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'ADMIN_SECURITY' && (
              <div className="max-w-2xl space-y-8 animate-in slide-in-from-bottom-5">
                <div className="p-10 bg-slate-900 border border-white/5 rounded-[3rem] space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-600/10 rounded-2xl"><ShieldAlert className="w-6 h-6 text-rose-500" /></div>
                    <div>
                      <h3 className="text-xl font-black text-white">{isRtl ? 'أمان الهوية السيادية' : 'Sovereign Identity Security'}</h3>
                      <p className="text-xs text-slate-500 font-bold">{isRtl ? 'تعديل بيانات الدخول للوحة التحكم الأساسية.' : 'Modify access credentials for the main admin panel.'}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'مفتاح الهوية (الإيميل)' : 'Identity Key (Email)'}</label>
                       <div className="relative">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input type="email" value={adminIdentity.email} onChange={(e) => setAdminIdentity({...adminIdentity, email: e.target.value})} className="w-full py-4 pl-14 pr-6 bg-slate-950 border border-white/10 rounded-2xl text-white font-mono text-sm outline-none focus:border-rose-500 transition-all" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'كلمة سر النظام' : 'System Passphrase'}</label>
                       <div className="relative">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input type={showAdminPass ? "text" : "password"} value={adminIdentity.password} onChange={(e) => setAdminIdentity({...adminIdentity, password: e.target.value})} className="w-full py-4 pl-14 pr-14 bg-slate-950 border border-white/10 rounded-2xl text-white font-mono text-sm outline-none focus:border-rose-500 transition-all" />
                          <button onClick={() => setShowAdminPass(!showAdminPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                            {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                       </div>
                    </div>
                    <button onClick={handleUpdateAdminIdentity} className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-rose-900/20 transition-all active:scale-95">
                      <Fingerprint className="w-5 h-5" />
                      {isRtl ? 'تحديث بيانات السيادة' : 'Update Sovereign Identity'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'GLOBAL_STORY' && (
              <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Megaphone className="w-5 h-5 text-rose-500" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{isRtl ? 'حالة الستوري' : 'Story Status'}</h3>
                             </div>
                             <button onClick={() => setTempConfig({...tempConfig, global_story: { ...(tempConfig.global_story || { id: '', message: '', image: '', active: false }), active: !tempConfig.global_story?.active }})} className={`w-12 h-6 rounded-full relative transition-all ${tempConfig.global_story?.active ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${tempConfig.global_story?.active ? (isRtl ? 'right-7' : 'left-7') : (isRtl ? 'right-1' : 'left-1')}`} />
                             </button>
                          </div>
                          <textarea value={tempConfig.global_story?.message || ''} onChange={(e) => setTempConfig({...tempConfig, global_story: { ...(tempConfig.global_story || { id: '', image: '', active: false, message: '' }), message: e.target.value }})} className="w-full h-32 p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs font-bold outline-none focus:border-rose-500 transition-all resize-none" placeholder={isRtl ? 'اكتب الرسالة...' : 'Type message...'} />
                          <button onClick={publishStory} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all active:scale-95"><Sparkles className="w-5 h-5" />{isRtl ? 'نشر كجديد' : 'Publish New'}</button>
                       </div>
                    </div>
                    <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-6">
                        <div onClick={() => storyFileRef.current?.click()} className="w-full aspect-[9/16] bg-slate-950 border-2 border-dashed border-white/10 rounded-3xl overflow-hidden cursor-pointer relative group">
                           {tempConfig.global_story?.image ? <img src={tempConfig.global_story.image} className="w-full h-full object-cover opacity-60" /> : <div className="h-full flex flex-col items-center justify-center text-slate-500"><Upload className="w-10 h-10 mb-2 opacity-20" /></div>}
                           <input type="file" ref={storyFileRef} className="hidden" accept="image/*" onChange={handleStoryImageUpload} />
                        </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'USERS' && (
              <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-10">
                 <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-slate-950/50 border-b border-white/5">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'المستخدم' : 'User'}</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'الحالة' : 'Status'}</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allUsers.length === 0 ? <tr><td colSpan={3} className="py-20 text-center text-slate-500 opacity-30">Empty</td></tr> : allUsers.map(u => (
                        <tr key={u.email} className="hover:bg-white/5 transition-all">
                          <td className="px-8 py-5"><div className="flex items-center gap-4"><img src={u.profilePic || `https://i.pravatar.cc/150?u=${u.email}`} className="w-10 h-10 rounded-xl object-cover" /><div className="text-sm font-black text-white">{u.name}</div></div></td>
                          <td className="px-8 py-5">{bannedEmails.includes(u.email) ? <span className="text-rose-500 text-[10px] font-black">BANNED</span> : <span className="text-emerald-500 text-[10px] font-black">ACTIVE</span>}</td>
                          <td className="px-8 py-5 flex justify-center gap-3"><button onClick={() => toggleBan(u.email)} className="p-2 bg-white/5 rounded-lg">{bannedEmails.includes(u.email) ? <UserCheck className="w-4 h-4 text-emerald-500" /> : <UserX className="w-4 h-4 text-rose-500" />}</button><button onClick={() => deleteUser(u.email)} className="p-2 bg-white/5 rounded-lg"><Trash2 className="w-4 h-4 text-slate-400" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            )}

            {['GLOBAL_HTML', 'CSS', 'JS', 'SEO'].includes(activeTab) && (
              <div className="max-w-4xl space-y-6 animate-in slide-in-from-bottom-5">
                 <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem]">
                    {activeTab === 'SEO' ? (
                      <div className="space-y-6">
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Meta Title</label><input value={tempConfig.seo_title} onChange={e => setTempConfig({...tempConfig, seo_title: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Meta Description</label><textarea value={tempConfig.seo_desc} onChange={e => setTempConfig({...tempConfig, seo_desc: e.target.value})} className="w-full h-32 p-4 bg-slate-950 border border-white/10 rounded-2xl text-white" /></div>
                      </div>
                    ) : (
                      <textarea value={activeTab === 'GLOBAL_HTML' ? tempConfig.global_html : activeTab === 'CSS' ? tempConfig.custom_css : tempConfig.custom_js} onChange={(e) => setTempConfig({...tempConfig, [activeTab === 'GLOBAL_HTML' ? 'global_html' : activeTab === 'CSS' ? 'custom_css' : 'custom_js']: e.target.value})} className="w-full h-[500px] p-6 bg-slate-950 border border-white/10 rounded-2xl text-cyan-400 font-mono text-xs leading-relaxed outline-none focus:border-indigo-500 transition-all" placeholder={`Enter ${activeTab} code here...`} />
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'API_SETTINGS' && (
              <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-5">
                <div className="p-10 bg-slate-900 border border-white/5 rounded-[3rem] space-y-8">
                  <div className="flex items-center gap-4"><div className="p-3 bg-amber-500/10 rounded-2xl"><Key className="w-6 h-6 text-amber-500" /></div><h3 className="text-xl font-black text-white">{isRtl ? 'مفتاح API العالمي' : 'Global API Key'}</h3></div>
                  <div className="relative"><input type={showApiKey ? "text" : "password"} value={tempConfig.global_api_key} onChange={(e) => setTempConfig({...tempConfig, global_api_key: e.target.value})} className="w-full py-5 px-6 bg-slate-950 border border-white/10 rounded-2xl text-white font-mono" /><button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500">{showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
                  <button onClick={generateRandomKey} className="px-6 py-3 bg-white/5 text-white rounded-xl text-xs font-black border border-white/5">Generate Random</button>
                </div>
              </div>
            )}

            {activeTab === 'MESSAGES' && (
               <div className="space-y-4 max-w-4xl">
                  {messages.length === 0 ? <p className="text-slate-500 font-bold opacity-30 text-center py-20">No Messages</p> : messages.map(msg => (
                      <div key={msg.id} className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
                        <div className="flex justify-between items-start"><div className="flex items-center gap-3"><User className="w-5 h-5 text-indigo-400" /><div><p className="text-white font-black text-sm">{msg.senderName}</p><p className="text-[10px] text-slate-500">{msg.senderEmail}</p></div></div><button onClick={() => setMessages(messages.filter(m => m.id !== msg.id))} className="text-rose-500"><Trash2 className="w-4 h-4" /></button></div>
                        <p className="text-slate-300 text-xs leading-relaxed">{msg.content}</p>
                      </div>
                    ))
                  }
               </div>
            )}

            {updateStatus && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm animate-bounce shadow-2xl z-50">{updateStatus}</div>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
