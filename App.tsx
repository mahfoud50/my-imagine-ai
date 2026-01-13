import React, { useState, useCallback, useEffect } from 'react';
import { ModelType, HistoryItem, GenerationSettings, SiteConfig, GenerationType, Language, UserSettings, Message, AppNotification } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import MainPreview from './components/MainPreview.tsx';
import RightPanel from './components/RightPanel.tsx';
import Header from './components/Header.tsx';
import AccountModal, { AccountTab } from './components/AccountModal.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import ToastNotification from './components/ToastNotification.tsx';
import ApiKeyModal from './components/ApiKeyModal.tsx';
import { GoogleGenAI } from "@google/genai";
import { Fingerprint } from 'lucide-react';
import { translations } from './translations.ts';
import { removeBackground } from "@imgly/background-removal";

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
    return defaultValue;
  }
};

const App: React.FC = () => {
  // --- States ---
  const [user, setUser] = useState<any>(() => safeParse('imagine_ai_user', null));
  const [language, setLanguage] = useState<Language>(() => safeParse('imagine_ai_lang', 'ar'));
  const [history, setHistory] = useState<HistoryItem[]>(() => safeParse('imagine_ai_history', []));
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [messages, setMessages] = useState<Message[]>(() => safeParse('imagine_ai_messages', []));
  
  const [allUsers, setAllUsers] = useState<any[]>(() => safeParse('site_verified_users', []));
  const [bannedEmails, setBannedEmails] = useState<string[]>(() => safeParse('banned_emails', []));
  const [adminIdentity, setAdminIdentity] = useState(() => safeParse('admin_identity', { email: "Mohammedzarzor26@gmail.com", password: "Mah7foud23" }));
  
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => safeParse('imagine_ai_config', {
    seo_title: 'Imagine AI', seo_desc: 'Professional AI Art', global_html: '', custom_css: '', custom_js: '',
    ux_blur_intensity: '20px', ux_accent_color: '#6366f1', manager_name: 'Ahmad kharbicha', 
    manager_dob: 'Jan 1, 1987', manager_location: 'SAHTEREANN', manager_pic: 'https://i.pravatar.cc/150?u=manager',
    site_logo_scale: 1.0, global_api_key: ''
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
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '', model: 'Plus', aspectRatio: '1:1', steps: 30, uploadedImage: null
  });

  // --- Sync Effects ---
  useEffect(() => { if (user) localStorage.setItem('imagine_ai_user', JSON.stringify(user)); else localStorage.removeItem('imagine_ai_user'); }, [user]);
  useEffect(() => localStorage.setItem('imagine_ai_history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('imagine_ai_config', JSON.stringify(siteConfig)), [siteConfig]);

  const addNotification = useCallback((title: string, description: string, type: 'system' | 'success' | 'update' | 'message' = 'system') => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, description, time: new Date(), isRead: false, type };
    setNotifications(prev => [newNotif, ...prev]);
    setToast(newNotif);
  }, []);

  // --- 🔥 دالة التوليد (Flux Engine) ---
  const handleGenerate = useCallback(async (customPrompt?: string, isLogo: boolean = false) => {
    const p = customPrompt || settings.prompt;
    if (!p.trim()) return;

    setIsGenerating(true);
    setActiveImage(null);

    try {
        const randomSeed = Math.floor(Math.random() * 10000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=1024&seed=${randomSeed}&model=flux&nologo=true`;

        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result as string;
            setActiveImage(base64data);
            setOriginalImage(base64data);
            const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: base64data, prompt: p, timestamp: new Date(), model: settings.model, type: isLogo ? 'LogoCreation' : 'Generated' };
            setHistory(prev => [newItem, ...prev].slice(0, 30));
            addNotification('Success', language === 'ar' ? 'تم التوليد بنجاح' : 'Generated Successfully', 'success');
            setIsGenerating(false);
        };
    } catch (e) {
      addNotification('Error', 'فشل التوليد', 'system');
      setIsGenerating(false);
    }
  }, [settings.prompt, settings.model, language, addNotification]);

  // --- 🔥 دالة الأدوات الذكية ---
  const handleImageAction = useCallback(async (type: GenerationType, customPrompt?: string) => {
    const sourceImage = activeImage || settings.uploadedImage;
    if (!sourceImage) return;

    setIsGenerating(true);

    if (type === 'Cleaned') {
      try {
        const blob = await removeBackground(sourceImage);
        const url = URL.createObjectURL(blob);
        setActiveImage(url);
        addNotification('Success', 'تم إزالة الخلفية', 'success');
      } catch (err) { addNotification('Error', 'فشلت الإزالة', 'system'); }
      finally { setIsGenerating(false); }
      return;
    }

    const userKey = localStorage.getItem('user_api_key');
    if (!userKey) {
        setIsGenerating(false);
        setIsApiKeyModalOpen(true);
        return;
    }

    try {
      const ai = new GoogleGenAI(userKey);
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      addNotification('Info', 'جاري المعالجة عبر Gemini', 'system');
    } catch (error) { addNotification('Error', 'فشلت المعالجة', 'system'); }
    finally { setIsGenerating(false); }
  }, [activeImage, settings.uploadedImage, addNotification]);

  if (!user) return <AuthScreen onLogin={setUser} language={language} />;

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${userSettings.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* 🚀 السيطرة السيادية */}
      {siteConfig.global_html && <div dangerouslySetInnerHTML={{ __html: siteConfig.global_html }} />}
      {siteConfig.custom_css && <style>{siteConfig.custom_css}</style>}

      <Header 
        credits={50} user={user} language={language} siteConfig={siteConfig} notifications={notifications}
        onToggleLang={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')}
        onUpgrade={() => setIsApiKeyModalOpen(true)}
        onProfile={() => { setAccountTab('profile'); setIsAccountOpen(true); }}
        onLogout={() => setUser(null)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onAdmin={() => setIsAdminOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar settings={settings} setSettings={setSettings} onGenerate={handleGenerate} isGenerating={isGenerating} language={language} onClose={() => setIsSidebarOpen(false)} />
        
        <MainPreview 
          imageUrl={activeImage} originalImageUrl={originalImage} isGenerating={isGenerating} prompt={settings.prompt} language={language}
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
            <RightPanel history={history} onSelect={setActiveImage} onDelete={(id) => setHistory(h => h.filter(x => x.id !== id))} language={language} onClose={() => setIsGalleryOpen(false)} />
        )}
      </div>

      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} activeTab={accountTab} setActiveTab={setAccountTab} credits={50} user={user} language={language} userSettings={userSettings} setUserSettings={s => setUserSettings(prev => ({ ...prev, ...s }))} />

      {isAdminOpen && <AdminPanel config={siteConfig} setConfig={setSiteConfig} apiKeys={[]} setApiKeys={() => {}} onClose={() => setIsAdminOpen(false)} language={language} currentUser={user} setCurrentUser={setUser} />}
      
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} onConfirm={(key) => { localStorage.setItem('user_api_key', key); setIsApiKeyModalOpen(false); }} language={language} />

      <ToastNotification toast={toast} onClose={() => setToast(null)} language={language} />
      
      {user?.isAdmin && (
        <div className="fixed bottom-4 left-4 z-[9999]">
          <button onClick={() => setIsAdminOpen(true)} className="p-2 bg-slate-900 text-white rounded-full border border-white/10 shadow-lg hover:scale-110 transition-transform">
            <Fingerprint className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
