
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
  config, setMessages, messages, setConfig, onClose, language,
  allUsers, setAllUsers, bannedEmails, setBannedEmails, adminIdentity, setAdminIdentity 
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('API_SETTINGS');
  const [tempConfig, setTempConfig] = useState<SiteConfig>(config);
  const [tempAdminIdentity, setTempAdminIdentity] = useState(adminIdentity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const managerFileRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const isRtl = language === 'ar';

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'manager' | 'story' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (target === 'manager') {
          setTempConfig(prev => ({ ...prev, manager_pic: dataUrl }));
        } else if (target === 'story') {
          setTempConfig(prev => ({ ...prev, global_story: { ...prev.global_story!, image: dataUrl } }));
        } else if (target === 'logo') {
          setTempConfig(prev => ({ ...prev, site_logo: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSystem = () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setTimeout(() => {
      try {
        setConfig({...tempConfig});
        setAdminIdentity(tempAdminIdentity);
        setIsUpdating(false);
        setUpdateStatus(language === 'ar' ? '✅ تم حفظ جميع التغييرات' : '✅ All changes saved!');
        setTimeout(() => setUpdateStatus(''), 3000);
      } catch (err) {
        setIsUpdating(false);
        setUpdateStatus('❌ Error during save');
      }
    }, 500);
  };

  const handleReplyMessage = (msgId: string) => {
    const replyText = replyInputs[msgId];
    if (!replyText) return;
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reply: replyText, replyTimestamp: new Date(), isRead: true } : m));
    setReplyInputs(prev => ({ ...prev, [msgId]: '' }));
    setUpdateStatus(isRtl ? 'تم إرسال الرد' : 'Reply Sent');
    setTimeout(() => setUpdateStatus(''), 2000);
  };

  const tabs: { id: AdminTab; icon: any; label: string; labelAr: string; color: string }[] = [
    { id: 'API_SETTINGS', icon: Key, label: 'API Keys', labelAr: 'مفاتيح API', color: 'text-amber-500' },
    { id: 'MANAGER_PROFILE', icon: User, label: 'Manager', labelAr: 'بروفايل المدير', color: 'text-indigo-400' },
    { id: 'MESSAGES', icon: MessageSquare, label: 'Messages', labelAr: 'الرسائل', color: 'text-emerald-500' },
    { id: 'USERS', icon: Users, label: 'Users', labelAr: 'المستخدمين', color: 'text-blue-400' },
    { id: 'GLOBAL_STORY', icon: Megaphone, label: 'Story', labelAr: 'الستوري', color: 'text-rose-500' },
    { id: 'UX_CONFIG', icon: Palette, label: 'Identity', labelAr: 'هوية الموقع', color: 'text-orange-500' },
    { id: 'SEO', icon: Search, label: 'SEO', labelAr: 'SEO', color: 'text-blue-500' },
    { id: 'GLOBAL_HTML', icon: Globe, label: 'HTML', labelAr: 'HTML', color: 'text-emerald-500' },
    { id: 'CSS', icon: Layout, label: 'CSS', labelAr: 'CSS', color: 'text-pink-500' },
    { id: 'JS', icon: Code, label: 'JS', labelAr: 'JS', color: 'text-cyan-500' },
    { id: 'ADMIN_SECURITY', icon: Lock, label: 'Security', labelAr: 'الأمان', color: 'text-rose-600' },
  ];

  const renderApiKeyInput = (label: string, configKey: keyof SiteConfig, icon: any, color: string) => (
    <div className="space-y-2 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-lg ${color} text-white shadow-sm`}>{icon}</div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      </div>
      <div className="relative">
        <input 
          type={visibleKeys[configKey] ? "text" : "password"} 
          value={(tempConfig as any)[configKey] || ''} 
          onChange={e => setTempConfig({...tempConfig, [configKey]: e.target.value})}
          className={`w-full p-3.5 bg-slate-950 border border-white/5 rounded-xl text-white font-mono text-[11px] outline-none focus:border-indigo-500 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
          placeholder="AIzaSy..."
        />
        <button onClick={() => toggleKeyVisibility(configKey)} className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-indigo-400`}>
          {visibleKeys[configKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  const renderCodeArea = (label: string, configKey: keyof SiteConfig, icon: any) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-xl font-black text-white">{label}</h3>
      </div>
      <textarea 
        value={(tempConfig as any)[configKey] || ''} 
        onChange={e => setTempConfig({...tempConfig, [configKey]: e.target.value})}
        className="w-full h-[450px] p-6 bg-slate-950 border border-white/5 rounded-[2rem] text-cyan-400 font-mono text-xs outline-none focus:border-indigo-500 transition-all custom-scrollbar"
        placeholder={`Paste your ${label} here...`}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex bg-slate-950/98 backdrop-blur-3xl animate-in fade-in duration-300">
      <aside className={`w-80 bg-slate-900 border-white/5 flex flex-col shrink-0 overflow-y-auto ${isRtl ? 'border-l' : 'border-r'}`}>
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Terminal className="w-6 h-6" /></div>
          <div>
            <h1 className="font-black text-white text-sm uppercase tracking-tighter">Imagine Core</h1>
            <p className="text-[10px] text-slate-500 font-bold">Admin Panel v5.1</p>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'} ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
              <tab.icon className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
              <span className="uppercase tracking-widest">{isRtl ? tab.labelAr : tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        <header className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-900/30">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{isRtl ? tabs.find(t => t.id === activeTab)?.labelAr : tabs.find(t => t.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-4">
            {updateStatus && <span className="text-[10px] font-black text-emerald-400 animate-pulse">{updateStatus}</span>}
            <button onClick={handleUpdateSystem} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isRtl ? 'حفظ الكل' : 'SAVE ALL'}
            </button>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 text-white rounded-2xl transition-all"><X className="w-6 h-6" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
          {activeTab === 'API_SETTINGS' && (
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               {renderApiKeyInput(isRtl ? 'توليد من النص' : 'Text-to-Image', 'api_key_text_to_image', <ImageIcon className="w-4 h-4" />, 'bg-rose-600')}
               {renderApiKeyInput(isRtl ? 'تصميم لوجو' : 'Logo Design', 'api_key_logo', <PenTool className="w-4 h-4" />, 'bg-blue-600')}
               {renderApiKeyInput(isRtl ? 'نص إلى صوت' : 'Voice/TTS', 'api_key_tts', <Mic2 className="w-4 h-4" />, 'bg-indigo-600')}
               {renderApiKeyInput(isRtl ? 'تعديل ذكي' : 'Smart Edit', 'api_key_smart_edit', <Wand2 className="w-4 h-4" />, 'bg-purple-600')}
               {renderApiKeyInput(isRtl ? 'إزالة الخلفية' : 'BG Removal', 'api_key_remove_bg', <Eraser className="w-4 h-4" />, 'bg-rose-500')}
               {renderApiKeyInput(isRtl ? 'تحسين الدقة' : 'Upscale', 'api_key_upscale', <Maximize2 className="w-4 h-4" />, 'bg-emerald-500')}
               {renderApiKeyInput(isRtl ? 'تغيير الملابس' : 'Try-On', 'api_key_virtual_try_on', <Shirt className="w-4 h-4" />, 'bg-blue-500')}
               {renderApiKeyInput(isRtl ? 'نظارات شمسية' : 'Sunglasses', 'api_key_sunglasses', <Eye className="w-4 h-4" />, 'bg-amber-500')}
               {renderApiKeyInput(isRtl ? 'إزالة العلامة' : 'Watermark', 'api_key_watermark', <Scissors className="w-4 h-4" />, 'bg-orange-500')}
               {renderApiKeyInput(isRtl ? 'تلوين قديم' : 'Colorize', 'api_key_colorize', <Palette className="w-4 h-4" />, 'bg-indigo-500')}
               {renderApiKeyInput(isRtl ? 'ممحاة سحرية' : 'Magic Eraser', 'api_key_magic_eraser', <Wind className="w-4 h-4" />, 'bg-rose-500')}
               {renderApiKeyInput(isRtl ? 'تحويل كرتون' : 'Cartoonize', 'api_key_cartoonize', <Smile className="w-4 h-4" />, 'bg-emerald-500')}
               {renderApiKeyInput(isRtl ? 'مصلح الصور' : 'Restore', 'api_key_restore', <Sparkles className="w-4 h-4" />, 'bg-amber-600')}
               <div className="col-span-full p-8 bg-indigo-600/10 rounded-[2.5rem] border border-indigo-500/20 mt-6">
                  {renderApiKeyInput(isRtl ? 'المفتاح العالمي' : 'Global Master Key', 'global_api_key', <Shield className="w-4 h-4" />, 'bg-indigo-600')}
               </div>
            </div>
          )}

          {activeTab === 'MANAGER_PROFILE' && (
            <div className="max-w-4xl mx-auto bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex flex-col items-center gap-6">
                     <div className="relative group w-40 h-40">
                        <img src={tempConfig.manager_pic} className="w-full h-full object-cover rounded-[2.5rem] border-4 border-white/5 shadow-2xl" alt="" />
                        <button onClick={() => managerFileRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-[2.5rem] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-8 h-8 mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{isRtl ? 'تحميل' : 'UPLOAD'}</span>
                        </button>
                        <input type="file" ref={managerFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'manager')} />
                     </div>
                  </div>
                  <div className="flex-1 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'الاسم' : 'Name'}</label>
                        <input value={tempConfig.manager_name} onChange={e => setTempConfig({...tempConfig, manager_name: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-black text-sm" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'الموقع' : 'Location'}</label>
                        <input value={tempConfig.manager_location} onChange={e => setTempConfig({...tempConfig, manager_location: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-black text-sm" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'الميلاد' : 'DOB'}</label>
                        <input value={tempConfig.manager_dob} onChange={e => setTempConfig({...tempConfig, manager_dob: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-black text-sm" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'MESSAGES' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               {messages.length === 0 ? (
                 <div className="py-20 text-center text-slate-500 uppercase font-black">{isRtl ? 'لا رسائل' : 'No messages'}</div>
               ) : (
                 messages.map(msg => (
                   <div key={msg.id} className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 space-y-4">
                      <div className="flex justify-between items-start">
                         <div>
                            <h4 className="text-white font-black text-sm">{msg.senderName}</h4>
                            <p className="text-[10px] text-slate-500">{msg.senderEmail}</p>
                         </div>
                         <div className="text-[9px] text-slate-500">{new Date(msg.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-xl text-slate-300 text-xs">{msg.content}</div>
                      <div className="flex gap-2">
                        <input value={replyInputs[msg.id] || ''} onChange={e => setReplyInputs({...replyInputs, [msg.id]: e.target.value})} placeholder={isRtl ? 'رد...' : 'Reply...'} className="flex-1 bg-slate-950 border border-white/5 rounded-lg px-4 text-xs text-white" />
                        <button onClick={() => handleReplyMessage(msg.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black">SEND</button>
                      </div>
                   </div>
                 ))
               )}
            </div>
          )}

          {activeTab === 'USERS' && (
            <div className="max-w-6xl mx-auto bg-slate-900/40 rounded-[2rem] border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
               <table className="w-full text-left">
                  <thead className="bg-slate-900/60 border-b border-white/5">
                     <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="px-8 py-4">User</th>
                        <th className="px-8 py-4">Email</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {allUsers.map(u => (
                        <tr key={u.email} className="hover:bg-white/5">
                           <td className="px-8 py-4 text-white text-xs font-black">{u.name}</td>
                           <td className="px-8 py-4 text-slate-400 text-xs">{u.email}</td>
                           <td className="px-8 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${bannedEmails.includes(u.email) ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                 {bannedEmails.includes(u.email) ? 'BANNED' : 'ACTIVE'}
                              </span>
                           </td>
                           <td className="px-8 py-4 text-right">
                              <button onClick={() => setBannedEmails(bannedEmails.includes(u.email) ? bannedEmails.filter(e => e !== u.email) : [...bannedEmails, u.email])} className="p-1.5 text-slate-400 hover:text-rose-500">
                                 {bannedEmails.includes(u.email) ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'GLOBAL_STORY' && (
            <div className="max-w-4xl mx-auto bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-white">Promo Story</h3>
                  <button onClick={() => setTempConfig({...tempConfig, global_story: { ...tempConfig.global_story!, active: !tempConfig.global_story?.active }})} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${tempConfig.global_story?.active ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {tempConfig.global_story?.active ? 'ACTIVE' : 'DISABLED'}
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div onClick={() => storyFileRef.current?.click()} className="aspect-video bg-slate-950 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center cursor-pointer group overflow-hidden">
                        {tempConfig.global_story?.image ? <img src={tempConfig.global_story.image} className="w-full h-full object-cover" alt="" /> : <Upload className="w-6 h-6 text-slate-600" />}
                        <input type="file" ref={storyFileRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'story')} />
                     </div>
                     <input value={tempConfig.global_story?.image} onChange={e => setTempConfig({...tempConfig, global_story: {...tempConfig.global_story!, image: e.target.value}})} className="w-full p-3 bg-slate-950 rounded-xl text-[10px] text-slate-400" placeholder="Image URL..." />
                  </div>
                  <textarea value={tempConfig.global_story?.message} onChange={e => setTempConfig({...tempConfig, global_story: {...tempConfig.global_story!, message: e.target.value}})} className="w-full h-full p-4 bg-slate-950 rounded-2xl text-white text-xs outline-none" placeholder="Story text..." />
               </div>
            </div>
          )}

          {activeTab === 'UX_CONFIG' && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                  <div onClick={() => logoFileRef.current?.click()} className="w-full h-32 bg-slate-950 rounded-2xl flex items-center justify-center border-2 border-dashed border-white/10 cursor-pointer overflow-hidden">
                    {tempConfig.site_logo ? <img src={tempConfig.site_logo} style={{ height: `${(tempConfig.site_logo_scale || 1) * 20}px` }} alt="" /> : <Upload className="w-6 h-6 text-slate-600" />}
                    <input type="file" ref={logoFileRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                  </div>
                  <input value={tempConfig.site_logo} onChange={e => setTempConfig({...tempConfig, site_logo: e.target.value})} className="w-full p-3 bg-slate-950 rounded-xl text-xs text-white" placeholder="Logo URL..." />
                  <input type="range" min="0.5" max="3" step="0.1" value={tempConfig.site_logo_scale} onChange={e => setTempConfig({...tempConfig, site_logo_scale: parseFloat(e.target.value)})} className="w-full accent-indigo-500" />
               </div>
               <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                  <div className="flex items-center gap-4">
                     <input type="color" value={tempConfig.ux_accent_color} onChange={e => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="w-12 h-12 bg-transparent cursor-pointer" />
                     <input value={tempConfig.ux_accent_color} onChange={e => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="flex-1 p-3 bg-slate-950 rounded-xl text-white font-mono text-xs" />
                  </div>
                  <input value={tempConfig.ux_blur_intensity} onChange={e => setTempConfig({...tempConfig, ux_blur_intensity: e.target.value})} className="w-full p-3 bg-slate-950 rounded-xl text-white text-xs" placeholder="Blur (e.g. 20px)" />
               </div>
            </div>
          )}

          {activeTab === 'SEO' && (
            <div className="max-w-4xl mx-auto bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <input value={tempConfig.seo_title} onChange={e => setTempConfig({...tempConfig, seo_title: e.target.value})} className="w-full p-4 bg-slate-950 rounded-2xl text-white text-sm font-black" placeholder="Meta Title" />
               <textarea value={tempConfig.seo_desc} onChange={e => setTempConfig({...tempConfig, seo_desc: e.target.value})} className="w-full h-32 p-4 bg-slate-950 rounded-2xl text-white text-xs" placeholder="Meta Description" />
            </div>
          )}

          {activeTab === 'GLOBAL_HTML' && renderCodeArea('Global HTML', 'global_html', <Globe className="w-6 h-6 text-emerald-500" />)}
          {activeTab === 'CSS' && renderCodeArea('Custom CSS', 'custom_css', <Layout className="w-6 h-6 text-pink-500" />)}
          {activeTab === 'JS' && renderCodeArea('Custom JS', 'custom_js', <Code className="w-6 h-6 text-cyan-500" />)}

          {activeTab === 'ADMIN_SECURITY' && (
            <div className="max-w-2xl mx-auto bg-rose-600/10 p-12 rounded-[3rem] border border-rose-500/20 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
               <Fingerprint className="w-16 h-16 text-rose-500 mx-auto mb-6" />
               <div className="space-y-4">
                  <input value={tempAdminIdentity.email} onChange={e => setTempAdminIdentity({...tempAdminIdentity, email: e.target.value})} className="w-full p-4 bg-slate-950 rounded-2xl text-white font-mono text-xs" placeholder="Admin Email" />
                  <input type="password" value={tempAdminIdentity.password} onChange={e => setTempAdminIdentity({...tempAdminIdentity, password: e.target.value})} className="w-full p-4 bg-slate-950 rounded-2xl text-white font-mono text-xs" placeholder="Admin Password" />
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
