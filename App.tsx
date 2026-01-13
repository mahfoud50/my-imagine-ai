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
import ApiKeyModal from './components/ApiKeyModal.tsx'; // تأكد من وجود هذا الملف
import { GoogleGenAI } from "@google/genai";
import { Fingerprint } from 'lucide-react';
import { translations } from './translations.ts';
import { removeBackground } from "@imgly/background-removal";

// دالة قراءة آمنة
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
  const [loadingStep, setLoadingStep] = useState(0);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab>('profile');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false); // ✅ مهم: حالة نافذة المفتاح
  
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '', model: 'Plus', aspectRatio: '1:1', steps: 30, uploadedImage: null
  });

  // --- Effects ---
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % translations[language].loadingMessages.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, language]);

  // Sync with LocalStorage
  useEffect(() => { if (user) localStorage.setItem('imagine_ai_user', JSON.stringify(user)); }, [user]);
  useEffect(() => localStorage.setItem('imagine_ai_history', JSON.stringify(history)), [history]);
  // ... (Other syncs remain same)

  const addNotification = useCallback((title: string, description: string, type: 'system' | 'success' | 'update' | 'message' = 'system') => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, description, time: new Date(), isRead: false, type };
    setNotifications(prev => [newNotif, ...prev]);
    setToast(newNotif);
  }, []);

  const handleLogout = () => setUser(null);

  // --- 🔥 دالة التوليد الجديدة (تستخدم Flux المجاني) ---
  const handleGenerate = useCallback(async (customPrompt?: string, isLogo: boolean = false) => {
    const p = customPrompt || settings.prompt;
    if (!p.trim()) {
        addNotification('Alert', language === 'ar' ? 'اكتب وصفاً أولاً' : 'Enter prompt first', 'system');
        return;
    }

    setIsGenerating(true);
    setActiveImage(null);

    try {
        // 🚀 استخدام Flux عبر Pollinations (مجاني، سريع، لا يحتاج مفتاح)
        const randomSeed = Math.floor(Math.random() * 10000000);
        const model = isLogo ? 'flux-pro' : 'flux';
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=1024&seed=${randomSeed}&model=${model}&nologo=true`;

        // جلب الصورة للتأكد من نجاحها
        const response = await fetch(imageUrl);
        if(!response.ok) throw new Error("Failed to fetch image");
        
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        
        reader.onloadend = () => {
            const base64data = reader.result as string;
            
            setActiveImage(base64data);
            setOriginalImage(base64data);
            
            const newItem: HistoryItem = { 
                id: Date.now().toString(), 
                imageUrl: base64data, 
                prompt: p, 
                timestamp: new Date(), 
                model: settings.model, 
                type: isLogo ? 'LogoCreation' : 'Generated' 
            };
            
            setHistory(prev => [newItem, ...prev].slice(0, 30));
            addNotification('Success', language === 'ar' ? 'تم التوليد بنجاح!' : 'Generated Successfully!', 'success');
            setIsGenerating(false);
        };

    } catch (e: any) {
      console.error("Generation error:", e);
      addNotification('Error', language === 'ar' ? 'فشل التوليد، حاول مرة أخرى' : 'Generation failed', 'system');
      setIsGenerating(false);
    }
  }, [settings.prompt, settings.model, language, addNotification]);


  // --- 🔥 دالة تعديل الصور (مع إصلاح إزالة الخلفية) ---
  const handleImageAction = useCallback(async (type: GenerationType, customPrompt?: string) => {
    const sourceImage = activeImage || settings.uploadedImage;
    if (!sourceImage) {
      addNotification('Alert', language === 'ar' ? 'يرجى رفع صورة أولاً' : 'Please upload an image first', 'system');
      return;
    }

    setIsGenerating(true);

    // 1. إزالة الخلفية (مجاني ومحلي)
    if (type === 'Cleaned') {
      try {
        // استخدام مكتبة imgly المحلية
        const blob = await removeBackground(sourceImage);
        const url = URL.createObjectURL(blob);
        
        setActiveImage(url);
        const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: url, prompt: 'Removed Background', timestamp: new Date(), model: 'Plus', type: 'Cleaned' };
        setHistory(prev => [newItem, ...prev].slice(0, 30));
        addNotification('Success', language === 'ar' ? 'تم إزالة الخلفية' : 'Background Removed', 'success');
      } catch (err) {
        console.error(err);
        addNotification('Error', 'Background removal failed', 'system');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // 2. باقي الأدوات (تتطلب مفتاح API)
    const userKey = localStorage.getItem('user_api_key');
    if (!userKey) {
        setIsGenerating(false);
        setIsApiKeyModalOpen(true); // فتح النافذة لطلب المفتاح
        return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: userKey });
      const prompt = customPrompt || (language === 'ar' ? 'تحسين جودة الصورة' : 'Enhance image quality');
      const mimeType = sourceImage.includes('png') ? 'image/png' : 'image/jpeg';
      const base64Data = sourceImage.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash', // موديل أكثر استقراراً
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ]
        }
      });
      
      // ملاحظة: Gemini Flash قد يعيد نصاً، لكننا سنحاول
      // ... (نفس منطق الاستجابة السابق)
      addNotification('Info', 'Gemini processed the request (Result might be text-only)', 'system');

    } catch (error: any) {
      console.error("Action error:", error);
      addNotification('Error', `Processing failed: ${error.message}`, 'system');
    } finally { 
        setIsGenerating(false); 
    }
  }, [activeImage, settings.uploadedImage, language, addNotification]);


  if (!user) return <AuthScreen onLogin={setUser} language={language} />;

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${userSettings.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* 🚀 Sovereign Injection: Master HTML */}
      {siteConfig.global_html && <div dangerouslySetInnerHTML={{ __html: siteConfig.global_html }} />}
      
      {/* 🚀 Sovereign Injection: Master CSS */}
      {siteConfig.custom_css && <style>{siteConfig.custom_css}</style>}

      <Header 
        credits={50} user={user} language={language} siteConfig={siteConfig} notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))}
        onToggleLang={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')}
        onUpgrade={() => { setAccountTab('api_key'); setIsAccountOpen(true); }} // تعديل الرابط لفتح تبويب الـ API
        onProfile={() => { setAccountTab('profile'); setIsAccountOpen(true); }}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onAdmin={() => setIsAdminOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          settings={settings} setSettings={setSettings}
          onGenerate={() => handleGenerate()}
          isGenerating={isGenerating}
          language={language}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <MainPreview
          imageUrl={activeImage}
          originalImageUrl={originalImage}
          isGenerating={isGenerating}
          prompt={settings.prompt}
          language={language}
          onToggleGallery={() => setIsGalleryOpen(!isGalleryOpen)}
          onRemoveBackground={() => handleImageAction('Cleaned')}
          onUpscale={() => handleImageAction('Upscaled')}
          onRemoveWatermark={() => handleImageAction('WatermarkRemoved')}
          onRestore={() => handleImageAction('Restored')}
          onColorize={() => handleImageAction('Colorized')}
          onCartoonize={() => handleImageAction('Cartoonized')}
          onMagicEraser={() => handleImageAction('ObjectRemoved')}
          onSmartEdit={() => { const p = prompt(translations[language].smartEdit + '?'); if (p) handleImageAction('Edited', p); }}
          onVirtualTryOn={() => handleImageAction('VirtualTryOn')}
        />
        
        {isGalleryOpen && (
            <RightPanel history={history} onSelect={setActiveImage} onDelete={(id) => setHistory(h => h.filter(x => x.id !== id))} language={language} onClose={() => setIsGalleryOpen(false)} />
        )}
      </div>

      <AccountModal 
        isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} 
        activeTab={accountTab} setActiveTab={setAccountTab} 
        credits={50} user={user} language={language} userSettings={userSettings} 
        setUserSettings={s => setUserSettings(prev => ({ ...prev, ...s }))} 
      />

      {isAdminOpen && <AdminPanel config={siteConfig} setConfig={setSiteConfig} apiKeys={[]} setApiKeys={() => {}} onClose={() => setIsAdminOpen(false)} language={language} currentUser={user} setCurrentUser={setUser} />}
      
      {/* نافذة المفتاح الإجبارية */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} 
        onConfirm={(key) => { localStorage.setItem('user_api_key', key); setIsApiKeyModalOpen(false); }}
        language={language} 
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} language={language} />
      
      {/* زر المدير السري */}
      {user?.isAdmin && (
        <div className="fixed bottom-4 left-4 z-[9999] opacity-0 hover:opacity-100 transition-opacity">
          <button onClick={() => setIsAdminOpen(true)} className="p-2 bg-slate-900 text-white rounded-full shadow-lg border border-white/10"><Fingerprint className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );
};

export default App;


