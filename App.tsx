
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ModelType, HistoryItem, GenerationSettings, SiteConfig, GenerationType, Language, UserSettings, Message, AppNotification, ModelStrategy, DeviceType } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import MainPreview from './components/MainPreview.tsx';
import RightPanel from './components/RightPanel.tsx';
import Header from './components/Header.tsx';
import AccountModal, { AccountTab } from './components/AccountModal.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import StoryViewer from './components/StoryViewer.tsx';
import ToastNotification from './components/ToastNotification.tsx';
import SpeechModal from './components/SpeechModal.tsx';
import HairModal from './components/HairModal.tsx';
import QrModal from './components/QrModal.tsx';
import CodeModal from './components/CodeModal.tsx';
import { GoogleGenAI, Modality } from "@google/genai";
import { Fingerprint, Sparkles, History, Loader2, MessageSquare, User as UserIcon } from 'lucide-react';
import { translations } from './translations.ts';

const SYSTEM_VERSION = "2.1.0_DEVICE_UPDATE";

function decode(base64: string) {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    return new Uint8Array(0);
  }
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, Math.floor(data.byteLength / 2));
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

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
  const [user, setUser] = useState<any>(() => {
    const lastVersion = localStorage.getItem('imagine_system_version');
    if (lastVersion !== SYSTEM_VERSION) {
      localStorage.removeItem('imagine_ai_user');
      return null;
    }
    return safeParse('imagine_ai_user', null);
  });

  const [language, setLanguage] = useState<Language>(() => safeParse('imagine_ai_lang', 'ar'));
  const [history, setHistory] = useState<HistoryItem[]>(() => safeParse('imagine_ai_history', []));
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [messages, setMessages] = useState<Message[]>(() => safeParse('imagine_ai_messages', []));
  const [allUsers, setAllUsers] = useState<any[]>(() => safeParse('site_verified_users', []));
  const [bannedEmails, setBannedEmails] = useState<string[]>(() => safeParse('banned_emails', []));
  const [adminIdentity, setAdminIdentity] = useState(() => safeParse('admin_identity', { 
    email: "Mohammedzarzor26@gmail.com", 
    password: "Mah7foud23" 
  }));
  
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = safeParse('imagine_ai_config', {});
    return {
      seo_title: 'Imagine AI', seo_desc: 'Professional AI Art',
      global_html: '', custom_css: '', custom_js: '', ux_blur_intensity: '20px', ux_accent_color: '#6366f1',
      manager_name: 'Ahmad kharbicha', manager_dob: 'Jan 1, 1987', manager_location: 'SAHTEREANN',
      manager_pic: 'https://i.pravatar.cc/150?u=manager', site_logo_scale: 1.0, 
      global_api_key: '', api_key_random: '', total_data_usage_bytes: 0,
      api_key_text_to_image: '', api_key_logo: '', api_key_tts: '', api_key_smart_edit: '',
      api_key_remove_bg: '', api_key_upscale: '', api_key_virtual_try_on: '',
      api_key_sunglasses: '', api_key_watermark: '', api_key_colorize: '',
      api_key_magic_eraser: '', api_key_cartoonize: '', api_key_restore: '',
      api_key_hair_style: '',
      global_story: { id: 'default', message: 'Welcome to Imagine AI!', active: false, image: '' },
      ...saved
    };
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => safeParse('imagine_ai_settings', {
    theme: 'dark', language: 'ar', fontFamily: 'modern', fontSize: 'medium', notificationSounds: true,
    autoSaveSession: true, imageQuality: 'high', modelStrategy: 'accurate', showTooltips: true,
    contentProtection: false, privacyMode: false, advancedMode: false, deviceType: 'pc'
  }));

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeechGenerating, setIsSpeechGenerating] = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [isHairModalOpen, setIsHairModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [toast, setToast] = useState<AppNotification | null>(null);
  
  const [activeImage, setActiveImage] = useState<string | null>(() => {
    try { return localStorage.getItem('imagine_active_image'); } catch (e) { return null; }
  });
  const [originalImage, setOriginalImage] = useState<string | null>(() => {
    try { return localStorage.getItem('imagine_original_image'); } catch (e) { return null; }
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab>('profile');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '', model: 'Plus', aspectRatio: '1:1', steps: 30, uploadedImage: null
  });

  useEffect(() => {
    localStorage.setItem('imagine_system_version', SYSTEM_VERSION);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('imagine_ai_user', JSON.stringify(user));
      localStorage.setItem('imagine_ai_config', JSON.stringify(siteConfig));
      localStorage.setItem('imagine_ai_settings', JSON.stringify(userSettings));
      localStorage.setItem('imagine_ai_history', JSON.stringify(history));
      localStorage.setItem('imagine_ai_messages', JSON.stringify(messages));
      localStorage.setItem('site_verified_users', JSON.stringify(allUsers));
      localStorage.setItem('banned_emails', JSON.stringify(bannedEmails));
      
      if (activeImage && activeImage.length < 2000000) {
        localStorage.setItem('imagine_active_image', activeImage);
      } else {
        localStorage.removeItem('imagine_active_image');
      }
      
      if (originalImage && originalImage.length < 2000000) {
        localStorage.setItem('imagine_original_image', originalImage);
      } else {
        localStorage.removeItem('imagine_original_image');
      }
    } catch (e) {}
  }, [user, siteConfig, userSettings, history, messages, allUsers, bannedEmails, activeImage, originalImage]);

  const getEffectiveApiKey = useCallback((specificKey?: string) => {
    return specificKey || siteConfig.global_api_key || siteConfig.api_key_random || userSettings.manualApiKey || process.env.API_KEY || '';
  }, [siteConfig.global_api_key, siteConfig.api_key_random, userSettings.manualApiKey]);

  const trackDataUsage = useCallback((dataUrl: string) => {
    if (!dataUrl || !user) return;
    try {
      const base64Content = dataUrl.split(',')[1];
      if (!base64Content) return;
      const bytes = Math.floor(base64Content.length * 0.75);
      setSiteConfig(prev => ({ ...prev, total_data_usage_bytes: (prev.total_data_usage_bytes || 0) + bytes }));
      setAllUsers(prevUsers => prevUsers.map(u => {
        if (u.email.toLowerCase() === user.email.toLowerCase()) {
          return { ...u, dataUsage: (u.dataUsage || 0) + bytes };
        }
        return u;
      }));
    } catch (e) {}
  }, [user]);

  const handleGenerate = useCallback(async (customPrompt?: string, isLogo: boolean = false, overrideType?: GenerationType) => {
    const p = customPrompt || settings.prompt;
    if (!p.trim()) return;
    setIsGenerating(true);
    setActiveImage(null);
    try {
      const targetKey = isLogo ? getEffectiveApiKey(siteConfig.api_key_logo) : getEffectiveApiKey(siteConfig.api_key_text_to_image);
      const ai = new GoogleGenAI({ apiKey: targetKey });
      const modelName = userSettings.modelStrategy === 'fast' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
      
      let finalPrompt = isLogo ? `Professional minimalist logo for: ${p}, 4k.` : p;
      if (overrideType === 'TextToCode') {
        finalPrompt = `Beautiful syntax-highlighted code snippet image for: ${p}. Visual Studio Code style, dark theme, professional developer aesthetics.`;
      } else if (overrideType === 'QrCode') {
        finalPrompt = `High-quality, functional, scannable black and white QR code for URL: ${p}. Minimalist professional design, 4k.`;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [{ text: finalPrompt }] },
        config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
      });
      let resultUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) { resultUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`; break; }
        }
      }
      if (resultUrl) {
        trackDataUsage(resultUrl);
        setActiveImage(resultUrl);
        setOriginalImage(resultUrl);
        setHistory(prev => [{ id: Date.now().toString(), imageUrl: resultUrl, prompt: p, timestamp: new Date(), model: settings.model, type: overrideType || (isLogo ? 'LogoCreation' : 'Generated') }, ...prev].slice(0, 30));
      }
    } catch (e: any) { 
    } finally { setIsGenerating(false); }
  }, [settings, siteConfig, userSettings.modelStrategy, getEffectiveApiKey, trackDataUsage]);

  const handleImageAction = useCallback(async (type: GenerationType, customPrompt?: string) => {
    const sourceImage = activeImage || settings.uploadedImage;
    if (!sourceImage && type !== 'TextToCode' && type !== 'QrCode') return;
    
    setIsGenerating(true);
    let specificKey = '';
    let actionPrompt = '';

    switch(type) {
      case 'Cleaned': specificKey = siteConfig.api_key_remove_bg; actionPrompt = "Remove background strictly."; break;
      case 'Upscaled': specificKey = siteConfig.api_key_upscale; actionPrompt = "Upscale to 4K quality."; break;
      case 'WatermarkRemoved': specificKey = siteConfig.api_key_watermark; actionPrompt = "Remove watermark."; break;
      default: specificKey = siteConfig.global_api_key; actionPrompt = customPrompt || "Edit image.";
    }

    try {
      const targetKey = getEffectiveApiKey(specificKey);
      const ai = new GoogleGenAI({ apiKey: targetKey });
      const mimeType = sourceImage?.split(';')[0].split(':')[1] || 'image/png';
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ inlineData: { data: sourceImage?.split(',')[1] || '', mimeType } }, { text: actionPrompt }] }
      });
      let resultUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) { resultUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`; break; }
        }
      }
      if (resultUrl) {
        trackDataUsage(resultUrl);
        setActiveImage(resultUrl);
      }
    } catch (error: any) { 
    } finally { setIsGenerating(false); }
  }, [activeImage, settings.uploadedImage, siteConfig, getEffectiveApiKey, trackDataUsage]);

  const handleGenerateSpeech = useCallback(async (text: string, voice: string) => {
    if (!text.trim()) return;
    setIsSpeechGenerating(true);
    try {
      const targetKey = getEffectiveApiKey(siteConfig.api_key_tts);
      const ai = new GoogleGenAI({ apiKey: targetKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice as any },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          audioContext,
          24000,
          1
        );
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (e) {
      console.error("Speech generation failed", e);
    } finally {
      setIsSpeechGenerating(false);
    }
  }, [getEffectiveApiKey, siteConfig.api_key_tts]);

  const authScreenMemo = useMemo(() => (
    <AuthScreen onLogin={(userData) => setUser(userData)} language={language} allUsers={allUsers} setAllUsers={setAllUsers} bannedEmails={bannedEmails} adminIdentity={adminIdentity} />
  ), [language, allUsers, setAllUsers, bannedEmails, adminIdentity]);

  if (!user) return authScreenMemo;

  const deviceClass = `device-layout-${userSettings.deviceType}`;

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${deviceClass} ${userSettings.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <Header credits={50} user={user} language={language} siteConfig={siteConfig} notifications={notifications} onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))} onToggleLang={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')} onUpgrade={() => { setAccountTab('credits'); setIsAccountOpen(true); }} onProfile={() => { setAccountTab('profile'); setIsAccountOpen(true); }} onOpenInbox={() => { setAccountTab('manager'); setIsAccountOpen(true); }} onOpenStory={() => setIsStoryOpen(true)} onLogout={() => setUser(null)} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onAdmin={() => setIsAdminOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} settings={settings} setSettings={setSettings} onGenerate={() => handleGenerate()} onUpload={(url) => { setActiveImage(url); setSettings(s => ({...s, uploadedImage: url})); }} isGenerating={isGenerating} language={language} onClose={() => setIsSidebarOpen(false)} modelStrategy={userSettings.modelStrategy} setModelStrategy={(s) => setUserSettings(prev => ({ ...prev, modelStrategy: s }))} />
        <MainPreview imageUrl={activeImage} originalImageUrl={originalImage} isGenerating={isGenerating} loadingStep={loadingStep} prompt={settings.prompt} language={language} isSidebarOpen={isSidebarOpen} isGalleryOpen={isGalleryOpen} onToggleGallery={() => setIsGalleryOpen(!isGalleryOpen)} onRemoveBackground={() => handleImageAction('Cleaned')} onUpscale={() => handleImageAction('Upscaled')} onRemoveWatermark={() => handleImageAction('WatermarkRemoved')} onRestore={() => handleImageAction('Restored')} onColorize={() => handleImageAction('Colorized')} onCartoonize={() => handleImageAction('Cartoonized')} onMagicEraser={() => handleImageAction('ObjectRemoved')} onSmartEdit={() => { const p = prompt(translations[language].promptPlaceholder); if(p) handleImageAction('Edited', p); }} onVirtualTryOn={() => handleImageAction('VirtualTryOn')} onAddSunglasses={() => handleImageAction('AddSunglasses')} onChangeHairStyle={() => setIsHairModalOpen(true)} onCreateLogo={() => { const n = prompt(translations[language].logoPrompt); if(n) handleGenerate(n, true); }} onTextToSpeech={() => setIsSpeechModalOpen(true)} onGenerateImage={() => handleGenerate()} onImageToVector={() => handleImageAction('ImageToVector')} onTextToCode={() => setIsCodeModalOpen(true)} onQrCode={() => setIsQrModalOpen(true)} />
        <RightPanel isOpen={isGalleryOpen} history={history} onSelect={setActiveImage} onDelete={(id) => setHistory(h => h.filter(x => x.id !== id))} language={language} onClose={() => setIsGalleryOpen(false)} />
      </div>

      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} activeTab={accountTab} setActiveTab={setAccountTab} credits={50} user={user} language={language} userSettings={userSettings} setUserSettings={s => setUserSettings(prev => ({ ...prev, ...s }))} siteConfig={siteConfig} allMessages={messages} onSendMessage={(content) => setMessages(prev => [{ id: Date.now().toString(), senderName: user?.name, senderEmail: user?.email, content, timestamp: new Date(), isRead: false }, ...prev])} />
      {isAdminOpen && <AdminPanel config={siteConfig} setConfig={setSiteConfig} messages={messages} setMessages={setMessages} onClose={() => setIsAdminOpen(false)} language={language} allUsers={allUsers} setAllUsers={setAllUsers} bannedEmails={bannedEmails} setBannedEmails={setBannedEmails} adminIdentity={adminIdentity} setAdminIdentity={setAdminIdentity} />}
      {isStoryOpen && siteConfig.global_story?.active && <StoryViewer story={{...siteConfig.global_story, timestamp: Date.now()}} onClose={() => setIsStoryOpen(false)} language={language} siteConfig={siteConfig} />}
      <ToastNotification toast={toast} onClose={() => setToast(null)} language={language} />
      {isSpeechModalOpen && <SpeechModal isOpen={isSpeechModalOpen} onClose={() => setIsSpeechModalOpen(false)} onGenerate={handleGenerateSpeech} language={language} isGenerating={isSpeechGenerating} />}
      {isHairModalOpen && <HairModal isOpen={isHairModalOpen} onClose={() => setIsHairModalOpen(false)} onApply={(p) => handleImageAction('ChangeHairStyle', p)} language={language} />}
      <QrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} onGenerate={(url) => handleGenerate(url, false, 'QrCode')} language={language} isGenerating={isGenerating} />
      <CodeModal isOpen={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)} onGenerate={(p) => handleGenerate(p, false, 'TextToCode')} language={language} isGenerating={isGenerating} />
    </div>
  );
};

export default App;
