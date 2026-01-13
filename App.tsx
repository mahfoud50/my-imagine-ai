
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
import { translations } from './translations.ts';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab>('profile');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '', model: 'Plus', aspectRatio: '1:1', steps: 30, uploadedImage: null
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const addNotification = (title: string, description: string, type: 'system' | 'success' | 'update' | 'message' = 'system') => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, description, time: new Date(), isRead: false, type, ownerEmail: user?.email };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    setToast(newNotif);
  };

  const handleLogout = () => {
    if (userSettings.privacyMode) {
      localStorage.removeItem('imagine_ai_history');
      localStorage.removeItem('imagine_ai_messages');
      localStorage.removeItem('user_api_key');
      setHistory([]);
      setMessages([]);
    }
    setUser(null);
  };

  const handleGenerate = async (customPrompt?: string, isLogo: boolean = false) => {
    const promptToUse = customPrompt || settings.prompt;
    if (!promptToUse.trim()) return;

    const userKey = localStorage.getItem('user_api_key') || userSettings.manualApiKey;
    if (!userKey) {
        setIsApiKeyModalOpen(true);
        return;
    }

    setIsGenerating(true);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);

    try {
      const ai = new GoogleGenAI({ apiKey: userKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: promptToUse },
            ...(settings.uploadedImage && !isLogo ? [{ inlineData: { data: settings.uploadedImage.split(',')[1], mimeType: 'image/png' } }] : [])
          ]
        }
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
        const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: newUrl, prompt: promptToUse, timestamp: new Date(), model: settings.model, type: isLogo ? 'LogoCreation' : 'Generated' };
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
        'Cleaned': 'remove background', 
        'Upscaled': 'upscale to high resolution', 
        'WatermarkRemoved': 'remove watermark from image',
        'Restored': 'restore and fix old photo', 
        'Colorized': 'colorize this black and white image', 
        'Cartoonized': 'turn this person into a 3d cartoon character', 
        'ObjectRemoved': 'magic eraser remove unwanted objects',
        'VirtualTryOn': customPrompt || 'change clothes of the person in the image',
        'AddSunglasses': customPrompt || 'add stylish sunglasses to the person in the image',
        'Edited': customPrompt || 'smart edit this image'
      };
      const prompt = customPrompt || actionPrompts[type] || 'enhance image quality';
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
        addNotification(language === 'ar' ? 'تمت المعالجة' : type, language === 'ar' ? 'تمت العملية بنجاح' : 'Processed successfully', 'success');
      }
    } catch (error) { addNotification('Error', 'Action failed', 'system'); } finally { setIsGenerating(false); }
  };

  const handleSendMessage = (content: string) => {
    if (!user) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderName: user.name,
      senderEmail: user.email,
      content: content,
      timestamp: new Date(),
      isRead: false
    };
    setMessages(prev => [newMessage, ...prev]);
    addNotification(
      language === 'ar' ? 'تم إرسال الرسالة' : 'Message Sent',
      language === 'ar' ? 'رسالتك وصلت للمدير بنجاح' : 'Your message reached the CEO',
      'message'
    );
  };

  const handleCloseStory = () => {
    if (siteConfig.global_story?.id) {
      const seenStories = safeParse('seen_stories', []);
      if (!seenStories.includes(siteConfig.global_story.id)) {
        localStorage.setItem('seen_stories', JSON.stringify([...seenStories, siteConfig.global_story.id]));
      }
    }
    setIsStoryOpen(false);
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
        onOpenInbox={() => { setAccountTab('manager'); setIsAccountOpen(true); }}
        onSettings={() => { setAccountTab('settings'); setIsAccountOpen(true); }}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onAdmin={() => setIsAdminOpen(true)}
        onOpenStory={() => setIsStoryOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && window.innerWidth < 1024 && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar 
          isOpen={isSidebarOpen}
          settings={settings} setSettings={setSettings} onGenerate={() => handleGenerate()} isGenerating={isGenerating} language={language}
          showTooltips={userSettings.showTooltips}
          onClose={() => setIsSidebarOpen(false)}
        />
        
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
          onSmartEdit={() => {
            const customPrompt = prompt(language === 'ar' ? 'ما التعديل الذي تريد القيام به؟' : 'What edit do you want to perform?');
            if (customPrompt) handleImageAction('Edited', customPrompt);
          }}
          onVirtualTryOn={() => {
            const clothesPrompt = prompt(language === 'ar' ? 'ما نوع الملابس التي تريد تجربتها؟' : 'What kind of clothes do you want to try?');
            if (clothesPrompt) handleImageAction('VirtualTryOn', `change the person clothes to ${clothesPrompt}`);
          }}
          onAddSunglasses={() => {
            const glassPrompt = prompt(language === 'ar' ? 'ما طراز النظارات؟' : 'What style of sunglasses?');
            if (glassPrompt) handleImageAction('AddSunglasses', `add ${glassPrompt} sunglasses to the person in the image`);
          }}
          onCreateLogo={() => {
            const companyName = prompt(translations[language].logoPrompt);
            if (companyName) {
              const logoPrompt = `Generate a professional minimalist flat vector logo for '${companyName}'. Modern typography, clean lines, white background.`;
              handleGenerate(logoPrompt, true);
            }
          }}
        />

        {isGalleryOpen && window.innerWidth < 1024 && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity animate-in fade-in"
            onClick={() => setIsGalleryOpen(false)}
          />
        )}
        
        <RightPanel 
          isOpen={isGalleryOpen}
          history={history} onSelect={(url) => { setActiveImage(url); if(window.innerWidth < 1024) setIsGalleryOpen(false); }} 
          onDelete={(id) => setHistory(prev => prev.filter(h => h.id !== id))} 
          language={language} onClose={() => setIsGalleryOpen(false)}
        />
      </div>

      <AccountModal 
        isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} activeTab={accountTab} setActiveTab={setAccountTab} 
        credits={50} user={user} language={language} userSettings={userSettings} setUserSettings={s => setUserSettings(prev => ({ ...prev, ...s }))}
        siteConfig={siteConfig}
        onSendMessage={handleSendMessage}
        allMessages={messages}
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
        <div className="fixed bottom-4 left-4 z-[9999] opacity-0 hover:opacity-100 transition-opacity hidden md:block">
          <button onClick={() => setIsAdminOpen(true)} className="p-2 bg-slate-900 text-white rounded-full">
            <Fingerprint className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {isStoryOpen && siteConfig.global_story?.active && (
        <StoryViewer 
          story={{ ...siteConfig.global_story, timestamp: Date.now() }} 
          onClose={handleCloseStory} 
          language={language} siteConfig={siteConfig} 
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default App;
