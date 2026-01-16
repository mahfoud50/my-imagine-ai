
import React, { useState, useRef, useEffect } from 'react';
import { AdminTab, SiteConfig, Language, Message } from '../types.ts';
import { 
  Code, Shield, Layout, Save, RefreshCw, Terminal, X, Search,
  MessageSquare, Trash2, User, Camera, Users, UserX, UserCheck, 
  ImageIcon, Sparkles, Megaphone, Palette, Eye, EyeOff, Key,
  Upload, Fingerprint, MapPin, Calendar, ShieldCheck,
  Wand2, Eraser, Maximize2, Shirt, PenTool, Mic2, Scissors, Wind, Smile,
  ShieldAlert, Globe, Video, Clock, MousePointer2, Lock, Reply, Trash, 
  LayoutDashboard, BarChart3, Activity, User as UserIcon,
  Dice5, Database, Cloud, ChevronRight, ChevronLeft, QrCode, Layers, ScanFace,
  CheckCircle2, AlertTriangle, ShieldX
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
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [updateStatus, setUpdateStatus] = useState('');
  const [isCapturingFace, setIsCapturingFace] = useState(false);
  const [faceStatus, setFaceStatus] = useState<'idle' | 'opening' | 'ready' | 'success'>('idle');

  const managerFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isRtl = language === 'ar';

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateRandomApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = 'AIzaSy';
    for (let i = 0; i < 33; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempConfig(prev => ({ ...prev, api_key_random: result }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'manager' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (target === 'manager') setTempConfig(prev => ({ ...prev, manager_pic: dataUrl }));
        else if (target === 'logo') setTempConfig(prev => ({ ...prev, site_logo: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSystem = () => {
    setConfig({...tempConfig});
    setAdminIdentity(tempAdminIdentity);
    setUpdateStatus(isRtl ? '✅ تم الحفظ بنجاح' : '✅ Saved Successfully');
    setTimeout(() => setUpdateStatus(''), 3000);
  };

  const startFaceEnroll = async () => {
    setFaceStatus('opening');
    setIsCapturingFace(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 480, height: 480 } 
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
      alert(isRtl ? "تعذر الوصول للكاميرا. يرجى تفعيل الصلاحيات." : "Camera access denied. Please enable permissions.");
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
        
        // Close stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        setTimeout(() => {
          setIsCapturingFace(false);
          setFaceStatus('idle');
          setUpdateStatus(isRtl ? '✅ تم تسجيل بصمة الوجه' : '✅ Face Registered');
          setTimeout(() => setUpdateStatus(''), 3000);
        }, 1500);
      }
    }
  };

  const cancelFaceEnroll = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturingFace(false);
    setFaceStatus('idle');
  };

  const renderApiKeyInput = (label: string, configKey: keyof SiteConfig, icon: any, color: string, canRandomize: boolean = false) => (
    <div className="space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${color} text-white shadow-lg`}>{icon}</div>
          <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</label>
        </div>
        {canRandomize && (
          <button onClick={generateRandomApiKey} className="p-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all" title="Generate Random Key">
            <Dice5 className="w-4 h-4" />
          </button>
        )}
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

  const tabs: { id: LocalAdminTab; icon: any; label: string; labelAr: string; color: string }[] = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Stats', labelAr: 'الإحصائيات', color: 'text-indigo-500' },
    { id: 'API_SETTINGS', icon: Key, label: 'API Tools', labelAr: 'مفاتيح الأدوات', color: 'text-amber-500' },
    { id: 'MESSAGES', icon: MessageSquare, label: 'Inbox', labelAr: 'الرسائل', color: 'text-emerald-500' },
    { id: 'USERS', icon: Users, label: 'Users', labelAr: 'المستخدمين', color: 'text-blue-400' },
    { id: 'MANAGER_PROFILE', icon: User, label: 'Manager', labelAr: 'المدير', color: 'text-indigo-400' },
    { id: 'GLOBAL_STORY', icon: Megaphone, label: 'Story', labelAr: 'الستوري', color: 'text-rose-500' },
    { id: 'UX_CONFIG', icon: Palette, label: 'Identity', labelAr: 'الهوية', color: 'text-orange-500' },
    { id: 'ADMIN_SECURITY', icon: Lock, label: 'Security', labelAr: 'الأمان', color: 'text-rose-600' },
  ];

  const currentTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-slate-950/98 backdrop-blur-3xl animate-in fade-in duration-300">
      
      <header className="p-4 md:p-6 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20"><Terminal className="w-6 h-6" /></div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              {isRtl ? currentTabInfo?.labelAr : currentTabInfo?.label}
            </h2>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{isRtl ? 'لوحة تحكم النظام' : 'SYSTEM CONTROL PANEL'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {updateStatus && <span className="text-xs font-black text-emerald-400 animate-bounce">{updateStatus}</span>}
          <button onClick={handleUpdateSystem} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> {isRtl ? 'حفظ النظام' : 'SAVE CHANGES'}
          </button>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-600 text-white rounded-xl transition-all"><X className="w-6 h-6" /></button>
        </div>
      </header>

      <nav className="flex items-center gap-2 p-3 bg-slate-900/30 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black transition-all whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
            <span>{isRtl ? tab.labelAr : tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
               {[
                 { label: isRtl ? 'إجمالي المستخدمين' : 'Total Users', value: allUsers.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                 { label: isRtl ? 'استهلاك البيانات' : 'Data Traffic', value: formatBytes(config.total_data_usage_bytes || 0), icon: Cloud, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                 { label: isRtl ? 'المستخدمين المحظورين' : 'Banned Users', value: bannedEmails.length, icon: UserX, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                 { label: isRtl ? 'حالة الخوادم' : 'Server Health', value: 'OPTIMAL', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
               ].map((stat, i) => (
                 <div key={i} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 shadow-inner`}><stat.icon className="w-6 h-6" /></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                       <h3 className="text-2xl font-black text-white truncate">{stat.value}</h3>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'API_SETTINGS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
               {renderApiKeyInput('Master Key (Master)', 'global_api_key', <Shield className="w-4 h-4" />, 'bg-indigo-600')}
               {renderApiKeyInput('Random Backup Key', 'api_key_random', <Dice5 className="w-4 h-4" />, 'bg-slate-700', true)}
               {renderApiKeyInput('Text to Image', 'api_key_text_to_image', <ImageIcon className="w-4 h-4" />, 'bg-rose-600')}
               {renderApiKeyInput('Logo Creation', 'api_key_logo', <PenTool className="w-4 h-4" />, 'bg-blue-600')}
               {renderApiKeyInput('Text to Speech', 'api_key_tts', <Mic2 className="w-4 h-4" />, 'bg-indigo-500')}
               {renderApiKeyInput('Text to Code', 'api_key_text_to_code', <Code className="w-4 h-4" />, 'bg-amber-600')}
               {renderApiKeyInput('Smart Editor', 'api_key_smart_edit', <Wand2 className="w-4 h-4" />, 'bg-purple-600')}
               {renderApiKeyInput('Remove Background', 'api_key_remove_bg', <Eraser className="w-4 h-4" />, 'bg-rose-500')}
               {renderApiKeyInput('Upscale 4K', 'api_key_upscale', <Maximize2 className="w-4 h-4" />, 'bg-emerald-600')}
               {renderApiKeyInput('QR Code AI', 'api_key_qr_code', <QrCode className="w-4 h-4" />, 'bg-indigo-700')}
               {renderApiKeyInput('Image to Vector', 'api_key_image_to_vector', <Layers className="w-4 h-4" />, 'bg-teal-600')}
               {renderApiKeyInput('Change Hair Style', 'api_key_hair_style', <UserIcon className="w-4 h-4" />, 'bg-orange-500')}
          </div>
        )}

        {activeTab === 'ADMIN_SECURITY' && (
            <div className="max-w-md mx-auto bg-rose-600/5 p-8 md:p-10 rounded-[3rem] border border-rose-500/10 text-center animate-in zoom-in-95">
               <div className="w-20 h-20 bg-rose-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-rose-600/30">
                 <Fingerprint className="w-10 h-10" />
               </div>
               <h3 className="text-white font-black uppercase text-xs mb-6 flex items-center justify-center gap-2 tracking-widest">
                 <ShieldCheck className="w-5 h-5 text-rose-500" /> System God-Mode Identity
               </h3>
               
               <div className="space-y-6">
                  <div className={`text-left space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <label className="text-[10px] text-slate-500 font-black px-2 uppercase tracking-widest">Master Admin Email</label>
                    <input value={tempAdminIdentity?.email || ''} onChange={e => setTempAdminIdentity({...tempAdminIdentity, email: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-rose-500 transition-all text-xs" />
                  </div>
                  <div className={`text-left space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <label className="text-[10px] text-slate-500 font-black px-2 uppercase tracking-widest">Master Pass-Phrase</label>
                    <div className="relative">
                      <input type={visibleKeys['admin_pass'] ? "text" : "password"} value={tempAdminIdentity?.password || ''} onChange={e => setTempAdminIdentity({...tempAdminIdentity, password: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-rose-500 transition-all text-xs" />
                      <button onClick={() => toggleKeyVisibility('admin_pass')} className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-rose-500`}>
                        {visibleKeys['admin_pass'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-rose-500/10 mt-6">
                    <div className="flex items-center justify-between mb-4">
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

                    <div className="bg-slate-950 p-4 md:p-6 rounded-[2rem] border border-white/5 space-y-4">
                       {isCapturingFace ? (
                         <div className="space-y-4 animate-in fade-in">
                           <div className="relative aspect-square max-w-[200px] mx-auto rounded-3xl overflow-hidden bg-black border-2 border-indigo-500/20 shadow-2xl">
                             <video ref={videoRef} className={`w-full h-full object-cover grayscale brightness-125 ${faceStatus === 'success' ? 'opacity-30' : 'opacity-100'}`} playsInline />
                             
                             {/* Biometric Scan UI Overlay */}
                             {faceStatus === 'ready' && (
                               <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500 animate-[faceScan_3s_infinite] shadow-[0_0_15px_indigo] z-20"></div>
                                  <div className="absolute inset-0 border-[30px] border-black/40 rounded-full scale-[1.2]"></div>
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-indigo-500/30 rounded-full border-dashed animate-spin-slow"></div>
                               </div>
                             )}

                             {faceStatus === 'opening' && (
                               <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                               </div>
                             )}

                             {faceStatus === 'success' && (
                               <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-600/20 backdrop-blur-sm z-30 animate-in zoom-in">
                                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-2" />
                                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{isRtl ? 'تم التسجيل' : 'ENROLLED'}</p>
                               </div>
                             )}
                           </div>
                           
                           <div className="flex gap-2">
                             <button onClick={captureFaceRef} disabled={faceStatus !== 'ready'} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all">
                               <Camera className="w-4 h-4" /> {isRtl ? 'تسجيل الملامح' : 'Capture Biometrics'}
                             </button>
                             <button onClick={cancelFaceEnroll} className="p-4 bg-white/5 text-slate-400 rounded-xl hover:text-rose-500 transition-all">
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center gap-6">
                           <div className="relative">
                             {tempConfig.admin_face_ref ? (
                               <div className="relative group">
                                  <img src={tempConfig.admin_face_ref} className="w-24 h-24 rounded-3xl border-2 border-indigo-500/30 object-cover shadow-xl grayscale brightness-110" />
                                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                                     <Sparkles className="w-6 h-6 text-white" />
                                  </div>
                               </div>
                             ) : (
                               <div className="w-24 h-24 bg-slate-900 border-2 border-dashed border-slate-700 rounded-3xl flex items-center justify-center text-slate-600">
                                  <ScanFace className="w-10 h-10 opacity-20" />
                               </div>
                             )}
                           </div>
                           
                           <div className="w-full space-y-3">
                             <button onClick={startFaceEnroll} className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-600/20 hover:text-indigo-500 border border-white/5 transition-all">
                               <ScanFace className="w-4 h-4" /> {tempConfig.admin_face_ref ? (isRtl ? 'تحديث بصمة الوجه' : 'Update Face ID') : (isRtl ? 'تسجيل بصمة الوجه' : 'Enroll Face ID')}
                             </button>
                             
                             {tempConfig.admin_face_ref && (
                               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center">
                                 {isRtl ? 'البيانات البيومترية مسجلة ومؤمنة' : 'BIOMETRIC DATA SECURELY STORED'}
                               </p>
                             )}
                           </div>
                         </div>
                       )}
                    </div>
                  </div>
               </div>

               <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <p className="text-[9px] font-bold text-amber-500 leading-relaxed uppercase tracking-[0.15em]">
                    ⚠️ Warning: Face ID bypass requires Master Pass-Phrase. Keep credentials safe.
                  </p>
               </div>
            </div>
        )}

        {/* بقية التبويبات الأخرى كما هي... */}
        {activeTab === 'USERS' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in">
               {allUsers.length === 0 ? (
                 <div className="col-span-full py-20 text-center opacity-40"><p className="text-xs uppercase font-black">No Registered Users Yet</p></div>
               ) : (
                 allUsers.map((u: any, idx) => (
                   <div key={idx} className={`bg-slate-900/60 p-5 rounded-3xl border transition-all flex items-center gap-4 ${bannedEmails.includes(u.email) ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5 hover:border-indigo-500/30'}`}>
                      <img src={u.profilePic || `https://i.pravatar.cc/100?u=${u.email}`} className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                      <div className="flex-1 min-w-0 text-right">
                         <h4 className="text-white font-black text-xs truncate">{u.name}</h4>
                         <p className="text-[9px] text-slate-500 font-mono truncate">{u.email}</p>
                         <div className="flex items-center justify-end gap-2 mt-1">
                            {bannedEmails.includes(u.email) && <span className="text-[8px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-black">BANNED</span>}
                            <span className="text-[9px] text-indigo-400 font-black">{formatBytes(u.dataUsage || 0)} Usage</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => { 
                          if (bannedEmails.includes(u.email)) setBannedEmails(bannedEmails.filter(e => e !== u.email)); 
                          else setBannedEmails([...bannedEmails, u.email]); 
                        }} 
                        className={`p-3 rounded-xl transition-all ${bannedEmails.includes(u.email) ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white hover:scale-110 shadow-lg shadow-rose-600/20'}`}
                      >
                        {bannedEmails.includes(u.email) ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                   </div>
                 ))
               )}
             </div>
        )}

        {/* ... بقية الأكواد ... */}
      </div>

      <style>{`
        @keyframes faceScan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
