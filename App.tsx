import React, { useState, useCallback, useEffect } from 'react';
// استيراد جميع الأنواع المطلوبة
import { 
  ModelType, HistoryItem, GenerationSettings, SiteConfig, 
  GenerationType, Language, UserSettings, Message, AppNotification 
} from './types.ts';

// استيراد المكونات (تأكد أن أسماء المجلدات والملفات صحيحة)
import Sidebar from './components/Sidebar.tsx';
import MainPreview from './components/MainPreview.tsx';
import RightPanel from './components/RightPanel.tsx';
import Header from './components/Header.tsx';
import AccountModal, { AccountTab } from './components/AccountModal.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import ToastNotification from './components/ToastNotification.tsx';
import ApiKeyModal from './components/ApiKeyModal.tsx';

// المكتبات الخارجية
import { GoogleGenAI } from "@google/genai";
import { Fingerprint } from 'lucide-react';
import { translations } from './translations.ts';
import { removeBackground } from "@imgly/background-removal";

// دالة التحليل الآمن
const safeParse = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
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
  
  const [allUsers] = useState<any[]>(() => safeParse('site_verified_users', []));
  const [bannedEmails] = useState<string[]>(() => safeParse('banned_emails', []));
  
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => safeParse('imagine_ai_config', {
    seo_title: 'Imagine AI', seo_desc: 'Professional AI Art',
    global_html: '', custom_css: '', custom_js: '', ux_blur_intensity: '20px', ux_accent_color: '#6366f1',
    manager_name: 'Ahmad', manager_dob: '', manager_location: '', manager_pic: '',
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab>('profile');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '', model: 'Plus', aspectRatio: '1:1', steps: 30, uploadedImage: null
  });

  // --- Persistence ---
  useEffect(() => {
    if (user) localStorage.setItem('imagine_ai_user', JSON.stringify(user));
    else localStorage.removeItem('imagine_ai_user');
  }, [user]);

  const addNotification = useCallback((title: string, description: string, type: 'system' | 'success' | 'update' | 'message' = 'system') => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, description, time: new Date(), isRead: false, type };
    setNotifications(prev => [newNotif, ...prev]);
    setToast(newNotif);
  }, []);

  // --- 🔥 دالة التوليد (Flux) ---
  const handleGenerate = async () => {
    if (!settings.prompt.trim()) return;
    setIsGenerating(true);
    try {
        const randomSeed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(settings.prompt)}?width=1024&height=1024&seed=${randomSeed}&model=flux&nologo=true`;
        
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setActiveImage(base64);
            setOriginalImage(base64);
            const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: base64, prompt: settings.prompt, timestamp: new Date(), model: settings.model, type: 'Generated' };
            setHistory(prev => [newItem, ...prev]);
            setIsGenerating(false);
        };
    } catch (e) {
      setIsGenerating(false);
      alert("Error generating image.");
    }
  };

  // --- 🔥 دالة الأدوات ---
  const handleImageAction = async (type: GenerationType) => {
    const sourceImage = activeImage || settings.uploadedImage;
    if (!sourceImage) return;

    if (type === 'Cleaned') {
      setIsGenerating(true);
      try {
        const blob = await removeBackground(sourceImage);
        const url = URL.createObjectURL(blob);
        setActiveImage(url);
        addNotification('Success', 'Removed BG', 'success');
      } catch (err) { alert("Failed to remove background"); }
      finally { setIsGenerating(false); }
      return;
    }
    setIsApiKeyModalOpen(true);
  };

  // --- Rendering ---
  if (!user) return <AuthScreen onLogin={setUser} language={language} />;

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${userSettings.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      
      {siteConfig.custom_css && <style>{siteConfig.custom_css}</style>}

      <Header 
        credits={50} user={user} language={language}
        onToggleLang={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')}
        onUpgrade={() => setIsApiKeyModalOpen(true)}
        onProfile={() => { setAccountTab('profile'); setIsAccountOpen(true); }}
        onLogout={() => setUser(null)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onAdmin={() => setIsAdminOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && (
          <Sidebar settings={settings} setSettings={setSettings} onGenerate={handleGenerate} isGenerating={isGenerating} language={language} onClose={() => setIsSidebarOpen(false)} />
        )}
        
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
          <button onClick={() => setIsAdminOpen(true)} className="p-2 bg-slate-900 text-white rounded-full"><Fingerprint className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );
};

export default App;
