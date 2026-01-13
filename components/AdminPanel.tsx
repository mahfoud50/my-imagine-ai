
import React, { useState, useRef } from 'react';
import { AdminTab, SiteConfig, Language, Message } from '../types.ts';
import { 
  Code, Shield, Layout, Save, RefreshCw, Terminal, X, Search,
  Mail, Lock, MousePointer2, LayoutTemplate, MessageSquare, Trash2, 
  User, Camera, Briefcase, Users, UserX, UserCheck, 
  ImageIcon, Sparkles, Megaphone, Palette, Eye, EyeOff, Key,
  Upload, Fingerprint, MapPin, Calendar, ShieldCheck, AlignLeft,
  Type, Layers, Sliders, Smartphone, CheckCircle, Reply, Send, Music, Volume2, Video,
  Clock, Circle, Activity, TrendingUp, Globe, FileCode
} from 'lucide-react';

interface AdminPanelProps {
  config: SiteConfig;
  setConfig: (config: SiteConfig) => void;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  onClose: () => void;
  language: Language;
  allUsers: any[];
  setAllUsers: (users: any[]) => void;
  bannedEmails: string[];
  setBannedEmails: (emails: string[]) => void;
  adminIdentity: any;
  setAdminIdentity: (id: any) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  config, setConfig, messages, setMessages, onClose, language,
  allUsers, setAllUsers, bannedEmails, setBannedEmails, adminIdentity, setAdminIdentity 
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('MANAGER_PROFILE');
  const [tempConfig, setTempConfig] = useState<SiteConfig>(config);
  const [tempAdminIdentity, setTempAdminIdentity] = useState(adminIdentity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const storyFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);
  const managerFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const handleUpdateSystem = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setConfig(tempConfig);
      setAdminIdentity(tempAdminIdentity);
      setIsUpdating(false);
      setUpdateStatus(language === 'ar' ? '✅ تم حفظ الإعدادات بنجاح' : '✅ Settings saved!');
      setTimeout(() => setUpdateStatus(''), 3000);
    }, 800);
  };

  const handlePublishNewStory = () => {
    const newStoryId = `STORY-${Date.now()}`;
    const newStory = {
      ...(tempConfig.global_story || { message: '', active: false }),
      id: newStoryId,
      active: true
    };
    const updated = { ...tempConfig, global_story: newStory };
    setTempConfig(updated);
    setConfig(updated);
    setUpdateStatus(language === 'ar' ? '🚀 تم نشر الستوري' : '🚀 Story Published!');
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  const handleSendReply = (messageId: string) => {
    if (!replyText.trim()) return;
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, reply: replyText, replyTimestamp: new Date(), isRead: true } : msg
    );
    setMessages(updatedMessages);
    setReplyingToId(null);
    setReplyText('');
    setUpdateStatus(language === 'ar' ? '✅ تم إرسال الرد' : '✅ Reply sent!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'story' | 'manager' | 'audio' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (target === 'logo') setTempConfig({ ...tempConfig, site_logo: dataUrl });
        if (target === 'manager') setTempConfig({ ...tempConfig, manager_pic: dataUrl });
        if (target === 'story') setTempConfig({ ...tempConfig, global_story: { ...(tempConfig.global_story || { id: '1', message: '', active: false }), image: dataUrl, video: undefined } });
        if (target === 'video') setTempConfig({ ...tempConfig, global_story: { ...(tempConfig.global_story || { id: '1', message: '', active: false }), video: dataUrl, image: undefined } });
        if (target === 'audio') setTempConfig({ ...tempConfig, global_story: { ...(tempConfig.global_story || { id: '1', message: '', active: false }), audio: dataUrl } });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs: { id: AdminTab; icon: any; label: string; labelAr: string; color: string }[] = [
    { id: 'MANAGER_PROFILE', icon: User, label: 'Manager Profile', labelAr: 'بروفايل المدير', color: 'text-indigo-400' },
    { id: 'MESSAGES', icon: MessageSquare, label: 'Inbox', labelAr: 'صندوق الوارد', color: 'text-emerald-500' },
    { id: 'UX_CONFIG', icon: MousePointer2, label: 'Identity & UI', labelAr: 'هوية الموقع', color: 'text-orange-500' },
    { id: 'USERS', icon: Users, label: 'Users', labelAr: 'المستخدمين', color: 'text-blue-400' },
    { id: 'GLOBAL_STORY', icon: Megaphone, label: 'Global Story', labelAr: 'الستوري العام', color: 'text-rose-500' },
    { id: 'API_SETTINGS', icon: Key, label: 'API Management', labelAr: 'مفاتيح التوليد', color: 'text-amber-500' },
    { id: 'ADMIN_SECURITY', icon: Lock, label: 'Security', labelAr: 'الأمان', color: 'text-rose-600' },
    { id: 'GLOBAL_HTML', icon: LayoutTemplate, label: 'HTML', labelAr: 'حقن HTML', color: 'text-indigo-500' },
    { id: 'CSS', icon: Layout, label: 'CSS', labelAr: 'كود CSS', color: 'text-pink-500' },
    { id: 'JS', icon: Code, label: 'JS', labelAr: 'كود JS', color: 'text-cyan-500' },
    { id: 'SEO', icon: Search, label: 'SEO', labelAr: 'محركات البحث', color: 'text-blue-500' },
  ];

  const isRtl = language === 'ar';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'MESSAGES':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-black text-white">{isRtl ? 'رسائل المستخدمين' : 'User Messages'}</h3>
               <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black">{messages.length} {isRtl ? 'رسالة' : 'Messages'}</span>
            </div>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="p-6 bg-slate-800/40 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400"><User className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs font-black text-white">{msg.senderName}</p>
                        <p className="text-[10px] text-slate-500">{msg.senderEmail}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteMessage(msg.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <p className="text-sm text-slate-300 bg-slate-900/40 p-4 rounded-2xl border border-white/5">{msg.content}</p>
                  
                  {msg.reply ? (
                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <p className="text-[10px] font-black text-emerald-400 uppercase mb-2 flex items-center gap-2"><CheckCircle className="w-3 h-3" /> {isRtl ? 'تم الرد' : 'Replied'}</p>
                      <p className="text-sm text-emerald-100">{msg.reply}</p>
                    </div>
                  ) : (
                    <div className="pt-2">
                       {replyingToId === msg.id ? (
                         <div className="space-y-3">
                           <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full h-24 p-4 bg-slate-950 border border-indigo-500/30 rounded-2xl text-white text-sm outline-none" placeholder={isRtl ? 'اكتب ردك هنا...' : 'Write your reply...'} />
                           <div className="flex gap-2">
                              <button onClick={() => handleSendReply(msg.id)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2"><Send className="w-3.5 h-3.5" /> {isRtl ? 'إرسال الرد' : 'Send Reply'}</button>
                              <button onClick={() => setReplyingToId(null)} className="px-6 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-black uppercase">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                           </div>
                         </div>
                       ) : (
                         <button onClick={() => setReplyingToId(msg.id)} className="px-6 py-2 bg-slate-700 hover:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all"><Reply className="w-3.5 h-3.5" /> {isRtl ? 'رد الآن' : 'Reply Now'}</button>
                       )}
                    </div>
                  )}
                </div>
              ))}
              {messages.length === 0 && <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest">{isRtl ? 'لا توجد رسائل حالياً' : 'No messages in inbox'}</div>}
            </div>
          </div>
        );

      case 'UX_CONFIG':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-800/40 rounded-[2.5rem] border border-white/5 space-y-6">
                   <h4 className="text-white font-black flex items-center gap-3"><Palette className="w-5 h-5 text-orange-500" /> {isRtl ? 'الهوية البصرية' : 'Brand Identity'}</h4>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-xs font-black text-white">{isRtl ? 'شعار الموقع' : 'Site Logo'}</p>
                            <p className="text-[10px] text-slate-500">{isRtl ? 'يفضل استخدام PNG شفاف' : 'Transparent PNG recommended'}</p>
                         </div>
                         <button onClick={() => logoFileRef.current?.click()} className="p-3 bg-indigo-600 text-white rounded-xl hover:scale-105 transition-all"><Upload className="w-4 h-4" /></button>
                         <input type="file" ref={logoFileRef} className="hidden" onChange={e => handleFileUpload(e, 'logo')} />
                      </div>
                      <div className="p-4 bg-slate-950 rounded-2xl flex items-center justify-center min-h-[100px] border border-white/5">
                         {tempConfig.site_logo ? <img src={tempConfig.site_logo} style={{ height: `${(tempConfig.site_logo_scale || 1) * 32}px` }} /> : <ImageIcon className="w-10 h-10 text-slate-700" />}
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase">{isRtl ? 'حجم الشعار' : 'Logo Scale'}</label>
                            <span className="text-[10px] font-bold text-indigo-400">{(tempConfig.site_logo_scale || 1).toFixed(2)}x</span>
                         </div>
                         <input type="range" min="0.5" max="6.2" step="0.1" value={tempConfig.site_logo_scale || 1} onChange={e => setTempConfig({...tempConfig, site_logo_scale: parseFloat(e.target.value)})} className="w-full accent-indigo-600" />
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-slate-800/40 rounded-[2.5rem] border border-white/5 space-y-6">
                   <h4 className="text-white font-black flex items-center gap-3"><Sliders className="w-5 h-5 text-indigo-500" /> {isRtl ? 'واجهة المستخدم' : 'UI Settings'}</h4>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase">{isRtl ? 'لون التمييز' : 'Accent Color'}</label>
                         <div className="flex gap-4">
                            <input type="color" value={tempConfig.ux_accent_color} onChange={e => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="w-12 h-12 bg-transparent border-none cursor-pointer" />
                            <input type="text" value={tempConfig.ux_accent_color} onChange={e => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="flex-1 p-3 bg-slate-900 border border-white/5 rounded-xl text-white font-mono text-xs" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase">{isRtl ? 'شدة ضبابية الزجاج' : 'Glass Blur Intensity'}</label>
                            <span className="text-[10px] font-bold text-indigo-400">{tempConfig.ux_blur_intensity}</span>
                         </div>
                         <input type="range" min="0" max="40" value={parseInt(tempConfig.ux_blur_intensity)} onChange={e => setTempConfig({...tempConfig, ux_blur_intensity: `${e.target.value}px`})} className="w-full accent-indigo-600" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'ADMIN_SECURITY':
        return (
          <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
             <div className="p-10 bg-slate-800/40 rounded-[3rem] border border-white/5 space-y-8">
                <div className="text-center">
                   <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-rose-500"><ShieldCheck className="w-10 h-10" /></div>
                   <h4 className="text-xl font-black text-white">{isRtl ? 'أمان حساب المدير' : 'Admin Security'}</h4>
                   <p className="text-xs text-slate-500 mt-2">{isRtl ? 'قم بتعديل بيانات الدخول الخاصة باللوحة' : 'Change your admin credentials here'}</p>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-1">{isRtl ? 'البريد الإلكتروني للإدارة' : 'Admin Email'}</label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                         <input type="email" value={tempAdminIdentity.email} onChange={e => setTempAdminIdentity({...tempAdminIdentity, email: e.target.value})} className="w-full p-4 pl-12 bg-slate-950 border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-1">{isRtl ? 'كلمة المرور الجديدة' : 'Admin Password'}</label>
                      <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                         <input type={showAdminPass ? "text" : "password"} value={tempAdminIdentity.password} onChange={e => setTempAdminIdentity({...tempAdminIdentity, password: e.target.value})} className="w-full p-4 pl-12 bg-slate-950 border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500" />
                         <button onClick={() => setShowAdminPass(!showAdminPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">{showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'GLOBAL_HTML':
      case 'CSS':
      case 'JS':
        const codeType = activeTab === 'GLOBAL_HTML' ? 'global_html' : activeTab === 'CSS' ? 'custom_css' : 'custom_js';
        const icon = activeTab === 'GLOBAL_HTML' ? <LayoutTemplate className="w-5 h-5 text-indigo-500" /> : activeTab === 'CSS' ? <Layout className="w-5 h-5 text-pink-500" /> : <Code className="w-5 h-5 text-cyan-500" />;
        return (
          <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500">
             <div className="flex items-center gap-3">
                {icon}
                <h4 className="text-white font-black">{activeTab} Injection</h4>
             </div>
             <div className="flex-1 relative group">
                <div className="absolute top-4 right-4 z-10 p-2 bg-indigo-600/20 text-indigo-400 rounded-lg text-[10px] font-mono border border-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity">Editable Code Block</div>
                <textarea 
                  value={(tempConfig as any)[codeType]} 
                  onChange={e => setTempConfig({...tempConfig, [codeType]: e.target.value})}
                  className="w-full h-[500px] p-8 bg-slate-950 border border-white/5 rounded-[2.5rem] text-indigo-300 font-mono text-xs outline-none focus:border-indigo-500/50 transition-all resize-none shadow-inner leading-relaxed"
                  placeholder={`/* Add your custom ${activeTab} here... */`}
                />
             </div>
          </div>
        );

      case 'SEO':
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
             <div className="p-10 bg-slate-800/40 rounded-[3rem] border border-white/5 space-y-8">
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500"><Globe className="w-6 h-6" /></div>
                   <div>
                      <h4 className="text-xl font-black text-white">Search Engine Optimization</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Meta tags & Social Presence</p>
                   </div>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-1">SEO Title (Browser Tab)</label>
                      <input value={tempConfig.seo_title} onChange={e => setTempConfig({...tempConfig, seo_title: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500" placeholder="Imagine AI - Professional Studio" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-1">SEO Description (Meta Tag)</label>
                      <textarea value={tempConfig.seo_desc} onChange={e => setTempConfig({...tempConfig, seo_desc: e.target.value})} className="w-full h-32 p-4 bg-slate-950 border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 resize-none" placeholder="The ultimate generative art platform driven by Google Gemini..." />
                   </div>
                </div>

                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                   <p className="text-[10px] font-black text-blue-400 uppercase mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Search Preview</p>
                   <div className="space-y-1">
                      <h5 className="text-blue-400 text-lg font-medium hover:underline cursor-pointer">{tempConfig.seo_title || 'Site Title'}</h5>
                      <p className="text-emerald-600 text-[11px]">https://imagine-ai-pro.com</p>
                      <p className="text-slate-400 text-xs line-clamp-2">{tempConfig.seo_desc || 'Describe your site for search engines...'}</p>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'USERS':
        const onlineCount = allUsers.filter(u => u.isOnline).length;
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-6 bg-slate-800/50 rounded-3xl border border-white/5 flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400"><Users className="w-7 h-7" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                    <h3 className="text-2xl font-black text-white">{allUsers.length}</h3>
                  </div>
               </div>
               <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/10 flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 relative">
                    <Activity className="w-7 h-7" />
                    {onlineCount > 0 && <span className="absolute top-3 right-3 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'متصل الآن' : 'Currently Online'}</p>
                    <h3 className="text-2xl font-black text-emerald-400">{onlineCount}</h3>
                  </div>
               </div>
               <div className="p-6 bg-slate-800/50 rounded-3xl border border-white/5 flex items-center gap-5">
                  <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400"><Shield className="w-7 h-7" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'حسابات معلقة' : 'Suspended'}</p>
                    <h3 className="text-2xl font-black text-white">{bannedEmails.length}</h3>
                  </div>
               </div>
            </div>

            <div className="bg-slate-800/30 rounded-[2.5rem] border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 border-b border-white/5">
                  <tr>
                    <th className={`p-5 text-[10px] font-black text-slate-500 uppercase ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'المستخدم' : 'User'}</th>
                    <th className={`p-5 text-[10px] font-black text-slate-500 uppercase ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'البريد' : 'Email'}</th>
                    <th className={`p-5 text-[10px] font-black text-slate-500 uppercase ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allUsers.map(u => (
                    <tr key={u.email} className="hover:bg-white/5 transition-all group">
                      <td className="p-5">
                         <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <img src={u.profilePic || "https://i.pravatar.cc/100"} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                               <p className="text-xs font-black text-white">{u.name}</p>
                               <p className="text-[10px] text-slate-500 font-mono">@{u.username}</p>
                            </div>
                         </div>
                      </td>
                      <td className={`p-5 text-[11px] text-slate-300 font-mono ${isRtl ? 'text-right' : 'text-left'}`}>{u.email}</td>
                      <td className="p-5">
                        {bannedEmails.includes(u.email) ? 
                          <span className="px-2 py-1 bg-rose-500/20 text-rose-500 rounded-md text-[9px] font-black uppercase">{isRtl ? 'محظور' : 'Banned'}</span> :
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded-md text-[9px] font-black uppercase">{isRtl ? 'نشط' : 'Active'}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'MANAGER_PROFILE':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="relative group">
                  <img src={tempConfig.manager_pic} className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-800 shadow-2xl" alt="" />
                  <button onClick={() => managerFileRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all opacity-0 group-hover:opacity-100"><Camera className="w-5 h-5" /></button>
                  <input type="file" ref={managerFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'manager')} />
               </div>
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Manager Name</label>
                    <input value={tempConfig.manager_name} onChange={e => setTempConfig({...tempConfig, manager_name: e.target.value})} className="w-full p-3 bg-slate-800 border border-white/5 rounded-xl text-white text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Birth Date</label>
                    <input value={tempConfig.manager_dob} onChange={e => setTempConfig({...tempConfig, manager_dob: e.target.value})} className="w-full p-3 bg-slate-800 border border-white/5 rounded-xl text-white text-xs font-bold" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Location</label>
                    <input value={tempConfig.manager_location} onChange={e => setTempConfig({...tempConfig, manager_location: e.target.value})} className="w-full p-3 bg-slate-800 border border-white/5 rounded-xl text-white text-xs font-bold" />
                  </div>
               </div>
            </div>
          </div>
        );

      case 'GLOBAL_STORY':
        return (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
             <div className="p-8 bg-slate-800/50 rounded-[3rem] border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-white font-black flex items-center gap-3"><Megaphone className="w-5 h-5 text-rose-500" /> Story Center</h4>
                   <button 
                    onClick={() => setTempConfig({...tempConfig, global_story: { ...(tempConfig.global_story || { id: '1', message: '', active: false }), active: !tempConfig.global_story?.active }})}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tempConfig.global_story?.active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                   >
                     {tempConfig.global_story?.active ? 'Story Active' : 'Story Disabled'}
                   </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden border-2 border-dashed border-white/10 flex flex-col items-center justify-center">
                    {tempConfig.global_story?.image ? <img src={tempConfig.global_story.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 opacity-20" />}
                    <button onClick={() => storyFileRef.current?.click()} className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg"><Upload className="w-4 h-4" /></button>
                    <input type="file" ref={storyFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'story')} />
                  </div>
                  <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden border-2 border-dashed border-white/10 flex flex-col items-center justify-center">
                    {tempConfig.global_story?.video ? <video src={tempConfig.global_story.video} className="w-full h-full object-cover" /> : <Video className="w-8 h-8 opacity-20" />}
                    <button onClick={() => videoFileRef.current?.click()} className="absolute bottom-3 right-3 p-2 bg-rose-600 text-white rounded-lg"><Upload className="w-4 h-4" /></button>
                    <input type="file" ref={videoFileRef} className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} />
                  </div>
                  <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden border-2 border-dashed border-white/10 flex flex-col items-center justify-center">
                    {tempConfig.global_story?.audio ? <Music className="w-8 h-8 text-emerald-500" /> : <Volume2 className="w-8 h-8 opacity-20" />}
                    <button onClick={() => audioFileRef.current?.click()} className="absolute bottom-3 right-3 p-2 bg-emerald-600 text-white rounded-lg"><Upload className="w-4 h-4" /></button>
                    <input type="file" ref={audioFileRef} className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} />
                  </div>
                </div>
                <textarea 
                  value={tempConfig.global_story?.message}
                  onChange={e => setTempConfig({...tempConfig, global_story: { ...(tempConfig.global_story || { id: '1', message: '', active: false }), message: e.target.value }})}
                  className="w-full h-24 p-4 bg-slate-900 border border-white/5 rounded-2xl text-white text-sm outline-none"
                  placeholder="Story message..."
                />
                <button onClick={handlePublishNewStory} className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm uppercase shadow-xl transition-all">Publish Story</button>
             </div>
          </div>
        );

      case 'API_SETTINGS':
        return (
          <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
             <div className="p-8 bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                <Key className="absolute -top-10 -right-10 w-40 h-40 text-white/5 rotate-12" />
                <h3 className="text-lg font-black text-white mb-2">Master Gemini API Key</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">This key will be used as the fallback/global generator for users who haven't provided their own keys. Ensure it has a paid tier for stability.</p>
                <div className="relative group">
                   <input 
                    type={showApiKey ? "text" : "password"} 
                    value={tempConfig.global_api_key} 
                    onChange={e => setTempConfig({...tempConfig, global_api_key: e.target.value})}
                    placeholder="sk-..."
                    className="w-full p-5 bg-slate-950 border border-white/10 rounded-2xl text-white font-mono text-sm outline-none focus:border-indigo-500 transition-all"
                   />
                   <button 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                   >
                     {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                   </button>
                </div>
             </div>
          </div>
        );

      default:
        return <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest">Under Development</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex bg-slate-950/98 backdrop-blur-2xl">
      <div className="flex w-full h-full overflow-hidden">
        <aside className="w-80 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-8 border-b border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><Terminal className="w-6 h-6" /></div>
            <div>
              <h1 className="font-black text-white text-sm uppercase tracking-tighter leading-none">Admin Core</h1>
              <p className="text-[10px] text-slate-500 font-bold mt-1">v3.5 Professional</p>
            </div>
          </div>
          <div className="p-4 space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl translate-x-1' : 'text-slate-500 hover:bg-white/5'}`}>
                <tab.icon className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                <span className="uppercase tracking-widest">{isRtl ? tab.labelAr : tab.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto p-8 border-t border-white/5">
             <button onClick={onClose} className="w-full py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-600 hover:text-white transition-all shadow-xl">Close Panel</button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          <header className="p-8 flex items-center justify-between border-b border-white/5">
             <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{isRtl ? 'وضع التحكم الكامل نشط' : 'Full Control Mode Active'}</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                {updateStatus && <span className="text-[10px] font-bold text-emerald-400 animate-in fade-in slide-in-from-right-4">{updateStatus}</span>}
                <button 
                  onClick={handleUpdateSystem}
                  disabled={isUpdating}
                  className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl shadow-indigo-500/20 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isUpdating ? 'Applying...' : 'Save Changes'}
                </button>
                <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-2xl transition-all shadow-xl border border-white/10 group">
                  <X className="w-6 h-6 group-hover:scale-110" />
                </button>
             </div>
          </header>
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
             <div className="max-w-6xl mx-auto h-full">
                {renderTabContent()}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
