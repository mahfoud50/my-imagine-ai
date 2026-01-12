
import React, { useState, useCallback, useEffect } from 'react';
import { ModelType, HistoryItem, GenerationSettings, SiteConfig, GenerationType, Language, UserSettings, Message, AppNotification } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import MainPreview from './components/MainPreview.tsx';
import RightPanel from './components/RightPanel.tsx';
import Header from './components/Header.tsx';
import AccountModal, { AccountTab } from './components/AccountModal.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import StoryViewer from './components/StoryViewer.tsx';
import ToastNotification from './components/ToastNotification.tsx';
import ApiKeyModal from './components/ApiKeyModal.tsx';
import { GoogleGenAI } from "@google/genai";
import { Fingerprint } from 'lucide-react';

const safeParse = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
      return { ...defaultValue, ...parsed };
    }
    return parsed;
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e);
    return defaultValue;
  }
};

const App: React.FC = () => {
  // --- State Initialization ---
  const [user, setUser] = useState<any>(() => safeParse('imagine_ai_user', null));
  const [language, setLanguage] = useState<Language>(() => safeParse('imagine_ai_lang', 'ar'));
  const [history, setHistory] = useState<HistoryItem[]>(() => safeParse('imagine_ai_history', []));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => safeParse('imagine_ai_notifs', []));
  const [messages, setMessages] = useState<Message[]>(() => safeParse('imagine_ai_messages', []));
  
  const [allUsers, setAllUsers] = useState<any[]>(() => safeParse('site_verified_users', []));
  const [bannedEmails, setBannedEmails] = useState<string[]>(() => safeParse('banned_emails', []));
  const [adminIdentity, setAdminIdentity] = useState(() => safeParse('admin_identity', { 
    email: "Mohammedzarzor26@gmail.com", 
    password: "Mah7foud23" 
  }));
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => safeParse('imagine_ai_config', {
    seo_title: 'Imagine AI', seo_desc: 'Professional AI Art',
    global_html: '', custom_css: '', custom_js: '', ux_blur_intensity: '20px', ux_accent_color: '#6366f1',
    manager_name: 'Ahmad kharbicha', manager_dob: 'Jan 1, 1987', manager_location: 'SAHTEREANN',
    manager_pic: 'https://i.pravatar.cc/150?u=manager', site_logo_scale: 1.0, global_api_key: ''
  }));
  const [userSettings, setUserSettings] = useState<UserSettings>(() => safeParse('imagine_ai_settings', {
    theme: 'dark', language: 'ar', fontFamily: 'modern', fontSize: 'medium', notificationSounds: true,
    autoSaveSession: true, imageQuality: 'high', modelStrategy: 'artistic', showTooltips: true,
    contentProtection: false, privacyMode: false, advancedMode: false
  }));

  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab>('profile');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '', model: 'Plus', aspectRatio: '1:1', steps: 30, uploadedImage: null
  });

  // --- Effects ---
  useEffect(() => { 
    if (user && userSettings.autoSaveSession) localStorage.setItem('imagine_ai_user', JSON.stringify(user)); 
    else if (!user) localStorage.removeItem('imagine_ai_user'); 
  }, [user, userSettings.autoSaveSession]);

  useEffect(() => localStorage.setItem('imagine_ai_lang', JSON.stringify(language)), [language]);
  useEffect(() => { if (userSettings.autoSaveSession) localStorage.setItem('imagine_ai_history', JSON.stringify(history)); }, [history, userSettings.autoSaveSession]);
  useEffect(() => localStorage.setItem('imagine_ai_notifs', JSON.stringify(notifications)), [notifications]);
  useEffect(() => localStorage.setItem('imagine_ai_messages', JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem('imagine_ai_config', JSON.stringify(siteConfig)), [siteConfig]);
  useEffect(() => localStorage.setItem('imagine_ai_settings', JSON.stringify(userSettings)), [userSettings]);
  useEffect(() => localStorage.setItem('site_verified_users', JSON.stringify(allUsers)), [allUsers]);
  useEffect(() => localStorage.setItem('banned_emails', JSON.stringify(bannedEmails)), [bannedEmails]);
  useEffect(() => localStorage.setItem('admin_identity', JSON.stringify(adminIdentity)), [adminIdentity]);

  // Handle Content Protection (Anti-Copy)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (userSettings.contentProtection) e.preventDefault();
    };
    const handleCopy = (e: ClipboardEvent) => {
      if (userSettings.contentProtection) e.preventDefault();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (userSettings.contentProtection && (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'u' || e.key === 's')) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [userSettings.contentProtection]);

  // Apply Font Styles Globally
  useEffect(() => {
    const root = document.documentElement;
    const fontMap = {
      classic: "'Inter', sans-serif",
      modern: "'Vazirmatn', sans-serif",
      comfort: "'Vazirmatn', sans-serif" // Assume a soft rounded font if available
    };
    root.style.fontFamily = fontMap[userSettings.fontFamily];
    
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.fontSize = sizeMap[userSettings.fontSize];
  }, [userSettings.fontFamily, userSettings.fontSize]);

  const addNotification = (title: string, description: string, type: 'system' | 'success' | 'update' | 'message' = 'system') => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, description, time: new Date(), isRead: false, type, ownerEmail: user?.email };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    setToast(newNotif);
  };

  const handleLogout = () => {
    if (userSettings.privacyMode) {
      // Clear all session sensitive data
      localStorage.removeItem('imagine_ai_history');
      localStorage.removeItem('imagine_ai_messages');
      localStorage.removeItem('user_api_key');
      setHistory([]);
      setMessages([]);
    }
    setUser(null);
  };

  const handleGenerate = async () => {
    if (!settings.prompt.trim()) return;
    const userKey = localStorage.getItem('user_api_key') || userSettings.manualApiKey;
    if (!userKey) {
        setIsApiKeyModalOpen(true);
        addNotification('API Key Missing', language === 'ar' ? 'الرجاء إدخال مفتاح API أولاً' : 'Please enter API Key first', 'system');
        return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: userKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: settings.prompt },
            ...(settings.uploadedImage ? [{ inlineData: { data: settings.uploadedImage.split(',')[1], mimeType: 'image/png' } }] : [])
          ]
        },
        config: { imageConfig: { aspectRatio: settings.aspectRatio as any } }
      });

      let newUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            newUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (newUrl) {
        setActiveImage(newUrl);
        setOriginalImage(newUrl);
        const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: newUrl, prompt: settings.prompt, timestamp: new Date(), model: settings.model, type: 'Generated' };
        setHistory(prev => [newItem, ...prev].slice(0, 20));
        addNotification(language === 'ar' ? 'تم التوليد' : 'Generated', language === 'ar' ? 'صورتك جاهزة الآن!' : 'Your image is ready!', 'success');
      }
    } catch (error: any) {
      addNotification('Error', `Failed: ${error.message || 'Unknown error'}`, 'system');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageAction = async (type: GenerationType, customPrompt?: string) => {
    const sourceImage = activeImage || settings.uploadedImage;
    if (!sourceImage) return;
    const userKey = localStorage.getItem('user_api_key') || userSettings.manualApiKey;
    if (!userKey) { setIsApiKeyModalOpen(true); return; }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: userKey });
      const actionPrompts: Record<string, string> = {
        'Cleaned': 'remove background', 'Upscaled': 'upscale', 'WatermarkRemoved': 'remove watermark',
        'Restored': 'restore', 'Colorized': 'colorize', 'Cartoonized': 'cartoonize', 'ObjectRemoved': 'remove objects'
      };
      const prompt = customPrompt || actionPrompts[type] || 'enhance';
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { data: sourceImage.split(',')[1], mimeType: 'image/png' } }, { text: prompt }] }
      });
      let newUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) { newUrl = `data:image/png;base64,${part.inlineData.data}`; break; }
        }
      }
      if (newUrl) {
        setActiveImage(newUrl);
        const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: newUrl, prompt: prompt, timestamp: new Date(), model: 'Plus', type: type };
        setHistory(prev => [newItem, ...prev].slice(0, 20));
        addNotification(type, language === 'ar' ? 'تمت المعالجة' : 'Processed', 'success');
      }
    } catch (error) { addNotification('Error', 'Failed', 'system'); } finally { setIsGenerating(false); }
  };

  if (!user) return (
    <AuthScreen 
      onLogin={setUser} 
      language={language}
      allUsers={allUsers}
      setAllUsers={setAllUsers}
      bannedEmails={bannedEmails}
      adminIdentity={adminIdentity}
    />
  );

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${userSettings.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'} ${userSettings.contentProtection ? 'select-none' : ''}`}>
      <Header 
        credits={50} user={user} language={language} siteConfig={siteConfig} notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
        onToggleLang={() => setLanguage(prev => prev === 'ar' ? 'en' : 'ar')}
        onUpgrade={() => setIsApiKeyModalOpen(true)}
        onProfile={() => { setAccountTab('profile'); setIsAccountOpen(true); }}
        onSettings={() => { setAccountTab('settings'); setIsAccountOpen(true); }}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onAdmin={() => setIsAdminOpen(true)}
        onOpenStory={() => setIsStoryOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && (
          <Sidebar 
            settings={settings} setSettings={setSettings} onGenerate={handleGenerate} isGenerating={isGenerating} language={language}
            showTooltips={userSettings.showTooltips}
          />
        )}
        <MainPreview 
          imageUrl={activeImage} originalImageUrl={originalImage} isGenerating={isGenerating} prompt={settings.prompt} language={language}
          showTooltips={userSettings.showTooltips}
          onToggleGallery={() => setIsGalleryOpen(!isGalleryOpen)}
          onRemoveBackground={() => handleImageAction('Cleaned')}
          onUpscale={() => handleImageAction('Upscaled')}
          onRemoveWatermark={() => handleImageAction('WatermarkRemoved')}
          onRestore={() => handleImageAction('Restored')}
          onColorize={() => handleImageAction('Colorized')}
          onCartoonize={() => handleImageAction('Cartoonized')}
          onMagicEraser={() => handleImageAction('ObjectRemoved')}
        />
        {isGalleryOpen && (
          <RightPanel 
            history={history} onSelect={setActiveImage} onDelete={(id) => setHistory(prev => prev.filter(h => h.id !== id))} 
            language={language} onClose={() => setIsGalleryOpen(false)}
          />
        )}
      </div>
      <AccountModal 
        isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} activeTab={accountTab} setActiveTab={setAccountTab} 
        credits={50} user={user} language={language} userSettings={userSettings} setUserSettings={s => setUserSettings(prev => ({ ...prev, ...s }))}
        siteConfig={siteConfig}
      />
      {isAdminOpen && (
        <AdminPanel 
          config={siteConfig} setConfig={setSiteConfig} 
          messages={messages} setMessages={setMessages} 
          onClose={() => setIsAdminOpen(false)} 
          language={language} 
          allUsers={allUsers} setAllUsers={setAllUsers}
          bannedEmails={bannedEmails} setBannedEmails={setBannedEmails}
          adminIdentity={adminIdentity} setAdminIdentity={setAdminIdentity}
        />
      )}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} 
        onConfirm={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
        onSimulateUpgrade={() => { setIsApiKeyModalOpen(false); setAccountTab('credits'); setIsAccountOpen(true); }}
        language={language} 
      />
      <ToastNotification toast={toast} onClose={() => setToast(null)} language={language} />
      {user?.isAdmin && (
        <div className="fixed bottom-4 left-4 z-[9999] opacity-0 hover:opacity-100 transition-opacity">
          <button onClick={() => setIsAdminOpen(true)} className="p-2 bg-slate-900 text-white rounded-full">
            <Fingerprint className="w-4 h-4" />
          </button>
        </div>
      )}
      {isStoryOpen && siteConfig.global_story?.active && (
        <StoryViewer 
          story={{ ...siteConfig.global_story, timestamp: Date.now() }} 
          onClose={() => setIsStoryOpen(false)} 
          language={language} siteConfig={siteConfig} 
        />
      )}
    </div>
  );
};

export default App;
