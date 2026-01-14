
import React, { useState, useRef } from 'react';
import { AdminTab, SiteConfig, Language, Message } from '../types.ts';
import { 
  Code, Shield, Layout, Save, RefreshCw, Terminal, X, Search,
  MessageSquare, Trash2, User, Camera, Users, UserX, UserCheck, 
  ImageIcon, Sparkles, Megaphone, Palette, Eye, EyeOff, Key,
  Upload, Fingerprint, MapPin, Calendar, ShieldCheck,
  Wand2, Eraser, Maximize2, Shirt, PenTool, Mic2, Scissors, Wind, Smile,
  ShieldAlert, Globe, Video, Clock, MousePointer2, Lock, Reply, Trash, LayoutDashboard, BarChart3, Activity
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

// إضافة DASHBOARD كنوع مسموح به محلياً لتجاوز أي مشاكل في types.ts
type LocalAdminTab = AdminTab | 'DASHBOARD';

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  config, setMessages, messages, setConfig, onClose, language,
  allUsers, setAllUsers, bannedEmails, setBannedEmails, adminIdentity, setAdminIdentity 
}) => {
  const [activeTab, setActiveTab] = useState<LocalAdminTab>('DASHBOARD');
  const [tempConfig, setTempConfig] = useState<SiteConfig>(() => ({
    ...config,
    global_story: config?.global_story || { id: 'default', message: '', active: false, image: '' }
  }));
  const [tempAdminIdentity, setTempAdminIdentity] = useState(adminIdentity || { email: '', password: '' });
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
        if (target === 'manager') setTempConfig(prev => ({ ...prev, manager_pic: dataUrl }));
        else if (target === 'story') setTempConfig(prev => ({ ...prev, global_story: { ...(prev.global_story || {id:'d',message:'',active:false}), image: dataUrl } }));
        else if (target === 'logo') setTempConfig(prev => ({ ...prev, site_logo: dataUrl }));
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
        setUpdateStatus(isRtl ? '✅ تم تحديث النظام بنجاح' : '✅ System Updated Successfully!');
        setTimeout(() => setUpdateStatus(''), 3000);
      } catch (err) {
        setIsUpdating(false);
      }
    }, 600);
  };

  const tabs: { id: LocalAdminTab; icon: any; label: string; labelAr: string; color: string }[] = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard', labelAr: 'لوحة التحكم', color: 'text-indigo-500' },
    { id: 'API_SETTINGS', icon: Key, label: 'API Keys', labelAr: 'مفاتيح API', color: 'text-amber-500' },
    { id: 'MESSAGES', icon: MessageSquare, label: 'Inbox', labelAr: 'الرسائل', color: 'text-emerald-500' },
    { id: 'USERS', icon: Users, label: 'Users', labelAr: 'المستخدمين', color: 'text-blue-400' },
    { id: 'MANAGER_PROFILE', icon: User, label: 'Manager', labelAr: 'بروفايل المدير', color: 'text-indigo-400' },
    { id: 'GLOBAL_STORY', icon: Megaphone, label: 'Story', labelAr: 'الستوري', color: 'text-rose-500' },
    { id: 'UX_CONFIG', icon: Palette, label: 'Identity', labelAr: 'هوية الموقع', color: 'text-orange-500' },
    { id: 'SEO', icon: Search, label: 'SEO', labelAr: 'SEO', color: 'text-blue-500' },
    { id: 'GLOBAL_HTML', icon: Globe, label: 'HTML', labelAr: 'HTML', color: 'text-emerald-500' },
    { id: 'CSS', icon: Layout, label: 'CSS', labelAr: 'CSS', color: 'text-pink-500' },
    { id: 'JS', icon: Code, label: 'JS', labelAr: 'JS', color: 'text-cyan-500' },
    { id: 'ADMIN_SECURITY', icon: Lock, label: 'Security', labelAr: 'الأمان', color: 'text-rose-600' },
  ];

  const currentTabInfo = tabs.find(t => t.id === activeTab);

  const renderApiKeyInput = (label: string, configKey: keyof SiteConfig, icon: any, color: string) => (
    <div className="space-y-2 bg-slate-900/40 p-3 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
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

  return (
    <div className="fixed inset-0 z-[1000] flex bg-slate-950/98 backdrop-blur-3xl animate-in fade-in duration-300">
      <aside className={`w-80 bg-slate-900 border-white/5 flex flex-col shrink-0 overflow-y-auto ${isRtl ? 'border-l' : 'border-r'}`}>
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Terminal className="w-6 h-6" /></div>
          <div><h1 className="font-black text-white text-sm uppercase tracking-tighter">Imagine AI Core</h1></div>
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

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-900/30 backdrop-blur-md">
          <h2 className="text-2xl font-black text-white uppercase">{isRtl ? currentTabInfo?.labelAr : currentTabInfo?.label}</h2>
          <div className="flex items-center gap-4">
            {updateStatus && <span className="text-[10px] font-bold text-emerald-400 animate-pulse">{updateStatus}</span>}
            <button onClick={handleUpdateSystem} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl flex items-center gap-3 active:scale-95 transition-all">
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isRtl ? 'حفظ التعديلات' : 'SAVE CORE'}
            </button>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 text-white rounded-2xl transition-all"><X className="w-6 h-6" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-10 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: isRtl ? 'إجمالي المستخدمين' : 'Total Users', value: allUsers.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                   { label: isRtl ? 'الرسائل الواردة' : 'Inbox Messages', value: messages.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                   { label: isRtl ? 'المحظورين' : 'Banned Emails', value: bannedEmails.length, icon: UserX, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                   { label: isRtl ? 'حالة النظام' : 'System Health', value: '100%', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                         <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                         <BarChart3 className="w-4 h-4 text-slate-700" />
                      </div>
                      <div className="mt-4">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                         <h3 className="text-3xl font-black text-white mt-1">{stat.value}</h3>
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5">
                   <h3 className="text-white font-black uppercase text-sm mb-6 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500" /> {isRtl ? 'أحدث المستخدمين' : 'Recent Users'}</h3>
                   <div className="space-y-4">
                      {allUsers.slice(-5).reverse().map((u, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                           <img src={`https://i.pravatar.cc/100?u=${u.email}`} className="w-10 h-10 rounded-xl" />
                           <div className="flex-1">
                              <p className="text-xs font-black text-white">{u.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                           </div>
                           <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5">
                   <h3 className="text-white font-black uppercase text-sm mb-6 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-emerald-500" /> {isRtl ? 'أحدث الرسائل' : 'Recent Messages'}</h3>
                   <div className="space-y-4">
                      {messages.slice(-5).reverse().map((m, i) => (
                        <div key={i} className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                           <div className="flex justify-between mb-1">
                              <p className="text-[10px] font-black text-indigo-400">{m.senderName}</p>
                              <p className="text-[9px] text-slate-600">{new Date(m.timestamp).toLocaleTimeString()}</p>
                           </div>
                           <p className="text-[11px] text-slate-400 line-clamp-1">{m.content}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'API_SETTINGS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95">
                 {renderApiKeyInput('Master Key', 'global_api_key', <Shield className="w-4 h-4" />, 'bg-indigo-600')}
                 {renderApiKeyInput('Text to Image', 'api_key_text_to_image', <ImageIcon className="w-4 h-4" />, 'bg-rose-600')}
                 {renderApiKeyInput('Logo Designer', 'api_key_logo', <PenTool className="w-4 h-4" />, 'bg-blue-600')}
                 {renderApiKeyInput('Text to Speech', 'api_key_tts', <Mic2 className="w-4 h-4" />, 'bg-indigo-500')}
                 {renderApiKeyInput('Smart Editor', 'api_key_smart_edit', <Wand2 className="w-4 h-4" />, 'bg-purple-600')}
                 {renderApiKeyInput('Remove BG', 'api_key_remove_bg', <Eraser className="w-4 h-4" />, 'bg-rose-500')}
                 {renderApiKeyInput('4K Upscale', 'api_key_upscale', <Maximize2 className="w-4 h-4" />, 'bg-emerald-500')}
                 {renderApiKeyInput('Virtual Try-On', 'api_key_virtual_try_on', <Shirt className="w-4 h-4" />, 'bg-indigo-400')}
                 {renderApiKeyInput('Add Sunglasses', 'api_key_sunglasses', <Eye className="w-4 h-4" />, 'bg-amber-500')}
                 {renderApiKeyInput('Watermark Remover', 'api_key_watermark', <Scissors className="w-4 h-4" />, 'bg-orange-500')}
                 {renderApiKeyInput('Photo Colorizer', 'api_key_colorize', <Palette className="w-4 h-4" />, 'bg-pink-500')}
                 {renderApiKeyInput('Magic Eraser', 'api_key_magic_eraser', <Wind className="w-4 h-4" />, 'bg-cyan-500')}
                 {renderApiKeyInput('Cartoonizer', 'api_key_cartoonize', <Smile className="w-4 h-4" />, 'bg-yellow-500')}
                 {renderApiKeyInput('Photo Restore', 'api_key_restore', <Sparkles className="w-4 h-4" />, 'bg-slate-500')}
            </div>
          )}

          {activeTab === 'MESSAGES' && (
            <div className="space-y-4 animate-in fade-in">
              {messages.length === 0 ? (
                <div className="py-20 text-center opacity-40"><MessageSquare className="w-20 h-20 mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xs">No Messages Yet</p></div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-black text-xs uppercase">{msg.senderName}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">{msg.senderEmail}</p>
                      </div>
                      <button onClick={() => setMessages(messages.filter(m => m.id !== msg.id))} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{msg.content}</p>
                    <div className="pt-4 border-t border-white/5 flex gap-2">
                       <input 
                         value={replyInputs[msg.id] || ''} 
                         onChange={e => setReplyInputs({...replyInputs, [msg.id]: e.target.value})}
                         className="flex-1 bg-slate-950 border border-white/5 rounded-xl p-3 text-[11px] text-white outline-none"
                         placeholder={isRtl ? 'اكتب ردك هنا...' : 'Write your reply...'}
                       />
                       <button 
                         onClick={() => {
                           if (!replyInputs[msg.id]) return;
                           setMessages(messages.map(m => m.id === msg.id ? {...m, reply: replyInputs[msg.id], replyTimestamp: new Date()} : m));
                           setReplyInputs({...replyInputs, [msg.id]: ''});
                         }}
                         className="px-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase"
                       >
                         {isRtl ? 'إرسال' : 'REPLY'}
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'USERS' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5">
               {allUsers.map((u: any, idx) => (
                 <div key={idx} className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 flex items-center gap-4">
                    <img src={`https://i.pravatar.cc/100?u=${u.email}`} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                       <h4 className="text-white font-black text-xs truncate">{u.name}</h4>
                       <p className="text-[10px] text-slate-500 truncate font-mono">{u.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (bannedEmails.includes(u.email)) setBannedEmails(bannedEmails.filter(e => e !== u.email));
                        else setBannedEmails([...bannedEmails, u.email]);
                      }}
                      className={`p-3 rounded-xl transition-all ${bannedEmails.includes(u.email) ? 'bg-emerald-600 text-white' : 'bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white'}`}
                    >
                      {bannedEmails.includes(u.email) ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </button>
                 </div>
               ))}
             </div>
          )}

          {activeTab === 'SEO' && (
            <div className="max-w-2xl space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase px-1">Meta Title</label>
                 <input value={tempConfig.seo_title} onChange={e => setTempConfig({...tempConfig, seo_title: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white text-xs" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase px-1">Meta Description</label>
                 <textarea value={tempConfig.seo_desc} onChange={e => setTempConfig({...tempConfig, seo_desc: e.target.value})} className="w-full p-4 h-32 bg-slate-950 border border-white/5 rounded-2xl text-white text-xs" />
               </div>
            </div>
          )}

          {activeTab === 'UX_CONFIG' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Accent Color</label>
                    <div className="flex gap-4 items-center">
                       <input type="color" value={tempConfig.ux_accent_color} onChange={e => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="w-16 h-16 bg-transparent border-none" />
                       <input value={tempConfig.ux_accent_color} onChange={e => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="flex-1 p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Blur Intensity</label>
                    <input type="range" min="0" max="100" value={parseInt(tempConfig.ux_blur_intensity)} onChange={e => setTempConfig({...tempConfig, ux_blur_intensity: `${e.target.value}px`})} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                    <p className="text-[10px] text-indigo-400 font-mono text-center">{tempConfig.ux_blur_intensity}</p>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2 text-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Site Logo</label>
                    <div onClick={() => logoFileRef.current?.click()} className="w-full aspect-video bg-slate-950 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center cursor-pointer overflow-hidden group">
                       {tempConfig.site_logo ? <img src={tempConfig.site_logo} className="w-full h-full object-contain p-4" /> : <Upload className="w-10 h-10 text-slate-600" />}
                       <input type="file" ref={logoFileRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {['GLOBAL_HTML', 'CSS', 'JS'].includes(activeTab) && (
            <div className="h-[500px] flex flex-col space-y-4 animate-in fade-in">
               <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest"><Code className="w-4 h-4" /> Custom Developer Injector</div>
               <textarea 
                 value={activeTab === 'GLOBAL_HTML' ? tempConfig.global_html : activeTab === 'CSS' ? tempConfig.custom_css : tempConfig.custom_js}
                 onChange={e => setTempConfig({...tempConfig, [activeTab === 'GLOBAL_HTML' ? 'global_html' : activeTab === 'CSS' ? 'custom_css' : 'custom_js']: e.target.value})}
                 className="flex-1 w-full p-8 bg-slate-950 border border-white/5 rounded-[2.5rem] text-indigo-300 font-mono text-xs outline-none focus:border-indigo-500/50 shadow-inner custom-scrollbar"
                 placeholder="/* Enter your code here */"
               />
            </div>
          )}

          {activeTab === 'GLOBAL_STORY' && (
            <div className="max-w-4xl mx-auto bg-slate-900/40 p-10 rounded-[3.5rem] border border-white/5 space-y-8 animate-in zoom-in-95">
               <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h3 className="text-xl font-black text-white">Story Config</h3>
                  <button onClick={() => setTempConfig({...tempConfig, global_story: { ...(tempConfig.global_story || {id:'d',message:'',active:false}), active: !tempConfig.global_story?.active }})} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${tempConfig.global_story?.active ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>
                    {tempConfig.global_story?.active ? 'LIVE' : 'DISABLED'}
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <div onClick={() => storyFileRef.current?.click()} className="aspect-video bg-slate-950 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center cursor-pointer overflow-hidden relative group">
                        {tempConfig.global_story?.image ? <img src={tempConfig.global_story.image} className="w-full h-full object-cover" alt="" /> : <Upload className="w-8 h-8 text-slate-600 group-hover:text-white transition-all" />}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black">CHANGE IMAGE</div>
                        <input type="file" ref={storyFileRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'story')} />
                     </div>
                  </div>
                  <textarea value={tempConfig.global_story?.message || ''} onChange={e => setTempConfig({...tempConfig, global_story: {...(tempConfig.global_story || {id:'d',message:'',active:false}), message: e.target.value}})} className="w-full h-48 p-5 bg-slate-950 rounded-[2rem] text-white text-xs outline-none border border-white/5 focus:border-indigo-500" placeholder="Type your story message here..." />
               </div>
            </div>
          )}

          {activeTab === 'MANAGER_PROFILE' && (
            <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Manager Name</label>
                    <input value={tempConfig.manager_name} onChange={e => setTempConfig({...tempConfig, manager_name: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Manager Birthday</label>
                    <input value={tempConfig.manager_dob} onChange={e => setTempConfig({...tempConfig, manager_dob: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Location</label>
                    <input value={tempConfig.manager_location} onChange={e => setTempConfig({...tempConfig, manager_location: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white text-xs" />
                  </div>
               </div>
               <div className="flex flex-col items-center justify-center p-10 bg-slate-950/40 rounded-[3rem] border border-white/5">
                  <div onClick={() => managerFileRef.current?.click()} className="relative group cursor-pointer">
                    <img src={tempConfig.manager_pic} className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-indigo-600/20 shadow-2xl group-hover:scale-105 transition-all" />
                    <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera className="w-8 h-8 text-white" /></div>
                    <input type="file" ref={managerFileRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'manager')} />
                  </div>
                  <p className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Manager Identity Portrait</p>
               </div>
            </div>
          )}

          {activeTab === 'ADMIN_SECURITY' && (
            <div className="max-w-2xl mx-auto bg-rose-600/10 p-16 rounded-[4rem] border border-rose-500/20 text-center shadow-2xl animate-in zoom-in-95">
               <Fingerprint className="w-20 h-20 text-rose-500 mx-auto mb-10" />
               <h3 className="text-white font-black mb-8 uppercase tracking-widest">Master Credentials</h3>
               <div className="space-y-6">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] text-slate-500 font-black ml-2">ADMIN EMAIL</label>
                    <input value={tempAdminIdentity?.email || ''} onChange={e => setTempAdminIdentity({...tempAdminIdentity, email: e.target.value})} className="w-full p-5 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-rose-500" placeholder="admin@imagine.ai" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] text-slate-500 font-black ml-2">MASTER PASSWORD</label>
                    <input type="password" value={tempAdminIdentity?.password || ''} onChange={e => setTempAdminIdentity({...tempAdminIdentity, password: e.target.value})} className="w-full p-5 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-rose-500" placeholder="••••••••" />
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
