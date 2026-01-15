
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ModelType, HistoryItem, GenerationSettings, SiteConfig, GenerationType, Language, UserSettings, Message, AppNotification, ModelStrategy } from './types.ts';
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
import { GoogleGenAI, Modality } from "@google/genai";
import { Fingerprint } from 'lucide-react';
import { translations } from './translations.ts';

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
  // الحفاظ على حالة المستخدم وبياناته حتى بعد التحديث التلقائي
  const [user, setUser] = useState<any>(() => safeParse('imagine_ai_user', null));
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
    contentProtection: false, privacyMode: false, advancedMode: false
  }));

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeechGenerating, setIsSpeechGenerating] = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [isHairModalOpen, setIsHairModalOpen] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [toast, setToast] = useState<AppNotification | null>(null);
  
  // استعادة حالة العمل (الصورة الحالية) لضمان عدم فقدانها عند التحديث
  const [activeImage, setActiveImage] = useState<string | null>(() => localStorage.getItem('imagine_active_image'));
  const [originalImage, setOriginalImage] = useState<string | null>(() => localStorage.getItem('imagine_original_image'));
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<AccountTab>('profile');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '', model: 'Plus', aspectRatio: '1:1', steps: 30, uploadedImage: null
  });

  // ميزة المراقبة الخارجية: استجابة التلقائية لأي تحديث في التخزين (تزامن عبر التبويبات)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'imagine_ai_config') {
        const newConfig = JSON.parse(e.newValue || '{}');
        setSiteConfig(newConfig);
        // إذا كان هناك "إشارة تحديث" معينة، يمكننا طلب إعادة تحميل خفيفة هنا
      }
      if (e.key === 'imagine_ai_user' && !e.newValue) {
        // إذا تم تسجيل الخروج من تبويب آخر
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getEffectiveApiKey = useCallback((specificKey?: string) => {
    return specificKey || siteConfig.global_api_key || siteConfig.api_key_random || userSettings.manualApiKey || process.env.API_KEY || '';
  }, [siteConfig.global_api_key, siteConfig.api_key_random, userSettings.manualApiKey]);

  const trackDataUsage = useCallback((dataUrl: string) => {
    if (!dataUrl || !user) return;
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
  }, [user]);

  useEffect(() => {
    document.title = siteConfig.seo_title || 'Imagine AI';
    const styleTag = document.getElementById('admin-dynamic-css');
    if (styleTag) styleTag.textContent = siteConfig.custom_css || '';
  }, [siteConfig]);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % translations[language].loadingMessages.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, language]);

  const addNotification = useCallback((title: string, description: string, type: 'system' | 'success' | 'update' | 'message' = 'system') => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, description, time: new Date(), isRead: false, type };
    setNotifications(prev => [newNotif, ...prev]);
    setToast(newNotif);
  }, []);

  const handleLoginSuccess = useCallback((userData: any, directToAdmin: boolean = false) => {
    setUser(userData);
    if (directToAdmin && userData.isAdmin) {
      setIsAdminOpen(true);
      addNotification(language === 'ar' ? 'تم الدخول المباشر للمدير' : 'Direct Admin Access', language === 'ar' ? 'أهلاً بك في غرفة العمليات' : 'Welcome to the core', 'success');
    } else {
      addNotification(language === 'ar' ? 'تم تسجيل الدخول' : 'Login Success', language === 'ar' ? `مرحباً بك، ${userData.name}` : `Welcome, ${userData.name}`, 'success');
    }
  }, [language, addNotification]);

  const handleGenerateSpeech = useCallback(async (text: string, voice: string) => {
    if (!text.trim()) return;
    setIsSpeechGenerating(true);
    try {
      const targetKey = getEffectiveApiKey(siteConfig.api_key_tts);
      if (!targetKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey: targetKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        trackDataUsage(`data:audio/pcm;base64,${base64Audio}`);
        const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) return;
        const audioCtx = new AudioCtxClass({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
        addNotification(language === 'ar' ? 'تم توليد الصوت' : 'Voice Generated', language === 'ar' ? 'يمكنك الاستماع الآن' : 'You can listen now', 'success');
      }
    } catch (err: any) {
      addNotification('Speech Error', 'Check API Key in Settings', 'system');
    } finally {
      setIsSpeechGenerating(false);
    }
  }, [getEffectiveApiKey, siteConfig.api_key_tts, language, addNotification, trackDataUsage]);

  const handleGenerate = useCallback(async (customPrompt?: string, isLogo: boolean = false) => {
    const p = customPrompt || settings.prompt;
    if (!p.trim()) return;
    setIsGenerating(true);
    setActiveImage(null);
    try {
      const targetKey = isLogo ? getEffectiveApiKey(siteConfig.api_key_logo) : getEffectiveApiKey(siteConfig.api_key_text_to_image);
      if (!targetKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey: targetKey });
      const modelName = userSettings.modelStrategy === 'fast' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [{ text: isLogo ? `Professional minimalist logo for: ${p}, 4k.` : p }] },
        config: { imageConfig: { aspectRatio: (settings.aspectRatio as any) || "1:1", imageSize: "1K" } }
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
        setHistory(prev => [{ id: Date.now().toString(), imageUrl: resultUrl, prompt: p, timestamp: new Date(), model: settings.model, type: isLogo ? 'LogoCreation' : 'Generated' }, ...prev].slice(0, 30));
        addNotification(isLogo ? 'Logo Done' : 'Gen Done', 'Your image is ready', 'success');
      }
    } catch (e: any) { 
      addNotification('API Error', 'Check API keys in Panel', 'system');
    } finally { setIsGenerating(false); }
  }, [settings, siteConfig, userSettings.modelStrategy, getEffectiveApiKey, addNotification, trackDataUsage]);

  const handleImageAction = useCallback(async (type: GenerationType, customPrompt?: string) => {
    const sourceImage = activeImage || settings.uploadedImage;
    if (!sourceImage) {
      addNotification(language === 'ar' ? 'تنبيه هام' : 'Important Alert', language === 'ar' ? 'يرجى رفع صورة أو توليد واحدة أولاً لكي يتمكن النظام الذكي من معالجتها.' : 'Please upload or generate an image first so the AI system can process it.', 'system');
      return;
    }
    
    setIsGenerating(true);
    let specificKey = '';
    let actionPrompt = '';

    switch(type) {
      case 'Cleaned': 
        specificKey = siteConfig.api_key_remove_bg; 
        actionPrompt = "STRICT INSTRUCTION: Completely remove the background of this image. Keep the main subject exactly as is. Output the subject on a transparent or solid white background. DO NOT upscale, DO NOT change resolution, DO NOT alter colors. Just background removal.";
        break;
      case 'Upscaled': 
        specificKey = siteConfig.api_key_upscale; 
        actionPrompt = "STRICT INSTRUCTION: Perform 4K super-resolution upscaling. Increase the pixel count and enhance clarity, sharpness, and textures. Maintain the exact original composition and colors. ONLY upscale.";
        break;
      case 'WatermarkRemoved': 
        specificKey = siteConfig.api_key_watermark; 
        actionPrompt = "STRICT INSTRUCTION: Identify and remove any watermarks, text, or logos from the image. Use content-aware inpainting to fill the removed area naturally. Keep the rest of the image untouched.";
        break;
      case 'Colorized': 
        specificKey = siteConfig.api_key_colorize; 
        actionPrompt = "STRICT INSTRUCTION: Colorize this black and white photo. Use realistic and historically accurate colors. Keep skin tones natural and maintain original detail. DO NOT upscale.";
        break;
      case 'ObjectRemoved': 
        specificKey = siteConfig.api_key_magic_eraser; 
        actionPrompt = "STRICT INSTRUCTION: Remove unwanted objects or distractions from the background as if they were never there. Maintain the main subject's integrity. Just object erasure.";
        break;
      case 'Cartoonized': 
        specificKey = siteConfig.api_key_cartoonize; 
        actionPrompt = "STRICT INSTRUCTION: Transform this image into a high-quality 3D animated movie style (Pixar/Disney style). Keep the person's features recognizable but in a stylized cartoon format.";
        break;
      case 'Restored': 
        specificKey = siteConfig.api_key_restore; 
        actionPrompt = "STRICT INSTRUCTION: Restore this old or damaged photo. Fix cracks, scratches, and noise. Improve contrast and light. Bring back lost facial details without changing identity.";
        break;
      case 'VirtualTryOn': 
        specificKey = siteConfig.api_key_virtual_try_on; 
        actionPrompt = "STRICT INSTRUCTION: Swap the clothes of the person in the image to a modern stylish outfit. Keep the head, face, skin, and background 100% identical. Only change the clothing.";
        break;
      case 'AddSunglasses': 
        specificKey = siteConfig.api_key_sunglasses; 
        actionPrompt = "STRICT INSTRUCTION: Add stylish, realistic sunglasses to the person's face. Make sure they fit the perspective and lighting of the scene.";
        break;
      case 'ChangeHairStyle': 
        specificKey = siteConfig.api_key_hair_style; 
        actionPrompt = `STRICT INSTRUCTION: AI Hair Stylist. Change the person's hairstyle to: "${customPrompt || "a modern professional haircut"}". CRITICAL: The face, eyes, expression, and background must remain EXACTLY the same. ONLY the hair should be changed.`;
        break;
      case 'ImageToVector':
        specificKey = siteConfig.global_api_key;
        actionPrompt = "STRICT INSTRUCTION: Convert this image into a clean, flat minimalist vector illustration (flat design SVG style). Use solid colors and sharp paths. No gradients, no photo-realism.";
        break;
      case 'Edited':
        specificKey = siteConfig.api_key_smart_edit;
        actionPrompt = customPrompt || "Perform the requested edit precisely while keeping the original style.";
        break;
      default:
        specificKey = siteConfig.global_api_key;
        actionPrompt = "Improve the overall quality of this image.";
    }

    try {
      const targetKey = getEffectiveApiKey(specificKey);
      if (!targetKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey: targetKey });
      const mimeType = sourceImage.split(';')[0].split(':')[1] || 'image/png';
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ inlineData: { data: sourceImage.split(',')[1], mimeType } }, { text: actionPrompt }] }
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
        setHistory(prev => [{ id: Date.now().toString(), imageUrl: resultUrl, prompt: type, timestamp: new Date(), model: 'Plus', type }, ...prev].slice(0, 30));
        addNotification(language === 'ar' ? 'تمت العملية بنجاح' : 'Success', language === 'ar' ? `تم تنفيذ [${type}] بنجاح.` : `[${type}] completed successfully.`, 'success');
      }
    } catch (error: any) { 
      addNotification('API Error', 'Check API keys in Admin Panel', 'system'); 
    } finally { setIsGenerating(false); }
  }, [activeImage, settings.uploadedImage, siteConfig, getEffectiveApiKey, addNotification, language, trackDataUsage]);

  const handleHairStyleRequest = useCallback(() => {
    if (!(activeImage || settings.uploadedImage)) {
      addNotification(language === 'ar' ? 'تنبيه' : 'Alert', language === 'ar' ? 'يجب اختيار صورة أولاً لكي يتمكن النظام من معرفة ملامح الوجه وتغيير الشعر.' : 'You must select an image first so the system can recognize facial features and change hair.', 'system');
      return;
    }
    setIsHairModalOpen(true);
  }, [activeImage, settings.uploadedImage, language, addNotification]);

  // تحديث التخزين المحلي بانتظام لضمان مزامنة الجلسة وحفظ العمل
  useEffect(() => {
    localStorage.setItem('imagine_ai_user', JSON.stringify(user));
    localStorage.setItem('imagine_ai_config', JSON.stringify(siteConfig));
    localStorage.setItem('imagine_ai_settings', JSON.stringify(userSettings));
    localStorage.setItem('imagine_ai_history', JSON.stringify(history));
    localStorage.setItem('imagine_ai_messages', JSON.stringify(messages));
    localStorage.setItem('site_verified_users', JSON.stringify(allUsers));
    localStorage.setItem('banned_emails', JSON.stringify(bannedEmails));
    
    // حفظ حالة الصورة الحالية لضمان استرجاعها بعد التحديث التلقائي
    if (activeImage) localStorage.setItem('imagine_active_image', activeImage);
    else localStorage.removeItem('imagine_active_image');
    
    if (originalImage) localStorage.setItem('imagine_original_image', originalImage);
    else localStorage.removeItem('imagine_original_image');

  }, [user, siteConfig, userSettings, history, messages, allUsers, bannedEmails, activeImage, originalImage]);

  const authScreenMemo = useMemo(() => (
    <AuthScreen onLogin={handleLoginSuccess} language={language} allUsers={allUsers} setAllUsers={setAllUsers} bannedEmails={bannedEmails} adminIdentity={adminIdentity} />
  ), [handleLoginSuccess, language, allUsers, setAllUsers, bannedEmails, adminIdentity]);

  if (!user) return authScreenMemo;

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${userSettings.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {siteConfig.global_html && <div dangerouslySetInnerHTML={{ __html: siteConfig.global_html }} />}
      <Header credits={50} user={user} language={language} siteConfig={siteConfig} notifications={notifications} onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))} onToggleLang={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')} onUpgrade={() => { setAccountTab('credits'); setIsAccountOpen(true); }} onProfile={() => { setAccountTab('profile'); setIsAccountOpen(true); }} onOpenInbox={() => { setAccountTab('manager'); setIsAccountOpen(true); }} onOpenStory={() => setIsStoryOpen(true)} onLogout={() => setUser(null)} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onAdmin={() => setIsAdminOpen(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} settings={settings} setSettings={setSettings} onGenerate={() => handleGenerate()} onUpload={(url) => { setActiveImage(url); setSettings(s => ({...s, uploadedImage: url})); }} isGenerating={isGenerating} language={language} onClose={() => setIsSidebarOpen(false)} modelStrategy={userSettings.modelStrategy} setModelStrategy={(s) => setUserSettings(prev => ({ ...prev, modelStrategy: s }))} />
        <MainPreview imageUrl={activeImage} originalImageUrl={originalImage} isGenerating={isGenerating} loadingStep={loadingStep} prompt={settings.prompt} language={language} isSidebarOpen={isSidebarOpen} isGalleryOpen={isGalleryOpen} onToggleGallery={() => setIsGalleryOpen(!isGalleryOpen)} onRemoveBackground={() => handleImageAction('Cleaned')} onUpscale={() => handleImageAction('Upscaled')} onRemoveWatermark={() => handleImageAction('WatermarkRemoved')} onRestore={() => handleImageAction('Restored')} onColorize={() => handleImageAction('Colorized')} onCartoonize={() => handleImageAction('Cartoonized')} onMagicEraser={() => handleImageAction('ObjectRemoved')} onSmartEdit={() => { const p = prompt('Edit Prompt?'); if(p) handleImageAction('Edited', p); }} onVirtualTryOn={() => handleImageAction('VirtualTryOn')} onAddSunglasses={() => handleImageAction('AddSunglasses')} onChangeHairStyle={handleHairStyleRequest} onCreateLogo={() => { const n = prompt('Logo Name?'); if(n) handleGenerate(n, true); }} onTextToSpeech={() => setIsSpeechModalOpen(true)} onGenerateImage={() => handleGenerate()} onImageToVector={() => handleImageAction('ImageToVector')} />
        <RightPanel isOpen={isGalleryOpen} history={history} onSelect={setActiveImage} onDelete={(id) => setHistory(h => h.filter(x => x.id !== id))} language={language} onClose={() => setIsGalleryOpen(false)} />
      </div>
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} activeTab={accountTab} setActiveTab={setAccountTab} credits={50} user={user} language={language} userSettings={userSettings} setUserSettings={s => setUserSettings(prev => ({ ...prev, ...s }))} siteConfig={siteConfig} allMessages={messages} onSendMessage={(content) => setMessages(prev => [{ id: Date.now().toString(), senderName: user?.name, senderEmail: user?.email, content, timestamp: new Date(), isRead: false }, ...prev])} />
      {isAdminOpen && <AdminPanel config={siteConfig} setConfig={setSiteConfig} messages={messages} setMessages={setMessages} onClose={() => setIsAdminOpen(false)} language={language} allUsers={allUsers} setAllUsers={setAllUsers} bannedEmails={bannedEmails} setBannedEmails={setBannedEmails} adminIdentity={adminIdentity} setAdminIdentity={setAdminIdentity} />}
      {isStoryOpen && siteConfig.global_story?.active && <StoryViewer story={{...siteConfig.global_story, timestamp: Date.now()}} onClose={() => setIsStoryOpen(false)} language={language} siteConfig={siteConfig} />}
      <ToastNotification toast={toast} onClose={() => setToast(null)} language={language} />
      {isSpeechModalOpen && <SpeechModal isOpen={isSpeechModalOpen} onClose={() => setIsSpeechModalOpen(false)} onGenerate={handleGenerateSpeech} language={language} isGenerating={isSpeechGenerating} />}
      {isHairModalOpen && <HairModal isOpen={isHairModalOpen} onClose={() => setIsHairModalOpen(false)} onApply={(p) => handleImageAction('ChangeHairStyle', p)} language={language} />}
      {user?.isAdmin && (
        <div className="fixed bottom-4 left-4 z-[9999]">
          <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-slate-900 text-white rounded-full shadow-2xl border border-white/10 hover:scale-110 transition-transform"><Fingerprint className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );
};

export default App;
