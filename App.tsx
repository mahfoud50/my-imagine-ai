
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ModelType, HistoryItem, GenerationSettings, SiteConfig, GenerationType, Language, UserSettings, Message, AppNotification } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import MainPreview from './components/MainPreview.tsx';
import RightPanel from './components/RightPanel.tsx';
import Header from './components/Header.tsx';
import AccountModal, { AccountTab } from './components/AccountModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import ToastNotification from './components/ToastNotification.tsx';
import StoryViewer from './components/StoryViewer.tsx';
import { GoogleGenAI } from "@google/genai";
import { 
  Terminal, ShieldCheck, Activity, 
  Layers, Power, RefreshCw, PanelTop, PanelBottom, AlignCenter, Code, Globe, Cpu
} from 'lucide-react';

interface UserData {
  email: string;
  name: string;
  username: string;
  profilePic?: string;
  isAdmin: boolean;
  story?: { image: string; message: string; timestamp: number; isNew: boolean };
}

const App: React.FC = () => {
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('user_settings_v1');
    return saved ? JSON.parse(saved) : {
      theme: 'dark', language: 'ar', fontFamily: 'modern', fontSize: 'medium',
      notificationSounds: true, autoSaveSession: true, imageQuality: 'high',
      modelStrategy: 'accurate', showTooltips: true, contentProtection: false,
      privacyMode: false, advancedMode: false, manualApiKey: ''
    };
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('site_config_sovereign_v9');
    return saved ? JSON.parse(saved) : {
      seo_title: 'Imagine AI - Professional Studio',
      seo_desc: 'Universal AI Control Platform.',
      global_html: '<div class="bg-black/80 text-white text-[10px] py-1 text-center font-black uppercase tracking-[0.3em] backdrop-blur-md border-b border-white/10">Sovereign Engine v8.0 Connected</div>',
      custom_css: '',
      custom_js: 'console.log("System Ready.");',
      php_logic: '',
      ux_blur_intensity: '20px',
      ux_accent_color: '#6366f1',
      manager_name: 'Ahmad kharbicha',
      manager_dob: '1 / 1 / 1987',
      manager_location: 'SAHTEREANN',
      manager_pic: 'https://i.pravatar.cc/150?u=manager',
      global_api_key: '' // القيمة الافتراضية للمفتاح العالمي
    };
  });

  const language = userSettings.language;
  const setLanguage = (lang: Language) => {
    setUserSettings(prev => ({ ...prev, language: lang }));
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<{ image: string; message: string; timestamp: number } | null>(null);
  
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('app_notifications_v1');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  const userSpecificNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(n => n.ownerEmail === currentUser.email || n.type === 'system');
  }, [notifications, currentUser]);

  useEffect(() => {
    localStorage.setItem('app_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title: string, description: string, type: AppNotification['type'], targetEmail?: string) => {
    const emailToUse = targetEmail || currentUser?.email;
    if (!emailToUse && type !== 'system') return;

    if (userSettings.notificationSounds) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (e) {}
    }

    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title,
      description,
      time: new Date(),
      isRead: false,
      type,
      ownerEmail: emailToUse
    };

    setNotifications(prev => [newNotif, ...prev]);
    if (emailToUse === currentUser?.email || type === 'system') {
      setActiveToast(newNotif);
    }
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('admin_messages_v1');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('admin_messages_v1', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      content: content,
      timestamp: new Date(),
      isRead: false
    };
    setMessages(prev => [newMessage, ...prev]);
    addNotification(language === 'ar' ? `رسالة مرسلة` : `Message Sent`, content.substring(0, 40) + '...', 'message', currentUser.email);
  };

  const handleReplyMessage = (messageId: string, replyContent: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        addNotification(language === 'ar' ? 'رد من الإدارة' : 'Reply from CEO', replyContent.substring(0, 40) + '...', 'success', msg.senderEmail);
        return { ...msg, reply: replyContent, replyTimestamp: new Date() };
      }
      return msg;
    }));
  };

  useEffect(() => {
    localStorage.setItem('site_config_sovereign_v9', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    document.title = siteConfig.seo_title;
    const root = document.documentElement;
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    if (userSettings.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.setProperty('--accent', siteConfig.ux_accent_color);
  }, [siteConfig, userSettings, language]);

  const [settings, setSettings] = useState<GenerationSettings>({ prompt: '', model: 'Base', aspectRatio: '1:1', steps: 25, uploadedImage: null });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [credits, setCredits] = useState(10);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [activeAccountTab, setActiveAccountTab] = useState<AccountTab>('profile');

  /**
   * دالة الحصول على المفتاح النشط:
   * 1. مفتاح المستخدم اليدوي (إذا وجد)
   * 2. مفتاح المدير العالمي (إذا وجد)
   * 3. مفتاح البيئة الافتراضي
   */
  const getActiveApiKey = () => {
    return userSettings.manualApiKey || siteConfig.global_api_key || process.env.API_KEY;
  };

  const handleGenerate = async () => {
    if (!settings.prompt.trim()) return;
    setIsGenerating(true);
    try {
      const activeKey = getActiveApiKey();
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const modelName = settings.model === 'Plus' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
      
      const response = await ai.models.generateContent({
        model: modelName, 
        contents: { parts: [{ text: settings.prompt }] },
        config: { 
          seed: Math.floor(Math.random() * 10000000),
          imageConfig: { aspectRatio: settings.aspectRatio as any } 
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const url = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: url, prompt: settings.prompt, timestamp: new Date(), model: settings.model, type: 'Generated' };
        setHistory(prev => [newItem, ...prev]);
        setCurrentPreview(url);
        if (!userSettings.manualApiKey) setCredits(c => Math.max(0, c - 1));
        addNotification(language === 'ar' ? 'تم التوليد بنجاح' : 'Success', '', 'success');
      }
    } catch (err: any) { 
      console.error("Error:", err);
      alert(language === 'ar' ? 'فشل في التوليد. تأكد من إعدادات مفتاح API في لوحة التحكم.' : 'Failed to generate. Check API key settings.');
    } finally { setIsGenerating(false); }
  };

  const handleSmartTool = async (type: GenerationType, toolPrompt: string) => {
    const sourceImage = currentPreview || settings.uploadedImage;
    if (!sourceImage) return;
    setIsGenerating(true);
    try {
      const activeKey = getActiveApiKey();
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const base64Data = sourceImage.split(',')[1];
      const mimeType = sourceImage.split(',')[0].split(':')[1].split(';')[0];
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: { parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: toolPrompt }] }
      });
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const url = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        setHistory(prev => [{ id: Date.now().toString(), imageUrl: url, prompt: toolPrompt, timestamp: new Date(), model: 'Plus', type: type }, ...prev]);
        setCurrentPreview(url);
      }
    } catch (err) {} finally { setIsGenerating(false); }
  };

  const handleAuth = (userData: UserData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
    if (userData.isAdmin) setIsAdminLoggedIn(true);
    localStorage.setItem('user_auth', JSON.stringify(userData));
    addNotification(language === 'ar' ? 'مرحباً بك' : 'Welcome', userData.name, 'success', userData.email);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_auth');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    window.location.reload();
  };

  useEffect(() => {
    const saved = localStorage.getItem('user_auth');
    if (saved) handleAuth(JSON.parse(saved));
  }, []);

  if (!isLoggedIn) return <AuthScreen onLogin={handleAuth} language={language} />;

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] dark:bg-[#0f172a]">
      <div className="z-[100]" dangerouslySetInnerHTML={{ __html: siteConfig.global_html }} />
      <ToastNotification toast={activeToast} onClose={() => setActiveToast(null)} language={language} />

      <Header 
        credits={credits} user={currentUser} language={language} 
        siteConfig={siteConfig} notifications={userSpecificNotifications}
        onMarkAllRead={() => setNotifications(n => n.map(it => ({...it, isRead: true})))}
        onToggleLang={() => setLanguage(language === 'ar' ? 'en' : 'ar')} 
        onUpgrade={() => { setActiveAccountTab('credits'); setIsAccountModalOpen(true); }}
        onProfile={() => setIsAccountModalOpen(true)}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          settings={settings} setSettings={setSettings} onGenerate={handleGenerate} 
          isGenerating={isGenerating} language={language} 
          onQuickAction={(action) => handleSmartTool(action, action)}
          onLogout={handleLogout}
        />
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <MainPreview 
            imageUrl={currentPreview} isGenerating={isGenerating} prompt={settings.prompt} 
            language={language} onRemoveBackground={() => handleSmartTool('Cleaned', 'remove background')}
            onUpscale={() => handleSmartTool('Upscaled', 'upscale')}
          />
        </div>
        <RightPanel 
          history={history} onSelect={setCurrentPreview} 
          onDelete={(id) => setHistory(h => h.filter(i => i.id !== id))} language={language} 
        />
      </div>

      <AccountModal 
        isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} 
        activeTab={activeAccountTab} setActiveTab={setActiveAccountTab} 
        credits={credits} user={currentUser} language={language} 
        userSettings={userSettings} setUserSettings={s => setUserSettings(p => ({...p, ...s}))}
        onSendMessage={handleSendMessage} allMessages={messages}
        siteConfig={siteConfig} onUpdateSiteConfig={c => setSiteConfig(p => ({...p, ...c}))}
      />

      {isAdminLoggedIn && (
        <div className="fixed bottom-10 right-10 z-50">
          <button onClick={() => setIsAdminPanelOpen(true)} className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-2xl border-4 border-indigo-500/30 active:scale-95 transition-all">
            <Terminal className="w-8 h-8" />
          </button>
        </div>
      )}

      {isAdminPanelOpen && (
        <AdminPanel 
          config={siteConfig} setConfig={setSiteConfig} 
          messages={messages} setMessages={setMessages}
          onReplyMessage={handleReplyMessage} onClose={() => setIsAdminPanelOpen(false)} 
          language={language} currentUser={currentUser} setCurrentUser={setCurrentUser} 
        />
      )}
    </div>
  );
};

export default App;
