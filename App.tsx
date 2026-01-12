
import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e);
    return defaultValue;
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<{ email: string; name: string; username: string; isAdmin: boolean; profilePic?: string } | null>(() => safeParse('imagine_ai_user', null));
  const [language, setLanguage] = useState<Language>(() => safeParse('imagine_ai_lang', 'ar'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => safeParse('imagine_ai_history', []));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => safeParse('imagine_ai_notifs', []));
  const [messages, setMessages] = useState<Message[]>(() => safeParse('imagine_ai_messages', []));
  const [toast, setToast] = useState<AppNotification | null>(null);

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => safeParse('imagine_ai_config', {
    seo_title: 'Imagine AI',
    seo_desc: 'Professional AI Art',
    global_html: '',
    custom_css: '',
    custom_js: '',
    ux_blur_intensity: '20px',
    ux_accent_color: '#6366f1',
    manager_name: 'Ahmad kharbicha',
    manager_dob: 'Jan 1, 1987',
    manager_location: 'SAHTEREANN',
    manager_pic: 'https://i.pravatar.cc/150?u=manager',
    site_logo_scale: 1.0,
    global_api_key: ''
  }));

  const [userSettings, setUserSettings] = useState<UserSettings>(() => safeParse('imagine_ai_settings', {
    theme: 'dark',
    language: 'ar',
    fontFamily: 'modern',
    fontSize: 'medium',
    notificationSounds: true,
    autoSaveSession: true,
    imageQuality: 'high',
    modelStrategy: 'artistic',
    showTooltips: true,
    contentProtection: false,
    privacyMode: false,
    advancedMode: false
  }));

  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '',
    model: 'Plus',
    aspectRatio: '1:1',
    steps: 30,
    uploadedImage: null
  });

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab>('profile');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // تحديث التخزين المحلي تلقائياً عند تغيير المستخدم
  useEffect(() => {
    if (user) {
      localStorage.setItem('imagine_ai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('imagine_ai_user');
    }
  }, [user]);

  useEffect(() => localStorage.setItem('imagine_ai_lang', JSON.stringify(language)), [language]);
  useEffect(() => localStorage.setItem('imagine_ai_history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('imagine_ai_notifs', JSON.stringify(notifications)), [notifications]);
  useEffect(() => localStorage.setItem('imagine_ai_messages', JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem('imagine_ai_config', JSON.stringify(siteConfig)), [siteConfig]);
  useEffect(() => localStorage.setItem('imagine_ai_settings', JSON.stringify(userSettings)), [userSettings]);

  const addNotification = (title: string, description: string, type: 'system' | 'success' | 'update' | 'message' = 'system') => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title,
      description,
      time: new Date(),
      isRead: false,
      type,
      ownerEmail: user?.email
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    setToast(newNotif);
  };

  const handleLogout = () => {
    // بضبط الحالة إلى null، سيقوم React تلقائياً بإظهار شاشة AuthScreen
    // الـ useEffect سيمسح الـ localStorage في الدورة القادمة
    setUser(null);
  };

  const handleGenerate = async () => {
    if (!settings.prompt.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
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
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          imageUrl: newUrl,
          prompt: settings.prompt,
          timestamp: new Date(),
          model: settings.model,
          type: 'Generated'
        };
        setHistory(prev => [newItem, ...prev].slice(0, 20));
        addNotification(language === 'ar' ? 'تم التوليد' : 'Generated', language === 'ar' ? 'صورتك جاهزة الآن!' : 'Your image is ready!', 'success');
      }
    } catch (error) {
      addNotification('Error', 'Failed to generate.', 'system');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageAction = async (type: GenerationType, customPrompt?: string) => {
    const sourceImage = activeImage || settings.uploadedImage;
    if (!sourceImage) {
      addNotification(language === 'ar' ? 'تنبيه' : 'Notice', language === 'ar' ? 'يرجى اختيار أو رفع صورة أولاً' : 'Please select or upload an image first', 'system');
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const actionPrompts: Record<string, string> = {
        'Cleaned': 'remove background and return as high quality png',
        'Upscaled': 'upscale this image to high resolution and improve details',
        'WatermarkRemoved': 'remove any watermarks or logos from this image',
        'Restored': 'restore and fix this image, remove scratches and noise',
        'Colorized': 'colorize this black and white image naturally',
        'Cartoonized': 'convert this image to a high-quality cartoon 3D style',
        'ObjectRemoved': 'remove main background objects from this image'
      };

      const prompt = customPrompt || actionPrompts[type] || 'enhance this image';
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: sourceImage.split(',')[1], mimeType: 'image/png' } },
            { text: prompt }
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
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          imageUrl: newUrl,
          prompt: prompt,
          timestamp: new Date(),
          model: 'Plus',
          type: type
        };
        setHistory(prev => [newItem, ...prev].slice(0, 20));
        addNotification(type, language === 'ar' ? 'تمت المعالجة بنجاح' : 'Processed successfully', 'success');
      }
    } catch (error) {
      addNotification('Error', 'Processing failed.', 'system');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return <AuthScreen onLogin={setUser} language={language} />;

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${userSettings.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <Header 
        credits={50} user={user} language={language} siteConfig={siteConfig} notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
        onToggleLang={() => setLanguage(prev => prev === 'ar' ? 'en' : 'ar')}
        onUpgrade={() => setIsApiKeyModalOpen(true)}
        onProfile={() => { setAccountTab('profile'); setIsAccountOpen(true); }}
        onSettings={() => { setAccountTab('settings'); setIsAccountOpen(true); }}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenStory={() => setIsStoryOpen(true)}
        onAdmin={() => setIsAdminOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && (
          <Sidebar 
            settings={settings} setSettings={setSettings} onGenerate={handleGenerate} isGenerating={isGenerating} language={language}
            onOpenApiKey={() => setIsApiKeyModalOpen(true)}
            onLogout={handleLogout}
            onQuickAction={handleImageAction}
          />
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
          <RightPanel 
            history={history} onSelect={setActiveImage} onDelete={(id) => setHistory(prev => prev.filter(h => h.id !== id))} 
            language={language} onClose={() => setIsGalleryOpen(false)}
          />
        )}
      </div>

      <AccountModal 
        isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} activeTab={accountTab} setActiveTab={setAccountTab} 
        credits={50} user={user} language={language} userSettings={userSettings} setUserSettings={s => setUserSettings(prev => ({ ...prev, ...s }))}
        siteConfig={siteConfig} onSendMessage={c => addNotification('Sent', 'Message received', 'message')}
        allMessages={messages}
      />

      {isAdminOpen && (
        <AdminPanel 
          config={siteConfig} setConfig={setSiteConfig} messages={messages} setMessages={setMessages} onClose={() => setIsAdminOpen(false)} 
          language={language} currentUser={user} setCurrentUser={setUser}
        />
      )}

      {isStoryOpen && siteConfig.global_story?.active && (
        <StoryViewer 
          story={{ ...siteConfig.global_story, timestamp: Date.now() }} 
          onClose={() => { setIsStoryOpen(false); localStorage.setItem('last_seen_global_story_id', siteConfig.global_story?.id || ''); }} 
          language={language} siteConfig={siteConfig} 
        />
      )}

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} 
        onConfirm={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
        onSimulateUpgrade={() => { setIsApiKeyModalOpen(false); setAccountTab('credits'); setIsAccountOpen(true); }}
        language={language} 
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} language={language} />

      {user.isAdmin && (
        <div className="fixed bottom-4 left-4 z-[9999] opacity-0 hover:opacity-100 transition-opacity">
          <button onClick={() => setIsAdminOpen(true)} className="p-2 bg-slate-900 text-white rounded-full">
            <Fingerprint className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
