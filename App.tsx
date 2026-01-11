
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

  // تصفية الإشعارات لتظهر فقط لصاحب الحساب الحالي
  const userSpecificNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(n => n.ownerEmail === currentUser.email || n.type === 'system');
  }, [notifications, currentUser]);

  useEffect(() => {
    localStorage.setItem('app_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (isLoggedIn && currentUser && !currentUser.isAdmin) {
      const banned = JSON.parse(localStorage.getItem('banned_emails') || '[]');
      if (banned.includes(currentUser.email)) {
        alert(language === 'ar' ? 'تم تعليق حسابك من قبل الإدارة.' : 'Your account has been suspended by management.');
        handleLogout();
      }
    }
  }, [isLoggedIn, currentUser, language]);

  const addNotification = (title: string, description: string, type: AppNotification['type'], targetEmail?: string) => {
    const emailToUse = targetEmail || currentUser?.email;
    if (!emailToUse && type !== 'system') return;

    if (userSettings.notificationSounds) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => console.log("Audio play blocked by browser"));
      } catch (e) {
        console.error("Audio error:", e);
      }
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
    
    // إظهار التوست فقط إذا كان الإشعار يخص المستخدم الحالي
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
    
    addNotification(
      language === 'ar' ? `رسالة مرسلة بنجاح` : `Message Sent Successfully`,
      content.substring(0, 40) + '...',
      'message',
      currentUser.email
    );
  };

  const handleReplyMessage = (messageId: string, replyContent: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        // إشعار موجه فقط لصاحب الرسالة الأصلية
        addNotification(
          language === 'ar' ? 'رد جديد من الإدارة' : 'New reply from CEO',
          replyContent.substring(0, 40) + '...',
          'success',
          msg.senderEmail
        );
        return { ...msg, reply: replyContent, replyTimestamp: new Date() };
      }
      return msg;
    }));
  };

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
      manager_pic: 'https://i.pravatar.cc/150?u=manager'
    };
  });

  useEffect(() => {
    localStorage.setItem('site_config_sovereign_v9', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    document.title = siteConfig.seo_title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', siteConfig.seo_desc);
    
    const root = document.documentElement;
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    if (userSettings.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    root.style.setProperty('--font-family', 
      userSettings.fontFamily === 'modern' ? "'Inter', 'Vazirmatn', sans-serif" :
      userSettings.fontFamily === 'classic' ? "'serif', 'Times New Roman'" :
      "'Comfortaa', cursive"
    );

    let styleTag = document.getElementById('admin-dynamic-css');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'admin-dynamic-css';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      :root { 
        --accent: ${siteConfig.ux_accent_color};
        --blur: ${siteConfig.ux_blur_intensity};
        font-size: ${userSettings.fontSize === 'small' ? '14px' : userSettings.fontSize === 'large' ? '18px' : '16px'};
      }
      body { font-family: var(--font-family) !important; transition: background-color 0.3s ease; }
      .bg-indigo-600, .bg-indigo-500, .bg-blue-600, .bg-violet-600 { background-color: var(--accent) !important; }
      .text-indigo-600, .text-indigo-500, .text-blue-500 { color: var(--accent) !important; }
      .border-indigo-600 { border-color: var(--accent) !important; }
      ${siteConfig.custom_css}
      ${userSettings.contentProtection ? 'body { user-select: none; -webkit-user-select: none; }' : ''}
    `;

    let scriptTag = document.getElementById('admin-dynamic-js');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'admin-dynamic-js';
      document.body.appendChild(scriptTag);
    }
    try {
      const runJs = new Function(siteConfig.custom_js);
      runJs();
    } catch (e) {
      console.warn("Custom JS Error:", e);
    }

    localStorage.setItem('user_settings_v1', JSON.stringify(userSettings));
  }, [siteConfig, userSettings, language]);

  const [settings, setSettings] = useState<GenerationSettings>({ prompt: '', model: 'Base', aspectRatio: '1:1', steps: 25, uploadedImage: null });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [credits, setCredits] = useState(10);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [activeAccountTab, setActiveAccountTab] = useState<AccountTab>('profile');

  const handleGenerate = async () => {
    if (!settings.prompt.trim()) return;
    setIsGenerating(true);
    try {
      const activeKey = userSettings.manualApiKey || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const modelName = settings.model === 'Plus' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
      const randomSeed = Math.floor(Math.random() * 10000000);
      const response = await ai.models.generateContent({
        model: modelName, 
        contents: { parts: [{ text: settings.prompt }] },
        config: { 
          seed: randomSeed,
          systemInstruction: "Generate a unique and artistic image. Ensure high diversity in composition, lighting, and style for every request. Avoid repetitive patterns and provide original visual interpretations.",
          imageConfig: { 
            aspectRatio: settings.aspectRatio as any,
            ...(modelName === 'gemini-3-pro-image-preview' ? { imageSize: "1K" } : {})
          } 
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const url = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: url, prompt: settings.prompt, timestamp: new Date(), model: settings.model, type: 'Generated' };
        setHistory(prev => [newItem, ...prev]);
        setOriginalPreview(null);
        setCurrentPreview(url);
        if (!userSettings.manualApiKey) setCredits(c => Math.max(0, c - 1));
        addNotification(language === 'ar' ? 'تم توليد الصورة' : 'Image Generated', language === 'ar' ? 'تحفتك الفنية جاهزة الآن' : 'Your masterpiece is ready', 'success');
      }
    } catch (err: any) { 
      console.error("Generation Error:", err);
      if (err.message?.includes("Requested entity was not found.")) {
        await (window as any).aistudio?.openSelectKey();
      }
    } finally { setIsGenerating(false); }
  };

  const handleSmartTool = async (type: GenerationType, toolPrompt: string) => {
    const sourceImage = currentPreview || settings.uploadedImage;
    if (!sourceImage) return;

    setIsGenerating(true);
    try {
      const activeKey = userSettings.manualApiKey || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const base64Data = sourceImage.split(',')[1];
      const mimeType = sourceImage.split(',')[0].split(':')[1].split(';')[0];
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } }, 
            { text: toolPrompt }
          ]
        }
      });
      
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const url = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: url, prompt: toolPrompt, timestamp: new Date(), model: 'Plus', type: type };
        setHistory(prev => [newItem, ...prev]);
        setOriginalPreview(sourceImage);
        setCurrentPreview(url);
        if (!userSettings.manualApiKey) setCredits(c => Math.max(0, c - 1));
        addNotification(language === 'ar' ? 'تمت معالجة الصورة' : 'Image Processed', toolPrompt, 'success');
      }
    } catch (err: any) {
      console.error("Smart Tool Error:", err);
    } finally { setIsGenerating(false); }
  };

  const handleAuth = (userData: UserData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
    if (userData.isAdmin) {
      setIsAdminLoggedIn(true);
      setCredits(9999);
    }
    localStorage.setItem('user_auth', JSON.stringify(userData));
    
    // إشعار دخول بخصوصية تامة وبصيغة ترحيبية
    addNotification(
      language === 'ar' ? 'مرحباً بك مجدداً' : 'Welcome Back', 
      language === 'ar' ? `تم تسجيل دخولك بنجاح يا ${userData.name}` : `You have successfully logged in, ${userData.name}`, 
      'success',
      userData.email
    );
  };

  const handleLogout = () => {
    if(userSettings.privacyMode) {
      localStorage.clear();
    } else {
      localStorage.removeItem('user_auth');
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    window.location.href = window.location.origin;
  };

  const handleProfileClick = () => {
    const lastGlobalId = localStorage.getItem('last_seen_global_story_id');
    const isGlobalStoryAvailable = siteConfig.global_story?.active && siteConfig.global_story.id !== lastGlobalId;

    if (isGlobalStoryAvailable) {
      setActiveStory({
        image: siteConfig.global_story!.image,
        message: siteConfig.global_story!.message,
        timestamp: Date.now()
      });
      setIsStoryViewerOpen(true);
    } else if (currentUser?.story?.isNew) {
      setActiveStory({
        image: currentUser.story.image,
        message: currentUser.story.message,
        timestamp: currentUser.story.timestamp
      });
      setIsStoryViewerOpen(true);
    } else {
      setActiveAccountTab('profile');
      setIsAccountModalOpen(true);
    }
  };

  const handleCloseStory = () => {
    setIsStoryViewerOpen(false);
    if (siteConfig.global_story?.active) localStorage.setItem('last_seen_global_story_id', siteConfig.global_story.id);
    if (currentUser && currentUser.story?.isNew) {
      const updatedUser = { ...currentUser, story: { ...currentUser.story!, isNew: false } };
      setCurrentUser(updatedUser);
      localStorage.setItem('user_auth', JSON.stringify(updatedUser));
      const users = JSON.parse(localStorage.getItem('site_verified_users') || '[]');
      const newUsers = users.map((u: any) => u.email === currentUser.email ? updatedUser : u);
      localStorage.setItem('site_verified_users', JSON.stringify(newUsers));
    }
    setActiveStory(null);
    setActiveAccountTab('profile');
    setIsAccountModalOpen(true);
  };

  const updateSiteConfig = (newConfig: Partial<SiteConfig>) => {
    setSiteConfig(prev => ({ ...prev, ...newConfig }));
  };

  useEffect(() => {
    const saved = localStorage.getItem('user_auth');
    if (saved) handleAuth(JSON.parse(saved));
  }, []);

  if (!isLoggedIn) return <AuthScreen onLogin={handleAuth} language={language} />;

  return (
    <div className={`flex flex-col h-screen w-full transition-colors duration-500 bg-[#f8fafc] dark:bg-[#0f172a]`}>
      <div className="z-[100]" dangerouslySetInnerHTML={{ __html: siteConfig.global_html }} />

      <ToastNotification toast={activeToast} onClose={() => setActiveToast(null)} language={language} />

      {isStoryViewerOpen && activeStory && (
        <StoryViewer story={activeStory} onClose={handleCloseStory} language={language} siteConfig={siteConfig} />
      )}

      <Header 
        credits={credits} user={currentUser} language={language} 
        siteConfig={siteConfig}
        notifications={userSpecificNotifications} // تمرير الإشعارات المفلترة فقط
        onMarkAllRead={() => {
          const updated = notifications.map(n => 
            (n.ownerEmail === currentUser?.email || n.type === 'system') ? { ...n, isRead: true } : n
          );
          setNotifications(updated);
        }}
        onToggleLang={() => setLanguage(language === 'ar' ? 'en' : 'ar')} 
        onUpgrade={() => { setActiveAccountTab('credits'); setIsAccountModalOpen(true); }}
        onProfile={handleProfileClick}
        onSettings={() => { setActiveAccountTab('settings'); setIsAccountModalOpen(true); }}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          settings={settings} setSettings={setSettings} onGenerate={handleGenerate} 
          isGenerating={isGenerating} language={language} onClose={() => setIsSidebarOpen(false)} 
          onQuickAction={(action) => handleSmartTool(action, action)}
          onOpenApiKey={() => { setActiveAccountTab('credits'); setIsAccountModalOpen(true); }}
          onLogout={handleLogout}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <MainPreview 
            imageUrl={currentPreview} 
            originalImageUrl={originalPreview}
            isGenerating={isGenerating} prompt={settings.prompt} 
            language={language} onToggleGallery={() => setIsRightPanelOpen(!isRightPanelOpen)} 
            onRemoveBackground={() => handleSmartTool('Cleaned', 'remove background')}
            onUpscale={() => handleSmartTool('Upscaled', 'upscale image')}
            onSmartEdit={() => handleSmartTool('Edited', 'professional edit')}
            onRemoveWatermark={() => handleSmartTool('WatermarkRemoved', 'remove watermark')}
            onColorize={() => handleSmartTool('Colorized', 'colorize')}
            onMagicEraser={() => handleSmartTool('ObjectRemoved', 'remove object')}
            onCartoonize={() => handleSmartTool('Cartoonized', 'cartoonize')}
            onRestore={() => handleSmartTool('Restored', 'restore old photo')}
            onSketchToImage={() => handleSmartTool('SketchToImage', 'sketch to photo')}
            onVirtualTryOn={() => handleSmartTool('VirtualTryOn', 'change clothes')}
            onOutpainted={() => handleSmartTool('Outpainted', 'outpaint')}
            onBackgroundChange={() => handleSmartTool('BackgroundChanged', 'change background')}
          />
        </div>

        <RightPanel 
          history={history} onSelect={(url) => { setOriginalPreview(null); setCurrentPreview(url); }} 
          onDelete={(id) => setHistory(h => h.filter(i => i.id !== id))} 
          language={language} onClose={() => setIsRightPanelOpen(false)} 
        />
      </div>

      <AccountModal 
        isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} 
        activeTab={activeAccountTab} setActiveTab={setActiveAccountTab} 
        credits={credits} user={currentUser} language={language} 
        userSettings={userSettings} setUserSettings={(s) => setUserSettings(prev => ({...prev, ...s}))}
        onSendMessage={handleSendMessage}
        allMessages={messages}
        siteConfig={siteConfig}
        onUpdateSiteConfig={updateSiteConfig}
        onUpdateProfile={(data) => {
           if (currentUser) {
             const updated = { ...currentUser, ...data };
             setCurrentUser(updated);
             localStorage.setItem('user_auth', JSON.stringify(updated));
           }
        }}
      />

      {isAdminLoggedIn && (
        <div className={`fixed bottom-10 ${language === 'ar' ? 'right-10' : 'left-10'} z-50`}>
          <button onClick={() => setIsAdminPanelOpen(true)} className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-indigo-500/30">
            <Terminal className="w-10 h-10" />
          </button>
        </div>
      )}

      {isAdminPanelOpen && (
        <AdminPanel 
          config={siteConfig} setConfig={setSiteConfig} 
          apiKeys={[]} setApiKeys={() => {}} 
          messages={messages} setMessages={setMessages}
          onReplyMessage={handleReplyMessage} 
          onClose={() => setIsAdminPanelOpen(false)} 
          language={language} currentUser={currentUser} setCurrentUser={setCurrentUser} 
        />
      )}
    </div>
  );
};

export default App;
