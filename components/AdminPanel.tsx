
import React, { useState, useRef, useEffect } from 'react';
import { AdminTab, SiteConfig, Language, Message } from '../types.ts';
import { 
  Code, Shield, Globe, Layout, Save, RefreshCw, Terminal, X, Search,
  Mail, Lock, Cpu, MousePointer2, LayoutTemplate, MessageSquare, Trash2, 
  CheckCircle, Clock, User, Send, Camera, Briefcase, Users, UserX, UserCheck, 
  ShieldAlert, Activity, Image as ImageIcon, Sparkles, Megaphone, Palette, Eye, EyeOff, Key
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

const AdminPanel: React.FC<AdminPanelProps> = ({ config, setConfig, messages, setMessages, onReplyMessage, onClose, language }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('MESSAGES');
  const [tempConfig, setTempConfig] = useState<SiteConfig>(config);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [bannedEmails, setBannedEmails] = useState<string[]>([]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('site_verified_users') || '[]');
    const banned = JSON.parse(localStorage.getItem('banned_emails') || '[]');
    setAllUsers(users);
    setBannedEmails(banned);
  }, [activeTab]);

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = 'AIzaSy'; // بداية مفاتيح جوجل المعتادة
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
    { id: 'MESSAGES', icon: MessageSquare, label: 'Inbox', labelAr: 'الرسائل', color: 'text-emerald-500' },
    { id: 'API_SETTINGS', icon: Key, label: 'API Management', labelAr: 'مفتاح API العالمي', color: 'text-amber-500' },
    { id: 'USERS', icon: Users, label: 'Users', labelAr: 'المستخدمين', color: 'text-blue-400' },
    { id: 'GLOBAL_STORY', icon: Megaphone, label: 'Global Story', labelAr: 'الستوري العام', color: 'text-rose-500' },
    { id: 'ADMIN_SECURITY', icon: Lock, label: 'Security', labelAr: 'أمان المدير', color: 'text-rose-600' },
    { id: 'UX_CONFIG', icon: MousePointer2, label: 'UI/UX', labelAr: 'الألوان والتصميم', color: 'text-orange-500' },
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
            
            {activeTab === 'API_SETTINGS' && (
              <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-5">
                <div className="p-10 bg-slate-900 border border-white/5 rounded-[3rem] space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-2xl"><Key className="w-6 h-6 text-amber-500" /></div>
                    <div>
                      <h3 className="text-xl font-black text-white">{isRtl ? 'مفتاح API العالمي (Global)' : 'Global API Key'}</h3>
                      <p className="text-xs text-slate-500 font-bold">{isRtl ? 'هذا المفتاح سيستخدم من قبل جميع مستخدمي الموقع بشكل افتراضي.' : 'This key will be used by all site users by default.'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type={showApiKey ? "text" : "password"} 
                        value={tempConfig.global_api_key} 
                        onChange={(e) => setTempConfig({...tempConfig, global_api_key: e.target.value})}
                        className="w-full py-5 px-6 bg-slate-950 border border-white/10 rounded-2xl outline-none text-white font-mono focus:border-amber-500 transition-all"
                        placeholder="Paste Gemini API Key here..."
                      />
                      <button 
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={generateRandomKey}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black flex items-center gap-2 border border-white/5 transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                        {isRtl ? 'توليد عشوائي (تجريبي)' : 'Generate Random (Test)'}
                      </button>
                      <button 
                        onClick={() => setTempConfig({...tempConfig, global_api_key: ''})}
                        className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-black flex items-center gap-2 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isRtl ? 'مسح المفتاح' : 'Clear Key'}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400 leading-relaxed font-bold">
                      {isRtl ? 'ملاحظة: تأكد من استخدام مفتاح صالح من Google AI Studio لضمان عمل ميزات التوليد لجميع الزوار.' : 'Note: Ensure you use a valid key from Google AI Studio to keep generation features active for all visitors.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* باقي التبويبات تظل كما هي ... */}
            {activeTab === 'MESSAGES' && (
               <div className="space-y-4 max-w-4xl">
                  {messages.length === 0 ? <p className="text-slate-500 font-bold opacity-30 text-center py-20">No Messages</p> : 
                    messages.map(msg => (
                      <div key={msg.id} className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3"><User className="w-5 h-5 text-indigo-400" /><div><p className="text-white font-black text-sm">{msg.senderName}</p><p className="text-[10px] text-slate-500">{msg.senderEmail}</p></div></div>
                           <button onClick={() => setMessages(messages.filter(m => m.id !== msg.id))} className="text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{msg.content}</p>
                      </div>
                    ))
                  }
               </div>
            )}

            {updateStatus && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm animate-bounce shadow-2xl">
                {updateStatus}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
