
import React, { useState, useRef, useEffect } from 'react';
import { AdminTab, SiteConfig, Language, Message, SYSTEM_VERSION } from '../types.ts';
import { 
  Code, Shield, Layout, Save, RefreshCw, Terminal, X, Search,
  MessageSquare, Trash2, User, Camera, Users, UserX, UserCheck, 
  ImageIcon, Sparkles, Megaphone, Palette, Eye, EyeOff, Key,
  Upload, Fingerprint, MapPin, Calendar, ShieldCheck,
  Wand2, Eraser, Maximize2, Shirt, PenTool, Mic2, Scissors, Wind, Smile,
  ShieldAlert, Globe, Video, Clock, MousePointer2, Lock, Reply, Trash, 
  LayoutDashboard, BarChart3, Activity, User as UserIcon,
  Dice5, Database, Cloud, ChevronRight, ChevronLeft, QrCode, Layers, ScanFace,
  CheckCircle2, AlertTriangle, ShieldX, Zap, Server, Search as SearchIcon, Mail, Link, Type, 
  Trash2 as TrashIcon, Ghost, MoveDiagonal
} from 'lucide-react';
import { translations } from '../translations.ts';

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
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [tempConfig, setTempConfig] = useState<SiteConfig>(() => ({...config}));
  const [tempAdminIdentity, setTempAdminIdentity] = useState(adminIdentity || { email: '', password: '' });
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [updateStatus, setUpdateStatus] = useState('');
  const [isCapturingFace, setIsCapturingFace] = useState(false);
  const [faceStatus, setFaceStatus] = useState<'idle' | 'opening' | 'ready' | 'success'>('idle');

  const managerFileRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isRtl = language === 'ar';

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateSystem = () => {
    setConfig({...tempConfig});
    setAdminIdentity(tempAdminIdentity);
    setUpdateStatus(isRtl ? '✅ تم حفظ التعديلات بنجاح' : '✅ Settings Saved');
    setTimeout(() => setUpdateStatus(''), 3000);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  const startFaceEnroll = async () => {
    setFaceStatus('opening');
    setIsCapturingFace(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setFaceStatus('ready');
        };
      }
    } catch (e) {
      alert(isRtl ? "تعذر الوصول للكاميرا" : "Camera access denied");
      setIsCapturingFace(false);
      setFaceStatus('idle');
    }
  };

  const captureFaceRef = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setTempConfig(prev => ({ ...prev, admin_face_ref: dataUrl, face_id_enabled: true }));
        setFaceStatus('success');
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        setTimeout(() => { setIsCapturingFace(false); setFaceStatus('idle'); }, 1200);
      }
    }
  };

  const renderApiKeyInput = (label: string, configKey: keyof SiteConfig, icon: any, color: string) => (
    <div className="space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-2 rounded-lg ${color} text-white shadow-lg`}>{icon}</div>
        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</label>
      </div>
      <div className="relative">
        <input 
          type={visibleKeys[configKey] ? "text" : "password"} 
          value={(tempConfig as any)[configKey] || ''} 
          onChange={e => setTempConfig({...tempConfig, [configKey]: e.target.value})}
          className={`w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-[11px] outline-none focus:border-indigo-500 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
          placeholder="AIzaSy..."
        />
        <button onClick={() => toggleKeyVisibility(configKey)} className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-indigo-400 transition-colors`}>
          {visibleKeys[configKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const stats = [
    { label: isRtl ? 'إجمالي البيانات' : 'Total Data', value: (tempConfig.total_data_usage_bytes ? (tempConfig.total_data_usage_bytes / (1024*1024)).toFixed(2) : '0') + ' MB', icon: Database, color: 'text-indigo-500' },
    { label: isRtl ? 'المستخدمين' : 'Total Users', value: allUsers.length, icon: Users, color: 'text-emerald-500' },
    { label: isRtl ? 'الرسائل' : 'Messages', value: messages.length, icon: MessageSquare, color: 'text-amber-500' },
    { label: isRtl ? 'الأدوات النشطة' : 'Active Tools', value: '20/20', icon: Zap, color: 'text-rose-500' },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-slate-950/98 backdrop-blur-3xl animate-in fade-in duration-300">
      <header className="p-4 md:p-6 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20"><Terminal className="w-7 h-7" /></div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">{isRtl ? 'الإدارة المركزية' : 'ADMIN CONTROL'}</h2>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">System Version {SYSTEM_VERSION}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {updateStatus && <span className="text-xs font-black text-emerald-400 animate-bounce">{updateStatus}</span>}
          <button onClick={handleUpdateSystem} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> {isRtl ? 'حفظ النظام' : 'SAVE CONFIG'}
          </button>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-600 text-white rounded-xl transition-all"><X className="w-6 h-6" /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 md:w-64 border-r border-white/10 bg-slate-900/30 flex flex-col gap-1 p-3 overflow-y-auto no-scrollbar">
          {[
            { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard', labelAr: 'الإحصائيات', color: 'text-indigo-500' },
            { id: 'API_SETTINGS', icon: Key, label: 'API Tools', labelAr: 'مفاتيح الأدوات', color: 'text-amber-500' },
            { id: 'GLOBAL_STORY', icon: Megaphone, label: 'Story Control', labelAr: 'تحكم الستوري', color: 'text-rose-500' },
            { id: 'DEV_TOOLS', icon: Code, label: 'Developer (Code)', labelAr: 'أدوات المطور', color: 'text-amber-400' },
            { id: 'SYSTEM_CONFIG', icon: Server, label: 'System (SEO/HTTPS)', labelAr: 'النظام والتحسين', color: 'text-cyan-500' },
            { id: 'UX_CONFIG', icon: Palette, label: 'UX Design', labelAr: 'تجربة المستخدم', color: 'text-emerald-500' },
            { id: 'MANAGER_PROFILE', icon: User, label: 'Manager', labelAr: 'المدير', color: 'text-indigo-400' },
            { id: 'MESSAGES', icon: MessageSquare, label: 'Inbox', labelAr: 'الرسائل', color: 'text-blue-500' },
            { id: 'ADMIN_SECURITY', icon: Lock, label: 'Security', labelAr: 'الأمان', color: 'text-rose-500' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
              <span className="hidden md:block font-black text-[11px] uppercase tracking-widest">{isRtl ? tab.labelAr : tab.label}</span>
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl bg-white/5 items-center justify-center flex ${s.color}`}><s.icon className="w-8 h-8" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                      <h3 className="text-2xl font-black text-white">{s.value}</h3>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-white uppercase">{isRtl ? 'سجل المستخدمين' : 'User Activity'}</h3>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[10px] text-emerald-500 font-black">SYSTEM LIVE</span></div>
                </div>
                <div className="space-y-4">
                  {allUsers.slice(0, 10).map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                         <img src={`https://i.pravatar.cc/150?u=${u.email}`} className="w-10 h-10 rounded-xl object-cover grayscale" />
                         <div>
                            <p className="text-xs font-black text-white">{u.name}</p>
                            <p className="text-[9px] text-slate-500">{u.email}</p>
                         </div>
                      </div>
                      <span className="text-[10px] font-black text-indigo-400">{( (u.dataUsage || 0) / (1024*1024)).toFixed(1)} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'API_SETTINGS' && (
            <div className="space-y-12 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Fallback Keys */}
                <div className="col-span-full mb-4">
                  <h3 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-indigo-400" /> {isRtl ? 'المفاتيح الاحتياطية' : 'FALLBACK KEYS'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderApiKeyInput(isRtl ? 'المفتاح العالمي (Global)' : 'Global API Key', 'global_api_key', <Globe className="w-4 h-4"/>, 'bg-indigo-600')}
                    {renderApiKeyInput(isRtl ? 'المفتاح العشوائي (Random Fallback)' : 'Random API Key', 'api_key_random', <Dice5 className="w-4 h-4"/>, 'bg-slate-600')}
                  </div>
                </div>

                <div className="col-span-full h-px bg-white/5 my-4"></div>

                {/* Specific Tool Keys */}
                <div className="col-span-full">
                  <h3 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> {isRtl ? 'مفاتيح الأدوات المخصصة' : 'SPECIFIC TOOL KEYS'}
                  </h3>
                </div>

                {renderApiKeyInput('Main Image Gen', 'api_key_text_to_image', <Sparkles className="w-4 h-4"/>, 'bg-indigo-600')}
                {renderApiKeyInput('Logo Designer', 'api_key_logo', <PenTool className="w-4 h-4"/>, 'bg-blue-600')}
                {renderApiKeyInput('Smart Editor', 'api_key_smart_edit', <Wand2 className="w-4 h-4"/>, 'bg-purple-600')}
                {renderApiKeyInput('Remove Background', 'api_key_remove_bg', <Eraser className="w-4 h-4"/>, 'bg-rose-600')}
                {renderApiKeyInput('4K Upscaler', 'api_key_upscale', <Maximize2 className="w-4 h-4"/>, 'bg-emerald-600')}
                {renderApiKeyInput('Text to Speech', 'api_key_tts', <Mic2 className="w-4 h-4"/>, 'bg-amber-600')}
                {renderApiKeyInput('Text to Code', 'api_key_text_to_code', <Code className="w-4 h-4"/>, 'bg-cyan-600')}
                {renderApiKeyInput('QR Generator', 'api_key_qr_code', <QrCode className="w-4 h-4"/>, 'bg-indigo-800')}
                {renderApiKeyInput('Image to Vector', 'api_key_image_to_vector', <Layers className="w-4 h-4"/>, 'bg-teal-600')}
                {renderApiKeyInput('Virtual Try-On', 'api_key_virtual_try_on', <Shirt className="w-4 h-4"/>, 'bg-pink-600')}
                {renderApiKeyInput('Add Sunglasses', 'api_key_sunglasses', <Eye className="w-4 h-4"/>, 'bg-orange-500')}
                {renderApiKeyInput('Remove Watermark', <Scissors className="w-4 h-4"/> as any, 'api_key_watermark' as any, 'bg-slate-500')}
                {renderApiKeyInput('Colorizer', 'api_key_colorize', <Palette className="w-4 h-4"/>, 'bg-indigo-400')}
                {renderApiKeyInput('Magic Eraser', 'api_key_magic_eraser', <Wind className="w-4 h-4"/>, 'bg-rose-700')}
                {renderApiKeyInput('Cartoonizer', 'api_key_cartoonize', <Smile className="w-4 h-4"/>, 'bg-emerald-700')}
                {renderApiKeyInput('Restore Photo', 'api_key_restore', <RefreshCw className="w-4 h-4"/>, 'bg-amber-700')}
                {renderApiKeyInput('Change HairStyle', 'api_key_hair_style', <UserIcon className="w-4 h-4"/>, 'bg-fuchsia-600')}
              </div>
            </div>
          )}

          {activeTab === 'DEV_TOOLS' && (
            <div className="space-y-6 animate-in fade-in">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5">
                     <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><Code className="w-4 h-4" /> Global HTML (Head/Body)</label>
                     <textarea 
                        value={tempConfig.global_html}
                        onChange={e => setTempConfig({...tempConfig, global_html: e.target.value})}
                        className="w-full h-48 p-4 bg-slate-950 border border-white/10 rounded-2xl text-amber-400 font-mono text-[11px] outline-none focus:border-amber-500 custom-scrollbar"
                        placeholder="<!-- Custom scripts or meta tags -->"
                     />
                  </div>
                  <div className="space-y-2 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5">
                     <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Palette className="w-4 h-4" /> Custom CSS</label>
                     <textarea 
                        value={tempConfig.custom_css}
                        onChange={e => setTempConfig({...tempConfig, custom_css: e.target.value})}
                        className="w-full h-48 p-4 bg-slate-950 border border-white/10 rounded-2xl text-indigo-400 font-mono text-[11px] outline-none focus:border-indigo-500 custom-scrollbar"
                        placeholder="body { filter: contrast(1.1); }"
                     />
                  </div>
                  <div className="space-y-2 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5">
                     <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2"><Terminal className="w-4 h-4" /> Global Javascript (JS)</label>
                     <textarea 
                        value={tempConfig.custom_js}
                        onChange={e => setTempConfig({...tempConfig, custom_js: e.target.value})}
                        className="w-full h-48 p-4 bg-slate-950 border border-white/10 rounded-2xl text-cyan-400 font-mono text-[11px] outline-none focus:border-cyan-500 custom-scrollbar"
                        placeholder="window.onload = () => console.log('Imagine AI Loaded');"
                     />
                  </div>
                  <div className="space-y-2 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5">
                     <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-4 h-4" /> PHP Logic / Server-side</label>
                     <textarea 
                        value={tempConfig.php_logic}
                        onChange={e => setTempConfig({...tempConfig, php_logic: e.target.value})}
                        className="w-full h-48 p-4 bg-slate-950 border border-white/10 rounded-2xl text-emerald-400 font-mono text-[11px] outline-none focus:border-emerald-500 custom-scrollbar"
                        placeholder="<?php // Custom PHP logic if applicable ?>"
                     />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'SYSTEM_CONFIG' && (
            <div className="space-y-8 animate-in fade-in">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* SEO Config */}
                  <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6">
                     <h3 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2"><SearchIcon className="text-cyan-400 w-4 h-4" /> SEO Optimization</h3>
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Site Title</label>
                           <input value={tempConfig.seo_title} onChange={e => setTempConfig({...tempConfig, seo_title: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-cyan-500" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Site Description</label>
                           <textarea value={tempConfig.seo_desc} onChange={e => setTempConfig({...tempConfig, seo_desc: e.target.value})} className="w-full h-24 p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-cyan-500" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">SEO Keywords</label>
                           <input value={tempConfig.seo_keywords} onChange={e => setTempConfig({...tempConfig, seo_keywords: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-cyan-500" placeholder="AI, Art, Generator..." />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-cyan-600/20 text-cyan-400 rounded-lg"><Link className="w-4 h-4" /></div>
                              <span className="text-[10px] text-slate-300 font-black uppercase">Force HTTPS (SSL)</span>
                           </div>
                           <button 
                              onClick={() => setTempConfig({...tempConfig, https_force: !tempConfig.https_force})}
                              className={`w-12 h-6 rounded-full relative transition-all ${tempConfig.https_force ? 'bg-emerald-500' : 'bg-slate-700'}`}
                           >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${tempConfig.https_force ? (isRtl ? 'right-1' : 'left-7') : (isRtl ? 'right-7' : 'left-1')}`} />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* SMTP Config */}
                  <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6">
                     <h3 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2"><Mail className="text-indigo-400 w-4 h-4" /> SMTP Email Server</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 col-span-2">
                           <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">SMTP Host</label>
                           <input value={tempConfig.smtp_host} onChange={e => setTempConfig({...tempConfig, smtp_host: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-indigo-500" placeholder="smtp.gmail.com" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">SMTP Port</label>
                           <input value={tempConfig.smtp_port} onChange={e => setTempConfig({...tempConfig, smtp_port: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-indigo-500" placeholder="587" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">SMTP User</label>
                           <input value={tempConfig.smtp_user} onChange={e => setTempConfig({...tempConfig, smtp_user: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-indigo-500" placeholder="admin@site.com" />
                        </div>
                        <div className="space-y-1 col-span-2">
                           <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">SMTP Password</label>
                           <input type="password" value={tempConfig.smtp_pass} onChange={e => setTempConfig({...tempConfig, smtp_pass: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-indigo-500" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'UX_CONFIG' && (
            <div className="max-w-2xl space-y-8 animate-in fade-in">
               <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/10">
                        <Palette className="w-8 h-8" />
                     </div>
                     <h3 className="text-white font-black uppercase text-sm tracking-widest">User Experience (UX)</h3>
                  </div>

                  <div className="space-y-8">
                     {/* Logo Editing Section */}
                     <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-indigo-400" /> {isRtl ? 'تعديل شعار الموقع (Logo Identity)' : 'Site Logo Identity'}
                        </label>
                        
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                           <div className="w-32 h-32 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center p-4 relative group shrink-0">
                              {tempConfig.site_logo ? (
                                <img 
                                  src={tempConfig.site_logo} 
                                  className="max-w-full max-h-full object-contain" 
                                  style={{ transform: `scale(${tempConfig.site_logo_scale || 1})` }} 
                                />
                              ) : (
                                <ImageIcon className="w-10 h-10 text-slate-700" />
                              )}
                              <button 
                                onClick={() => logoFileRef.current?.click()}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white rounded-2xl"
                              >
                                <Camera className="w-6 h-6" />
                              </button>
                              <input 
                                type="file" 
                                ref={logoFileRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if(file) {
                                    const reader = new FileReader();
                                    reader.onload = ev => setTempConfig({...tempConfig, site_logo: ev.target?.result as string});
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                           </div>

                           <div className="flex-1 w-full space-y-4">
                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-500 font-black uppercase">{isRtl ? 'رابط الشعار المباشر' : 'Direct Logo URL'}</label>
                                <input 
                                  value={tempConfig.site_logo || ''} 
                                  onChange={e => setTempConfig({...tempConfig, site_logo: e.target.value})} 
                                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-white text-[10px] outline-none focus:border-indigo-500" 
                                  placeholder="https://..." 
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-[9px] text-slate-500 font-black uppercase flex items-center gap-1">
                                    <MoveDiagonal className="w-3 h-3" /> {isRtl ? 'حجم الشعار' : 'Logo Scale'}
                                  </label>
                                  <span className="text-[10px] font-black text-indigo-400">{(tempConfig.site_logo_scale || 1).toFixed(1)}x</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="0.5" 
                                  max="2.5" 
                                  step="0.1" 
                                  value={tempConfig.site_logo_scale || 1} 
                                  onChange={e => setTempConfig({...tempConfig, site_logo_scale: parseFloat(e.target.value)})} 
                                  className="w-full accent-indigo-500" 
                                />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">Accent Color</label>
                        <div className="flex items-center gap-4">
                           <input type="color" value={tempConfig.ux_accent_color} onChange={e => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="w-16 h-16 rounded-2xl bg-transparent border-none cursor-pointer" />
                           <input value={tempConfig.ux_accent_color} onChange={e => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="flex-1 p-4 bg-slate-950 border border-white/10 rounded-2xl text-white font-mono text-xs uppercase" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">Blur Intensity (px)</label>
                           <input value={tempConfig.ux_blur_intensity} onChange={e => setTempConfig({...tempConfig, ux_blur_intensity: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs" placeholder="20px" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">Border Radius (rem)</label>
                           <input value={tempConfig.ux_border_radius} onChange={e => setTempConfig({...tempConfig, ux_border_radius: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs" placeholder="2rem" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'GLOBAL_STORY' && (
            <div className="max-w-2xl space-y-8 animate-in fade-in">
               <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-3"><Megaphone className="text-rose-500" /> Story Configuration</h3>
                     <button 
                       onClick={() => setTempConfig({...tempConfig, global_story: {...(tempConfig.global_story || {id: 'default', message: '', active: false}), active: !tempConfig.global_story?.active}})}
                       className={`w-14 h-8 rounded-full relative transition-all ${tempConfig.global_story?.active ? 'bg-emerald-500' : 'bg-slate-700'}`}
                     >
                       <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${tempConfig.global_story?.active ? (isRtl ? 'right-1' : 'left-7') : (isRtl ? 'right-7' : 'left-1')}`} />
                     </button>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Story Text Content</label>
                        <textarea 
                          value={tempConfig.global_story?.message || ''}
                          onChange={e => setTempConfig({...tempConfig, global_story: {...(tempConfig.global_story || {id: 'default', active: false}), message: e.target.value}})}
                          className="w-full h-32 p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs font-bold outline-none focus:border-rose-500"
                          placeholder="What would you like to announce?"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Media URL (Image/Video)</label>
                        <div className="flex gap-4">
                          <input 
                            value={tempConfig.global_story?.image || ''}
                            onChange={e => setTempConfig({...tempConfig, global_story: {...(tempConfig.global_story || {id: 'default', active: false, message: ''}), image: e.target.value}})}
                            className="flex-1 p-4 bg-slate-950 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-rose-500"
                            placeholder="https://..."
                          />
                          <button onClick={() => storyFileRef.current?.click()} className="p-4 bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl transition-all"><Upload className="w-5 h-5" /></button>
                          <input type="file" ref={storyFileRef} className="hidden" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if(file) {
                              const reader = new FileReader();
                              reader.onload = ev => setTempConfig({...tempConfig, global_story: {...(tempConfig.global_story || {id: 'default', active: false, message: ''}), image: ev.target?.result as string}});
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'ADMIN_SECURITY' && (
            <div className="max-w-md mx-auto space-y-8 animate-in zoom-in-95">
               <div className="bg-rose-600/5 p-8 md:p-10 rounded-[3rem] border border-rose-500/10 text-center">
                  <div className="w-20 h-20 bg-rose-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-rose-600/30">
                    <Fingerprint className="w-10 h-10" />
                  </div>
                  <h3 className="text-white font-black uppercase text-xs mb-6 flex items-center justify-center gap-2 tracking-widest">
                    <ShieldCheck className="w-5 h-5 text-rose-500" /> Admin Credentials
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="text-left space-y-1">
                      <label className="text-[9px] text-slate-500 font-black uppercase ml-1">Master Email</label>
                      <input value={tempAdminIdentity.email} onChange={e => setTempAdminIdentity({...tempAdminIdentity, email: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-rose-500 text-xs" />
                    </div>
                    <div className="text-left space-y-1">
                      <label className="text-[9px] text-slate-500 font-black uppercase ml-1">Master Password</label>
                      <input type="password" value={tempAdminIdentity.password} onChange={e => setTempAdminIdentity({...tempAdminIdentity, password: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-rose-500 text-xs" />
                    </div>
                  </div>
               </div>

               <div className="bg-amber-600/5 p-8 md:p-10 rounded-[3rem] border border-amber-500/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white"><Terminal className="w-6 h-6" /></div>
                    <h3 className="text-white font-black uppercase text-xs tracking-widest">{isRtl ? 'كود المطورين (Master Key)' : 'Developer Master Key'}</h3>
                  </div>
                  <input value={tempConfig.dev_access_code} onChange={e => setTempConfig({...tempConfig, dev_access_code: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-amber-500 font-mono font-black outline-none focus:border-amber-500 text-xs tracking-[0.4em]" />
               </div>

               <div className="bg-indigo-600/5 p-8 md:p-10 rounded-[3rem] border border-indigo-500/10">
                  <div className="flex items-center justify-between mb-8">
                     <label className="text-[10px] text-indigo-400 font-black uppercase tracking-widest flex items-center gap-2">
                       <ScanFace className="w-4 h-4" /> {isRtl ? 'بصمة الوجه (Face ID)' : 'Biometric Face ID'}
                     </label>
                     <button 
                      onClick={() => setTempConfig({...tempConfig, face_id_enabled: !tempConfig.face_id_enabled})}
                      className={`w-12 h-6 rounded-full relative transition-all ${tempConfig.face_id_enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                     >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${tempConfig.face_id_enabled ? (isRtl ? 'right-1' : 'left-7') : (isRtl ? 'right-7' : 'left-1')}`} />
                     </button>
                  </div>
                  <button onClick={startFaceEnroll} className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all border border-white/5">
                    <ScanFace className="w-4 h-4" /> {tempConfig.admin_face_ref ? (isRtl ? 'تحديث بصمة الوجه' : 'Update Face ID') : (isRtl ? 'تسجيل بصمة الوجه' : 'Enroll Face ID')}
                  </button>
                  {isCapturingFace && (
                    <div className="mt-4 space-y-4">
                      <div className="aspect-square w-32 mx-auto rounded-full overflow-hidden bg-black border-2 border-indigo-500">
                         <video ref={videoRef} className="w-full h-full object-cover grayscale" playsInline />
                      </div>
                      <button onClick={captureFaceRef} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase">Capture Now</button>
                    </div>
                  )}
               </div>
            </div>
          )}
          
          {activeTab === 'MANAGER_PROFILE' && (
            <div className="max-w-xl space-y-8 animate-in fade-in">
              <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-white/5 space-y-6">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative group">
                    <img src={tempConfig.manager_pic} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white/10 shadow-2xl" />
                    <button onClick={() => managerFileRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"><Camera className="w-6 h-6" /></button>
                    <input type="file" ref={managerFileRef} className="hidden" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if(file) {
                        const reader = new FileReader();
                        reader.onload = ev => setTempConfig({...tempConfig, manager_pic: ev.target?.result as string});
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </div>
                  
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'اسم المدير' : 'Manager Name'}</label>
                      <input value={tempConfig.manager_name} onChange={e => setTempConfig({...tempConfig, manager_name: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'تاريخ الميلاد' : 'Birth Date'}</label>
                      <input value={tempConfig.manager_dob} onChange={e => setTempConfig({...tempConfig, manager_dob: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 text-xs" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'الموقع' : 'Location'}</label>
                      <input value={tempConfig.manager_location} onChange={e => setTempConfig({...tempConfig, manager_location: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MESSAGES' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                   <h3 className="text-sm font-black text-white uppercase">{isRtl ? 'صندوق الرسائل الواردة' : 'System Inbox'}</h3>
                   <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-[9px] font-black">{messages.length} TOTAL</span>
                </div>
                <div className="divide-y divide-white/5">
                  {messages.length === 0 ? (
                    <div className="p-20 text-center opacity-30 flex flex-col items-center gap-4">
                       <MessageSquare className="w-12 h-12" />
                       <p className="text-xs font-black uppercase tracking-widest">{isRtl ? 'لا توجد رسائل حالياً' : 'Inbox is empty'}</p>
                    </div>
                  ) : (
                    messages.map((m, i) => (
                      <div key={m.id} className="p-6 hover:bg-white/5 transition-all group">
                         <div className="flex justify-between mb-2">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 ${m.isRead ? 'bg-slate-600' : 'bg-indigo-500'} rounded-full`}></div>
                               <span className="text-xs font-black text-white">{m.senderName} ({m.senderEmail})</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{new Date(m.timestamp).toLocaleString()}</span>
                         </div>
                         <p className="text-[11px] text-slate-400 font-bold mb-4">{m.content}</p>
                         <div className="flex gap-2">
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-2"><Reply className="w-3 h-3" /> REPLY</button>
                            <button onClick={() => handleDeleteMessage(m.id)} className="px-4 py-2 bg-white/5 text-rose-500 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 hover:bg-rose-500 hover:text-white"><Trash className="w-3 h-3" /> DELETE</button>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
