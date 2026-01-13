
import React, { useState, useRef } from 'react';
import { AdminTab, SiteConfig, Language, Message } from '../types.ts';
import { 
  Code, Shield, Layout, Save, RefreshCw, Terminal, X, Search,
  Mail, Lock, MousePointer2, LayoutTemplate, MessageSquare, Trash2, 
  User, Camera, Briefcase, Users, UserX, UserCheck, 
  ImageIcon, Sparkles, Megaphone, Palette, Eye, EyeOff, Key,
  Upload, Fingerprint, MapPin, Calendar, ShieldCheck, AlignLeft,
  Type, Layers, Sliders, Smartphone, CheckCircle, Reply, Send
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const storyFileRef = useRef<HTMLInputElement>(null);
  const managerFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const handleUpdateSystem = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setConfig(tempConfig);
      setIsUpdating(false);
      setUpdateStatus(language === 'ar' ? '✅ تم حفظ الإعدادات بنجاح' : '✅ Settings saved!');
      setTimeout(() => setUpdateStatus(''), 3000);
    }, 800);
  };

  const handlePublishNewStory = () => {
    // توليد معرف فريد لضمان أنها تظهر كـ "جديدة" لجميع المستخدمين في كل مرة
    const newStoryId = `STORY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newStory = {
      ...(tempConfig.global_story || { image: '', message: '' }),
      id: newStoryId,
      active: true
    };
    
    const updatedConfig = { ...tempConfig, global_story: newStory };
    setTempConfig(updatedConfig);
    
    // حفظ مباشر للقصة لضمان النشر الفوري
    setIsUpdating(true);
    setTimeout(() => {
      setConfig(updatedConfig);
      setIsUpdating(false);
      setUpdateStatus(language === 'ar' ? '🚀 تم نشر الستوري الجديد بنجاح' : '🚀 New Story Published!');
      setTimeout(() => setUpdateStatus(''), 3000);
    }, 500);
  };

  const toggleBan = (email: string) => {
    if (bannedEmails.includes(email)) setBannedEmails(bannedEmails.filter(e => e !== email));
    else setBannedEmails([...bannedEmails, email]);
  };

  const deleteUser = (email: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف المستخدم؟' : 'Delete user permanently?')) {
      setAllUsers(allUsers.filter(u => u.email !== email));
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  const handleSendReply = (messageId: string) => {
    if (!replyText.trim()) return;
    
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          reply: replyText,
          replyTimestamp: new Date(),
          isRead: true
        };
      }
      return msg;
    });

    setMessages(updatedMessages);
    setReplyingToId(null);
    setReplyText('');
    setUpdateStatus(language === 'ar' ? '✅ تم إرسال الرد' : '✅ Reply sent!');
    setTimeout(() => setUpdateStatus(''), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'story' | 'manager') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (target === 'logo') setTempConfig({ ...tempConfig, site_logo: dataUrl });
        if (target === 'manager') setTempConfig({ ...tempConfig, manager_pic: dataUrl });
        if (target === 'story') setTempConfig({ 
            ...tempConfig, 
            global_story: { ...(tempConfig.global_story || { id: '1', message: '', active: false }), image: dataUrl } 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs: { id: AdminTab; icon: any; label: string; labelAr: string; color: string }[] = [
    { id: 'MANAGER_PROFILE', icon: User, label: 'Manager Profile', labelAr: 'بروفايل المدير', color: 'text-indigo-400' },
    { id: 'MESSAGES', icon: MessageSquare, label: 'Inbox', labelAr: 'صندوق الوارد (الرسائل)', color: 'text-emerald-500' },
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

      case 'UX_CONFIG':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
             <div className="space-y-6">
                <div className="p-6 bg-slate-800/50 rounded-3xl border border-white/5 space-y-4">
                   <h4 className="text-sm font-black text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> Branding</h4>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <img src={tempConfig.site_logo} className="h-12 w-auto bg-slate-900 p-2 rounded-lg object-contain border border-white/10" alt="Logo" />
                         <button onClick={() => logoFileRef.current?.click()} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase">Change Logo</button>
                         <input type="file" ref={logoFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-500 uppercase">Logo Scale (1.0 = Default)</label>
                         <input type="number" step="0.1" value={tempConfig.site_logo_scale} onChange={e => setTempConfig({...tempConfig, site_logo_scale: parseFloat(e.target.value)})} className="w-full p-3 bg-slate-800 border border-white/5 rounded-xl text-white font-mono" />
                      </div>
                   </div>
                </div>
             </div>
             <div className="space-y-6">
                <div className="p-6 bg-slate-800/50 rounded-3xl border border-white/5 space-y-4">
                   <h4 className="text-sm font-black text-white flex items-center gap-2"><Palette className="w-4 h-4 text-orange-400" /> Visual Styles</h4>
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-500 uppercase">Accent Color</label>
                         <div className="flex gap-2">
                           <input type="color" value={tempConfig.ux_accent_color} onChange={e => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="w-12 h-12 bg-transparent border-0 cursor-pointer" />
                           <input type="text" value={tempConfig.ux_accent_color} onChange={e => setTempConfig({...tempConfig, ux_accent_color: e.target.value})} className="flex-1 p-3 bg-slate-800 border border-white/5 rounded-xl text-white font-mono" />
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-500 uppercase">UI Blur Intensity</label>
                         <input type="text" value={tempConfig.ux_blur_intensity} onChange={e => setTempConfig({...tempConfig, ux_blur_intensity: e.target.value})} className="w-full p-3 bg-slate-800 border border-white/5 rounded-xl text-white font-mono" placeholder="20px" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'MESSAGES':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {messages.length === 0 ? (
              <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest bg-slate-800/20 rounded-[3rem]">Inbox is Empty</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="p-6 bg-slate-800/50 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-6">
                   <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-3 flex-1">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">{msg.senderName[0]}</div>
                            <div>
                               <h5 className="text-white text-sm font-black flex items-center gap-2">
                                 {msg.senderName}
                                 {msg.reply && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                               </h5>
                               <p className="text-[10px] text-slate-500 font-mono">{msg.senderEmail}</p>
                            </div>
                         </div>
                         <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5">
                            <p className="text-xs text-slate-300 leading-relaxed">{msg.content}</p>
                         </div>

                         {msg.reply && (
                           <div className="bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20 mt-4 animate-in slide-in-from-top-2">
                              <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Admin Reply</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed italic">"{msg.reply}"</p>
                           </div>
                         )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                         <button 
                          onClick={() => setReplyingToId(replyingToId === msg.id ? null : msg.id)}
                          className={`p-3 rounded-xl transition-all flex items-center gap-2 ${replyingToId === msg.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-indigo-500 hover:text-white'}`}
                         >
                           <Reply className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase">Reply</span>
                         </button>
                         <button onClick={() => deleteMessage(msg.id)} className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>

                   {replyingToId === msg.id && (
                     <div className="animate-in slide-in-from-top-4 duration-300 space-y-4 p-6 bg-slate-900 rounded-2xl border border-indigo-500/20">
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={isRtl ? "اكتب ردك هنا..." : "Type your reply..."}
                          className="w-full h-32 p-4 bg-slate-800 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-indigo-500 transition-all resize-none"
                        />
                        <div className="flex justify-end gap-3">
                           <button onClick={() => setReplyingToId(null)} className="px-5 py-2.5 text-[10px] font-black text-slate-400 hover:text-white uppercase">Cancel</button>
                           <button 
                            onClick={() => handleSendReply(msg.id)}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                           >
                             <Send className="w-3.5 h-3.5" /> Send Reply
                           </button>
                        </div>
                     </div>
                   )}
                </div>
              ))
            )}
          </div>
        );

      case 'USERS':
        return (
          <div className="bg-slate-800/30 rounded-[2.5rem] border border-white/5 overflow-hidden animate-in fade-in duration-500">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 border-b border-white/5">
                <tr>
                  <th className="p-5 text-[10px] font-black text-slate-500 uppercase">User</th>
                  <th className="p-5 text-[10px] font-black text-slate-500 uppercase">Email</th>
                  <th className="p-5 text-[10px] font-black text-slate-500 uppercase">Status</th>
                  <th className="p-5 text-[10px] font-black text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allUsers.map(u => (
                  <tr key={u.email} className="hover:bg-white/5 transition-all">
                    <td className="p-5">
                       <div className="flex items-center gap-3">
                          <img src={u.profilePic || "https://i.pravatar.cc/100"} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                             <p className="text-xs font-black text-white">{u.name}</p>
                             <p className="text-[10px] text-slate-500 font-mono">@{u.username}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-5 text-[11px] text-slate-300">{u.email}</td>
                    <td className="p-5">
                       {bannedEmails.includes(u.email) ? 
                         <span className="px-2 py-1 bg-rose-500/20 text-rose-500 rounded-md text-[9px] font-black uppercase">Suspended</span> :
                         <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded-md text-[9px] font-black uppercase">Active</span>
                       }
                    </td>
                    <td className="p-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button onClick={() => toggleBan(u.email)} className={`p-2 rounded-lg transition-all ${bannedEmails.includes(u.email) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                             {bannedEmails.includes(u.email) ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                          <button onClick={() => deleteUser(u.email)} className="p-2 bg-slate-700 text-white rounded-lg hover:bg-rose-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'GLOBAL_STORY':
        return (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
             <div className="p-8 bg-slate-800/50 rounded-[3rem] border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-white font-black flex items-center gap-3"><Megaphone className="w-5 h-5 text-rose-500" /> Story Center</h4>
                   <div className="flex items-center gap-3">
                     <button 
                      onClick={() => setTempConfig({...tempConfig, global_story: { ...(tempConfig.global_story || { id: '1', image: '', message: '', active: false }), active: !tempConfig.global_story?.active }})}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tempConfig.global_story?.active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                     >
                       {tempConfig.global_story?.active ? 'Story Active' : 'Story Disabled'}
                     </button>
                </div>
                </div>
                
                <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden group border-2 border-dashed border-white/10">
                   {tempConfig.global_story?.image ? (
                     <img src={tempConfig.global_story.image} className="w-full h-full object-cover" />
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                        <span className="text-xs font-black uppercase">No Media Attached</span>
                     </div>
                   )}
                   <button onClick={() => storyFileRef.current?.click()} className="absolute bottom-4 right-4 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl hover:scale-110 transition-all"><Upload className="w-6 h-6" /></button>
                   <input type="file" ref={storyFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'story')} />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase px-1">Message Content</label>
                   <textarea 
                    value={tempConfig.global_story?.message}
                    onChange={e => setTempConfig({...tempConfig, global_story: { ...(tempConfig.global_story || { id: '1', image: tempConfig.global_story?.image || '', message: '', active: tempConfig.global_story?.active || false }), message: e.target.value }})}
                    className="w-full h-32 p-4 bg-slate-900 border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all resize-none"
                    placeholder="Write your story message here..."
                   />
                </div>

                <button 
                  onClick={handlePublishNewStory}
                  className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-3 shadow-xl shadow-rose-900/20 active:scale-95 transition-all mt-4"
                >
                  <Sparkles className="w-5 h-5" />
                  Publish As New Story
                </button>
                <p className="text-[9px] text-slate-500 text-center font-bold uppercase tracking-widest mt-2">Posting a "New Story" will generate a unique ID, ensuring it appears as a red ring for everyone again.</p>
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

      case 'ADMIN_SECURITY':
        return (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
             <div className="p-8 bg-rose-950/20 rounded-[3rem] border border-rose-500/10 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white"><ShieldCheck className="w-6 h-6" /></div>
                   <div>
                      <h3 className="text-white font-black uppercase tracking-widest text-sm">Security Core</h3>
                      <p className="text-[10px] text-rose-400 font-bold">Update Admin Credentials</p>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-1">Admin Email</label>
                      <input 
                        type="email" 
                        value={adminIdentity.email}
                        onChange={e => setAdminIdentity({...adminIdentity, email: e.target.value})}
                        className="w-full p-4 bg-slate-900 border border-white/5 rounded-2xl text-white text-xs font-bold"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-1">System Password</label>
                      <div className="relative">
                        <input 
                          type={showAdminPass ? "text" : "password"}
                          value={adminIdentity.password}
                          onChange={e => setAdminIdentity({...adminIdentity, password: e.target.value})}
                          className="w-full p-4 bg-slate-900 border border-white/5 rounded-2xl text-white font-mono text-sm"
                        />
                        <button onClick={() => setShowAdminPass(!showAdminPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'GLOBAL_HTML':
      case 'CSS':
      case 'JS':
      case 'SEO':
        const fieldMap: Record<string, keyof SiteConfig> = {
          'GLOBAL_HTML': 'global_html',
          'CSS': 'custom_css',
          'JS': 'custom_js',
          'SEO': 'seo_desc'
        };
        const titleMap: Record<string, string> = {
          'GLOBAL_HTML': 'Header/Body HTML Injection',
          'CSS': 'Global Style Override (CSS)',
          'JS': 'Dynamic Script Logic (JS)',
          'SEO': 'Meta Description'
        };
        
        return (
          <div className="h-full flex flex-col gap-4 animate-in fade-in duration-500">
             <div className="flex items-center justify-between">
                <h4 className="text-white font-black text-sm uppercase tracking-[0.2em]">{titleMap[activeTab]}</h4>
                <span className="px-2 py-1 bg-indigo-500 text-[9px] font-black rounded uppercase">Editor Mode</span>
             </div>
             {activeTab === 'SEO' && (
               <div className="space-y-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Meta Title</label>
                    <input 
                      value={tempConfig.seo_title}
                      onChange={e => setTempConfig({...tempConfig, seo_title: e.target.value})}
                      className="w-full p-3 bg-slate-900 border border-white/5 rounded-xl text-white text-xs font-bold"
                      placeholder="Enter SEO Title..."
                    />
                  </div>
               </div>
             )}
             <textarea 
              value={tempConfig[fieldMap[activeTab] as keyof SiteConfig] as string}
              onChange={e => setTempConfig({...tempConfig, [fieldMap[activeTab]]: e.target.value})}
              className="flex-1 w-full p-6 bg-slate-950 border border-white/5 rounded-[2rem] text-indigo-400 font-mono text-xs outline-none focus:border-indigo-500 transition-all resize-none custom-scrollbar"
              placeholder={`Enter ${activeTab} content here...`}
             />
          </div>
        );

      default:
        return null;
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
                <button 
                  onClick={onClose}
                  className="p-4 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-2xl transition-all shadow-xl border border-white/10 group"
                  title={isRtl ? 'إغلاق' : 'Close'}
                >
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
