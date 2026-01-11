
import React, { useState, useRef, useEffect } from 'react';
import { AdminTab, SiteConfig, Language, Message } from '../types.ts';
import { 
  Code, Shield, Globe, Layout, Save, RefreshCw, Terminal, X, Braces, Search,
  Mail, Lock, Cpu, MousePointer2, Settings, BarChart3, Database, Key, LayoutTemplate,
  MessageSquare, Trash2, CheckCircle, Clock, User, Reply, Send, Camera, Briefcase, Calendar, MapPin,
  Users, UserX, UserCheck, ShieldAlert, Activity, Image as ImageIcon, Sparkles, Megaphone, Palette
} from 'lucide-react';

interface AdminPanelProps {
  config: SiteConfig;
  setConfig: (config: SiteConfig) => void;
  apiKeys: string[];
  setApiKeys: (keys: string[]) => void;
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
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const globalStoryFileRef = useRef<HTMLInputElement>(null);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [bannedEmails, setBannedEmails] = useState<string[]>([]);
  const [storyUser, setStoryUser] = useState<any | null>(null);
  const [storyContent, setStoryContent] = useState({ image: '', message: '' });

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('site_verified_users') || '[]');
    const banned = JSON.parse(localStorage.getItem('banned_emails') || '[]');
    setAllUsers(users);
    setBannedEmails(banned);
  }, [activeTab]);

  const toggleBan = (email: string) => {
    let newBanned = [...bannedEmails];
    if (newBanned.includes(email)) newBanned = newBanned.filter(e => e !== email);
    else newBanned.push(email);
    setBannedEmails(newBanned);
    localStorage.setItem('banned_emails', JSON.stringify(newBanned));
  };

  const deleteUser = (email: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المستخدم نهائياً؟' : 'Are you sure you want to delete this user permanently?')) return;
    const filtered = allUsers.filter(u => u.email !== email);
    setAllUsers(filtered);
    localStorage.setItem('site_verified_users', JSON.stringify(filtered));
  };

  const handleSendStory = () => {
    if (!storyUser) return;
    const users = JSON.parse(localStorage.getItem('site_verified_users') || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.email === storyUser.email) {
        return { 
          ...u, 
          story: { 
            image: storyContent.image, 
            message: storyContent.message, 
            timestamp: new Date().getTime(),
            isNew: true 
          } 
        };
      }
      return u;
    });
    localStorage.setItem('site_verified_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    setUpdateStatus(language === 'ar' ? '✅ تم إرسال الستوري بنجاح' : '✅ Story sent successfully');
    setStoryUser(null);
    setStoryContent({ image: '', message: '' });
    setTimeout(() => setUpdateStatus(''), 3000);
  };

  const handleStoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setStoryContent({ ...storyContent, image: event.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleGlobalStoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempConfig({
          ...tempConfig,
          global_story: {
            ...(tempConfig.global_story || { id: Date.now().toString(), message: '', active: false }),
            image: event.target?.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSystem = () => {
    setIsUpdating(true);
    setUpdateStatus('');
    const updatedConfig = { ...tempConfig };
    if (activeTab === 'GLOBAL_STORY' && updatedConfig.global_story) {
      updatedConfig.global_story.id = `story_${Date.now()}`;
    }
    setTimeout(() => {
      setConfig(updatedConfig);
      setIsUpdating(false);
      setUpdateStatus(language === 'ar' ? '✅ تم الحفظ ونشر التحديثات!' : '✅ Saved and published updates!');
      setTimeout(() => setUpdateStatus(''), 3000);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setTempConfig({ ...tempConfig, manager_pic: event.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSendReply = (id: string) => {
    if (!replyText[id]?.trim() || !onReplyMessage) return;
    onReplyMessage(id, replyText[id]);
    setReplyText(prev => ({ ...prev, [id]: '' }));
  };

  const tabs: { id: AdminTab; icon: any; label: string; labelAr: string; color: string }[] = [
    { id: 'MESSAGES', icon: MessageSquare, label: 'Inbox', labelAr: 'صندوق الرسائل', color: 'text-emerald-500' },
    { id: 'GLOBAL_STORY', icon: Megaphone, label: 'Global Story', labelAr: 'ستوري الإدارة (عام)', color: 'text-rose-500' },
    { id: 'USERS', icon: Users, label: 'Users', labelAr: 'إدارة المستخدمين', color: 'text-blue-400' },
    { id: 'MANAGER_PROFILE', icon: Briefcase, label: 'CEO Identity', labelAr: 'هوية المدير', color: 'text-indigo-400' },
    { id: 'GLOBAL_HTML', icon: LayoutTemplate, label: 'Global HTML', labelAr: 'حقن HTML الموقع', color: 'text-indigo-500' },
    { id: 'UX_CONFIG', icon: MousePointer2, label: 'Buttons & UI', labelAr: 'الألوان والأزرار', color: 'text-orange-500' },
    { id: 'CSS', icon: Layout, label: 'Style (CSS)', labelAr: 'ستايل (CSS)', color: 'text-pink-500' },
    { id: 'JS', icon: Code, label: 'Script (JS)', labelAr: 'سكربت (JS)', color: 'text-cyan-500' },
    { id: 'SEO', icon: Search, label: 'SEO', labelAr: 'الإعدادات العامة', color: 'text-blue-500' },
  ];

  const deleteMessage = (id: string) => setMessages(messages.filter(m => m.id !== id));

  const isRtl = language === 'ar';

  return (
    <div className="fixed inset-0 z-[1000] flex bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose}>
      <div className="flex w-full h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        <aside className="w-80 bg-slate-900 border-r border-white/5 flex flex-col shrink-0">
          <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-slate-950/20">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Terminal className="w-7 h-7" />
            </div>
            <div>
               <h1 className="font-black text-xl text-white tracking-tighter uppercase">Architect</h1>
               <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sovereign Control</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-1 custom-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl scale-[1.02]' : 'text-slate-500 hover:bg-white/5'}`}
              >
                <tab.icon className={`w-5 h-5 shrink-0 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                <span className="truncate">{isRtl ? tab.labelAr : tab.label}</span>
                {tab.id === 'MESSAGES' && messages.length > 0 && (
                   <span className="ml-auto w-5 h-5 bg-emerald-500 text-white rounded-full text-[10px] flex items-center justify-center animate-pulse">{messages.length}</span>
                )}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-28 px-12 border-b border-white/5 flex items-center justify-between bg-slate-900/20 shrink-0">
            <div>
              <h2 className="text-3xl font-black text-white">{isRtl ? tabs.find(t => t.id === activeTab)?.labelAr : tabs.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Active Context: {activeTab}</p>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={handleUpdateSystem} disabled={isUpdating} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-black text-sm shadow-2xl flex items-center gap-3 active:scale-95 transition-all">
                {isUpdating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isRtl ? 'حفظ ونشر التغييرات' : 'Save & Publish'}
              </button>
              <button onClick={onClose} className="p-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-[1.5rem] hover:bg-rose-500 transition-all shadow-xl"><X className="w-7 h-7" /></button>
            </div>
          </header>

          <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
            
            {activeTab === 'MESSAGES' && (
               <div className="space-y-4 max-w-5xl animate-in slide-in-from-bottom-10">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 opacity-30 text-white space-y-4">
                       <MessageSquare className="w-20 h-20" />
                       <p className="font-black uppercase tracking-widest">No Messages</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="p-5 bg-slate-900 border border-white/5 rounded-3xl group relative">
                         <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20"><User className="w-5 h-5 text-emerald-500" /></div>
                               <div><h4 className="text-white font-bold text-sm">{msg.senderName}</h4><p className="text-slate-500 text-[10px] font-mono">{msg.senderEmail}</p></div>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-black uppercase tracking-widest"><Clock className="w-2.5 h-2.5" /> {new Date(msg.timestamp).toLocaleString()}</div>
                         </div>
                         <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 text-slate-300 text-xs leading-relaxed mb-4">{msg.content}</div>
                         <div className="mt-2 pt-3 border-t border-white/5">
                            {msg.reply ? (
                               <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                  <div><p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">{isRtl ? 'رد الإدارة:' : 'Reply:'}</p><p className="text-[11px] text-slate-300">{msg.reply}</p></div>
                               </div>
                            ) : (
                               <div className="flex flex-col gap-2">
                                  <textarea value={replyText[msg.id] || ''} onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })} placeholder={isRtl ? 'اكتب ردك هنا...' : 'Type reply...'} className="w-full h-20 p-3 bg-slate-950 rounded-xl text-white border border-white/5 text-xs outline-none focus:border-indigo-500 transition-all resize-none" />
                                  <button onClick={() => handleSendReply(msg.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-black text-[10px] flex items-center gap-2 hover:bg-indigo-700 w-fit transition-all shadow-md"><Send className="w-2.5 h-2.5" /> {isRtl ? 'إرسال الرد' : 'Send'}</button>
                               </div>
                            )}
                         </div>
                         <button onClick={() => deleteMessage(msg.id)} className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))
                  )}
               </div>
            )}

            {activeTab === 'GLOBAL_STORY' && (
              <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-10">
                <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4"><Megaphone className="w-6 h-6 text-rose-500" /><h3 className="text-xl font-black text-white">{isRtl ? 'تعديل الستوري العام' : 'Global Story'}</h3></div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tempConfig.global_story?.active ? (isRtl ? 'نشط' : 'ACTIVE') : (isRtl ? 'معطل' : 'INACTIVE')}</span>
                      <div onClick={() => setTempConfig({ ...tempConfig, global_story: { ...(tempConfig.global_story || { id: Date.now().toString(), message: '', active: false }), active: !tempConfig.global_story?.active } })} className={`w-14 h-7 rounded-full relative transition-all ${tempConfig.global_story?.active ? 'bg-rose-500' : 'bg-slate-700'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${tempConfig.global_story?.active ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-8' : 'left-8')}`} /></div>
                    </label>
                  </div>
                  <div className="space-y-6">
                    <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-4 bg-slate-800/50 hover:border-rose-500/50 transition-all cursor-pointer text-center">
                      {tempConfig.global_story?.image ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden"><img src={tempConfig.global_story.image} className="w-full h-full object-cover" alt="" /><button onClick={() => setTempConfig({ ...tempConfig, global_story: { ...(tempConfig.global_story!), image: '' } })} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg shadow-lg"><X className="w-4 h-4" /></button></div>
                      ) : (
                        <label className="flex flex-col items-center py-10 cursor-pointer"><input type="file" className="hidden" accept="image/*" onChange={handleGlobalStoryImageUpload} /><ImageIcon className="w-12 h-12 text-slate-500 mb-2" /><span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'رفع صورة' : 'UPLOAD IMAGE'}</span></label>
                      )}
                    </div>
                    <textarea value={tempConfig.global_story?.message || ''} onChange={(e) => setTempConfig({ ...tempConfig, global_story: { ...(tempConfig.global_story || { id: Date.now().toString(), image: '', active: false }), message: e.target.value } })} placeholder={isRtl ? 'رسالة الستوري...' : 'Story message...'} className="w-full h-32 p-4 bg-slate-800 border border-white/5 rounded-2xl text-white outline-none focus:border-rose-500 transition-all resize-none text-sm" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'USERS' && (
              <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-10">
                 <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-slate-950/50 border-b border-white/5">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'المستخدم' : 'User'}</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'الحالة' : 'Status'}</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allUsers.length === 0 ? (
                        <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-500 font-bold opacity-30">No Users</td></tr>
                      ) : (
                        allUsers.map(u => (
                          <tr key={u.email} className="hover:bg-white/5 transition-all">
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-4"><img src={u.profilePic || `https://i.pravatar.cc/150?u=${u.email}`} className="w-10 h-10 rounded-xl object-cover" alt="" /><div><h4 className="text-sm font-black text-white">{u.name}</h4><p className="text-[10px] text-slate-500 font-mono">{u.email}</p></div></div>
                            </td>
                            <td className="px-8 py-5">
                               {bannedEmails.includes(u.email) ? (
                                 <span className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full text-[9px] font-black">BANNED</span>
                               ) : (
                                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black">ACTIVE</span>
                               )}
                            </td>
                            <td className="px-8 py-5 flex justify-center gap-3">
                               <button onClick={() => setStoryUser(u)} className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><ImageIcon className="w-4 h-4" /></button>
                               <button onClick={() => toggleBan(u.email)} className={`p-2.5 rounded-xl transition-all ${bannedEmails.includes(u.email) ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{bannedEmails.includes(u.email) ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}</button>
                               <button onClick={() => deleteUser(u.email)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                 </table>
              </div>
            )}

            {activeTab === 'GLOBAL_HTML' && (
              <div className="max-w-4xl space-y-6 animate-in slide-in-from-bottom-10">
                <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-3"><LayoutTemplate className="w-5 h-5 text-indigo-500" /> {isRtl ? 'حقن HTML الموقع (Global Header/Body)' : 'Global HTML Injection'}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{isRtl ? 'هذا المحتوى سيظهر في أعلى الصفحة لجميع المستخدمين.' : 'This content will appear at the top for all users.'}</p>
                  <textarea value={tempConfig.global_html} onChange={(e) => setTempConfig({...tempConfig, global_html: e.target.value})} className="w-full h-64 p-5 bg-slate-950 border border-white/5 rounded-2xl text-indigo-400 font-mono text-xs outline-none focus:border-indigo-500 transition-all resize-y" spellCheck={false} />
                </div>
              </div>
            )}

            {activeTab === 'CSS' && (
              <div className="max-w-4xl space-y-6 animate-in slide-in-from-bottom-10">
                <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-3"><Layout className="w-5 h-5 text-pink-500" /> {isRtl ? 'تخصيص الستايل (Custom CSS)' : 'Custom CSS Style'}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{isRtl ? 'أدخل أكواد CSS لتعديل مظهر الموقع بالكامل.' : 'Enter CSS code to customize the entire site appearance.'}</p>
                  <textarea value={tempConfig.custom_css} onChange={(e) => setTempConfig({...tempConfig, custom_css: e.target.value})} className="w-full h-80 p-5 bg-slate-950 border border-white/5 rounded-2xl text-pink-400 font-mono text-xs outline-none focus:border-pink-500 transition-all resize-y" spellCheck={false} />
                </div>
              </div>
            )}

            {activeTab === 'JS' && (
              <div className="max-w-4xl space-y-6 animate-in slide-in-from-bottom-10">
                <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-3"><Code className="w-5 h-5 text-cyan-500" /> {isRtl ? 'حقن سكربتات (Custom JS)' : 'Custom JavaScript Injection'}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{isRtl ? 'يتم تنفيذ هذا الكود عند تحميل الموقع.' : 'This code executes on site load.'}</p>
                  <textarea value={tempConfig.custom_js} onChange={(e) => setTempConfig({...tempConfig, custom_js: e.target.value})} className="w-full h-80 p-5 bg-slate-950 border border-white/5 rounded-2xl text-cyan-400 font-mono text-xs outline-none focus:border-cyan-500 transition-all resize-y" spellCheck={false} />
                </div>
              </div>
            )}

            {activeTab === 'SEO' && (
              <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-10">
                <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-6">
                  <h4 className="text-sm font-black text-white flex items-center gap-3"><Search className="w-5 h-5 text-blue-500" /> {isRtl ? 'إعدادات SEO العامة' : 'General SEO Settings'}</h4>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{isRtl ? 'عنوان الموقع (Meta Title)' : 'Site Title'}</label>
                       <input type="text" value={tempConfig.seo_title} onChange={(e) => setTempConfig({...tempConfig, seo_title: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-xl text-white font-bold text-sm outline-none focus:border-blue-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{isRtl ? 'وصف الموقع (Meta Description)' : 'Site Description'}</label>
                       <textarea value={tempConfig.seo_desc} onChange={(e) => setTempConfig({...tempConfig, seo_desc: e.target.value})} className="w-full h-32 p-4 bg-slate-950 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-blue-500 transition-all resize-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'UX_CONFIG' && (
              <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-10">
                <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-8">
                  <h4 className="text-sm font-black text-white flex items-center gap-3"><MousePointer2 className="w-5 h-5 text-orange-500" /> {isRtl ? 'إعدادات واجهة المستخدم (UX)' : 'User Interface (UX) Config'}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> {isRtl ? 'لون التمييز (Accent Color)' : 'Accent Color'}</label>
                       <div className="flex gap-3">
                          <input type="color" value={tempConfig.ux_accent_color} onChange={(e) => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="w-14 h-14 bg-transparent border-none cursor-pointer" />
                          <input type="text" value={tempConfig.ux_accent_color} onChange={(e) => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="flex-1 p-4 bg-slate-950 border border-white/5 rounded-xl text-white font-mono text-sm" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> {isRtl ? 'شدة التغبيش (Blur Intensity)' : 'Blur Intensity'}</label>
                       <select value={tempConfig.ux_blur_intensity} onChange={(e) => setTempConfig({...tempConfig, ux_blur_intensity: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-xl text-white font-bold text-sm outline-none">
                          <option value="0px">None</option>
                          <option value="4px">Soft (4px)</option>
                          <option value="12px">Medium (12px)</option>
                          <option value="20px">Intense (20px)</option>
                          <option value="40px">Heavy (40px)</option>
                       </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'MANAGER_PROFILE' && (
              <div className="max-w-4xl space-y-10 animate-in slide-in-from-bottom-10">
                 <div className="flex flex-col md:flex-row items-center gap-10 bg-slate-900 border border-white/5 p-10 rounded-[3rem]">
                    <div className="relative group">
                       <img src={tempConfig.manager_pic} className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-indigo-500/30 shadow-2xl transition-transform group-hover:scale-105 duration-500" alt="" />
                       <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl border-4 border-slate-900"><Camera className="w-5 h-5" /></button>
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="flex-1 w-full space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Name</label><input type="text" value={tempConfig.manager_name} onChange={(e) => setTempConfig({...tempConfig, manager_name: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-bold text-sm outline-none" /></div>
                          <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">DOB</label><input type="text" value={tempConfig.manager_dob} onChange={(e) => setTempConfig({...tempConfig, manager_dob: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-bold text-sm outline-none" /></div>
                          <div className="space-y-2 md:col-span-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Location</label><input type="text" value={tempConfig.manager_location} onChange={(e) => setTempConfig({...tempConfig, manager_location: e.target.value})} className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-bold text-sm outline-none" /></div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {updateStatus && (
              <div className="fixed bottom-12 left-1/2 -translate-x-1/2 px-10 py-5 bg-emerald-600 text-white rounded-[2rem] text-sm font-black animate-bounce shadow-2xl z-[1100]">
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
