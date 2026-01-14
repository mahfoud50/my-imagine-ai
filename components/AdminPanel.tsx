
import React, { useState, useRef } from 'react';
import { AdminTab, SiteConfig, Language, Message } from '../types.ts';
import { 
  Code, Shield, Layout, Save, RefreshCw, Terminal, X, Search,
  Mail, Lock, MousePointer2, LayoutTemplate, MessageSquare, Trash2, 
  User, Camera, Briefcase, Users, UserX, UserCheck, 
  ImageIcon, Sparkles, Megaphone, Palette, Eye, EyeOff, Key,
  Upload, Fingerprint, MapPin, Calendar, ShieldCheck, AlignLeft,
  Type, Layers, Sliders, Smartphone, CheckCircle, Reply, Send, Music, Volume2, Video,
  Clock, Circle, Activity, TrendingUp, Globe, FileCode, Wand2, Eraser, Maximize2, Shirt, PenTool, Mic2, Scissors, Wind, Smile,
  ShieldAlert
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
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateSystem = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setConfig(tempConfig);
      setAdminIdentity(tempAdminIdentity);
      setIsUpdating(false);
      setUpdateStatus(language === 'ar' ? '✅ تم حفظ الإعدادات وتطبيقها بنجاح' : '✅ Settings saved and applied!');
      setTimeout(() => setUpdateStatus(''), 3000);
    }, 800);
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

  const renderApiKeyInput = (label: string, configKey: keyof SiteConfig, icon: any, color: string) => (
    <div className="space-y-2 group">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-lg ${color} text-white shadow-sm`}>{icon}</div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      </div>
      <div className="relative">
        <input 
          type={visibleKeys[configKey] ? "text" : "password"} 
          value={(tempConfig as any)[configKey] || ''} 
          onChange={e => setTempConfig({...tempConfig, [configKey]: e.target.value})}
          placeholder="sk-..."
          className="w-full p-3.5 bg-slate-900 border border-white/5 rounded-xl text-white font-mono text-[11px] outline-none focus:border-indigo-500 transition-all shadow-inner"
        />
        <button 
          onClick={() => toggleKeyVisibility(configKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-indigo-400"
        >
          {visibleKeys[configKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'MANAGER_PROFILE':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-800/40 rounded-[2.5rem] border border-white/5 space-y-6">
                   <h4 className="text-white font-black flex items-center gap-3"><User className="w-5 h-5 text-indigo-400" /> {isRtl ? 'بيانات المدير الحقيقية' : 'Real Manager Info'}</h4>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <img src={tempConfig.manager_pic} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10" alt="" />
                         <button onClick={() => document.getElementById('manager-pic-up')?.click()} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase">Change Photo</button>
                         <input id="manager-pic-up" type="file" className="hidden" onChange={e => handleFileUpload(e, 'manager')} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase">Manager Name</label>
                         <input value={tempConfig.manager_name} onChange={e => setTempConfig({...tempConfig, manager_name: e.target.value})} className="w-full p-3 bg-slate-900 border border-white/5 rounded-xl text-white text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Birth Date</label>
                            <input value={tempConfig.manager_dob} onChange={e => setTempConfig({...tempConfig, manager_dob: e.target.value})} className="w-full p-3 bg-slate-900 border border-white/5 rounded-xl text-white text-xs" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Location</label>
                            <input value={tempConfig.manager_location} onChange={e => setTempConfig({...tempConfig, manager_location: e.target.value})} className="w-full p-3 bg-slate-900 border border-white/5 rounded-xl text-white text-xs" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'MESSAGES':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-black text-white">{isRtl ? 'صندوق الوارد الحقيقي' : 'Real Inbox Messages'}</h3>
               <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black">{messages.length} Messages</span>
            </div>
            {messages.length === 0 ? (
               <div className="py-20 text-center text-slate-500 font-black uppercase tracking-widest">{isRtl ? 'لا توجد رسائل حالياً' : 'No messages yet'}</div>
            ) : (
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
                      <button onClick={() => setMessages(messages.filter(m => m.id !== msg.id))} className="p-2 text-slate-500 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <p className="text-sm text-slate-300 bg-slate-900/40 p-4 rounded-2xl border border-white/5">{msg.content}</p>
                    {msg.reply ? (
                      <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <p className="text-[10px] font-black text-emerald-400 uppercase mb-2 flex items-center gap-2"><CheckCircle className="w-3 h-3" /> {isRtl ? 'رد الإدارة' : 'Manager Reply'}</p>
                        <p className="text-sm text-emerald-100">{msg.reply}</p>
                      </div>
                    ) : (
                      <button onClick={() => {
                        const reply = prompt(isRtl ? 'اكتب ردك:' : 'Write reply:');
                        if (reply) setMessages(messages.map(m => m.id === msg.id ? {...m, reply, replyTimestamp: new Date(), isRead: true} : m));
                      }} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2"><Reply className="w-3.5 h-3.5" /> {isRtl ? 'رد الآن' : 'Reply Now'}</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'USERS':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white">{isRtl ? 'إدارة المستخدمين الحقيقية' : 'Real User Management'}</h3>
                <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black">{allUsers.length} Users</span>
             </div>
             <div className="bg-slate-800/40 border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-[11px] text-left">
                   <thead className="bg-white/5 text-slate-400 font-black uppercase tracking-widest border-b border-white/5">
                      <tr>
                         <th className="px-6 py-4">{isRtl ? 'المستخدم' : 'User'}</th>
                         <th className="px-6 py-4">{isRtl ? 'البريد' : 'Email'}</th>
                         <th className="px-6 py-4">{isRtl ? 'الحالة' : 'Status'}</th>
                         <th className="px-6 py-4 text-center">{isRtl ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {allUsers.map(u => (
                        <tr key={u.email} className="hover:bg-white/5 transition-colors">
                           <td className="px-6 py-4 text-white font-bold">{u.name}</td>
                           <td className="px-6 py-4 text-slate-400 font-mono">{u.email}</td>
                           <td className="px-6 py-4">
                              {bannedEmails.includes(u.email) ? (
                                 <span className="px-2 py-0.5 bg-rose-500/20 text-rose-500 rounded-full font-black text-[9px] uppercase">Banned</span>
                              ) : (
                                 <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded-full font-black text-[9px] uppercase">Active</span>
                              )}
                           </td>
                           <td className="px-6 py-4 flex items-center justify-center gap-2">
                              {bannedEmails.includes(u.email) ? (
                                 <button onClick={() => setBannedEmails(bannedEmails.filter(e => e !== u.email))} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><UserCheck className="w-4 h-4" /></button>
                              ) : (
                                 <button onClick={() => setBannedEmails([...bannedEmails, u.email])} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><UserX className="w-4 h-4" /></button>
                              )}
                              <button onClick={() => setAllUsers(allUsers.filter(usr => usr.email !== u.email))} className="p-2 text-slate-500 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        );

      case 'GLOBAL_STORY':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="p-8 bg-slate-800/40 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-white font-black flex items-center gap-3"><Megaphone className="w-5 h-5 text-rose-500" /> {isRtl ? 'الستوري الترويجي الحقيقي' : 'Real Global Story Promo'}</h4>
                   <button onClick={() => setTempConfig({...tempConfig, global_story: {...(tempConfig.global_story || {id: '1', message: '', active: false}), active: !tempConfig.global_story?.active}})} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${tempConfig.global_story?.active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {tempConfig.global_story?.active ? 'ACTIVE' : 'DISABLED'}
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Story Message</label>
                      <textarea value={tempConfig.global_story?.message} onChange={e => setTempConfig({...tempConfig, global_story: {...(tempConfig.global_story || {id: '1', message: '', active: false}), message: e.target.value}})} className="w-full h-32 p-4 bg-slate-900 border border-white/5 rounded-2xl text-white text-xs outline-none" placeholder="Write something..." />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Media Content</label>
                      <div className="grid grid-cols-2 gap-2">
                         <button onClick={() => document.getElementById('story-img-up')?.click()} className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-400">
                            <ImageIcon className="w-6 h-6" /> <span className="text-[9px] font-black uppercase">Image</span>
                         </button>
                         <button onClick={() => document.getElementById('story-vid-up')?.click()} className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col items-center gap-2 text-slate-400 hover:text-rose-400">
                            <Video className="w-6 h-6" /> <span className="text-[9px] font-black uppercase">Video</span>
                         </button>
                         <button onClick={() => document.getElementById('story-aud-up')?.click()} className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col items-center gap-2 text-slate-400 hover:text-emerald-400">
                            <Music className="w-6 h-6" /> <span className="text-[9px] font-black uppercase">Audio</span>
                         </button>
                      </div>
                      <input id="story-img-up" type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'story')} />
                      <input id="story-vid-up" type="file" className="hidden" accept="video/*" onChange={e => handleFileUpload(e, 'video')} />
                      <input id="story-aud-up" type="file" className="hidden" accept="audio/*" onChange={e => handleFileUpload(e, 'audio')} />
                   </div>
                </div>
             </div>
          </div>
        );

      case 'ADMIN_SECURITY':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="p-8 bg-slate-800/40 rounded-[2.5rem] border border-white/5 space-y-6">
                <h4 className="text-white font-black flex items-center gap-3"><Lock className="w-5 h-5 text-rose-600" /> {isRtl ? 'تغيير بيانات الوصول الحقيقية' : 'Real Access Credentials'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Admin Email</label>
                      <input value={tempAdminIdentity.email} onChange={e => setTempAdminIdentity({...tempAdminIdentity, email: e.target.value})} className="w-full p-3 bg-slate-900 border border-white/5 rounded-xl text-white font-mono text-xs" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Admin Password</label>
                      <input type="password" value={tempAdminIdentity.password} onChange={e => setTempAdminIdentity({...tempAdminIdentity, password: e.target.value})} className="w-full p-3 bg-slate-900 border border-white/5 rounded-xl text-white font-mono text-xs" />
                   </div>
                </div>
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4">
                   <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
                   <p className="text-[10px] text-rose-200 leading-relaxed font-bold">{isRtl ? 'تحذير: تغيير هذه البيانات يتطلب استخدام البيانات الجديدة في المرة القادمة.' : 'Warning: Changing these credentials requires using the new ones for next login.'}</p>
                </div>
             </div>
          </div>
        );

      case 'GLOBAL_HTML':
      case 'CSS':
      case 'JS':
        const codeKey = activeTab === 'GLOBAL_HTML' ? 'global_html' : activeTab === 'CSS' ? 'custom_css' : 'custom_js';
        const codeIcon = activeTab === 'GLOBAL_HTML' ? <LayoutTemplate className="w-5 h-5 text-indigo-500" /> : activeTab === 'CSS' ? <Layout className="w-5 h-5 text-pink-500" /> : <Code className="w-5 h-5 text-cyan-500" />;
        return (
          <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
             <div className="flex items-center justify-between">
                <h4 className="text-white font-black flex items-center gap-3">{codeIcon} {isRtl ? tabs.find(t => t.id === activeTab)?.labelAr : tabs.find(t => t.id === activeTab)?.label}</h4>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'سيتم الحقن فور الحفظ' : 'Injected live after save'}</span>
             </div>
             <div className="flex-1 bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-inner relative">
                <textarea 
                  value={(tempConfig as any)[codeKey]} 
                  onChange={e => setTempConfig({...tempConfig, [codeKey]: e.target.value})} 
                  className="w-full h-[500px] p-12 bg-transparent text-cyan-400 font-mono text-xs outline-none resize-none"
                  placeholder={activeTab === 'CSS' ? 'body { filter: grayscale(1); }' : '// Enter logic here...'}
                />
             </div>
          </div>
        );

      case 'SEO':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="p-8 bg-slate-800/40 rounded-[2.5rem] border border-white/5 space-y-6">
                <h4 className="text-white font-black flex items-center gap-3"><Search className="w-5 h-5 text-blue-500" /> {isRtl ? 'إعدادات محركات البحث الحقيقية' : 'Real SEO Management'}</h4>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Site Title (SEO)</label>
                      <input value={tempConfig.seo_title} onChange={e => setTempConfig({...tempConfig, seo_title: e.target.value})} className="w-full p-4 bg-slate-900 border border-white/5 rounded-2xl text-white font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Meta Description</label>
                      <textarea value={tempConfig.seo_desc} onChange={e => setTempConfig({...tempConfig, seo_desc: e.target.value})} className="w-full h-32 p-4 bg-slate-900 border border-white/5 rounded-2xl text-white text-xs" />
                   </div>
                </div>
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
                   <p className="text-white font-black text-xs mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> Google Search Preview</p>
                   <div className="space-y-1">
                      <p className="text-blue-400 font-medium text-lg hover:underline cursor-pointer truncate">{tempConfig.seo_title || 'Imagine AI - Smart Art'}</p>
                      <p className="text-emerald-500 text-xs truncate">https://imagine-ai.pro/</p>
                      <p className="text-slate-400 text-xs line-clamp-2">{tempConfig.seo_desc || 'The ultimate generative art platform driven by Google Gemini.'}</p>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'API_SETTINGS':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="p-8 bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                <Key className="absolute -top-10 -right-10 w-40 h-40 text-white/5 rotate-12" />
                <h3 className="text-lg font-black text-white mb-2">{isRtl ? 'المفتاح العالمي (Gemini API)' : 'Master Gemini API Key'}</h3>
                {renderApiKeyInput(isRtl ? 'المفتاح الرئيسي' : 'Global Master Key', 'global_api_key', <ShieldCheck className="w-4 h-4" />, 'bg-indigo-600')}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-full border-b border-white/5 pb-2 mb-2">
                   <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{isRtl ? 'تخصيص مفاتيح الأدوات الذكية' : 'Smart Tools Specific Keys'}</h4>
                </div>
                {renderApiKeyInput(isRtl ? 'توليد الصور من النص' : 'Text to Image', 'api_key_text_to_image', <ImageIcon className="w-4 h-4" />, 'bg-rose-600')}
                {renderApiKeyInput(isRtl ? 'إنشاء لوجو' : 'Logo Creation', 'api_key_logo', <PenTool className="w-4 h-4" />, 'bg-blue-600')}
                {renderApiKeyInput(isRtl ? 'نص إلى صوت' : 'Text to Speech', 'api_key_tts', <Mic2 className="w-4 h-4" />, 'bg-indigo-600')}
                {renderApiKeyInput(isRtl ? 'تعديل ذكي' : 'Smart Edit', 'api_key_smart_edit', <Wand2 className="w-4 h-4" />, 'bg-purple-600')}
                {renderApiKeyInput(isRtl ? 'إزالة الخلفية' : 'Remove Background', 'api_key_remove_bg', <Eraser className="w-4 h-4" />, 'bg-rose-500')}
                {renderApiKeyInput(isRtl ? 'تحسين الدقة' : 'Upscale', 'api_key_upscale', <Maximize2 className="w-4 h-4" />, 'bg-emerald-500')}
                {renderApiKeyInput(isRtl ? 'تغيير الملابس' : 'Virtual Try-On', 'api_key_virtual_try_on', <Shirt className="w-4 h-4" />, 'bg-blue-500')}
                {renderApiKeyInput(isRtl ? 'نظارات شمسية' : 'Add Sunglasses', 'api_key_sunglasses', <Eye className="w-4 h-4" />, 'bg-amber-500')}
                {renderApiKeyInput(isRtl ? 'إزالة العلامة' : 'Remove Watermark', 'api_key_watermark', <Scissors className="w-4 h-4" />, 'bg-orange-500')}
                {renderApiKeyInput(isRtl ? 'تلوين قديم' : 'Colorize Photo', 'api_key_colorize', <Palette className="w-4 h-4" />, 'bg-indigo-500')}
                {renderApiKeyInput(isRtl ? 'ممحاة سحرية' : 'Magic Eraser', 'api_key_magic_eraser', <Wind className="w-4 h-4" />, 'bg-rose-500')}
                {renderApiKeyInput(isRtl ? 'تحويل كرتون' : 'Cartoonize', 'api_key_cartoonize', <Smile className="w-4 h-4" />, 'bg-emerald-500')}
                {renderApiKeyInput(isRtl ? 'مصلح الصور' : 'Photo Restore', 'api_key_restore', <Sparkles className="w-4 h-4" />, 'bg-amber-600')}
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
                         </div>
                         <button onClick={() => document.getElementById('logo-upload')?.click()} className="p-3 bg-indigo-600 text-white rounded-xl hover:scale-105 transition-all"><Upload className="w-4 h-4" /></button>
                         <input id="logo-upload" type="file" className="hidden" onChange={e => handleFileUpload(e, 'logo')} />
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
             </div>
          </div>
        );

      default:
        return <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest">{isRtl ? 'تحت التطوير' : 'Under Development'}</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex bg-slate-950/98 backdrop-blur-2xl">
      <div className="flex w-full h-full overflow-hidden">
        <aside className="w-80 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-8 border-b border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Terminal className="w-6 h-6" /></div>
            <div>
              <h1 className="font-black text-white text-sm uppercase tracking-tighter leading-none">Admin Core</h1>
              <p className="text-[10px] text-slate-500 font-bold mt-1">v4.0 Enterprise</p>
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
             </div>
             <div className="flex items-center gap-4">
                {updateStatus && <span className="text-[10px] font-bold text-emerald-400 animate-in fade-in">{updateStatus}</span>}
                <button 
                  onClick={handleUpdateSystem}
                  disabled={isUpdating}
                  className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
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
