
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
  const [activeTab, setActiveTab] = useState<AdminTab>('API_SETTINGS');
  const [tempConfig, setTempConfig] = useState<SiteConfig>(config);
  const [tempAdminIdentity, setTempAdminIdentity] = useState(adminIdentity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateSystem = () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setTimeout(() => {
      try {
        setConfig({...tempConfig});
        setAdminIdentity(tempAdminIdentity);
        setIsUpdating(false);
        setUpdateStatus(language === 'ar' ? '✅ تم حفظ جميع المفاتيح والأدوات' : '✅ All keys & tools saved!');
        setTimeout(() => setUpdateStatus(''), 3000);
      } catch (err) {
        setIsUpdating(false);
        setUpdateStatus('❌ Error during save');
      }
    }, 500);
  };

  const renderApiKeyInput = (label: string, configKey: keyof SiteConfig, icon: any, color: string) => (
    <div className="space-y-2 group bg-slate-900/40 p-3 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-lg ${color} text-white shadow-sm`}>{icon}</div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      </div>
      <div className="relative">
        <input 
          type={visibleKeys[configKey] ? "text" : "password"} 
          value={(tempConfig as any)[configKey] || ''} 
          onChange={e => setTempConfig({...tempConfig, [configKey]: e.target.value})}
          placeholder="AIzaSy..."
          className="w-full p-3.5 bg-slate-950 border border-white/5 rounded-xl text-white font-mono text-[11px] outline-none focus:border-indigo-500 transition-all shadow-inner"
        />
        <button onClick={() => toggleKeyVisibility(configKey)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-indigo-400">
          {visibleKeys[configKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  const isRtl = language === 'ar';

  const tabs: { id: AdminTab; icon: any; label: string; labelAr: string; color: string }[] = [
    { id: 'MANAGER_PROFILE', icon: User, label: 'Manager Profile', labelAr: 'بروفايل المدير', color: 'text-indigo-400' },
    { id: 'MESSAGES', icon: MessageSquare, label: 'Inbox', labelAr: 'صندوق الوارد', color: 'text-emerald-500' },
    { id: 'API_SETTINGS', icon: Key, label: 'Smart Tools API', labelAr: 'مفاتيح الأدوات', color: 'text-amber-500' },
    { id: 'USERS', icon: Users, label: 'Users', labelAr: 'المستخدمين', color: 'text-blue-400' },
    { id: 'UX_CONFIG', icon: MousePointer2, label: 'Identity', labelAr: 'هوية الموقع', color: 'text-orange-500' },
    { id: 'GLOBAL_STORY', icon: Megaphone, label: 'Promo Story', labelAr: 'الستوري', color: 'text-rose-500' },
    { id: 'SEO', icon: Search, label: 'SEO', labelAr: 'محركات البحث', color: 'text-blue-500' },
    { id: 'CSS', icon: Layout, label: 'Custom CSS', labelAr: 'كود CSS', color: 'text-pink-500' },
    { id: 'JS', icon: Code, label: 'Custom JS', labelAr: 'كود JS', color: 'text-cyan-500' },
    { id: 'ADMIN_SECURITY', icon: Lock, label: 'Security', labelAr: 'الأمان', color: 'text-rose-600' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex bg-slate-950/98 backdrop-blur-3xl">
      <aside className="w-80 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Terminal className="w-6 h-6" /></div>
          <div>
            <h1 className="font-black text-white text-sm uppercase tracking-tighter">Admin Core</h1>
            <p className="text-[10px] text-slate-500 font-bold">v4.5 Connected</p>
          </div>
        </div>
        <div className="p-4 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}>
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
              <span className="uppercase tracking-widest">{isRtl ? tab.labelAr : tab.label}</span>
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        <header className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-900/30">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{isRtl ? tabs.find(t => t.id === activeTab)?.labelAr : tabs.find(t => t.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-4">
            {updateStatus && <span className="text-[10px] font-bold text-emerald-400">{updateStatus}</span>}
            <button onClick={handleUpdateSystem} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl flex items-center gap-3 hover:scale-105 transition-all">
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isUpdating ? 'SAVING...' : 'APPLY ALL KEYS'}
            </button>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 text-white rounded-2xl transition-all"><X className="w-6 h-6" /></button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          {activeTab === 'API_SETTINGS' ? (
            <div className="max-w-6xl mx-auto space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-full border-b border-white/10 pb-4 mb-2">
                     <h3 className="text-xl font-black text-white flex items-center gap-2"><Key className="w-6 h-6 text-amber-500" /> {isRtl ? 'المفاتيح المخصصة للأدوات' : 'Specific Tool API Keys'}</h3>
                     <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{isRtl ? 'كل أداة ستعمل بمفتاحها الخاص عند توفره' : 'Each tool will use its own key if provided'}</p>
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
               <div className="p-8 bg-indigo-600/10 rounded-3xl border border-indigo-500/20">
                  <h4 className="text-white font-black mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-400" /> {isRtl ? 'المفتاح الرئيسي (Master)' : 'Master API Key'}</h4>
                  <p className="text-[10px] text-slate-400 mb-4">{isRtl ? 'سيستخدم للأدوات التي لا تملك مفتاحاً خاصاً' : 'Used for tools without a specific key'}</p>
                  {renderApiKeyInput(isRtl ? 'المفتاح العالمي' : 'Global Master Key', 'global_api_key', <Shield className="w-4 h-4" />, 'bg-indigo-600')}
               </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-600 font-black uppercase tracking-widest">{isRtl ? 'يرجى الانتقال لإعدادات المفاتيح' : 'Please navigate to API Settings'}</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
